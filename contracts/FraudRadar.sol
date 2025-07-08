// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title FraudRadar
 * @dev On-chain fraud detection and monitoring system for Epicenter
 * Provides real-time fraud detection, reputation scoring, and alert system
 */
contract FraudRadar is ReentrancyGuard, Pausable, Ownable {
    using ECDSA for bytes32;

    // Events
    event FraudReported(
        address indexed reporter,
        address indexed token,
        uint256 indexed tokenId,
        string reason,
        uint256 timestamp
    );
    
    event FraudVerified(
        address indexed token,
        uint256 indexed tokenId,
        bool isFraudulent,
        uint256 confidence,
        address verifier
    );
    
    event ReputationUpdated(
        address indexed user,
        int256 scoreChange,
        uint256 newScore,
        string reason
    );
    
    event AlertTriggered(
        address indexed target,
        string alertType,
        uint256 severity,
        string details
    );

    // Structs
    struct FraudReport {
        address reporter;
        string reason;
        uint256 timestamp;
        uint256 votes;
        bool verified;
        bool isFraudulent;
        uint256 confidence;
        mapping(address => bool) voters;
    }

    struct ReputationData {
        uint256 score;
        uint256 totalTransactions;
        uint256 successfulTransactions;
        uint256 fraudReports;
        uint256 fraudReportsAgainst;
        uint256 lastUpdated;
        bool flagged;
    }

    struct AlertRule {
        string alertType;
        uint256 threshold;
        uint256 cooldown;
        bool active;
        uint256 lastTriggered;
    }

    // State variables
    mapping(address => mapping(uint256 => FraudReport)) public fraudReports;
    mapping(address => ReputationData) public reputationScores;
    mapping(string => AlertRule) public alertRules;
    mapping(address => uint256) public userStakes;
    
    uint256 public minStake = 1 ether; // 1 SEI minimum stake
    uint256 public minVotesForVerification = 5;
    uint256 public reputationDecayRate = 10; // Points per day
    uint256 public maxReputationScore = 1000;
    
    address public marketplaceContract;
    address public bridgeContract;
    uint256 public totalReports;
    uint256 public totalVerifiedFraud;

    // Modifiers
    modifier onlyMarketplace() {
        require(msg.sender == marketplaceContract, "Only marketplace can call");
        _;
    }

    modifier onlyStakedUser() {
        require(userStakes[msg.sender] >= minStake, "Insufficient stake");
        _;
    }

    constructor(address _marketplaceContract, address _bridgeContract) {
        marketplaceContract = _marketplaceContract;
        bridgeContract = _bridgeContract;
        
        // Initialize default alert rules
        alertRules["high_volume"] = AlertRule({
            alertType: "high_volume",
            threshold: 100, // 100 transactions per day
            cooldown: 1 days,
            active: true,
            lastTriggered: 0
        });
        
        alertRules["suspicious_pattern"] = AlertRule({
            alertType: "suspicious_pattern",
            threshold: 5, // 5 similar transactions
            cooldown: 6 hours,
            active: true,
            lastTriggered: 0
        });
    }

    /**
     * @dev Report potential fraud
     */
    function reportFraud(
        address token,
        uint256 tokenId,
        string calldata reason
    ) external onlyStakedUser nonReentrant whenNotPaused {
        require(bytes(reason).length > 0, "Reason required");
        require(fraudReports[token][tokenId].timestamp == 0, "Already reported");

        FraudReport storage report = fraudReports[token][tokenId];
        report.reporter = msg.sender;
        report.reason = reason;
        report.timestamp = block.timestamp;
        report.votes = 1;
        report.voters[msg.sender] = true;

        // Update reputation
        ReputationData storage reporterData = reputationScores[msg.sender];
        reporterData.fraudReports++;
        reporterData.lastUpdated = block.timestamp;

        totalReports++;

        emit FraudReported(msg.sender, token, tokenId, reason, block.timestamp);
    }

    /**
     * @dev Vote on a fraud report
     */
    function voteOnFraud(
        address token,
        uint256 tokenId,
        bool isFraudulent
    ) external onlyStakedUser nonReentrant whenNotPaused {
        FraudReport storage report = fraudReports[token][tokenId];
        require(report.timestamp != 0, "Report not found");
        require(!report.verified, "Report already verified");
        require(!report.voters[msg.sender], "Already voted");

        report.voters[msg.sender] = true;
        report.votes++;

        // Update reputation based on vote
        ReputationData storage voterData = reputationScores[msg.sender];
        if (isFraudulent) {
            voterData.score = voterData.score < 10 ? 0 : voterData.score - 10;
        } else {
            voterData.score = voterData.score + 5 > maxReputationScore ? maxReputationScore : voterData.score + 5;
        }
        voterData.lastUpdated = block.timestamp;

        // Check if enough votes for verification
        if (report.votes >= minVotesForVerification) {
            _verifyFraudReport(token, tokenId);
        }
    }

    /**
     * @dev Verify a fraud report based on votes
     */
    function _verifyFraudReport(address token, uint256 tokenId) internal {
        FraudReport storage report = fraudReports[token][tokenId];
        require(!report.verified, "Already verified");

        // Calculate confidence based on votes and stakes
        uint256 totalStake = 0;
        uint256 fraudStake = 0;
        
        // This is a simplified calculation
        // In practice, you'd iterate through voters and their stakes
        uint256 confidence = (report.votes * 100) / minVotesForVerification;
        
        report.verified = true;
        report.confidence = confidence;
        report.isFraudulent = confidence > 70; // 70% threshold

        if (report.isFraudulent) {
            totalVerifiedFraud++;
        }

        emit FraudVerified(token, tokenId, report.isFraudulent, confidence, msg.sender);
    }

    /**
     * @dev Update reputation for transaction
     */
    function updateReputationForTransaction(
        address user,
        bool success,
        uint256 transactionValue
    ) external onlyMarketplace {
        ReputationData storage data = reputationScores[user];
        
        if (success) {
            data.successfulTransactions++;
            data.score = data.score + 5 > maxReputationScore ? maxReputationScore : data.score + 5;
        } else {
            data.score = data.score < 10 ? 0 : data.score - 10;
        }
        
        data.totalTransactions++;
        data.lastUpdated = block.timestamp;

        // Check for suspicious patterns
        _checkSuspiciousPatterns(user, transactionValue);
        
        emit ReputationUpdated(user, success ? 5 : -10, data.score, success ? "successful_transaction" : "failed_transaction");
    }

    /**
     * @dev Check for suspicious transaction patterns
     */
    function _checkSuspiciousPatterns(address user, uint256 transactionValue) internal {
        ReputationData storage data = reputationScores[user];
        
        // High volume alert
        if (data.totalTransactions > alertRules["high_volume"].threshold) {
            if (block.timestamp > alertRules["high_volume"].lastTriggered + alertRules["high_volume"].cooldown) {
                alertRules["high_volume"].lastTriggered = block.timestamp;
                emit AlertTriggered(user, "high_volume", 2, "High transaction volume detected");
            }
        }
        
        // Suspicious pattern alert
        if (data.fraudReports > alertRules["suspicious_pattern"].threshold) {
            if (block.timestamp > alertRules["suspicious_pattern"].lastTriggered + alertRules["suspicious_pattern"].cooldown) {
                alertRules["suspicious_pattern"].lastTriggered = block.timestamp;
                emit AlertTriggered(user, "suspicious_pattern", 3, "Multiple fraud reports detected");
            }
        }
    }

    /**
     * @dev Stake tokens to participate in fraud detection
     */
    function stake() external payable nonReentrant whenNotPaused {
        require(msg.value >= minStake, "Insufficient stake amount");
        
        userStakes[msg.sender] += msg.value;
        
        // Initialize reputation if new user
        if (reputationScores[msg.sender].lastUpdated == 0) {
            reputationScores[msg.sender] = ReputationData({
                score: 500, // Starting score
                totalTransactions: 0,
                successfulTransactions: 0,
                fraudReports: 0,
                fraudReportsAgainst: 0,
                lastUpdated: block.timestamp,
                flagged: false
            });
        }
    }

    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        require(userStakes[msg.sender] >= amount, "Insufficient staked amount");
        
        userStakes[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev Get reputation score for a user
     */
    function getReputationScore(address user) external view returns (ReputationData memory) {
        return reputationScores[user];
    }

    /**
     * @dev Get fraud report details
     */
    function getFraudReport(address token, uint256 tokenId) external view returns (
        address reporter,
        string memory reason,
        uint256 timestamp,
        uint256 votes,
        bool verified,
        bool isFraudulent,
        uint256 confidence
    ) {
        FraudReport storage report = fraudReports[token][tokenId];
        return (
            report.reporter,
            report.reason,
            report.timestamp,
            report.votes,
            report.verified,
            report.isFraudulent,
            report.confidence
        );
    }

    /**
     * @dev Check if user has voted on a report
     */
    function hasVoted(address token, uint256 tokenId, address voter) external view returns (bool) {
        return fraudReports[token][tokenId].voters[voter];
    }

    /**
     * @dev Get user stake amount
     */
    function getUserStake(address user) external view returns (uint256) {
        return userStakes[user];
    }

    /**
     * @dev Get alert rule
     */
    function getAlertRule(string memory alertType) external view returns (AlertRule memory) {
        return alertRules[alertType];
    }

    // Admin functions
    function setMarketplaceContract(address _marketplace) external onlyOwner {
        marketplaceContract = _marketplace;
    }

    function setBridgeContract(address _bridge) external onlyOwner {
        bridgeContract = _bridge;
    }

    function setMinStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
    }

    function setMinVotesForVerification(uint256 _minVotes) external onlyOwner {
        minVotesForVerification = _minVotes;
    }

    function setMaxReputationScore(uint256 _maxScore) external onlyOwner {
        maxReputationScore = _maxScore;
    }

    function updateAlertRule(
        string memory alertType,
        uint256 threshold,
        uint256 cooldown,
        bool active
    ) external onlyOwner {
        alertRules[alertType] = AlertRule({
            alertType: alertType,
            threshold: threshold,
            cooldown: cooldown,
            active: active,
            lastTriggered: alertRules[alertType].lastTriggered
        });
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
            // For ERC20 tokens, you'd need to import IERC20
            // IERC20(token).transfer(owner(), amount);
        }
    }

    // Receive function for native token
    receive() external payable {
        // Accept native token for staking
    }
} 