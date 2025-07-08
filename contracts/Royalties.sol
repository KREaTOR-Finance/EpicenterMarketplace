// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title Royalties
 * @dev Implementation of EIP-2981 NFT Royalty Standard
 * Provides a registry for royalty information and implements the royalty interface
 */
contract Royalties is ERC165, Ownable {
    // Events
    event RoyaltyInfoSet(address indexed token, uint256 indexed tokenId, address indexed recipient, uint256 bps);
    event RoyaltyInfoCleared(address indexed token, uint256 indexed tokenId);
    event DefaultRoyaltySet(address indexed token, address indexed recipient, uint256 bps);

    // Structs
    struct RoyaltyInfo {
        address recipient;
        uint256 bps; // Basis points (10000 = 100%)
    }

    // State variables
    mapping(address => mapping(uint256 => RoyaltyInfo)) public royaltyInfo;
    mapping(address => RoyaltyInfo) public defaultRoyaltyInfo;
    
    uint256 public constant BASIS_POINTS = 10000;

    // EIP-2981 interface ID
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    constructor() {
        _registerInterface(_INTERFACE_ID_ERC2981);
    }

    /**
     * @dev Set royalty information for a specific token
     * @param token The NFT contract address
     * @param tokenId The token ID
     * @param recipient The royalty recipient
     * @param bps Basis points (e.g., 500 = 5%)
     */
    function setRoyaltyInfo(
        address token,
        uint256 tokenId,
        address recipient,
        uint256 bps
    ) external onlyOwner {
        require(bps <= BASIS_POINTS, "Royalty basis points too high");
        require(recipient != address(0), "Invalid recipient");
        
        royaltyInfo[token][tokenId] = RoyaltyInfo(recipient, bps);
        emit RoyaltyInfoSet(token, tokenId, recipient, bps);
    }

    /**
     * @dev Set default royalty information for a token contract
     * @param token The NFT contract address
     * @param recipient The royalty recipient
     * @param bps Basis points (e.g., 500 = 5%)
     */
    function setDefaultRoyalty(
        address token,
        address recipient,
        uint256 bps
    ) external onlyOwner {
        require(bps <= BASIS_POINTS, "Royalty basis points too high");
        require(recipient != address(0), "Invalid recipient");
        
        defaultRoyaltyInfo[token] = RoyaltyInfo(recipient, bps);
        emit DefaultRoyaltySet(token, recipient, bps);
    }

    /**
     * @dev Clear royalty information for a specific token
     * @param token The NFT contract address
     * @param tokenId The token ID
     */
    function clearRoyaltyInfo(address token, uint256 tokenId) external onlyOwner {
        delete royaltyInfo[token][tokenId];
        emit RoyaltyInfoCleared(token, tokenId);
    }

    /**
     * @dev Clear default royalty information for a token contract
     * @param token The NFT contract address
     */
    function clearDefaultRoyalty(address token) external onlyOwner {
        delete defaultRoyaltyInfo[token];
    }

    /**
     * @dev Get royalty information for a token
     * @param token The NFT contract address
     * @param tokenId The token ID
     * @param salePrice The sale price
     * @return recipient The royalty recipient
     * @return royaltyAmount The royalty amount
     */
    function royaltyInfo(
        address token,
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (address recipient, uint256 royaltyAmount) {
        RoyaltyInfo memory info = royaltyInfo[token][tokenId];
        
        // If no specific royalty info, check default
        if (info.recipient == address(0)) {
            info = defaultRoyaltyInfo[token];
        }
        
        if (info.recipient != address(0)) {
            royaltyAmount = (salePrice * info.bps) / BASIS_POINTS;
            return (info.recipient, royaltyAmount);
        }
        
        return (address(0), 0);
    }

    /**
     * @dev Check if royalty info exists for a token
     * @param token The NFT contract address
     * @param tokenId The token ID
     * @return True if royalty info exists
     */
    function hasRoyaltyInfo(address token, uint256 tokenId) external view returns (bool) {
        RoyaltyInfo memory info = royaltyInfo[token][tokenId];
        if (info.recipient != address(0)) {
            return true;
        }
        
        info = defaultRoyaltyInfo[token];
        return info.recipient != address(0);
    }

    /**
     * @dev Get royalty info for a token
     * @param token The NFT contract address
     * @param tokenId The token ID
     * @return recipient The royalty recipient
     * @return bps Basis points
     */
    function getRoyaltyInfo(address token, uint256 tokenId) external view returns (address recipient, uint256 bps) {
        RoyaltyInfo memory info = royaltyInfo[token][tokenId];
        
        if (info.recipient == address(0)) {
            info = defaultRoyaltyInfo[token];
        }
        
        return (info.recipient, info.bps);
    }

    /**
     * @dev Get default royalty info for a token contract
     * @param token The NFT contract address
     * @return recipient The royalty recipient
     * @return bps Basis points
     */
    function getDefaultRoyaltyInfo(address token) external view returns (address recipient, uint256 bps) {
        RoyaltyInfo memory info = defaultRoyaltyInfo[token];
        return (info.recipient, info.bps);
    }

    /**
     * @dev Batch set royalty information for multiple tokens
     * @param token The NFT contract address
     * @param tokenIds Array of token IDs
     * @param recipients Array of recipients
     * @param bpsArray Array of basis points
     */
    function batchSetRoyaltyInfo(
        address token,
        uint256[] calldata tokenIds,
        address[] calldata recipients,
        uint256[] calldata bpsArray
    ) external onlyOwner {
        require(
            tokenIds.length == recipients.length && 
            tokenIds.length == bpsArray.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(bpsArray[i] <= BASIS_POINTS, "Royalty basis points too high");
            require(recipients[i] != address(0), "Invalid recipient");
            
            royaltyInfo[token][tokenIds[i]] = RoyaltyInfo(recipients[i], bpsArray[i]);
            emit RoyaltyInfoSet(token, tokenIds[i], recipients[i], bpsArray[i]);
        }
    }

    /**
     * @dev Calculate royalty amount for a given sale price
     * @param salePrice The sale price
     * @param bps Basis points
     * @return The royalty amount
     */
    function calculateRoyalty(uint256 salePrice, uint256 bps) external pure returns (uint256) {
        return (salePrice * bps) / BASIS_POINTS;
    }

    /**
     * @dev Supports EIP-2981 interface
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == _INTERFACE_ID_ERC2981 || super.supportsInterface(interfaceId);
    }
} 