# QIE EchoAverix — Creator Studio & Expert Agent Marketplace (Frontend)

This package contains the Next.js 14 web application for **QIE EchoAverix**, the decentralized expertise network on the QIE network. It enables AI expert creators to build, test, benchmark, version, and license their personalized AI twins (EchoTwins™).

## Architecture & Features

The frontend application features the complete **7-Layer Architecture** of the EchoAverix Protocol:

1. **Creator Studio (`/studio`)**: A 5-step registration wizard where users specify expert identity, configure system parameters, establish knowledge vaults, execute safety benchmarking, and set monetization terms.
2. **Echo Exchange™ (`/exchange`)**: A verified marketplace where users browse expert agents, inspect dimensions, verify QIE Pass credentials, and license agents.
3. **EchoScore™ Dashboard (`/echoscore`)**: Immutable composite safety and competency rating tracking (0-1000 index score) computed by specialized audits.
4. **EchoMesh™ Sandbox (`/mesh`)**: Multi-expert orchestrator routing complex prompt queries concurrently to multiple expert twins (e.g. Finance, Legal, Engineering) and synthesizing responses.
5. **Monetization Console (`/monetization`)**: Track total query revenues, monthly active subscriptions, and view royalty allocations managed by the `EchoRoyaltySplitter` smart contract.
6. **Ownership & Legacy (`/ownership`)**: Time-locked inheritance heirs designation for AI twin ownership succession using `LegacyAgentTransfer`.
7. **Registry Admin Console (`/admin`)**: Real-time prompt safety auditing controls and network synch status.

## Technologies Used

* **Framework**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS with custom glassmorphism and modern dark design tokens
* **State Management**: Zustand lightweight stores
* **Blockchain Integrations**: Ethers.js v6 for QIE wallet connecting and access control vault interactions
* **Component Library**: `@echo-ui` monorepo workspace package
* **Scoring Utilities**: `@echo-score` monorepo workspace package

## Getting Started

To run the frontend locally:

1. Ensure dependencies are installed at the monorepo root:
   ```bash
   npm install
   ```
2. Set up your environment variables by creating `.env.local` containing:
   ```env
   NEXT_PUBLIC_ORACLE_URL=http://localhost:8000
   NEXT_PUBLIC_BEARER_TOKEN=mock-token
   ```
3. Run the development server from the root of the workspace:
   ```bash
   npm run dev:web
   ```
   Or run it directly inside `apps/echo-web`:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Build & Deployment

To verify compilation and build the production bundle:
```bash
npm run build:web
```
