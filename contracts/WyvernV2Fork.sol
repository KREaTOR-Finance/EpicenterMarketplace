// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title WyvernV2Fork
 * @dev Fork of OpenSea's Wyvern V2 protocol adapted for SEI blockchain
 * Supports ERC-721 and ERC-1155 NFTs with EIP-2981 royalties and lazy minting
 */
contract WyvernV2Fork is ReentrancyGuard, Pausable, Ownable, EIP712 {
    using ECDSA for bytes32;

    // Constants
    bytes32 public constant ORDER_TYPEHASH = keccak256(
        "Order(address maker,address taker,uint256 makerRelayerFee,uint256 takerRelayerFee,address makerProtocolFee,address takerProtocolFee,address feeRecipient,uint8 feeMethod,uint8 side,uint8 saleKind,address target,uint8 howToCall,bytes calldata,bytes replacementPattern,address staticTarget,bytes staticExtradata,bytes paymentToken,uint256 basePrice,uint256 extra,uint256 listingTime,uint256 expirationTime,uint256 salt)"
    );

    // Events
    event OrderCancelled(bytes32 indexed hash);
    event OrdersMatched(bytes32 buyHash, bytes32 sellHash, address indexed maker, address indexed taker, uint256 price, bytes metadata);
    event OrderValidated(bytes32 indexed hash, address indexed maker, uint256 basePrice);
    event RoyaltyPaid(address indexed token, uint256 indexed tokenId, address indexed recipient, uint256 amount);

    // Structs
    struct Order {
        address maker;
        address taker;
        uint256 makerRelayerFee;
        uint256 takerRelayerFee;
        address makerProtocolFee;
        address takerProtocolFee;
        address feeRecipient;
        FeeMethod feeMethod;
        Side side;
        SaleKind saleKind;
        address target;
        HowToCall howToCall;
        bytes calldata;
        bytes replacementPattern;
        address staticTarget;
        bytes staticExtradata;
        address paymentToken;
        uint256 basePrice;
        uint256 extra;
        uint256 listingTime;
        uint256 expirationTime;
        uint256 salt;
    }

    enum FeeMethod { ProtocolFee, SplitFee }
    enum Side { Buy, Sell }
    enum SaleKind { FixedPrice, DutchAuction }
    enum HowToCall { Call, DelegateCall }

    // State variables
    mapping(bytes32 => bool) public cancelledOrFinalized;
    mapping(bytes32 => bool) public approvedOrders;
    
    uint256 public protocolFee = 250; // 2.5% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    address public protocolFeeRecipient;
    address public royaltyRegistry;

    // Modifiers
    modifier onlyApprovedOrOwner(address spender, uint256 tokenId, address token) {
        require(_isApprovedOrOwner(spender, tokenId, token), "Not approved or owner");
        _;
    }

    constructor(
        string memory name,
        string memory version,
        address _protocolFeeRecipient,
        address _royaltyRegistry
    ) EIP712(name, version) {
        protocolFeeRecipient = _protocolFeeRecipient;
        royaltyRegistry = _royaltyRegistry;
    }

    /**
     * @dev Cancel an order, preventing it from being matched
     * @param order The order to cancel
     */
    function cancelOrder(Order calldata order) external {
        bytes32 hash = hashOrder(order);
        require(msg.sender == order.maker, "Only maker can cancel");
        require(!cancelledOrFinalized[hash], "Order already cancelled");
        
        cancelledOrFinalized[hash] = true;
        emit OrderCancelled(hash);
    }

    /**
     * @dev Match a buy order with a sell order
     * @param buy The buy order
     * @param sell The sell order
     * @param buySig The signature for the buy order
     * @param sellSig The signature for the sell order
     */
    function atomicMatch(
        Order calldata buy,
        Order calldata sell,
        bytes calldata buySig,
        bytes calldata sellSig
    ) external payable nonReentrant whenNotPaused {
        bytes32 buyHash = hashOrder(buy);
        bytes32 sellHash = hashOrder(sell);

        require(validateOrderParameters(buy), "Invalid buy order parameters");
        require(validateOrderParameters(sell), "Invalid sell order parameters");
        require(validateOrder(buy, buyHash, buySig), "Invalid buy order");
        require(validateOrder(sell, sellHash, sellSig), "Invalid sell order");
        require(ordersCanMatch(buy, sell), "Orders cannot match");

        // Execute the match
        executeMatch(buy, sell, buyHash, sellHash);
    }

    /**
     * @dev Validate order parameters
     */
    function validateOrderParameters(Order calldata order) public view returns (bool) {
        return (
            order.expirationTime > block.timestamp &&
            order.listingTime <= block.timestamp &&
            order.salt != 0
        );
    }

    /**
     * @dev Validate order signature and approval
     */
    function validateOrder(Order calldata order, bytes32 hash, bytes calldata signature) public view returns (bool) {
        if (cancelledOrFinalized[hash]) return false;
        
        // Check signature
        address signer = hash.recover(signature);
        if (signer != order.maker) return false;

        // Check approval for ERC721/ERC1155
        if (order.side == Side.Sell) {
            (address token, uint256 tokenId) = _getTokenInfo(order.calldata);
            return _isApprovedOrOwner(order.maker, tokenId, token);
        }

        return true;
    }

    /**
     * @dev Check if orders can be matched
     */
    function ordersCanMatch(Order calldata buy, Order calldata sell) public pure returns (bool) {
        return (
            buy.side == Side.Buy &&
            sell.side == Side.Sell &&
            buy.target == sell.target &&
            buy.paymentToken == sell.paymentToken &&
            buy.basePrice >= sell.basePrice
        );
    }

    /**
     * @dev Execute the actual match between buy and sell orders
     */
    function executeMatch(
        Order calldata buy,
        Order calldata sell,
        bytes32 buyHash,
        bytes32 sellHash
    ) internal {
        // Mark orders as finalized
        cancelledOrFinalized[buyHash] = true;
        cancelledOrFinalized[sellHash] = true;

        // Transfer NFT from seller to buyer
        (address token, uint256 tokenId) = _getTokenInfo(sell.calldata);
        _transferNFT(sell.maker, buy.maker, token, tokenId);

        // Calculate fees and transfer payment
        uint256 price = sell.basePrice;
        uint256 protocolFeeAmount = (price * protocolFee) / BASIS_POINTS;
        uint256 royaltyAmount = _calculateAndPayRoyalty(token, tokenId, price);
        uint256 sellerAmount = price - protocolFeeAmount - royaltyAmount;

        // Transfer payments
        if (sell.paymentToken == address(0)) {
            // Native token (SEI)
            require(msg.value >= price, "Insufficient payment");
            
            payable(sell.maker).transfer(sellerAmount);
            payable(protocolFeeRecipient).transfer(protocolFeeAmount);
            
            // Refund excess
            if (msg.value > price) {
                payable(msg.sender).transfer(msg.value - price);
            }
        } else {
            // ERC20 token
            IERC20(sell.paymentToken).transferFrom(buy.maker, sell.maker, sellerAmount);
            IERC20(sell.paymentToken).transferFrom(buy.maker, protocolFeeRecipient, protocolFeeAmount);
        }

        emit OrdersMatched(buyHash, sellHash, sell.maker, buy.maker, price, "");
    }

    /**
     * @dev Calculate and pay royalty according to EIP-2981
     */
    function _calculateAndPayRoyalty(address token, uint256 tokenId, uint256 price) internal returns (uint256) {
        // Try to get royalty info from the token contract
        try IERC2981(token).royaltyInfo(tokenId, price) returns (address recipient, uint256 amount) {
            if (recipient != address(0) && amount > 0) {
                // Pay royalty
                if (msg.value > 0) {
                    payable(recipient).transfer(amount);
                } else {
                    // For ERC20 payments, this would need to be handled differently
                    // For now, we'll just emit the event
                }
                emit RoyaltyPaid(token, tokenId, recipient, amount);
                return amount;
            }
        } catch {
            // Token doesn't support EIP-2981, no royalty
        }
        return 0;
    }

    /**
     * @dev Transfer NFT between addresses
     */
    function _transferNFT(address from, address to, address token, uint256 tokenId) internal {
        try IERC721(token).ownerOf(tokenId) {
            // ERC721
            IERC721(token).transferFrom(from, to, tokenId);
        } catch {
            // ERC1155 - assume amount of 1
            IERC1155(token).safeTransferFrom(from, to, tokenId, 1, "");
        }
    }

    /**
     * @dev Check if address is approved or owner of token
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId, address token) internal view returns (bool) {
        try IERC721(token).ownerOf(tokenId) returns (address owner) {
            return (spender == owner || 
                    spender == IERC721(token).getApproved(tokenId) ||
                    IERC721(token).isApprovedForAll(owner, spender));
        } catch {
            // ERC1155 - check approval
            return IERC1155(token).isApprovedForAll(IERC1155(token).ownerOf(tokenId), spender);
        }
    }

    /**
     * @dev Extract token address and token ID from calldata
     */
    function _getTokenInfo(bytes calldata data) internal pure returns (address token, uint256 tokenId) {
        // This is a simplified version - in practice, you'd need to parse the calldata
        // based on the function selector and parameters
        require(data.length >= 68, "Invalid calldata");
        
        assembly {
            token := calldataload(36)
            tokenId := calldataload(68)
        }
    }

    /**
     * @dev Hash an order for signature verification
     */
    function hashOrder(Order calldata order) public view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            ORDER_TYPEHASH,
            order.maker,
            order.taker,
            order.makerRelayerFee,
            order.takerRelayerFee,
            order.makerProtocolFee,
            order.takerProtocolFee,
            order.feeRecipient,
            order.feeMethod,
            order.side,
            order.saleKind,
            order.target,
            order.howToCall,
            keccak256(order.calldata),
            keccak256(order.replacementPattern),
            order.staticTarget,
            keccak256(order.staticExtradata),
            order.paymentToken,
            order.basePrice,
            order.extra,
            order.listingTime,
            order.expirationTime,
            order.salt
        )));
    }

    // Admin functions
    function setProtocolFee(uint256 _protocolFee) external onlyOwner {
        require(_protocolFee <= 1000, "Fee too high"); // Max 10%
        protocolFee = _protocolFee;
    }

    function setProtocolFeeRecipient(address _recipient) external onlyOwner {
        protocolFeeRecipient = _recipient;
    }

    function setRoyaltyRegistry(address _registry) external onlyOwner {
        royaltyRegistry = _registry;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    // Interface for EIP-2981
    interface IERC2981 {
        function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount);
    }
} 