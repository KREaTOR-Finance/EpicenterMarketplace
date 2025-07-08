import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    "sei-testnet": {
      url: process.env.SEI_TESTNET_RPC_URL || "https://sei-testnet-rpc.example.com",
      chainId: 713715,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    "sei-mainnet": {
      url: process.env.SEI_MAINNET_RPC_URL || "https://sei-mainnet-rpc.example.com",
      chainId: 713715,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
  },
  etherscan: {
    apiKey: {
      "sei-testnet": process.env.SEI_EXPLORER_API_KEY || "",
      "sei-mainnet": process.env.SEI_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "sei-testnet",
        chainId: 713715,
        urls: {
          apiURL: "https://sei-testnet-explorer.example.com/api",
          browserURL: "https://sei-testnet-explorer.example.com",
        },
      },
      {
        network: "sei-mainnet",
        chainId: 713715,
        urls: {
          apiURL: "https://sei-mainnet-explorer.example.com/api",
          browserURL: "https://sei-mainnet-explorer.example.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 40000,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config; 