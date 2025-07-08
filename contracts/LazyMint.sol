// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LazyMint
 * @dev Allows lazy minting of NFTs via off-chain signatures
 * Supports both ERC-721 and ERC-1155 tokens
 */
contract LazyMint is ERC721, ERC1155, Ownable, EIP712 {
    using ECDSA for bytes32;
    using Strings for uint256;

    // Constants
    bytes32 public constant MINT_TYPEHASH = keccak256(
        "MintRequest(address to,uint256 tokenId,string tokenURI,uint256 amount,uint256 nonce,uint256 deadline)"
    );

    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI, uint256 amount);
    event BatchMinted(address indexed to, uint256[] tokenIds, string[] tokenURIs, uint256[] amounts);

    // State variables
    mapping(uint256 => bool) public nonces;
    mapping(uint256 => bool) public mintedTokens;
    
    string public baseURI;
    string public contractURI;
    
    uint256 public totalSupply;
    uint256 public maxSupply;
    
    bool public mintingEnabled = true;
    address public signer;

    // Structs
    struct MintRequest {
        address to;
        uint256 tokenId;
        string tokenURI;
        uint256 amount;
        uint256 nonce;
        uint256 deadline;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI,
        string memory _contractURI,
        uint256 _maxSupply,
        address _signer
    ) ERC721(name, symbol) ERC1155(_baseURI) EIP712(name, "1.0.0") {
        baseURI = _baseURI;
        contractURI = _contractURI;
        maxSupply = _maxSupply;
        signer = _signer;
    }

    /**
     * @dev Mint a single NFT using a signed request
     * @param request The mint request
     * @param signature The signature from the authorized signer
     */
    function lazyMint(MintRequest calldata request, bytes calldata signature) external {
        require(mintingEnabled, "Minting is disabled");
        require(block.timestamp <= request.deadline, "Request expired");
        require(!nonces[request.nonce], "Nonce already used");
        require(!mintedTokens[request.tokenId], "Token already minted");
        require(totalSupply + 1 <= maxSupply, "Max supply reached");
        require(_verifySignature(request, signature), "Invalid signature");

        nonces[request.nonce] = true;
        mintedTokens[request.tokenId] = true;
        totalSupply++;

        _mint(request.to, request.tokenId);
        _setTokenURI(request.tokenId, request.tokenURI);

        emit TokenMinted(request.to, request.tokenId, request.tokenURI, 1);
    }

    /**
     * @dev Mint multiple NFTs using signed requests
     * @param requests Array of mint requests
     * @param signatures Array of signatures
     */
    function batchLazyMint(
        MintRequest[] calldata requests,
        bytes[] calldata signatures
    ) external {
        require(mintingEnabled, "Minting is disabled");
        require(requests.length == signatures.length, "Array lengths must match");
        require(totalSupply + requests.length <= maxSupply, "Max supply reached");

        uint256[] memory tokenIds = new uint256[](requests.length);
        string[] memory tokenURIs = new string[](requests.length);
        uint256[] memory amounts = new uint256[](requests.length);

        for (uint256 i = 0; i < requests.length; i++) {
            MintRequest calldata request = requests[i];
            bytes calldata signature = signatures[i];

            require(block.timestamp <= request.deadline, "Request expired");
            require(!nonces[request.nonce], "Nonce already used");
            require(!mintedTokens[request.tokenId], "Token already minted");
            require(_verifySignature(request, signature), "Invalid signature");

            nonces[request.nonce] = true;
            mintedTokens[request.tokenId] = true;
            totalSupply++;

            _mint(request.to, request.tokenId);
            _setTokenURI(request.tokenId, request.tokenURI);

            tokenIds[i] = request.tokenId;
            tokenURIs[i] = request.tokenURI;
            amounts[i] = request.amount;
        }

        emit BatchMinted(msg.sender, tokenIds, tokenURIs, amounts);
    }

    /**
     * @dev Mint ERC-1155 tokens using a signed request
     * @param request The mint request
     * @param signature The signature from the authorized signer
     */
    function lazyMintERC1155(MintRequest calldata request, bytes calldata signature) external {
        require(mintingEnabled, "Minting is disabled");
        require(block.timestamp <= request.deadline, "Request expired");
        require(!nonces[request.nonce], "Nonce already used");
        require(request.amount > 0, "Amount must be greater than 0");
        require(_verifySignature(request, signature), "Invalid signature");

        nonces[request.nonce] = true;
        totalSupply += request.amount;

        _mint(request.to, request.tokenId, request.amount, "");
        _setTokenURI(request.tokenId, request.tokenURI);

        emit TokenMinted(request.to, request.tokenId, request.tokenURI, request.amount);
    }

    /**
     * @dev Verify the signature for a mint request
     * @param request The mint request
     * @param signature The signature
     * @return True if signature is valid
     */
    function _verifySignature(MintRequest calldata request, bytes calldata signature) internal view returns (bool) {
        bytes32 hash = hashMintRequest(request);
        address recoveredSigner = hash.recover(signature);
        return recoveredSigner == signer;
    }

    /**
     * @dev Hash a mint request for signature verification
     * @param request The mint request
     * @return The hash of the request
     */
    function hashMintRequest(MintRequest calldata request) public view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            MINT_TYPEHASH,
            request.to,
            request.tokenId,
            keccak256(bytes(request.tokenURI)),
            request.amount,
            request.nonce,
            request.deadline
        )));
    }

    /**
     * @dev Set the token URI for a token
     * @param tokenId The token ID
     * @param tokenURI The token URI
     */
    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal {
        // This would typically set the token URI in the NFT contract
        // Implementation depends on the specific NFT contract being used
    }

    /**
     * @dev Get the token URI for a token
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }

    /**
     * @dev Check if a token exists
     * @param tokenId The token ID
     * @return True if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return mintedTokens[tokenId];
    }

    /**
     * @dev Check if a nonce has been used
     * @param nonce The nonce to check
     * @return True if nonce has been used
     */
    function isNonceUsed(uint256 nonce) external view returns (bool) {
        return nonces[nonce];
    }

    /**
     * @dev Check if a token has been minted
     * @param tokenId The token ID
     * @return True if token has been minted
     */
    function isTokenMinted(uint256 tokenId) external view returns (bool) {
        return mintedTokens[tokenId];
    }

    // Admin functions
    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function setContractURI(string memory _contractURI) external onlyOwner {
        contractURI = _contractURI;
    }

    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(_maxSupply >= totalSupply, "Max supply cannot be less than current supply");
        maxSupply = _maxSupply;
    }

    function setMintingEnabled(bool _enabled) external onlyOwner {
        mintingEnabled = _enabled;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Override functions for ERC-721 and ERC-1155 compatibility
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        super._afterTokenTransfer(from, to, firstTokenId, batchSize);
    }
} 