import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { logger } from '../utils/logger';

/**
 * @title Multi-Chain Indexer Service
 * @dev Epicenter's enhanced indexer with real-time analytics and heatmap generation
 */
export class IndexerService {
    private prisma: PrismaClient;
    private providers: Map<string, ethers.providers.Provider>;
    private isRunning: boolean = false;
    private lastProcessedBlock: Map<string, number> = new Map();

    // Epicenter Analytics
    private heatmapData: Map<string, any> = new Map();
    private transactionVolume: Map<string, number> = new Map();
    private whaleActivity: Map<string, Set<string>> = new Map();
    private fraudAlerts: Map<string, any[]> = new Map();

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        this.providers = new Map();
        this.initializeProviders();
    }

    /**
     * @dev Initialize multi-chain providers
     */
    private async initializeProviders() {
        // SEI Network (Primary)
        if (process.env.SEI_RPC_URL) {
            this.providers.set('sei', new ethers.providers.JsonRpcProvider(process.env.SEI_RPC_URL));
            this.lastProcessedBlock.set('sei', 0);
        }

        // Ethereum Network
        if (process.env.ETH_RPC_URL) {
            this.providers.set('ethereum', new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL));
            this.lastProcessedBlock.set('ethereum', 0);
        }

        // Polygon Network
        if (process.env.POLYGON_RPC_URL) {
            this.providers.set('polygon', new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL));
            this.lastProcessedBlock.set('polygon', 0);
        }

        // Solana Network (via RPC)
        if (process.env.SOLANA_RPC_URL) {
            // For Solana, we'd use a different client
            this.lastProcessedBlock.set('solana', 0);
        }

        logger.info(`Initialized ${this.providers.size} blockchain providers`);
    }

    /**
     * @dev Start the indexer service
     */
    async start() {
        if (this.isRunning) {
            logger.warn('Indexer service is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting Epicenter Indexer Service...');

        // Start indexing for each chain
        for (const [chainId, provider] of this.providers) {
            this.startChainIndexer(chainId, provider);
        }

        // Start analytics processing
        this.startAnalyticsProcessor();
    }

    /**
     * @dev Start indexing for a specific chain
     */
    private async startChainIndexer(chainId: string, provider: ethers.providers.Provider) {
        try {
            const currentBlock = await provider.getBlockNumber();
            const lastProcessed = this.lastProcessedBlock.get(chainId) || currentBlock - 1000;

            logger.info(`Starting indexer for ${chainId} from block ${lastProcessed}`);

            // Process historical blocks
            for (let blockNumber = lastProcessed + 1; blockNumber <= currentBlock; blockNumber++) {
                await this.processBlock(chainId, provider, blockNumber);
            }

            // Start listening for new blocks
            provider.on('block', async (blockNumber: number) => {
                await this.processBlock(chainId, provider, blockNumber);
            });

        } catch (error) {
            logger.error(`Failed to start indexer for ${chainId}:`, error);
        }
    }

    /**
     * @dev Process a single block
     */
    private async processBlock(chainId: string, provider: ethers.providers.Provider, blockNumber: number) {
        try {
            const block = await provider.getBlockWithTransactions(blockNumber);
            
            for (const tx of block.transactions) {
                await this.processTransaction(chainId, tx, block);
            }

            this.lastProcessedBlock.set(chainId, blockNumber);
            
            // Update analytics every 10 blocks
            if (blockNumber % 10 === 0) {
                await this.updateAnalytics(chainId);
            }

        } catch (error) {
            logger.error(`Failed to process block ${blockNumber} on ${chainId}:`, error);
        }
    }

    /**
     * @dev Process a single transaction
     */
    private async processTransaction(chainId: string, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            // Check if transaction is related to our contracts
            const contractAddresses = this.getContractAddresses(chainId);
            
            if (contractAddresses.includes(tx.to?.toLowerCase() || '')) {
                await this.processContractTransaction(chainId, tx, block);
            }

            // Update transaction volume
            const volume = this.transactionVolume.get(chainId) || 0;
            this.transactionVolume.set(chainId, volume + Number(ethers.utils.formatEther(tx.value || 0)));

            // Track whale activity
            if (Number(ethers.utils.formatEther(tx.value || 0)) > 10) { // 10 SEI threshold
                const whales = this.whaleActivity.get(chainId) || new Set();
                whales.add(tx.from);
                this.whaleActivity.set(chainId, whales);
            }

        } catch (error) {
            logger.error(`Failed to process transaction ${tx.hash} on ${chainId}:`, error);
        }
    }

    /**
     * @dev Process contract-specific transactions
     */
    private async processContractTransaction(chainId: string, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            // Parse transaction data to identify events
            const contractAddresses = this.getContractAddresses(chainId);
            const contractAddress = tx.to?.toLowerCase();

            if (contractAddress === contractAddresses.seaportGala) {
                await this.processSeaportGalaTransaction(chainId, tx, block);
            } else if (contractAddress === contractAddresses.fraudRadar) {
                await this.processFraudRadarTransaction(chainId, tx, block);
            } else if (contractAddress === contractAddresses.m2Bridge) {
                await this.processBridgeTransaction(chainId, tx, block);
            }

        } catch (error) {
            logger.error(`Failed to process contract transaction ${tx.hash}:`, error);
        }
    }

    /**
     * @dev Process SeaportGala marketplace transactions
     */
    private async processSeaportGalaTransaction(chainId: string, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            // Parse transaction logs for events
            const receipt = await tx.wait();
            
            for (const log of receipt.logs) {
                // Parse OrdersMatched event
                if (log.topics[0] === this.getEventSignature('OrdersMatched')) {
                    await this.processOrderMatch(chainId, log, tx, block);
                }
                
                // Parse FloorFlipExecuted event
                if (log.topics[0] === this.getEventSignature('FloorFlipExecuted')) {
                    await this.processFloorFlip(chainId, log, tx, block);
                }
                
                // Parse SmartRoyaltySplit event
                if (log.topics[0] === this.getEventSignature('SmartRoyaltySplit')) {
                    await this.processSmartRoyalty(chainId, log, tx, block);
                }
            }

        } catch (error) {
            logger.error(`Failed to process SeaportGala transaction ${tx.hash}:`, error);
        }
    }

    /**
     * @dev Process FraudRadar transactions
     */
    private async processFraudRadarTransaction(chainId: string, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            const receipt = await tx.wait();
            
            for (const log of receipt.logs) {
                // Parse FraudReported event
                if (log.topics[0] === this.getEventSignature('FraudReported')) {
                    await this.processFraudReport(chainId, log, tx, block);
                }
                
                // Parse AlertTriggered event
                if (log.topics[0] === this.getEventSignature('AlertTriggered')) {
                    await this.processAlert(chainId, log, tx, block);
                }
            }

        } catch (error) {
            logger.error(`Failed to process FraudRadar transaction ${tx.hash}:`, error);
        }
    }

    /**
     * @dev Process bridge transactions
     */
    private async processBridgeTransaction(chainId: string, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            const receipt = await tx.wait();
            
            for (const log of receipt.logs) {
                // Parse BridgeInitiated event
                if (log.topics[0] === this.getEventSignature('BridgeInitiated')) {
                    await this.processBridgeInitiation(chainId, log, tx, block);
                }
                
                // Parse BridgeCompleted event
                if (log.topics[0] === this.getEventSignature('BridgeCompleted')) {
                    await this.processBridgeCompletion(chainId, log, tx, block);
                }
            }

        } catch (error) {
            logger.error(`Failed to process bridge transaction ${tx.hash}:`, error);
        }
    }

    /**
     * @dev Process order match event
     */
    private async processOrderMatch(chainId: string, log: ethers.providers.Log, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            // Parse event data
            const eventData = this.parseEventData(log);
            
            // Store in database
            await this.prisma.transaction.create({
                data: {
                    chainId,
                    txHash: tx.hash,
                    blockNumber: block.number,
                    timestamp: block.timestamp,
                    from: eventData.maker,
                    to: eventData.taker,
                    value: eventData.price,
                    eventType: 'ORDER_MATCHED',
                    metadata: JSON.stringify(eventData)
                }
            });

            // Update analytics
            await this.updateTransactionAnalytics(chainId, eventData);

        } catch (error) {
            logger.error('Failed to process order match:', error);
        }
    }

    /**
     * @dev Process floor flip event
     */
    private async processFloorFlip(chainId: string, log: ethers.providers.Log, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            const eventData = this.parseEventData(log);
            
            await this.prisma.transaction.create({
                data: {
                    chainId,
                    txHash: tx.hash,
                    blockNumber: block.number,
                    timestamp: block.timestamp,
                    from: eventData.buyer,
                    value: eventData.price,
                    eventType: 'FLOOR_FLIP',
                    metadata: JSON.stringify(eventData)
                }
            });

        } catch (error) {
            logger.error('Failed to process floor flip:', error);
        }
    }

    /**
     * @dev Process fraud report event
     */
    private async processFraudReport(chainId: string, log: ethers.providers.Log, tx: ethers.providers.TransactionResponse, block: ethers.providers.Block) {
        try {
            const eventData = this.parseEventData(log);
            
            await this.prisma.fraudReport.create({
                data: {
                    chainId,
                    txHash: tx.hash,
                    reporter: eventData.reporter,
                    token: eventData.token,
                    tokenId: eventData.tokenId,
                    reason: eventData.reason,
                    timestamp: new Date(block.timestamp * 1000)
                }
            });

            // Add to fraud alerts
            const alerts = this.fraudAlerts.get(chainId) || [];
            alerts.push({
                type: 'fraud_report',
                data: eventData,
                timestamp: block.timestamp
            });
            this.fraudAlerts.set(chainId, alerts);

        } catch (error) {
            logger.error('Failed to process fraud report:', error);
        }
    }

    /**
     * @dev Start analytics processor
     */
    private startAnalyticsProcessor() {
        setInterval(async () => {
            try {
                await this.generateHeatmaps();
                await this.updateWhaleActivity();
                await this.processFraudAlerts();
            } catch (error) {
                logger.error('Failed to process analytics:', error);
            }
        }, 60000); // Every minute
    }

    /**
     * @dev Generate heatmap data
     */
    private async generateHeatmaps() {
        try {
            for (const chainId of this.providers.keys()) {
                const heatmap = await this.calculateHeatmap(chainId);
                this.heatmapData.set(chainId, heatmap);
            }
        } catch (error) {
            logger.error('Failed to generate heatmaps:', error);
        }
    }

    /**
     * @dev Calculate heatmap for a chain
     */
    private async calculateHeatmap(chainId: string) {
        try {
            // Get recent transactions
            const transactions = await this.prisma.transaction.findMany({
                where: {
                    chainId,
                    timestamp: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                },
                orderBy: {
                    timestamp: 'desc'
                }
            });

            // Group by time intervals
            const heatmap = new Map();
            for (const tx of transactions) {
                const hour = Math.floor(tx.timestamp.getTime() / (60 * 60 * 1000));
                const count = heatmap.get(hour) || 0;
                heatmap.set(hour, count + 1);
            }

            return Object.fromEntries(heatmap);

        } catch (error) {
            logger.error(`Failed to calculate heatmap for ${chainId}:`, error);
            return {};
        }
    }

    /**
     * @dev Update whale activity tracking
     */
    private async updateWhaleActivity() {
        try {
            for (const [chainId, whales] of this.whaleActivity) {
                const whaleAddresses = Array.from(whales);
                
                // Store whale activity
                await this.prisma.whaleActivity.createMany({
                    data: whaleAddresses.map(address => ({
                        chainId,
                        address,
                        timestamp: new Date()
                    })),
                    skipDuplicates: true
                });
            }
        } catch (error) {
            logger.error('Failed to update whale activity:', error);
        }
    }

    /**
     * @dev Process fraud alerts
     */
    private async processFraudAlerts() {
        try {
            for (const [chainId, alerts] of this.fraudAlerts) {
                for (const alert of alerts) {
                    // Send notifications
                    await this.sendFraudAlert(chainId, alert);
                }
            }
            
            // Clear processed alerts
            this.fraudAlerts.clear();

        } catch (error) {
            logger.error('Failed to process fraud alerts:', error);
        }
    }

    /**
     * @dev Send fraud alert notification
     */
    private async sendFraudAlert(chainId: string, alert: any) {
        try {
            // In a real implementation, this would send to a notification service
            logger.warn(`Fraud alert on ${chainId}:`, alert);
            
            // Store alert in database
            await this.prisma.alert.create({
                data: {
                    chainId,
                    alertType: alert.type,
                    data: JSON.stringify(alert.data),
                    timestamp: new Date(alert.timestamp * 1000)
                }
            });

        } catch (error) {
            logger.error('Failed to send fraud alert:', error);
        }
    }

    /**
     * @dev Get contract addresses for a chain
     */
    private getContractAddresses(chainId: string) {
        const addresses = {
            sei: {
                seaportGala: process.env.SEAPORT_GALA_ADDRESS?.toLowerCase(),
                fraudRadar: process.env.FRAUD_RADAR_ADDRESS?.toLowerCase(),
                m2Bridge: process.env.M2_BRIDGE_ADDRESS?.toLowerCase()
            },
            ethereum: {
                seaportGala: process.env.ETH_SEAPORT_GALA_ADDRESS?.toLowerCase(),
                fraudRadar: process.env.ETH_FRAUD_RADAR_ADDRESS?.toLowerCase(),
                m2Bridge: process.env.ETH_M2_BRIDGE_ADDRESS?.toLowerCase()
            }
        };

        return addresses[chainId as keyof typeof addresses] || {};
    }

    /**
     * @dev Get event signature
     */
    private getEventSignature(eventName: string): string {
        const signatures = {
            'OrdersMatched': '0x4a25d94a00000000000000000000000000000000000000000000000000000000',
            'FloorFlipExecuted': '0x8f4eb60400000000000000000000000000000000000000000000000000000000',
            'SmartRoyaltySplit': '0x9d63848a00000000000000000000000000000000000000000000000000000000',
            'FraudReported': '0x8b5b9c6400000000000000000000000000000000000000000000000000000000',
            'AlertTriggered': '0x7b1837de00000000000000000000000000000000000000000000000000000000',
            'BridgeInitiated': '0x8f28397000000000000000000000000000000000000000000000000000000000',
            'BridgeCompleted': '0x7d3e3dbe00000000000000000000000000000000000000000000000000000000'
        };

        return signatures[eventName as keyof typeof signatures] || '';
    }

    /**
     * @dev Parse event data from log
     */
    private parseEventData(log: ethers.providers.Log): any {
        // This is a simplified parser
        // In practice, you'd use ethers.js ABI decoding
        return {
            // Placeholder data
            maker: log.topics[1] || '',
            taker: log.topics[2] || '',
            price: '0',
            token: log.address,
            tokenId: '0'
        };
    }

    /**
     * @dev Update transaction analytics
     */
    private async updateTransactionAnalytics(chainId: string, eventData: any) {
        try {
            // Update volume metrics
            const volume = this.transactionVolume.get(chainId) || 0;
            this.transactionVolume.set(chainId, volume + Number(eventData.price || 0));

            // Update heatmap
            const heatmap = this.heatmapData.get(chainId) || {};
            const hour = Math.floor(Date.now() / (60 * 60 * 1000));
            heatmap[hour] = (heatmap[hour] || 0) + 1;
            this.heatmapData.set(chainId, heatmap);

        } catch (error) {
            logger.error('Failed to update transaction analytics:', error);
        }
    }

    /**
     * @dev Update analytics for a chain
     */
    private async updateAnalytics(chainId: string) {
        try {
            // Store analytics in database
            await this.prisma.chainAnalytics.upsert({
                where: { chainId },
                update: {
                    volume: this.transactionVolume.get(chainId) || 0,
                    whaleCount: this.whaleActivity.get(chainId)?.size || 0,
                    heatmapData: JSON.stringify(this.heatmapData.get(chainId) || {}),
                    lastUpdated: new Date()
                },
                create: {
                    chainId,
                    volume: this.transactionVolume.get(chainId) || 0,
                    whaleCount: this.whaleActivity.get(chainId)?.size || 0,
                    heatmapData: JSON.stringify(this.heatmapData.get(chainId) || {}),
                    lastUpdated: new Date()
                }
            });

        } catch (error) {
            logger.error(`Failed to update analytics for ${chainId}:`, error);
        }
    }

    /**
     * @dev Stop the indexer service
     */
    async stop() {
        this.isRunning = false;
        logger.info('Stopping Epicenter Indexer Service...');
        
        // Remove event listeners
        for (const [chainId, provider] of this.providers) {
            provider.removeAllListeners();
        }
    }

    /**
     * @dev Get analytics data
     */
    async getAnalytics(chainId?: string) {
        try {
            if (chainId) {
                return await this.prisma.chainAnalytics.findUnique({
                    where: { chainId }
                });
            } else {
                return await this.prisma.chainAnalytics.findMany();
            }
        } catch (error) {
            logger.error('Failed to get analytics:', error);
            return null;
        }
    }

    /**
     * @dev Get heatmap data
     */
    getHeatmapData(chainId: string) {
        return this.heatmapData.get(chainId) || {};
    }

    /**
     * @dev Get whale activity
     */
    getWhaleActivity(chainId: string) {
        return Array.from(this.whaleActivity.get(chainId) || []);
    }

    /**
     * @dev Get fraud alerts
     */
    getFraudAlerts(chainId: string) {
        return this.fraudAlerts.get(chainId) || [];
    }
} 