import { ethers } from "hardhat";

async function main() {
  console.log("Starting EchoAverix contract deployment...");

  // 1. Deploy Access Controller
  const EchoAccessController = await ethers.getContractFactory("EchoAccessController");
  const accessController = await EchoAccessController.deploy();
  await accessController.waitForDeployment();
  console.log(`EchoAccessController deployed to: ${await accessController.getAddress()}`);

  // 2. Deploy Agent Registry
  const EchoAgentRegistry = await ethers.getContractFactory("EchoAgentRegistry");
  const registry = await EchoAgentRegistry.deploy();
  await registry.waitForDeployment();
  console.log(`EchoAgentRegistry deployed to: ${await registry.getAddress()}`);

  // Deploy Mock QUSDC or use a dummy ERC20 for payments if running locally
  // For production, this would be the actual QUSDC address
  const qusdcAddress = process.env.QUSDC_ADDRESS && process.env.QUSDC_ADDRESS !== "0x0000000000000000000000000000000000000000" 
    ? process.env.QUSDC_ADDRESS 
    : "0x1111111111111111111111111111111111111111"; // dummy non-zero address for testing
  const treasuryAddress = process.env.TREASURY_ADDRESS || (await ethers.getSigners())[0].address;
  
  // 3. Deploy Agent License Vault
  const AgentLicenseVault = await ethers.getContractFactory("AgentLicenseVault");
  const licenseVault = await AgentLicenseVault.deploy(
    qusdcAddress,
    treasuryAddress
  );
  await licenseVault.waitForDeployment();
  console.log(`AgentLicenseVault deployed to: ${await licenseVault.getAddress()}`);

  // 4. Deploy Royalty Splitter
  const EchoRoyaltySplitter = await ethers.getContractFactory("EchoRoyaltySplitter");
  const royaltySplitter = await EchoRoyaltySplitter.deploy(
    qusdcAddress
  );
  await royaltySplitter.waitForDeployment();
  console.log(`EchoRoyaltySplitter deployed to: ${await royaltySplitter.getAddress()}`);

  // 5. Deploy Legacy Agent Transfer
  const LegacyAgentTransfer = await ethers.getContractFactory("LegacyAgentTransfer");
  const legacyTransfer = await LegacyAgentTransfer.deploy();
  await legacyTransfer.waitForDeployment();
  console.log(`LegacyAgentTransfer deployed to: ${await legacyTransfer.getAddress()}`);

  // 6. Deploy Reputation Anchor
  const ReputationAnchor = await ethers.getContractFactory("ReputationAnchor");
  const reputationAnchor = await ReputationAnchor.deploy();
  await reputationAnchor.waitForDeployment();
  console.log(`ReputationAnchor deployed to: ${await reputationAnchor.getAddress()}`);

  // 7. Deploy EchoMesh Router
  const EchoMeshRouter = await ethers.getContractFactory("EchoMeshRouter");
  const meshRouter = await EchoMeshRouter.deploy(
    qusdcAddress
  );
  await meshRouter.waitForDeployment();
  console.log(`EchoMeshRouter deployed to: ${await meshRouter.getAddress()}`);

  console.log("All EchoAverix contracts successfully deployed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
