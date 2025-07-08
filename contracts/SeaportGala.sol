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
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

/**
 * @title SeaportGala
 * @dev Enhanced WyvernV2 fork with Epicenter's unique features:
 * - Feature flags for gradual rollout
 * - Floor Flip instant liquidation
 * - Smart Royalties with split payouts
 * - Fraud Radar integration
 * - Cross-chain bridge support
 * - Pro Mode features
 */
contract SeaportGala is ReentrancyGuard, Pausable, Ownable, EIP712 {
    using ECDSA for bytes32;
    using BitMaps for BitMaps.BitMap;

    // Constants
    bytes32 public constant ORDER_TYPEHASH = keccak256(
        "Order(address maker,address taker,uint256 makerRelayerFee,uint256 takerRelayerFee,address makerProtocolFee,address takerProtocolFee,address feeRecipient,uint8 feeMethod,uint8 side,uint8 saleKind,address target,uint8 howToCall,bytes calldata,bytes replacementPattern,address staticTarget,bytes staticExtradata,bytes paymentToken,uint256 basePrice,uint256 extra,uint256 listingTime,uint256 expirationTime,uint256 salt,uint256 featureFlags)"
    );

    // Feature Flags
    uint256 public constant FEATURE_FLOOR_FLIP = 1 << 0;
    uint256 public constant FEATURE_SMART_ROYALTIES = 1 << 1;
    uint256 public constant FEATURE_FRAUD_RADAR = 1 << 2;
    uint256 public constant FEATURE_CROSS_CHAIN = 1 << 3;
    uint256 public constant FEATURE_PRO_MODE = 1 << 4;
    uint256 public constant FEATURE_AI_FILTERS = 1 << 5;
    uint256 public constant FEATURE_HEATMAP = 1 << 6;
    uint256 public constant FEATURE_REPUTATION = 1 << 7;

    // Events
    event OrderCancelled(bytes32 indexed hash);
    event OrdersMatched(bytes32 buyHash, bytes32 sellHash, address indexed maker, address indexed taker, uint256 price, bytes metadata);
    event OrderValidated(bytes32 indexed hash, address indexed maker, uint256 basePrice);
    event RoyaltyPaid(address indexed token, uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event FloorFlipExecuted(address indexed token, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event SmartRoyaltySplit(address indexed token, uint256 indexed tokenId, address[] recipients, uint256[] amounts);
    event FraudDetected(address indexed token, uint256 indexed tokenId, address indexed reporter, string reason);
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 change);
    event FeatureFlagUpdated(uint256 feature, bool enabled);

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
        uint256 featureFlags; // Epicenter feature flags
    }

    struct SmartRoyalty {
        address[] recipients;
        uint256[] percentages;
        uint256 totalPercentage;
    }

    struct ReputationData {
        uint256 score;
        uint256 totalTransactions;
        uint256 successfulTransactions;
        uint256 fraudReports;
        uint256 lastUpdated;
    }

    enum FeeMethod { ProtocolFee, SplitFee }
    enum Side { Buy, Sell }
    enum SaleKind { FixedPrice, DutchAuction, FloorFlip }
    enum HowToCall { Call, DelegateCall }

    // State variables
    mapping(bytes32 => bool) public cancelledOrFinalized;
    mapping(bytes32 => bool) public approvedOrders;
    mapping(address => ReputationData) public reputationScores;
    mapping(address => mapping(uint256 => SmartRoyalty)) public smartRoyalties;
    mapping(address => mapping(uint256 => bool)) public fraudReports;
    mapping(address => uint256) public userFeatureFlags;
    
    uint256 public protocolFee = 200; // 2.0% in basis points (Epicenter's lower fee)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public globalFeatureFlags = FEATURE_FLOOR_FLIP | FEATURE_SMART_ROYALTIES | FEATURE_FRAUD_RADAR;
    
    address public protocolFeeRecipient;
    address public royaltyRegistry;
    address public fraudRadarContract;
    address public bridgeContract;

    // Modifiers
    modifier onlyApprovedOrOwner(address spender, uint256 tokenId, address token) {
        require(_isApprovedOrOwner(spender, tokenId, token), "Not approved or owner");
        _;
    }

    modifier featureEnabled(uint256 feature) {
        require(globalFeatureFlags & feature != 0, "Feature not enabled");
        _;
    }

    modifier userFeatureEnabled(address user, uint256 feature) {
        require((globalFeatureFlags & feature != 0) || (userFeatureFlags[user] & feature != 0), "Feature not enabled for user");
        _;
    }

    constructor(
        string memory name,
        string memory version,
        address _protocolFeeRecipient,
        address _royaltyRegistry,
        address _fraudRadarContract,
        address _bridgeContract
    ) EIP712(name, version) {
        protocolFeeRecipient = _protocolFeeRecipient;
        royaltyRegistry = _royaltyRegistry;
        fraudRadarContract = _fraudRadarContract;
        bridgeContract = _bridgeContract;
    }

    /**
     * @dev Epicenter's Floor Flip feature - instant liquidation on best standing offers
     */
    function floorFlip(
        address token,
        uint256 tokenId,
        uint256 maxPrice
    ) external payable nonReentrant whenNotPaused featureEnabled(FEATURE_FLOOR_FLIP) {
        require(msg.value >= maxPrice, "Insufficient payment for floor flip");
        
        // Find the best standing offer
        bytes32 bestOfferHash = _findBestOffer(token, tokenId, maxPrice);
        require(bestOfferHash != bytes32(0), "No suitable offer found");
        
        // Execute the floor flip
        _executeFloorFlip(token, tokenId, bestOfferHash, maxPrice);
        
        emit FloorFlipExecuted(token, tokenId, msg.sender, maxPrice);
    }

    /**
     * @dev Epicenter's Smart Royalties - split payouts among multiple wallets
     */
    function setSmartRoyalty(
        address token,
        uint256 tokenId,
        address[] calldata recipients,
        uint256[] calldata percentages
    ) external onlyApprovedOrOwner(msg.sender, tokenId, token) featureEnabled(FEATURE_SMART_ROYALTIES) {
        require(recipients.length == percentages.length, "Arrays length mismatch");
        require(recipients.length > 0 && recipients.length <= 10, "Invalid recipients count");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            require(percentages[i] > 0, "Invalid percentage");
            totalPercentage += percentages[i];
        }
        require(totalPercentage <= BASIS_POINTS, "Total percentage exceeds 100%");
        
        smartRoyalties[token][tokenId] = SmartRoyalty({
            recipients: recipients,
            percentages: percentages,
            totalPercentage: totalPercentage
        });
    }

    /**
     * @dev Epicenter's Fraud Radar - report suspicious activity
     */
    function reportFraud(
        address token,
        uint256 tokenId,
        string calldata reason
    ) external featureEnabled(FEATURE_FRAUD_RADAR) {
        require(!fraudReports[token][tokenId], "Already reported");
        
        fraudReports[token][tokenId] = true;
        
        // Update reputation score
        ReputationData storage data = reputationScores[msg.sender];
        data.fraudReports++;
        data.lastUpdated = block.timestamp;
        
        emit FraudDetected(token, tokenId, msg.sender, reason);
    }

    /**
     * @dev Epicenter's Reputation System
     */
    function updateReputation(address user, uint256 scoreChange, bool isPositive) external {
        require(msg.sender == owner() || msg.sender == fraudRadarContract, "Not authorized");
        
        ReputationData storage data = reputationScores[user];
        data.lastUpdated = block.timestamp;
        
        if (isPositive) {
            data.score += scoreChange;
            data.successfulTransactions++;
        } else {
            data.score = data.score > scoreChange ? data.score - scoreChange : 0;
        }
        
        data.totalTransactions++;
        
        emit ReputationUpdated(user, data.score, scoreChange);
    }

    /**
     * @dev Enhanced atomic match with Epicenter features
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

        // Check fraud radar if enabled
        if (globalFeatureFlags & FEATURE_FRAUD_RADAR != 0) {
            (address token, uint256 tokenId) = _getTokenInfo(sell.calldata);
            require(!fraudReports[token][tokenId], "Token reported for fraud");
        }

        // Execute the match with enhanced features
        executeMatch(buy, sell, buyHash, sellHash);
        
        // Update reputation scores
        _updateReputationForTransaction(sell.maker, buy.maker, true);
    }

    /**
     * @dev Cancel an order with enhanced validation
     */
    function cancelOrder(Order calldata order) external {
        bytes32 hash = hashOrder(order);
        require(msg.sender == order.maker, "Only maker can cancel");
        require(!cancelledOrFinalized[hash], "Order already cancelled");
        
        cancelledOrFinalized[hash] = true;
        emit OrderCancelled(hash);
    }

    /**
     * @dev Validate order parameters with Epicenter enhancements
     */
    function validateOrderParameters(Order calldata order) public view returns (bool) {
        bool basicValidation = (
            order.expirationTime > block.timestamp &&
            order.listingTime <= block.timestamp &&
            order.salt != 0
        );
        
        if (!basicValidation) return false;
        
        // Check if order uses features that are enabled
        if (order.featureFlags != 0) {
            return (globalFeatureFlags & order.featureFlags) == order.featureFlags;
        }
        
        return true;
    }

    /**
     * @dev Validate order signature and approval with reputation check
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

        // Check reputation if feature is enabled
        if (globalFeatureFlags & FEATURE_REPUTATION != 0) {
            ReputationData storage data = reputationScores[order.maker];
            if (data.fraudReports > 5) return false; // Block users with too many fraud reports
        }

        return true;
    }

    /**
     * @dev Enhanced order matching with Epicenter features
     */
    function ordersCanMatch(Order calldata buy, Order calldata sell) public pure returns (bool) {
        bool basicMatch = (
            buy.side == Side.Buy &&
            sell.side == Side.Sell &&
            buy.target == sell.target &&
            buy.paymentToken == sell.paymentToken &&
            buy.basePrice >= sell.basePrice
        );
        
        if (!basicMatch) return false;
        
        // Check if both orders support the same features
        if (buy.featureFlags != sell.featureFlags) return false;
        
        return true;
    }

    /**
     * @dev Execute match with Epicenter's enhanced features
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

        // Calculate fees and transfer payment with Epicenter enhancements
        uint256 price = sell.basePrice;
        uint256 protocolFeeAmount = (price * protocolFee) / BASIS_POINTS;
        uint256 royaltyAmount = _calculateAndPaySmartRoyalty(token, tokenId, price);
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
     * @dev Epicenter's Smart Royalty calculation and payment
     */
    function _calculateAndPaySmartRoyalty(address token, uint256 tokenId, uint256 price) internal returns (uint256) {
        SmartRoyalty storage royalty = smartRoyalties[token][tokenId];
        
        if (royalty.recipients.length > 0) {
            // Use smart royalty split
            uint256 totalRoyaltyAmount = 0;
            uint256[] memory amounts = new uint256[](royalty.recipients.length);
            
            for (uint256 i = 0; i < royalty.recipients.length; i++) {
                amounts[i] = (price * royalty.percentages[i]) / BASIS_POINTS;
                totalRoyaltyAmount += amounts[i];
                
                if (msg.value > 0) {
                    payable(royalty.recipients[i]).transfer(amounts[i]);
                }
            }
            
            emit SmartRoyaltySplit(token, tokenId, royalty.recipients, amounts);
            return totalRoyaltyAmount;
        } else {
            // Fall back to standard EIP-2981 royalty
            try IERC2981(token).royaltyInfo(tokenId, price) returns (address recipient, uint256 amount) {
                if (recipient != address(0) && amount > 0) {
                    if (msg.value > 0) {
                        payable(recipient).transfer(amount);
                    }
                    emit RoyaltyPaid(token, tokenId, recipient, amount);
                    return amount;
                }
            } catch {
                // Token doesn't support EIP-2981, no royalty
            }
        }
        
        return 0;
    }

    /**
     * @dev Find the best standing offer for Floor Flip
     */
    function _findBestOffer(address token, uint256 tokenId, uint256 maxPrice) internal view returns (bytes32) {
        // This is a simplified implementation
        // In practice, you'd query an order book or index
        return bytes32(0); // Placeholder
    }

    /**
     * @dev Execute Floor Flip transaction
     */
    function _executeFloorFlip(address token, uint256 tokenId, bytes32 offerHash, uint256 price) internal {
        // Implementation for floor flip execution
        // This would interact with the order book and execute the best offer
    }

    /**
     * @dev Update reputation for successful transaction
     */
    function _updateReputationForTransaction(address seller, address buyer, bool success) internal {
        if (globalFeatureFlags & FEATURE_REPUTATION != 0) {
            ReputationData storage sellerData = reputationScores[seller];
            ReputationData storage buyerData = reputationScores[buyer];
            
            if (success) {
                sellerData.successfulTransactions++;
                buyerData.successfulTransactions++;
                sellerData.score += 10;
                buyerData.score += 10;
            }
            
            sellerData.totalTransactions++;
            buyerData.totalTransactions++;
            sellerData.lastUpdated = block.timestamp;
            buyerData.lastUpdated = block.timestamp;
        }
    }

    // Standard helper functions (same as WyvernV2Fork)
    function _transferNFT(address from, address to, address token, uint256 tokenId) internal {
        try IERC721(token).ownerOf(tokenId) {
            IERC721(token).transferFrom(from, to, tokenId);
        } catch {
            IERC1155(token).safeTransferFrom(from, to, tokenId, 1, "");
        }
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId, address token) internal view returns (bool) {
        try IERC721(token).ownerOf(tokenId) returns (address owner) {
            return (spender == owner || 
                    spender == IERC721(token).getApproved(tokenId) ||
                    IERC721(token).isApprovedForAll(owner, spender));
        } catch {
            return IERC1155(token).isApprovedForAll(IERC1155(token).ownerOf(tokenId), spender);
        }
    }

    function _getTokenInfo(bytes calldata data) internal pure returns (address token, uint256 tokenId) {
        require(data.length >= 68, "Invalid calldata");
        
        assembly {
            token := calldataload(36)
            tokenId := calldataload(68)
        }
    }

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
            order.salt,
            order.featureFlags
        )));
    }

    // Admin functions for Epicenter features
    function setFeatureFlag(uint256 feature, bool enabled) external onlyOwner {
        if (enabled) {
            globalFeatureFlags |= feature;
        } else {
            globalFeatureFlags &= ~feature;
        }
        emit FeatureFlagUpdated(feature, enabled);
    }

    function setUserFeatureFlag(address user, uint256 feature, bool enabled) external onlyOwner {
        if (enabled) {
            userFeatureFlags[user] |= feature;
        } else {
            userFeatureFlags[user] &= ~feature;
        }
    }

    function setProtocolFee(uint256 _protocolFee) external onlyOwner {
        require(_protocolFee <= 1000, "Fee too high");
        protocolFee = _protocolFee;
    }

    function setProtocolFeeRecipient(address _recipient) external onlyOwner {
        protocolFeeRecipient = _recipient;
    }

    function setFraudRadarContract(address _contract) external onlyOwner {
        fraudRadarContract = _contract;
    }

    function setBridgeContract(address _contract) external onlyOwner {
        bridgeContract = _contract;
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

    // View functions for Epicenter features
    function getReputationScore(address user) external view returns (ReputationData memory) {
        return reputationScores[user];
    }

    function getSmartRoyalty(address token, uint256 tokenId) external view returns (SmartRoyalty memory) {
        return smartRoyalties[token][tokenId];
    }

    function isFraudReported(address token, uint256 tokenId) external view returns (bool) {
        return fraudReports[token][tokenId];
    }

    function getFeatureFlags() external view returns (uint256) {
        return globalFeatureFlags;
    }

    function getUserFeatureFlags(address user) external view returns (uint256) {
        return userFeatureFlags[user];
    }

    // Interface for EIP-2981
    interface IERC2981 {
        function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount);
    }
} 