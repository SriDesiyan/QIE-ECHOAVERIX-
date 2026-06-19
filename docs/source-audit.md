# QIE EchoAverix — Source Code Audit Report

> **Audit Date**: June 2024
> **Source Repository**: PayChatAI (GitHub fork)
> **Target Product**: QIE EchoAverix — Decentralized AI Expert Agent Marketplace on QIE

---

## Executive Summary

The source repository is **PayChatAI**, a simple chatbot creation-and-monetization platform built on the **Nevermined** protocol. It allows users to create GPT-based chat models, set subscription pricing via Nevermined's payment widget, and deploy them as web services.

**Verdict**: The entire codebase requires complete transformation. Every file contains source-project branding, naming, or architecture that must be eliminated and rewritten for EchoAverix.

---

## File-by-File Audit

### Root Configuration Files

| File | Branding Found | Disposition |
|------|---------------|-------------|
| `README.md` | "PayChatAI" (title, description, links), `paychatai.vercel.app`, YouTube demo link | **DELETE** — Rewrite entirely |
| `package.json` | `"name": "nevermined-chat"`, `@nevermined-io/payments` dependency | **DELETE** — New package.json |
| `pyproject.toml` | `"Nevermind chat backend server"`, author `dsouzajovian123@gmail.com` | **DELETE** — New pyproject.toml |
| `.gitignore` | Generic — no branding | Reuse pattern, new file |
| `.npmrc` | Generic — no branding | Reuse pattern |
| `next.config.mjs` | Generic Next.js config | Rewrite for EchoAverix |
| `postcss.config.js` | Generic — no branding | Reuse pattern |
| `tailwind.config.ts` | Source color scheme (primary/secondary) | Rewrite with EchoAverix design tokens |
| `tsconfig.json` | Generic — no branding | Reuse with modifications |

### Frontend — `src/app/`

| File | Branding Found | Disposition |
|------|---------------|-------------|
| `layout.tsx` | `title: "PayChatAI"`, `description: "PayChatAI"`, Nevermined imports | **REWRITE** — EchoAverix metadata |
| `page.tsx` | References `HeroSection`, `TutorialSection`, `TestimonialsSection`, `CallToActionSection` | **REWRITE** — All new landing sections |
| `globals.css` | Tailwind base, source component classes | **REWRITE** — New design system |
| `create/page.tsx` | "Create your Chat AI", Nevermined service creation, model-centric flow | **REWRITE** → Creator Studio with expert-centric flow |
| `chats/[modelId]/page.tsx` | Chat interface for models | **REWRITE** → Expert interaction interface |
| `playground/page.tsx` | Model playground | **REWRITE** → Expert testing sandbox |
| `api/route.ts` | Base API route | **REWRITE** |
| `api/chatApi.ts` | Chat API with bearer token | **REWRITE** → Expert query API |
| `api/modelData.ts` | Model CRUD operations | **REWRITE** → Agent registry operations |
| `api/chat/` | Chat endpoint | **REWRITE** → Expert query endpoint |
| `api/create_model/` | Model creation endpoint | **REWRITE** → Agent registration endpoint |
| `api/get_model_did/` | Nevermined DID lookup | **DELETE** — No Nevermined DIDs |
| `api/model_list/` | Model listing endpoint | **REWRITE** → Exchange listing endpoint |
| `api/playground/` | Playground endpoint | **REWRITE** |

### Frontend — `src/components/` (28 files)

