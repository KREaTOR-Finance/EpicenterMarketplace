import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * @title Epicenter Analytics Service
 * @dev Advanced analytics and heatmap generation for Epicenter marketplace
 */
export class AnalyticsService {
    private prisma: PrismaClient;
    private isRunning: boolean = false;

    // Analytics cache
    private heatmapCache: Map<string, any> = new Map();
    private volumeCache: Map<string, number> = new Map();
    private whaleCache: Map<string, any[]> = new Map();
    private fraudCache: Map<string, any[]> = new Map();

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * @dev Start the analytics service
     */
    async start() {
        if (this.isRunning) {
            logger.warn('Analytics service is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting Epicenter Analytics Service...');

        // Start analytics processors
        this.startHeatmapProcessor();
        this.startVolumeProcessor();
        this.startWhaleProcessor();
        this.startFraudProcessor();
    }

    /**
     * @dev Start heatmap processor
     */
    private startHeatmapProcessor() {
        setInterval(async () => {
            try {
                await this.generateHeatmaps();
            } catch (error) {
                logger.error('Failed to generate heatmaps:', error);
            }
        }, 300000); // Every 5 minutes
    }

    /**
     * @dev Start volume processor
     */
    private startVolumeProcessor() {
        setInterval(async () => {
            try {
                await this.calculateVolumeMetrics();
            } catch (error) {
                logger.error('Failed to calculate volume metrics:', error);
            }
        }, 60000); // Every minute
    }

    /**
     * @dev Start whale processor
     */
    private startWhaleProcessor() {
        setInterval(async () => {
            try {
                await this.trackWhaleActivity();
            } catch (error) {
                logger.error('Failed to track whale activity:', error);
            }
        }, 300000); // Every 5 minutes
    }

    /**
     * @dev Start fraud processor
     */
    private startFraudProcessor() {
        setInterval(async () => {
            try {
                await this.analyzeFraudPatterns();
            } catch (error) {
                logger.error('Failed to analyze fraud patterns:', error);
            }
        }, 600000); // Every 10 minutes
    }

    /**
     * @dev Generate heatmaps for all chains
     */
    private async generateHeatmaps() {
        try {
            const chains = ['sei', 'ethereum', 'polygon', 'solana'];

            for (const chainId of chains) {
                const heatmap = await this.calculateChainHeatmap(chainId);
                this.heatmapCache.set(chainId, heatmap);

                // Store in database
                await this.prisma.heatmapData.upsert({
                    where: { chainId },
                    update: {
                        data: JSON.stringify(heatmap),
                        lastUpdated: new Date()
                    },
                    create: {
                        chainId,
                        data: JSON.stringify(heatmap),
                        lastUpdated: new Date()
                    }
                });
            }

            logger.info('Heatmaps generated successfully');

        } catch (error) {
            logger.error('Failed to generate heatmaps:', error);
        }
    }

    /**
     * @dev Calculate heatmap for a specific chain
     */
    private async calculateChainHeatmap(chainId: string) {
        try {
            // Get transactions from last 24 hours
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            const transactions = await this.prisma.transaction.findMany({
                where: {
                    chainId,
                    timestamp: {
                        gte: twentyFourHoursAgo
                    }
                },
                orderBy: {
                    timestamp: 'asc'
                }
            });

            // Group by hour
            const hourlyData = new Map();
            const dailyData = new Map();

            for (const tx of transactions) {
                const hour = Math.floor(tx.timestamp.getTime() / (60 * 60 * 1000));
                const day = Math.floor(tx.timestamp.getTime() / (24 * 60 * 60 * 1000));

                // Hourly data
                const hourKey = `${day}-${hour % 24}`;
                const hourCount = hourlyData.get(hourKey) || 0;
                const hourVolume = hourlyData.get(`${hourKey}-volume`) || 0;
                hourlyData.set(hourKey, hourCount + 1);
                hourlyData.set(`${hourKey}-volume`, hourVolume + Number(tx.value || 0));

                // Daily data
                const dayCount = dailyData.get(day) || 0;
                const dayVolume = dailyData.get(`${day}-volume`) || 0;
                dailyData.set(day, dayCount + 1);
                dailyData.set(`${day}-volume`, dayVolume + Number(tx.value || 0));
            }

            return {
                hourly: Object.fromEntries(hourlyData),
                daily: Object.fromEntries(dailyData),
                totalTransactions: transactions.length,
                totalVolume: transactions.reduce((sum, tx) => sum + Number(tx.value || 0), 0)
            };

        } catch (error) {
            logger.error(`Failed to calculate heatmap for ${chainId}:`, error);
            return {
                hourly: {},
                daily: {},
                totalTransactions: 0,
                totalVolume: 0
            };
        }
    }

    /**
     * @dev Calculate volume metrics
     */
    private async calculateVolumeMetrics() {
        try {
            const chains = ['sei', 'ethereum', 'polygon', 'solana'];

            for (const chainId of chains) {
                // Get volume for different time periods
                const now = new Date();
                const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

                const hourlyVolume = await this.getVolumeForPeriod(chainId, oneHourAgo, now);
                const dailyVolume = await this.getVolumeForPeriod(chainId, oneDayAgo, now);
                const weeklyVolume = await this.getVolumeForPeriod(chainId, oneWeekAgo, now);

                this.volumeCache.set(`${chainId}-hourly`, hourlyVolume);
                this.volumeCache.set(`${chainId}-daily`, dailyVolume);
                this.volumeCache.set(`${chainId}-weekly`, weeklyVolume);

                // Store in database
                await this.prisma.volumeMetrics.upsert({
                    where: { chainId },
                    update: {
                        hourlyVolume,
                        dailyVolume,
                        weeklyVolume,
                        lastUpdated: new Date()
                    },
                    create: {
                        chainId,
                        hourlyVolume,
                        dailyVolume,
                        weeklyVolume,
                        lastUpdated: new Date()
                    }
                });
            }

        } catch (error) {
            logger.error('Failed to calculate volume metrics:', error);
        }
    }

    /**
     * @dev Get volume for a specific time period
     */
    private async getVolumeForPeriod(chainId: string, startTime: Date, endTime: Date): Promise<number> {
        try {
            const result = await this.prisma.transaction.aggregate({
                where: {
                    chainId,
                    timestamp: {
                        gte: startTime,
                        lte: endTime
                    }
                },
                _sum: {
                    value: true
                }
            });

            return Number(result._sum.value || 0);

        } catch (error) {
            logger.error(`Failed to get volume for ${chainId}:`, error);
            return 0;
        }
    }

    /**
     * @dev Track whale activity
     */
    private async trackWhaleActivity() {
        try {
            const chains = ['sei', 'ethereum', 'polygon', 'solana'];
            const whaleThreshold = 10; // 10 SEI minimum for whale activity

            for (const chainId of chains) {
                // Get recent large transactions
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                
                const whaleTransactions = await this.prisma.transaction.findMany({
                    where: {
                        chainId,
                        value: {
                            gte: whaleThreshold
                        },
                        timestamp: {
                            gte: oneDayAgo
                        }
                    },
                    orderBy: {
                        timestamp: 'desc'
                    },
                    take: 100
                });

                // Group by address
                const whaleActivity = new Map();
                for (const tx of whaleTransactions) {
                    const address = tx.from;
                    const existing = whaleActivity.get(address) || {
                        address,
                        totalVolume: 0,
                        transactionCount: 0,
                        lastTransaction: tx.timestamp
                    };

                    existing.totalVolume += Number(tx.value || 0);
                    existing.transactionCount += 1;
                    existing.lastTransaction = tx.timestamp;
                    whaleActivity.set(address, existing);
                }

                const whaleList = Array.from(whaleActivity.values())
                    .sort((a, b) => b.totalVolume - a.totalVolume)
                    .slice(0, 50); // Top 50 whales

                this.whaleCache.set(chainId, whaleList);

                // Store in database
                await this.prisma.whaleActivity.createMany({
                    data: whaleList.map(whale => ({
                        chainId,
                        address: whale.address,
                        totalVolume: whale.totalVolume,
                        transactionCount: whale.transactionCount,
                        lastTransaction: whale.lastTransaction
                    })),
                    skipDuplicates: true
                });
            }

        } catch (error) {
            logger.error('Failed to track whale activity:', error);
        }
    }

    /**
     * @dev Analyze fraud patterns
     */
    private async analyzeFraudPatterns() {
        try {
            const chains = ['sei', 'ethereum', 'polygon', 'solana'];

            for (const chainId of chains) {
                // Get recent fraud reports
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                const fraudReports = await this.prisma.fraudReport.findMany({
                    where: {
                        chainId,
                        timestamp: {
                            gte: oneWeekAgo
                        }
                    },
                    orderBy: {
                        timestamp: 'desc'
                    }
                });

                // Analyze patterns
                const fraudAnalysis = this.analyzeFraudData(fraudReports);
                this.fraudCache.set(chainId, fraudAnalysis);

                // Store analysis in database
                await this.prisma.fraudAnalysis.upsert({
                    where: { chainId },
                    update: {
                        totalReports: fraudAnalysis.totalReports,
                        verifiedFraud: fraudAnalysis.verifiedFraud,
                        commonReasons: JSON.stringify(fraudAnalysis.commonReasons),
                        riskScore: fraudAnalysis.riskScore,
                        lastUpdated: new Date()
                    },
                    create: {
                        chainId,
                        totalReports: fraudAnalysis.totalReports,
                        verifiedFraud: fraudAnalysis.verifiedFraud,
                        commonReasons: JSON.stringify(fraudAnalysis.commonReasons),
                        riskScore: fraudAnalysis.riskScore,
                        lastUpdated: new Date()
                    }
                });
            }

        } catch (error) {
            logger.error('Failed to analyze fraud patterns:', error);
        }
    }

    /**
     * @dev Analyze fraud data
     */
    private analyzeFraudData(fraudReports: any[]) {
        try {
            const totalReports = fraudReports.length;
            const verifiedFraud = fraudReports.filter(report => report.verified).length;
            
            // Count common reasons
            const reasonCounts = new Map();
            for (const report of fraudReports) {
                const reason = report.reason;
                reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
            }

            const commonReasons = Array.from(reasonCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([reason, count]) => ({ reason, count }));

            // Calculate risk score (0-100)
            const riskScore = Math.min(100, (verifiedFraud / Math.max(totalReports, 1)) * 100);

            return {
                totalReports,
                verifiedFraud,
                commonReasons,
                riskScore
            };

        } catch (error) {
            logger.error('Failed to analyze fraud data:', error);
            return {
                totalReports: 0,
                verifiedFraud: 0,
                commonReasons: [],
                riskScore: 0
            };
        }
    }

    /**
     * @dev Get heatmap data
     */
    async getHeatmapData(chainId: string) {
        try {
            // Return cached data if available
            if (this.heatmapCache.has(chainId)) {
                return this.heatmapCache.get(chainId);
            }

            // Get from database
            const heatmapData = await this.prisma.heatmapData.findUnique({
                where: { chainId }
            });

            if (heatmapData) {
                const data = JSON.parse(heatmapData.data);
                this.heatmapCache.set(chainId, data);
                return data;
            }

            return null;

        } catch (error) {
            logger.error(`Failed to get heatmap data for ${chainId}:`, error);
            return null;
        }
    }

    /**
     * @dev Get volume metrics
     */
    async getVolumeMetrics(chainId: string) {
        try {
            const metrics = await this.prisma.volumeMetrics.findUnique({
                where: { chainId }
            });

            if (metrics) {
                return {
                    hourlyVolume: metrics.hourlyVolume,
                    dailyVolume: metrics.dailyVolume,
                    weeklyVolume: metrics.weeklyVolume,
                    lastUpdated: metrics.lastUpdated
                };
            }

            return null;

        } catch (error) {
            logger.error(`Failed to get volume metrics for ${chainId}:`, error);
            return null;
        }
    }

    /**
     * @dev Get whale activity
     */
    async getWhaleActivity(chainId: string, limit: number = 50) {
        try {
            const whales = await this.prisma.whaleActivity.findMany({
                where: { chainId },
                orderBy: {
                    totalVolume: 'desc'
                },
                take: limit
            });

            return whales;

        } catch (error) {
            logger.error(`Failed to get whale activity for ${chainId}:`, error);
            return [];
        }
    }

    /**
     * @dev Get fraud analysis
     */
    async getFraudAnalysis(chainId: string) {
        try {
            const analysis = await this.prisma.fraudAnalysis.findUnique({
                where: { chainId }
            });

            if (analysis) {
                return {
                    totalReports: analysis.totalReports,
                    verifiedFraud: analysis.verifiedFraud,
                    commonReasons: JSON.parse(analysis.commonReasons),
                    riskScore: analysis.riskScore,
                    lastUpdated: analysis.lastUpdated
                };
            }

            return null;

        } catch (error) {
            logger.error(`Failed to get fraud analysis for ${chainId}:`, error);
            return null;
        }
    }

    /**
     * @dev Get comprehensive analytics
     */
    async getComprehensiveAnalytics(chainId?: string) {
        try {
            const chains = chainId ? [chainId] : ['sei', 'ethereum', 'polygon', 'solana'];
            const analytics = {};

            for (const chain of chains) {
                const heatmap = await this.getHeatmapData(chain);
                const volume = await this.getVolumeMetrics(chain);
                const whales = await this.getWhaleActivity(chain, 10);
                const fraud = await this.getFraudAnalysis(chain);

                analytics[chain] = {
                    heatmap,
                    volume,
                    whales,
                    fraud
                };
            }

            return analytics;

        } catch (error) {
            logger.error('Failed to get comprehensive analytics:', error);
            return {};
        }
    }

    /**
     * @dev Generate market insights
     */
    async generateMarketInsights(chainId: string) {
        try {
            const heatmap = await this.getHeatmapData(chainId);
            const volume = await this.getVolumeMetrics(chainId);
            const fraud = await this.getFraudAnalysis(chainId);

            const insights = {
                marketTrend: this.calculateMarketTrend(volume),
                peakHours: this.findPeakHours(heatmap),
                whaleDominance: this.calculateWhaleDominance(chainId),
                riskLevel: this.calculateRiskLevel(fraud),
                recommendations: this.generateRecommendations(heatmap, volume, fraud)
            };

            return insights;

        } catch (error) {
            logger.error(`Failed to generate market insights for ${chainId}:`, error);
            return null;
        }
    }

    /**
     * @dev Calculate market trend
     */
    private calculateMarketTrend(volume: any) {
        if (!volume) return 'stable';

        const hourlyChange = ((volume.hourlyVolume - volume.dailyVolume / 24) / (volume.dailyVolume / 24)) * 100;
        const dailyChange = ((volume.dailyVolume - volume.weeklyVolume / 7) / (volume.weeklyVolume / 7)) * 100;

        if (hourlyChange > 10 && dailyChange > 20) return 'bullish';
        if (hourlyChange < -10 && dailyChange < -20) return 'bearish';
        return 'stable';
    }

    /**
     * @dev Find peak trading hours
     */
    private findPeakHours(heatmap: any) {
        if (!heatmap || !heatmap.hourly) return [];

        const hourlyData = heatmap.hourly;
        const hours = Object.keys(hourlyData)
            .filter(key => !key.includes('-volume'))
            .map(hour => ({
                hour: parseInt(hour.split('-')[1]),
                volume: hourlyData[`${hour}-volume`] || 0,
                transactions: hourlyData[hour] || 0
            }))
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 3);

        return hours;
    }

