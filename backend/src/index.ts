import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

// Import resolvers
import { CollectionResolver } from './resolvers/CollectionResolver';
import { ListingResolver } from './resolvers/ListingResolver';
import { UserResolver } from './resolvers/UserResolver';
import { BidResolver } from './resolvers/BidResolver';
import { AuctionResolver } from './resolvers/AuctionResolver';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import services
import { BlockchainService } from './services/BlockchainService';
import { IndexerService } from './services/IndexerService';
import { StorageService } from './services/StorageService';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/collections', require('./routes/collections'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/auctions', require('./routes/auctions'));

// GraphQL setup
async function startApolloServer() {
  const schema = await buildSchema({
    resolvers: [
      CollectionResolver,
      ListingResolver,
      UserResolver,
      BidResolver,
      AuctionResolver
    ],
    validate: false,
    authChecker: ({ context }) => {
      return !!context.user;
    }
  });

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const user = authMiddleware(req);
      return { user, prisma };
    },
    plugins: [
      {
        requestDidStart: async () => ({
          willSendResponse: async ({ response }) => {
            logger.info(`GraphQL Response: ${JSON.stringify(response.data)}`);
          }
        })
      }
    ],
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return error;
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  });

  useServer({ schema }, wsServer);

  logger.info(`GraphQL server ready at http://localhost:${process.env.PORT || 4000}${server.graphqlPath}`);
}

// Error handling middleware
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    // Initialize blockchain service
    const blockchainService = new BlockchainService();
    await blockchainService.initialize();

    // Initialize indexer service
    const indexerService = new IndexerService(prisma, blockchainService);
    await indexerService.start();

    // Initialize storage service
    const storageService = new StorageService();
    await storageService.initialize();

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeServices();
    await startApolloServer();

    const port = process.env.PORT || 4000;
    httpServer.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`🔗 GraphQL endpoint: http://localhost:${port}/graphql`);
      logger.info(`🔗 GraphQL playground: http://localhost:${port}/graphql`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 