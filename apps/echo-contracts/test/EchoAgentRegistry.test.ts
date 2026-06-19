import { expect } from "chai";
import { ethers } from "hardhat";

describe("EchoAverix Smart Contracts", function () {
  let accessController: any;
  let registry: any;
  let owner: any;
  let creator: any;
  let user: any;

  beforeEach(async function () {
    [owner, creator, user] = await ethers.getSigners();

    const EchoAccessController = await ethers.getContractFactory("EchoAccessController");
    accessController = await EchoAccessController.deploy();
    await accessController.waitForDeployment();

    const EchoAgentRegistry = await ethers.getContractFactory("EchoAgentRegistry");
    registry = await EchoAgentRegistry.deploy(await accessController.getAddress());
    await registry.waitForDeployment();
  });

  describe("Access Control & Registry", function () {
    it("Should allow registering a new EchoTwin agent", async function () {
      const agentId = "agent-123";
      const metadataUri = "ipfs://QmAgentMetadata";
      const paymentAddress = creator.address;

      await expect(registry.connect(creator).registerAgent(agentId, metadataUri, paymentAddress))
        .to.emit(registry, "AgentRegistered")
        .withArgs(agentId, creator.address, metadataUri);

      const agent = await registry.getAgent(agentId);
      expect(agent.creator).to.equal(creator.address);
      expect(agent.metadataUri).to.equal(metadataUri);
      expect(agent.activeVersion).to.equal(1);
    });

    it("Should allow updating agent metadata and increment version", async function () {
      const agentId = "agent-123";
      await registry.connect(creator).registerAgent(agentId, "ipfs://v1", creator.address);
      
      await expect(registry.connect(creator).updateAgent(agentId, "ipfs://v2", "changelog-hash-v2"))
        .to.emit(registry, "AgentVersionPublished")
        .withArgs(agentId, 2, "ipfs://v2");

      const agent = await registry.getAgent(agentId);
      expect(agent.metadataUri).to.equal("ipfs://v2");
      expect(agent.activeVersion).to.equal(2);
    });
  });
});
