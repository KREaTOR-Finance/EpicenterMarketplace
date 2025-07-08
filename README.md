# Seismic Epicenter NFT Marketplace

A cross-chain NFT marketplace that forks OpenSea's Wyvern V2 protocol (EVM/ERC-721 & ERC-1155) and Magic Eden's Auction House (Solana/Metaplex) into a unified marketplace running primarily on the SEI blockchain's EVM layer, with optional cross-listing on Solana.

## 🏗️ Architecture

- **Primary Chain**: SEI (EVM) for ERC-721/ERC-1155 listings
- **Primary Wallet**: SeismicWallet with native integration
- **Secondary Wallet**: MetaMask as fallback for SEI
- **Secondary Chain**: Solana for optional cross-listing via Wormhole-style relayer
- **Smart Contracts**: WyvernV2Fork (Solidity) + AuctionHouse (Rust/Anchor)
- **Backend**: Node.js + Express + GraphQL + PostgreSQL
- **Frontend**: React + Vite + TypeScript + Tailwind CSS

## 🎯 Wallet Priority

### Primary: SeismicWallet
- **Native SEI integration** with best user experience
- **Automatic network detection** and configuration
- **Optimized transaction handling** for SEI blockchain
- **Primary wallet option** in all UI components

### Secondary: MetaMask
- **Fallback option** for SEI blockchain
- **Familiar interface** for users transitioning from other marketplaces
- **Full compatibility** with existing MetaMask workflows

### Tertiary: Solana Wallets
- **Reduced prominence** in UI
- **Optional cross-chain support** for specific collections
- **Secondary priority** in wallet connection flow

## 📁 Project Structure

```
/seismic-epicenter
├─ /contracts          # Solidity smart contracts (SEI EVM)
├─ /anchor-auction     # Rust/Anchor programs (Solana)
├─ /backend           # Node.js API & indexer
├─ /frontend          # React frontend
├─ /ui                # Shared UI components
└─ /ci                # CI/CD scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Hardhat
- Anchor CLI
- PostgreSQL
- **SeismicWallet** (Primary)
- MetaMask (Fallback for SEI)
- Phantom Wallet (Solana - Optional)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd seismic-epicenter
npm install
```

2. **Environment Setup:**
```bash
# Copy environment files
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup:**
```bash
# Start PostgreSQL
# Create database
createdb seismic_epicenter
```

### Development

#### Smart Contracts (SEI)

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat deploy --network sei-testnet
```

#### Solana Programs (Optional)

```bash
cd anchor-auction
anchor build
anchor test
anchor deploy
```

#### Backend API

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each directory:

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/seismic_epicenter
SEI_RPC_URL=https://sei-testnet-rpc.example.com
SOLANA_RPC_URL=https://api.devnet.solana.com
IPFS_GATEWAY=https://ipfs.io/ipfs/
GRAPHQL_PORT=4000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:4000/graphql
VITE_SEI_CHAIN_ID=713715
VITE_SOLANA_NETWORK=devnet
```

### Network Configuration

**SEI Testnet (Primary):**
- Chain ID: 713715
- RPC: https://sei-testnet-rpc.example.com
- Explorer: https://sei-testnet-explorer.example.com
- **Primary Wallet**: SeismicWallet

**SEI Mainnet (Primary):**
- Chain ID: 713715
- RPC: https://sei-mainnet-rpc.example.com
- Explorer: https://sei-mainnet-explorer.example.com
- **Primary Wallet**: SeismicWallet

**Solana Devnet (Secondary):**
- Network: devnet
- RPC: https://api.devnet.solana.com
- **Secondary Wallet**: Phantom

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Contract tests
cd contracts && npm test

# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

## 🚀 Deployment

### Smart Contracts

```bash
# Deploy to SEI testnet
cd contracts
npx hardhat deploy --network sei-testnet

# Deploy to SEI mainnet
npx hardhat deploy --network sei-mainnet

# Verify contracts
npx hardhat verify --network sei-testnet <contract-address>
```

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Deploy to your hosting provider
```

## 🔗 API Endpoints

### GraphQL

- **Endpoint**: `http://localhost:4000/graphql`
- **Playground**: `http://localhost:4000/graphql`

### REST API

- **Health Check**: `GET /health`
- **Collections**: `GET /api/collections`
- **Listings**: `GET /api/listings`
- **Bids**: `GET /api/bids`

## 🛠️ Development Commands

```bash
# Start all services
npm run dev:all

# Start specific services
npm run dev:backend
npm run dev:frontend
npm run dev:contracts

# Linting
npm run lint

# Type checking
npm run type-check

# Build all
npm run build:all
```

## 📊 Monitoring

- **Contract Events**: Monitor via Hardhat console
- **API Metrics**: Prometheus + Grafana
- **Error Tracking**: Sentry integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Wiki Link]
- **Discord**: [Discord Server]
- **Email**: support@seismic-epicenter.com

---

**Built with ❤️ for the SEI ecosystem**

## 🎯 Key Features

### SEI-First Design
- **Primary blockchain**: SEI with native SeismicWallet integration
- **Optimized UX**: SeismicWallet-first design with MetaMask fallback
- **Fast transactions**: Leveraging SEI's high-performance infrastructure
- **Low fees**: Minimal gas costs for NFT operations

### Wallet Integration Priority
1. **SeismicWallet** - Native SEI integration (Primary)
2. **MetaMask** - Fallback for SEI (Secondary)
3. **Solana Wallets** - Optional cross-chain support (Tertiary)

### Cross-Chain Capabilities
- **Primary**: SEI blockchain with full feature set
- **Secondary**: Solana integration for specific collections
- **Bridge**: Wormhole-style relayer for cross-chain operations

---

**Seismic Epicenter - The Premier NFT Marketplace for the SEI Ecosystem** 