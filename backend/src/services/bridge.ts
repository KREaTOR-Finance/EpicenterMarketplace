import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { logger } from '../utils/logger';

/**
 * @title Cross-Chain Bridge Service
 * @dev Epicenter's bridge service for seamless cross-chain NFT transfers
 */
export class BridgeService {
    private prisma: PrismaClient;
    private providers: Map<string, ethers.providers.Provider>;
    private bridgeContracts: Map<string, ethers.Contract>;
    private isRunning: boolean = false;

    // Bridge state
    private pendingBridges: Map<string, any> = new Map();
    private completedBridges: Map<string, any> = new Map();
    private failedBridges: Map<string, any> = new Map();

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        this.providers = new Map();
        this.bridgeContracts = new Map();
        this.initializeProviders();
    }

    /**
     * @dev Initialize providers and bridge contracts
     */
    private async initializeProviders() {
        // SEI Network (Primary)
        if (process.env.SEI_RPC_URL) {
            const seiProvider = new ethers.providers.JsonRpcProvider(process.env.SEI_RPC_URL);
            this.providers.set('sei', seiProvider);
            
            if (process.env.SEI_BRIDGE_ADDRESS) {
                const bridgeABI = this.getBridgeABI();
                const bridgeContract = new ethers.Contract(
                    process.env.SEI_BRIDGE_ADDRESS,
                    bridgeABI,
                    seiProvider
                );
                this.bridgeContracts.set('sei', bridgeContract);
            }
        }

        // Ethereum Network
        if (process.env.ETH_RPC_URL) {
            const ethProvider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
            this.providers.set('ethereum', ethProvider);
            
            if (process.env.ETH_BRIDGE_ADDRESS) {
                const bridgeABI = this.getBridgeABI();
                const bridgeContract = new ethers.Contract(
                    process.env.ETH_BRIDGE_ADDRESS,
                    bridgeABI,
                    ethProvider
                );
                this.bridgeContracts.set('ethereum', bridgeContract);
            }
        }

        // Solana Network (via RPC)
        if (process.env.SOLANA_RPC_URL) {
            // For Solana, we'd use a different client
            this.providers.set('solana', null as any);
        }

        logger.info(`Initialized ${this.providers.size} bridge providers`);
    }

    /**
     * @dev Start the bridge service
     */
    async start() {
        if (this.isRunning) {
            logger.warn('Bridge service is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting Epicenter Bridge Service...');

        // Start listening for bridge events
        for (const [chainId, contract] of this.bridgeContracts) {
            this.startBridgeListener(chainId, contract);
        }

        // Start bridge processor
        this.startBridgeProcessor();
    }

    /**
     * @dev Start listening for bridge events
     */
    private async startBridgeListener(chainId: string, contract: ethers.Contract) {
        try {
            // Listen for BridgeInitiated events
            contract.on('BridgeInitiated', async (
                from: string,
                bridgeId: string,
                token: string,
                tokenId: string,
                targetChain: string,
                targetAddress: string,
                event: ethers.Event
            ) => {
                await this.processBridgeInitiation(chainId, {
                    from,
                    bridgeId,
                    token,
                    tokenId,
                    targetChain,
                    targetAddress,
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                });
            });

            // Listen for BridgeCompleted events
            contract.on('BridgeCompleted', async (
                bridgeId: string,
                token: string,
                tokenId: string,
                recipient: string,
                sourceChain: string,
                event: ethers.Event
            ) => {
                await this.processBridgeCompletion(chainId, {
                    bridgeId,
                    token,
                    tokenId,
                    recipient,
                    sourceChain,
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                });
            });

            // Listen for BridgeCancelled events
            contract.on('BridgeCancelled', async (
                bridgeId: string,
                from: string,
                event: ethers.Event
            ) => {
                await this.processBridgeCancellation(chainId, {
                    bridgeId,
                    from,
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                });
            });

            logger.info(`Started bridge listener for ${chainId}`);

        } catch (error) {
            logger.error(`Failed to start bridge listener for ${chainId}:`, error);
        }
    }

    /**
     * @dev Process bridge initiation
     */
    private async processBridgeInitiation(chainId: string, data: any) {
        try {
            logger.info(`Bridge initiated on ${chainId}:`, data);

            // Store bridge request
            await this.prisma.bridgeRequest.create({
                data: {
                    bridgeId: data.bridgeId,
                    sourceChain: chainId,
                    targetChain: data.targetChain,
                    from: data.from,
                    token: data.token,
                    tokenId: data.tokenId,
                    targetAddress: data.targetAddress,
                    status: 'PENDING',
                    blockNumber: data.blockNumber,
                    transactionHash: data.transactionHash,
                    createdAt: new Date()
                }
            });

            // Add to pending bridges
            this.pendingBridges.set(data.bridgeId, {
                ...data,
                sourceChain: chainId,
                status: 'PENDING',
                createdAt: Date.now()
            });

            // Trigger cross-chain validation
            await this.validateCrossChainBridge(data);

        } catch (error) {
            logger.error('Failed to process bridge initiation:', error);
        }
    }

    /**
     * @dev Process bridge completion
     */
    private async processBridgeCompletion(chainId: string, data: any) {
        try {
            logger.info(`Bridge completed on ${chainId}:`, data);

            // Update bridge request
            await this.prisma.bridgeRequest.update({
                where: { bridgeId: data.bridgeId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    recipient: data.recipient
                }
            });

            // Move from pending to completed
            const pendingBridge = this.pendingBridges.get(data.bridgeId);
            if (pendingBridge) {
                this.pendingBridges.delete(data.bridgeId);
                this.completedBridges.set(data.bridgeId, {
                    ...pendingBridge,
                    ...data,
                    status: 'COMPLETED',
                    completedAt: Date.now()
                });
            }

            // Trigger post-completion actions
            await this.handleBridgeCompletion(data);

        } catch (error) {
            logger.error('Failed to process bridge completion:', error);
        }
    }

    /**
     * @dev Process bridge cancellation
     */
    private async processBridgeCancellation(chainId: string, data: any) {
        try {
            logger.info(`Bridge cancelled on ${chainId}:`, data);

            // Update bridge request
            await this.prisma.bridgeRequest.update({
                where: { bridgeId: data.bridgeId },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date()
                }
            });

            // Move from pending to failed
            const pendingBridge = this.pendingBridges.get(data.bridgeId);
            if (pendingBridge) {
                this.pendingBridges.delete(data.bridgeId);
                this.failedBridges.set(data.bridgeId, {
                    ...pendingBridge,
                    ...data,
                    status: 'CANCELLED',
                    cancelledAt: Date.now()
                });
            }

        } catch (error) {
            logger.error('Failed to process bridge cancellation:', error);
        }
    }

    /**
     * @dev Validate cross-chain bridge
     */
    private async validateCrossChainBridge(data: any) {
        try {
            // Check if target chain is supported
            const supportedChains = ['sei', 'ethereum', 'polygon', 'solana'];
            if (!supportedChains.includes(data.targetChain)) {
                throw new Error(`Unsupported target chain: ${data.targetChain}`);
            }

            // Validate token exists on source chain
            const sourceProvider = this.providers.get(data.sourceChain);
            if (sourceProvider) {
                const tokenContract = new ethers.Contract(
                    data.token,
                    ['function ownerOf(uint256) view returns (address)'],
                    sourceProvider
                );

                const owner = await tokenContract.ownerOf(data.tokenId);
                if (owner !== data.from) {
                    throw new Error('Token not owned by bridge initiator');
                }
            }

            // Store validation result
            await this.prisma.bridgeValidation.create({
                data: {
                    bridgeId: data.bridgeId,
                    sourceChain: data.sourceChain,
                    targetChain: data.targetChain,
                    isValid: true,
                    validatedAt: new Date()
                }
            });

            logger.info(`Bridge validation successful for ${data.bridgeId}`);

        } catch (error) {
            logger.error(`Bridge validation failed for ${data.bridgeId}:`, error);
            
            // Mark bridge as failed
            await this.prisma.bridgeRequest.update({
                where: { bridgeId: data.bridgeId },
                data: {
                    status: 'FAILED',
                    failedAt: new Date(),
                    failureReason: error.message
                }
            });
        }
    }

    /**
     * @dev Handle bridge completion
     */
    private async handleBridgeCompletion(data: any) {
        try {
            // Update NFT metadata for target chain
            await this.updateNFTMetadata(data);

            // Send completion notification
            await this.sendBridgeNotification(data);

            // Update analytics
            await this.updateBridgeAnalytics(data);

        } catch (error) {
            logger.error('Failed to handle bridge completion:', error);
        }
    }

    /**
     * @dev Update NFT metadata for target chain
     */
    private async updateNFTMetadata(data: any) {
        try {
            // Store cross-chain NFT mapping
            await this.prisma.crossChainNFT.create({
                data: {
                    sourceChain: data.sourceChain,
                    targetChain: data.targetChain,
                    sourceToken: data.token,
                    sourceTokenId: data.tokenId,
                    targetToken: data.token, // In practice, this would be different
                    targetTokenId: data.tokenId,
                    bridgeId: data.bridgeId,
                    bridgedAt: new Date()
                }
            });

        } catch (error) {
            logger.error('Failed to update NFT metadata:', error);
        }
    }

    /**
     * @dev Send bridge notification
     */
    private async sendBridgeNotification(data: any) {
        try {
            // In a real implementation, this would send to a notification service
            logger.info(`Bridge completion notification for ${data.bridgeId}`);

            // Store notification
            await this.prisma.notification.create({
                data: {
                    type: 'BRIDGE_COMPLETED',
                    recipient: data.recipient,
                    data: JSON.stringify(data),
                    sentAt: new Date()
                }
            });

        } catch (error) {
            logger.error('Failed to send bridge notification:', error);
        }
    }

    /**
     * @dev Update bridge analytics
     */
    private async updateBridgeAnalytics(data: any) {
        try {
            // Update bridge statistics
            await this.prisma.bridgeStats.upsert({
                where: { 
                    sourceChain_targetChain: {
                        sourceChain: data.sourceChain,
                        targetChain: data.targetChain
                    }
                },
                update: {
                    totalBridges: {
                        increment: 1
                    },
                    lastBridgeAt: new Date()
                },
                create: {
                    sourceChain: data.sourceChain,
                    targetChain: data.targetChain,
                    totalBridges: 1,
                    lastBridgeAt: new Date()
                }
            });

        } catch (error) {
            logger.error('Failed to update bridge analytics:', error);
        }
    }

    /**
     * @dev Start bridge processor
     */
    private startBridgeProcessor() {
        setInterval(async () => {
            try {
                await this.processPendingBridges();
                await this.cleanupExpiredBridges();
            } catch (error) {
                logger.error('Failed to process bridges:', error);
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * @dev Process pending bridges
     */
    private async processPendingBridges() {
        try {
            for (const [bridgeId, bridge] of this.pendingBridges) {
                const age = Date.now() - bridge.createdAt;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours

                if (age > maxAge) {
                    // Bridge has expired
                    await this.handleExpiredBridge(bridgeId, bridge);
                }
            }
        } catch (error) {
            logger.error('Failed to process pending bridges:', error);
        }
    }

    /**
     * @dev Handle expired bridge
     */
    private async handleExpiredBridge(bridgeId: string, bridge: any) {
        try {
            logger.warn(`Bridge ${bridgeId} has expired`);

            // Update database
            await this.prisma.bridgeRequest.update({
                where: { bridgeId },
                data: {
                    status: 'EXPIRED',
                    expiredAt: new Date()
                }
            });

            // Move to failed bridges
            this.pendingBridges.delete(bridgeId);
            this.failedBridges.set(bridgeId, {
                ...bridge,
                status: 'EXPIRED',
                expiredAt: Date.now()
            });

        } catch (error) {
            logger.error(`Failed to handle expired bridge ${bridgeId}:`, error);
        }
    }

    /**
     * @dev Cleanup expired bridges
     */
    private async cleanupExpiredBridges() {
        try {
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
            const now = Date.now();

            // Cleanup completed bridges
            for (const [bridgeId, bridge] of this.completedBridges) {
                if (now - bridge.completedAt > maxAge) {
                    this.completedBridges.delete(bridgeId);
                }
            }

            // Cleanup failed bridges
            for (const [bridgeId, bridge] of this.failedBridges) {
                if (now - bridge.failedAt > maxAge) {
                    this.failedBridges.delete(bridgeId);
                }
            }

        } catch (error) {
            logger.error('Failed to cleanup expired bridges:', error);
        }
    }

    /**
     * @dev Initiate a bridge transfer
     */
    async initiateBridge(
        sourceChain: string,
        targetChain: string,
        token: string,
        tokenId: string,
        targetAddress: string,
        signer: ethers.Signer
    ) {
        try {
            const bridgeContract = this.bridgeContracts.get(sourceChain);
            if (!bridgeContract) {
                throw new Error(`Bridge contract not found for ${sourceChain}`);
            }

            const connectedContract = bridgeContract.connect(signer);
            
            // Calculate bridge fee
            const bridgeFee = await connectedContract.bridgeFee();
            
            // Initiate bridge
            const tx = await connectedContract.initiateBridge(
                token,
                tokenId,
                targetChain,
                targetAddress,
                { value: bridgeFee }
            );

            logger.info(`Bridge initiated: ${tx.hash}`);

            return {
                success: true,
                transactionHash: tx.hash,
                bridgeFee: bridgeFee.toString()
            };

        } catch (error) {
            logger.error('Failed to initiate bridge:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * @dev Get bridge status
     */
    async getBridgeStatus(bridgeId: string) {
        try {
            const bridgeRequest = await this.prisma.bridgeRequest.findUnique({
                where: { bridgeId }
            });

            if (!bridgeRequest) {
                return { status: 'NOT_FOUND' };
            }

            return {
                status: bridgeRequest.status,
                sourceChain: bridgeRequest.sourceChain,
                targetChain: bridgeRequest.targetChain,
                from: bridgeRequest.from,
                token: bridgeRequest.token,
                tokenId: bridgeRequest.tokenId,
                createdAt: bridgeRequest.createdAt,
                completedAt: bridgeRequest.completedAt,
                cancelledAt: bridgeRequest.cancelledAt,
                failedAt: bridgeRequest.failedAt
            };

        } catch (error) {
            logger.error('Failed to get bridge status:', error);
            return { status: 'ERROR', error: error.message };
        }
    }

    /**
     * @dev Get bridge statistics
     */
    async getBridgeStats() {
        try {
            const stats = await this.prisma.bridgeStats.findMany();
            
            const totalBridges = await this.prisma.bridgeRequest.count();
            const pendingBridges = await this.prisma.bridgeRequest.count({
                where: { status: 'PENDING' }
            });
            const completedBridges = await this.prisma.bridgeRequest.count({
                where: { status: 'COMPLETED' }
            });
            const failedBridges = await this.prisma.bridgeRequest.count({
                where: { status: { in: ['FAILED', 'CANCELLED', 'EXPIRED'] } }
            });

            return {
                totalBridges,
                pendingBridges,
                completedBridges,
                failedBridges,
                chainStats: stats
            };

        } catch (error) {
            logger.error('Failed to get bridge stats:', error);
            return null;
        }
    }

    /**
     * @dev Stop the bridge service
     */
    async stop() {
        this.isRunning = false;
        logger.info('Stopping Epicenter Bridge Service...');
        
        // Remove event listeners
        for (const [chainId, contract] of this.bridgeContracts) {
            contract.removeAllListeners();
        }
    }

    /**
     * @dev Get bridge ABI
     */
    private getBridgeABI(): string[] {
        return [
            'event BridgeInitiated(address indexed from, bytes32 indexed bridgeId, address token, uint256 tokenId, uint256 targetChain, bytes targetAddress)',
            'event BridgeCompleted(bytes32 indexed bridgeId, address token, uint256 tokenId, address recipient, uint256 sourceChain)',
            'event BridgeCancelled(bytes32 indexed bridgeId, address indexed from)',
            'function initiateBridge(address token, uint256 tokenId, uint256 targetChain, bytes calldata targetAddress) external payable',
            'function bridgeFee() external view returns (uint256)',
            'function getBridgeRequest(bytes32 bridgeId) external view returns (tuple)'
        ];
    }
} 