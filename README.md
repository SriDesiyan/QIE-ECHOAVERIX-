# QIE EchoAverix — Decentralized AI Expert Agent Marketplace on QIE

> **Tagline**: *"Create, Own, Verify, and Monetize Trusted AI Expertise on QIE."*

---

## 1. Executive Product Overview

QIE EchoAverix is a fully decentralized, Web3-native marketplace designed for building, securing, licensing, and orchestrating AI domain expertise on the QIE network. Rather than interacting with generic chatbots, users deploy, license, and orchestrate benchmarked AI agents called **EchoTwins™**.

## 2. Branded Architecture Subsystems

```
┌─────────────────────────────────────────────────────┐
│              QIE EchoAverix Platform                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 7 ─ Legacy Transfer                          │
│     Inheritance, succession, ownership transfer     │
│                                                     │
│  Layer 6 ─ EchoMesh™                               │
│     Multi-expert collaboration & orchestration      │
│                                                     │
│  Layer 5 ─ Echo Exchange™                           │
│     Expertise monetization & licensing              │
│                                                     │
│  Layer 4 ─ EchoScore™                              │
│     0–1000 benchmarking & reputation system         │
│                                                     │
│  Layer 3 ─ Knowledge Vault                          │
│     RAG-powered knowledge sources & datasets        │
│                                                     │
│  Layer 2 ─ EchoTwin Registry                        │
│     Agent identity, ownership & version history     │
│                                                     │
│  Layer 1 ─ QIE Pass                                 │
│     Creator identity & wallet authentication        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### EchoScore™ — The Reputation Index
Every EchoTwin receives an immutable reputation score from **0 to 1000** computed dynamically by safety auditing agents across six core dimensions:
* **Accuracy** (25%)
* **Reliability** (20%)
* **Safety** (20%)
* **Consistency** (15%)
* **Response Quality** (10%)
* **Community Rating** (10%)

### EchoExchange™ — Curated Expertise Marketplace
A premium marketplace where builders catalog their AI expert twins, offering subscription, pay-per-query, and trial licensing models paid in QUSDC.

### EchoMesh™ — Multi-Expert Orchestration
An intelligence router that takes complex queries, splits them across relevant specialized domain experts, and synthesizes a unified answer with clear contribution attribution weights.

---

## 3. Smart Contracts (Layer 1, 2, 5 & 7)

All contracts are written in Solidity (v0.8.20) and configured for Hardhat deployment on the QIE VM:
1. `EchoAccessController.sol`: Handles granular access control lists for creators, subscribers, and successors.
2. `EchoAgentRegistry.sol`: Registers agent IDs, creators, metadata IPFS hashes, and publishes version increments.
3. `AgentLicenseVault.sol`: Manages QUSDC subscription licenses, pay-per-query access checks, and trial parameters.
4. `EchoRoyaltySplitter.sol`: Automatically routes payments to creators, collaborators, and the platform treasury.
5. `LegacyAgentTransfer.sol`: Supports owner succession using time-locked designate-and-claim contracts.
6. `ReputationAnchor.sol`: Records EchoScore history hashes on-chain for tamper-proof reputation verification.
7. `EchoMeshRouter.sol`: Records multi-expert orchestration sessions and distributes payments based on routing weights.

---

## 4. setup & Getting Started

### Prerequisites
* Node.js v18+
* Python v3.10+
* Hardhat
* Poetry

### Contracts Compile & Deploy
```bash
cd apps/echo-contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network qie
```

### Oracle Backend Run
```bash
cd apps/echo-oracle
poetry install
poetry run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Web Frontend Start
```bash
cd apps/echo-web
npm install
npm run dev
```
