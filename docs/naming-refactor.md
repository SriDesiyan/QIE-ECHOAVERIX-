# QIE EchoAverix — Naming Refactor Map

> Complete mapping of all source-project names to their EchoAverix equivalents.

---

## Package & Project Names

| Source Name | EchoAverix Name |
|------------|-----------------|
| `nevermined-chat` | `qie-echoaverix` |
| `backend-server` | `echo-oracle` |
| `PayChatAI` | `QIE EchoAverix` |
| `Nevermind chat backend server` | `EchoAverix Oracle — Decentralized AI Expert Intelligence Service` |
| `Awesome AI service` | `EchoAverix Oracle Service` |

## Folder Structure

| Source Path | EchoAverix Path |
|------------|-----------------|
| `backend-server/` | `apps/echo-oracle/` |
| `src/` (Next.js root) | `apps/echo-web/src/` |
| `prisma-qie/` | *(eliminated — schema in Oracle)* |
| `imgs/` | *(eliminated)* |
| `src/components/` | `apps/echo-web/src/components/` (reorganized into subdirs) |
| `src/store/atoms/` | `apps/echo-web/src/store/` (Zustand stores) |
| `src/hooks/` | `apps/echo-web/src/hooks/` |
| `src/data/` | `apps/echo-web/src/lib/` |
| *(none)* | `apps/echo-contracts/` |
| *(none)* | `packages/echo-core/` |
| *(none)* | `packages/echo-score/` |
| *(none)* | `packages/echo-ui/` |

## Component Names

| Source Component | EchoAverix Component | Rationale |
|-----------------|---------------------|-----------|
| `Header.tsx` | `EchoHeader.tsx` | New branding, QIE Pass connect |
| `Footer.tsx` | `EchoFooter.tsx` | New branding, ecosystem links |
| `HeroSection.tsx` | `EchoHero.tsx` | Completely new copy and value props |
| `TutorialSection.tsx` | `LayerShowcase.tsx` | 7-layer architecture instead of "tutorial" |
| `TestimonialsSection.tsx` | `CreatorSpotlight.tsx` | AI expert creators, not generic users |
| `CallToActionSection.tsx` | `ExchangeCTA.tsx` | Echo Exchange branding |
| `ModelDetailFormStep.tsx` | `ExpertIdentityStep.tsx` | Expert identity, not model details |
| `MonetizationFormStep.tsx` | `PricingConfigStep.tsx` | QUSDC licensing, not credits |
| `ReviewFormStep.tsx` | `PublishReviewStep.tsx` | Includes EchoScore preview |
| `Stepper.tsx` | `CreationStepper.tsx` | 5 steps instead of 3 |
| `CreateButton.tsx` | `PublishButton.tsx` | "Publish Expert" not "Create Model" |
| `Chat.tsx` | *(eliminated)* | Replaced by expert query system |
| `ChatContainer.tsx` | *(eliminated)* | Replaced by MeshResultView |
| `ChatInput.tsx` | `MeshQueryInput.tsx` | Multi-expert query input |
| `DemoCards.tsx` | `FeaturedExperts.tsx` | Featured expert carousel |
| `LoginModal.tsx` | `QIEPassConnect.tsx` | QIE Pass branded |
| `TransactionalModel.tsx` | `PublishConfirmation.tsx` | Expert publish flow |
| `ModelSideBar.tsx` | *(eliminated)* | Not needed |
| `ClientProvider.tsx` | *(eliminated)* | No Recoil |
| `Container.tsx` | `PageContainer.tsx` | Restyled |
| `LoadingIndicator.tsx` | `EchoLoader.tsx` | Branded loading |
| `ThreeDotLoading.tsx` | *(merged into EchoLoader)* | Consolidated |

## Hook Names

| Source Hook | EchoAverix Hook | Rationale |
|------------|-----------------|-----------|
| `useCreateModel.tsx` | `useEchoAgent.ts` | Agent-centric, not model-centric |
| `usePayments.tsx` | `useQIEWallet.ts` | QIE Wallet via ethers.js, not Nevermined |
| `useChat.tsx` | `useEchoMesh.ts` | Multi-expert mesh queries |
| `usePlayground.tsx` | `useEchoScore.ts` | Benchmarking, not playground |
| *(none)* | `useKnowledgeVault.ts` | New — RAG knowledge management |
| *(none)* | `useAgentLicense.ts` | New — License management |
| *(none)* | `useRevenue.ts` | New — Revenue analytics |
| *(none)* | `useVersionHistory.ts` | New — Version tracking |