    /**
     * @dev Calculate whale dominance
     */
    private async calculateWhaleDominance(chainId: string) {
        try {
            const whales = await this.getWhaleActivity(chainId, 10);
            const totalVolume = await this.getVolumeMetrics(chainId);

            if (!totalVolume || !whales.length) return 0;

            const whaleVolume = whales.reduce((sum, whale) => sum + whale.totalVolume, 0);
            return (whaleVolume / totalVolume.dailyVolume) * 100;

        } catch (error) {
            logger.error(`Failed to calculate whale dominance for ${chainId}:`, error);
            return 0;
        }
    }

    /**
     * @dev Calculate risk level
     */
    private calculateRiskLevel(fraud: any) {
        if (!fraud) return 'low';

        const riskScore = fraud.riskScore;
        if (riskScore > 70) return 'high';
        if (riskScore > 30) return 'medium';
        return 'low';
    }

    /**
     * @dev Generate recommendations
     */
    private generateRecommendations(heatmap: any, volume: any, fraud: any) {
        const recommendations = [];

        if (volume && volume.dailyVolume < volume.weeklyVolume / 7) {
            recommendations.push('Market volume is below average. Consider promotional activities.');
        }

        if (fraud && fraud.riskScore > 50) {
            recommendations.push('High fraud risk detected. Increase monitoring and validation.');
        }

        if (heatmap && heatmap.totalTransactions > 1000) {
            recommendations.push('High transaction volume. Consider scaling infrastructure.');
        }

        return recommendations;
    }

    /**
     * @dev Stop the analytics service
     */
    async stop() {
        this.isRunning = false;
        logger.info('Stopping Epicenter Analytics Service...');
    }
} 