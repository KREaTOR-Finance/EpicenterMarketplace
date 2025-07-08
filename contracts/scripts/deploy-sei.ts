import { ethers } from "hardhat";
import { verify } from "./verify";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Royalties contract first
  console.log("\nDeploying Royalties contract...");
  const Royalties = await ethers.getContractFactory("Royalties");
  const royalties = await Royalties.deploy();
  await royalties.deployed();
  console.log("Royalties deployed to:", royalties.address);

  // Deploy LazyMint contract
  console.log("\nDeploying LazyMint contract...");
  const LazyMint = await ethers.getContractFactory("LazyMint");
  const lazyMint = await LazyMint.deploy(
    "Seismic Epicenter NFT",
    "SEI",
    "https://ipfs.io/ipfs/",
    "https://ipfs.io/ipfs/contract-metadata.json",
    10000, // maxSupply
    deployer.address // signer
  );
  await lazyMint.deployed();
  console.log("LazyMint deployed to:", lazyMint.address);

  // Deploy WyvernV2Fork contract
  console.log("\nDeploying WyvernV2Fork contract...");
  const WyvernV2Fork = await ethers.getContractFactory("WyvernV2Fork");
  const wyvernV2Fork = await WyvernV2Fork.deploy(
    "Seismic Epicenter",
    "1.0.0",
    deployer.address, // protocolFeeRecipient
    royalties.address // royaltyRegistry
  );
  await wyvernV2Fork.deployed();
  console.log("WyvernV2Fork deployed to:", wyvernV2Fork.address);

  // Deploy CrossChainRelayer contract
  console.log("\nDeploying CrossChainRelayer contract...");
  const CrossChainRelayer = await ethers.getContractFactory("CrossChainRelayer");
  const crossChainRelayer = await CrossChainRelayer.deploy(
    wyvernV2Fork.address,
    "0x0000000000000000000000000000000000000000" // wormhole bridge address (placeholder)
  );
  await crossChainRelayer.deployed();
  console.log("CrossChainRelayer deployed to:", crossChainRelayer.address);

  // Deploy AuctionHouseAdapter contract
  console.log("\nDeploying AuctionHouseAdapter contract...");
  const AuctionHouseAdapter = await ethers.getContractFactory("AuctionHouseAdapter");
  const auctionHouseAdapter = await AuctionHouseAdapter.deploy(
    wyvernV2Fork.address,
    crossChainRelayer.address
  );
  await auctionHouseAdapter.deployed();
  console.log("AuctionHouseAdapter deployed to:", auctionHouseAdapter.address);

  // Set up initial configurations
  console.log("\nSetting up initial configurations...");
  
  // Set protocol fee to 2.5%
  await wyvernV2Fork.setProtocolFee(250);
  console.log("Protocol fee set to 2.5%");

  // Set default royalty for LazyMint contract
  await royalties.setDefaultRoyalty(lazyMint.address, deployer.address, 500); // 5%
  console.log("Default royalty set to 5% for LazyMint contract");

  // Grant permissions
  await wyvernV2Fork.transferOwnership(deployer.address);
  await royalties.transferOwnership(deployer.address);
  await lazyMint.transferOwnership(deployer.address);
  console.log("Ownership transferred to deployer");

  // Wait for a few block confirmations
  console.log("\nWaiting for block confirmations...");
  await wyvernV2Fork.deployTransaction.wait(5);
  await royalties.deployTransaction.wait(5);
  await lazyMint.deployTransaction.wait(5);
  await crossChainRelayer.deployTransaction.wait(5);
  await auctionHouseAdapter.deployTransaction.wait(5);

  // Verify contracts on explorer
  console.log("\nVerifying contracts on explorer...");
  
  try {
    await verify(royalties.address, []);
    console.log("Royalties contract verified");
  } catch (error) {
    console.log("Failed to verify Royalties contract:", error);
  }

  try {
    await verify(lazyMint.address, [
      "Seismic Epicenter NFT",
      "SEI",
      "https://ipfs.io/ipfs/",
      "https://ipfs.io/ipfs/contract-metadata.json",
      10000,
      deployer.address
    ]);
    console.log("LazyMint contract verified");
  } catch (error) {
    console.log("Failed to verify LazyMint contract:", error);
  }

  try {
    await verify(wyvernV2Fork.address, [
      "Seismic Epicenter",
      "1.0.0",
      deployer.address,
      royalties.address
    ]);
    console.log("WyvernV2Fork contract verified");
  } catch (error) {
    console.log("Failed to verify WyvernV2Fork contract:", error);
  }

  try {
    await verify(crossChainRelayer.address, [
      wyvernV2Fork.address,
      "0x0000000000000000000000000000000000000000"
    ]);
    console.log("CrossChainRelayer contract verified");
  } catch (error) {
    console.log("Failed to verify CrossChainRelayer contract:", error);
  }

  try {
    await verify(auctionHouseAdapter.address, [
      wyvernV2Fork.address,
      crossChainRelayer.address
    ]);
    console.log("AuctionHouseAdapter contract verified");
  } catch (error) {
    console.log("Failed to verify AuctionHouseAdapter contract:", error);
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: await deployer.provider?.getNetwork(),
    deployer: deployer.address,
    contracts: {
      royalties: royalties.address,
      lazyMint: lazyMint.address,
      wyvernV2Fork: wyvernV2Fork.address,
      crossChainRelayer: crossChainRelayer.address,
      auctionHouseAdapter: auctionHouseAdapter.address
    },
    timestamp: new Date().toISOString()
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network:", deploymentInfo.network?.name);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Royalties:", deploymentInfo.contracts.royalties);
  console.log("LazyMint:", deploymentInfo.contracts.lazyMint);
  console.log("WyvernV2Fork:", deploymentInfo.contracts.wyvernV2Fork);
  console.log("CrossChainRelayer:", deploymentInfo.contracts.crossChainRelayer);
  console.log("AuctionHouseAdapter:", deploymentInfo.contracts.auctionHouseAdapter);
  console.log("Timestamp:", deploymentInfo.timestamp);

  // Save to file
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const networkName = deploymentInfo.network?.name || "unknown";
  const deploymentFile = path.join(deploymentPath, `${networkName}.json`);
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  console.log("\n✅ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 