// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title M2Bridge
 * @dev Cross-chain bridge adapter for Solana integration
 * Enables seamless NFT transfers between SEI and Solana
 */
contract M2Bridge is ReentrancyGuard, Pausable, Ownable {
    using ECDSA for bytes32;

    // Events
    event BridgeInitiated(
        address indexed from,
        bytes32 indexed bridgeId,
        address token,
        uint256 tokenId,
        uint256 targetChain,
        bytes targetAddress
    );
    
    event BridgeCompleted(
        bytes32 indexed bridgeId,
        address token,
        uint256 tokenId,
        address recipient,
        uint256 sourceChain
    );
    
    event BridgeCancelled(bytes32 indexed bridgeId, address indexed from);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    // Structs
    struct BridgeRequest {
        address from;
        address token;
        uint256 tokenId;
        uint256 targetChain;
        bytes targetAddress;
        uint256 amount;
        uint256 timestamp;
        bool completed;
        bool cancelled;
        bytes32 bridgeId;
    }

    struct Validator {
        address addr;
        bool active;
        uint256 stake;
        uint256 lastValidation;
    }

    // State variables
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(address => Validator) public validators;
    mapping(uint256 => bool) public supportedChains;
    mapping(bytes32 => uint256) public validatorVotes;
    
    uint256 public minValidatorStake = 1000 ether; // 1000 SEI
    uint256 public bridgeFee = 0.01 ether; // 0.01 SEI
    uint256 public requiredValidations = 3;
    uint256 public bridgeTimeout = 1 hours;
    
    address public feeRecipient;
    uint256 public totalBridges;
    uint256 public totalVolume;

    // Modifiers
    modifier onlyValidator() {
        require(validators[msg.sender].active, "Not a validator");
        _;
    }

    modifier onlySupportedChain(uint256 chainId) {
        require(supportedChains[chainId], "Chain not supported");
        _;
    }

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        
        // Initialize supported chains
        supportedChains[1] = true; // Ethereum mainnet
        supportedChains[101] = true; // Solana mainnet
        supportedChains[102] = true; // Solana devnet
        supportedChains[713715] = true; // SEI mainnet
    }

    /**
     * @dev Initiate a cross-chain bridge transfer
     */
    function initiateBridge(
        address token,
        uint256 tokenId,
        uint256 targetChain,
        bytes calldata targetAddress
    ) external payable nonReentrant whenNotPaused onlySupportedChain(targetChain) {
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(IERC721(token).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(IERC721(token).isApprovedForAll(msg.sender, address(this)), "Not approved");

        bytes32 bridgeId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            tokenId,
            targetChain,
            targetAddress,
            block.timestamp,
            totalBridges
        ));

        require(bridgeRequests[bridgeId].bridgeId == bytes32(0), "Bridge ID collision");

        // Transfer NFT to bridge contract
        IERC721(token).transferFrom(msg.sender, address(this), tokenId);

        // Create bridge request
        bridgeRequests[bridgeId] = BridgeRequest({
            from: msg.sender,
            token: token,
            tokenId: tokenId,
            targetChain: targetChain,
            targetAddress: targetAddress,
            amount: 1,
            timestamp: block.timestamp,
            completed: false,
            cancelled: false,
            bridgeId: bridgeId
        });

        totalBridges++;
        totalVolume += bridgeFee;

        // Transfer fee to recipient
        payable(feeRecipient).transfer(bridgeFee);
        
        // Refund excess
        if (msg.value > bridgeFee) {
            payable(msg.sender).transfer(msg.value - bridgeFee);
        }

        emit BridgeInitiated(msg.sender, bridgeId, token, tokenId, targetChain, targetAddress);
    }

    /**
     * @dev Complete a bridge transfer (called by validators)
     */
    function completeBridge(
        bytes32 bridgeId,
        address recipient,
        uint256 sourceChain,
        bytes calldata validatorSignature
    ) external onlyValidator nonReentrant whenNotPaused {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.bridgeId != bytes32(0), "Bridge request not found");
        require(!request.completed, "Bridge already completed");
        require(!request.cancelled, "Bridge was cancelled");
        require(block.timestamp <= request.timestamp + bridgeTimeout, "Bridge timeout");

        // Verify validator signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            bridgeId,
            recipient,
            sourceChain,
            "COMPLETE"
        ));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ethSignedMessageHash.recover(validatorSignature);
        require(validators[signer].active, "Invalid validator signature");

        // Count validator votes
        validatorVotes[bridgeId]++;
        require(validatorVotes[bridgeId] >= requiredValidations, "Insufficient validations");

        // Mark as completed
        request.completed = true;

        // Transfer NFT to recipient
        IERC721(request.token).transferFrom(address(this), recipient, request.tokenId);

        // Update validator stats
        Validator storage validator = validators[msg.sender];
        validator.lastValidation = block.timestamp;

        emit BridgeCompleted(bridgeId, request.token, request.tokenId, recipient, sourceChain);
    }

    /**
     * @dev Cancel a bridge request
     */
    function cancelBridge(bytes32 bridgeId) external nonReentrant {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.bridgeId != bytes32(0), "Bridge request not found");
        require(msg.sender == request.from, "Only requester can cancel");
        require(!request.completed, "Bridge already completed");
        require(!request.cancelled, "Bridge already cancelled");
        require(block.timestamp > request.timestamp + bridgeTimeout, "Bridge not timed out");

        request.cancelled = true;

        // Return NFT to original owner
        IERC721(request.token).transferFrom(address(this), request.from, request.tokenId);

        emit BridgeCancelled(bridgeId, request.from);
    }

    /**
     * @dev Add a new validator
     */
    function addValidator(address validator, uint256 stake) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(stake >= minValidatorStake, "Insufficient stake");
        require(!validators[validator].active, "Validator already exists");

        validators[validator] = Validator({
            addr: validator,
            active: true,
            stake: stake,
            lastValidation: 0
        });

        emit ValidatorAdded(validator);
    }

    /**
     * @dev Remove a validator
     */
    function removeValidator(address validator) external onlyOwner {
        require(validators[validator].active, "Validator not found");
        
        validators[validator].active = false;
        
        emit ValidatorRemoved(validator);
    }

    /**
     * @dev Update bridge configuration
     */
    function updateBridgeConfig(
        uint256 _minValidatorStake,
        uint256 _bridgeFee,
        uint256 _requiredValidations,
        uint256 _bridgeTimeout
    ) external onlyOwner {
        minValidatorStake = _minValidatorStake;
        bridgeFee = _bridgeFee;
        requiredValidations = _requiredValidations;
        bridgeTimeout = _bridgeTimeout;
    }

    /**
     * @dev Add or remove supported chain
     */
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
    }

    /**
     * @dev Set fee recipient
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Pause bridge operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause bridge operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw tokens
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    // View functions
    function getBridgeRequest(bytes32 bridgeId) external view returns (BridgeRequest memory) {
        return bridgeRequests[bridgeId];
    }

    function getValidator(address validator) external view returns (Validator memory) {
        return validators[validator];
    }

    function getBridgeStats() external view returns (
        uint256 _totalBridges,
        uint256 _totalVolume,
        uint256 _activeValidators
    ) {
        uint256 activeCount = 0;
        // Count active validators (simplified)
        return (totalBridges, totalVolume, activeCount);
    }

    function isChainSupported(uint256 chainId) external view returns (bool) {
        return supportedChains[chainId];
    }

    // Receive function for native token
    receive() external payable {
        // Accept native token for bridge fees
    }
} 