| File | Branding Found | Disposition |
|------|---------------|-------------|
| `Header.tsx` | "PayChatAI" logo text, Nevermined login | **REWRITE** → `EchoHeader.tsx` |
| `Footer.tsx` | "© 2024 PayChatAI", `flowbite.com` link | **REWRITE** → `EchoFooter.tsx` |
| `HeroSection.tsx` | "Create and Sell Your AI Chat Models 🤖", "Rapid Model Creation", "Easy Selling" | **REWRITE** → `EchoHero.tsx` |
| `TutorialSection.tsx` | "Create your AI in 5mins", "Create Your Chat Model", "List Your Chat Model on PayChatAi" | **REWRITE** → `LayerShowcase.tsx` |
| `TestimonialsSection.tsx` | 6 fake testimonials mentioning "PayChatAI" by name | **REWRITE** → `CreatorSpotlight.tsx` |
| `CallToActionSection.tsx` | "Ready to Monetize Your AI Chat Models?", "Join PayChatAi" | **REWRITE** → `ExchangeCTA.tsx` |
| `ModelDetailFormStep.tsx` | "Model" naming, base model selector | **REWRITE** → `ExpertIdentityStep.tsx` |
| `MonetizationFormStep.tsx` | Credits-based, subscription ID | **REWRITE** → `PricingConfigStep.tsx` |
| `ReviewFormStep.tsx` | Model review with Nevermined DID | **REWRITE** → `PublishReviewStep.tsx` |
| `Stepper.tsx` | 3-step model creation | **REWRITE** → 5-step expert creation |
| `CreateButton.tsx` | "Create Model" | **REWRITE** → "Publish Expert" |
| `NextStepButton.tsx` | Generic stepper button | **REWRITE** |
| `BackStepButton.tsx` | Generic stepper button | **REWRITE** |
| `Chat.tsx` | Chat message component | **REWRITE** → Expert query component |
| `ChatContainer.tsx` | Chat container | **REWRITE** |
| `ChatInput.tsx` | Chat input | **REWRITE** |
| `DemoCards.tsx` | Demo model cards | **REWRITE** → Expert demo cards |
| `LoginModal.tsx` | Generic login prompt | **REWRITE** → QIE Pass connect |
| `TransactionalModel.tsx` | Transaction modal | **REWRITE** |
| `ModelSideBar.tsx` | Model sidebar | **DELETE** |
| `Container.tsx` | Generic wrapper | Reuse pattern |
| `ClientProvider.tsx` | Recoil provider | **REWRITE** → No Recoil |
| `LoadingIndicator.tsx` | Loading animation | Reuse concept, rewrite |
| `ThreeDotLoading.tsx` | Dot animation | Reuse concept, rewrite |
| `TextInput.tsx` | Form input | Reuse pattern, restyle |
| `TextArea.tsx` | Form textarea | Reuse pattern, restyle |
| `SelectInput.tsx` | Form select | Reuse pattern, restyle |
| `Message.tsx` | Chat message | **REWRITE** |

### Frontend — State & Hooks

| File | Branding Found | Disposition |
|------|---------------|-------------|
| `store/atoms/createPageAtoms.jsx` | Model-centric naming (baseModel, modelDid, etc.), Recoil atoms | **DELETE** → Zustand stores |
| `hooks/useCreateModel.tsx` | "createModel", model-centric API calls | **REWRITE** → `useEchoAgent.ts` |
| `hooks/usePayments.tsx` | Full Nevermined SDK integration (`@nevermined-io/payments`) | **REWRITE** → `useQIEWallet.ts` |
| `hooks/useChat.tsx` | Chat hook | **REWRITE** |
| `hooks/usePlayground.tsx` | Playground hook | **REWRITE** |
| `data/AppContext.tsx` | Nevermined payments context | **REWRITE** → QIE wallet context |
| `data/constants.ts` | Menu links (Create, Playground) | **REWRITE** → New navigation |
| `lib/prisma.ts` | Prisma client | **REWRITE** |
| `utils/messageUtils.tsx` | Message formatting | **REWRITE** |

### Backend — `backend-server/src/`

| File | Branding Found | Disposition |
|------|---------------|-------------|
| `app.py` | "Awesome AI service", model CRUD, OpenRouter | **REWRITE** → `main.py` with 7 routers |
| `openrouterapi.py` | OpenRouter class, hardcoded free models | **REWRITE** → Provider-agnostic AI adapter |
| `postgresDB.py` | `model_data` table, model-centric schema | **REWRITE** → EchoAverix schema |
| `README.md` | Backend setup instructions | **REWRITE** |

### Database — `prisma-qie/`

| File | Branding Found | Disposition |
|------|---------------|-------------|
| `schema.prisma` | `ModelData` model, `model_did`, `base_model`, `subscription_id` | **DELETE** → New schema in Oracle |

### Assets — `imgs/`

| File | Branding Found | Disposition |
|------|---------------|-------------|
| `paychatai_landing.png` | PayChatAI screenshot | **DELETE** |

---

## Branding Reference Summary

| Term | Occurrences | Files Affected |
|------|-------------|---------------|
| `PayChatAI` / `PayChatAi` / `paychat` | 15+ | README, Header, Footer, Layout, Hero, CTA, Testimonials (×6), Tutorial |
| `Nevermined` / `nevermined` / `nevermind` | 10+ | package.json, pyproject.toml, usePayments, AppContext, create/page |
| `@nevermined-io/payments` | 2 | package.json, usePayments.tsx |
| `flowbite.com` | 1 | Footer.tsx |
| `dsouzajovian123@gmail.com` | 1 | pyproject.toml |
| `model_data` / `ModelData` | 5+ | schema.prisma, postgresDB.py, app.py, API routes |
| `paychatai_landing.png` | 1 | README.md |

**Total branding instances to eliminate: 35+**

---

## Conclusion

Every single file in the source repository either contains direct PayChatAI/Nevermined branding or uses model-centric architecture that must be transformed into EchoAverix's expert-centric paradigm. The transformation is **total** — no file survives unchanged.