## State Management

| Source (Recoil Atoms) | EchoAverix (Zustand Stores) |
|----------------------|---------------------------|
| `imageAtom`, `imageUrlAtom` | `useAgentStore` → `avatarFile`, `avatarUrl` |
| `baseModelAtom`, `baseModelProviderAtom` | `useAgentStore` → `foundationModel`, `modelProvider` |
| `nameAtom`, `descAtom`, `promptAtom` | `useAgentStore` → `expertName`, `expertDescription`, `systemPrompt` |
| `subscriptionAtom`, `priceAtom` | `useAgentStore` → `pricingTier`, `qusdcPrice` |
| `amountOfCreditsAtom`, `durationAtom` | `useAgentStore` → `queryAllowance`, `licenseDuration` |
| `chargeTypeAtom`, `minCreditsAtom`, `maxCreditsAtom` | `useAgentStore` → `billingModel`, `minQueries`, `maxQueries` |
| `currentStepAtom` | `useAgentStore` → `wizardStep` |

## Route Names

| Source Route | EchoAverix Route | Purpose |
|-------------|-----------------|---------|
| `/` | `/` | Landing page |
| `/create` | `/studio` | Creator Studio |
| `/playground` | `/exchange` | Echo Exchange™ |
| `/chats/[modelId]` | `/expert/[id]` | Expert detail |
| *(none)* | `/echoscore` | EchoScore™ dashboard |
| *(none)* | `/mesh` | EchoMesh™ |
| *(none)* | `/monetization` | Revenue analytics |
| *(none)* | `/ownership` | Legacy & ownership |
| *(none)* | `/admin` | Admin registry |
| *(none)* | `/expert/[id]/versions` | Version history |

## API Route Names

| Source API | EchoAverix API | Purpose |
|-----------|---------------|---------|
| `/api/model_list` | `/api/exchange/list` | List experts |
| `/api/create_model` | `/api/agents/create` | Register agent |
| `/api/chat/[modelId]` | `/api/agents/[id]/query` | Query expert |
| `/api/get_model_did` | *(eliminated)* | No Nevermined DIDs |
| `/api/playground` | `/api/agents/[id]/benchmark` | Run EchoScore |
| *(none)* | `/api/mesh/query` | EchoMesh multi-expert |
| *(none)* | `/api/echoscore/[id]` | Get EchoScore |
| *(none)* | `/api/licenses/[id]` | License management |
| *(none)* | `/api/analytics/revenue` | Revenue data |

## Database Table Names

| Source Table | EchoAverix Table | Changes |
|-------------|-----------------|---------|
| `model_data` | `echo_agents` | Complete schema redesign |
| *(none)* | `echo_scores` | EchoScore™ records |
| *(none)* | `knowledge_vaults` | RAG knowledge sources |
| *(none)* | `agent_licenses` | License records |
| *(none)* | `mesh_sessions` | Multi-expert sessions |
| *(none)* | `revenue_records` | Revenue tracking |
| *(none)* | `agent_versions` | Version history |
| *(none)* | `creator_profiles` | Creator data |

## Variable & Concept Names

| Source Variable | EchoAverix Variable | Context |
|----------------|--------------------| --------|
| `model_id` | `agent_id` | Primary identifier |
| `model_did` | `ownership_hash` | On-chain reference |
| `base_model` | `foundation_model` | Underlying AI model |
| `model_data` | `agent_metadata` | Agent information |
| `prompt` | `system_directive` | System prompt |
| `subscription_id` | `license_tier_id` | License reference |
| `credits` | `query_allowance` | Usage limit |
| `charge_type` | `billing_model` | Pricing type |
| `price` | `qusdc_price` | Cost in QUSDC |
| `Payments` | `QIEWalletService` | Wallet service |
| `nvmRef` | `walletRef` | Wallet reference |
| `createService` | `publishExpert` | Publish action |
| `modelDid` | `expertRegistryId` | Registry identifier |

## Smart Contract Names

| Concept | EchoAverix Contract |
|---------|-------------------|
| *(none existed)* | `EchoAgentRegistry.sol` |
| *(none existed)* | `AgentLicenseVault.sol` |
| *(none existed)* | `EchoAccessController.sol` |
| *(none existed)* | `EchoRoyaltySplitter.sol` |
| *(none existed)* | `LegacyAgentTransfer.sol` |
| *(none existed)* | `ReputationAnchor.sol` |
| *(none existed)* | `EchoMeshRouter.sol` |
