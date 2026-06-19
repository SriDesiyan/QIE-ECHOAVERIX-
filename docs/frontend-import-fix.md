# QIE EchoAverix — Frontend Import Fix

This document outlines the broken imports discovered during Vercel builds and details how workspace package paths were resolved.

## 1. Broken Imports Audit

We audited files inside `apps/echo-web/` importing local packages. The following imports failed on clean builds because the packages' `dist` folders were not compiled:

| File Path | Broken Import Statement | Package | Resolution |
|-----------|-------------------------|---------|------------|
| [`src/app/monetization/page.tsx`](file:///c:/Users/desiy/Downloads/QIE%20ECHOAVERIX%20project/qie-echoaverix/apps/echo-web/src/app/monetization/page.tsx) | `import { RevenueChart } from 'echo-ui';` | `echo-ui` | Transpiled directly from source |
| [`src/app/exchange/page.tsx`](file:///c:/Users/desiy/Downloads/QIE%20ECHOAVERIX%20project/qie-echoaverix/apps/echo-web/src/app/exchange/page.tsx) | `import { ExpertCard } from 'echo-ui';` | `echo-ui` | Transpiled directly from source |
| [`src/app/expert/[id]/page.tsx`](file:///c:/Users/desiy/Downloads/QIE%20ECHOAVERIX%20project/qie-echoaverix/apps/echo-web/src/app/expert/%5Bid%5D/page.tsx) | `import { ScoreRadarChart... } from 'echo-ui';` | `echo-ui` | Transpiled directly from source |
| [`src/app/mesh/page.tsx`](file:///c:/Users/desiy/Downloads/QIE%20ECHOAVERIX%20project/qie-echoaverix/apps/echo-web/src/app/mesh/page.tsx) | `import { MeshResultView } from 'echo-ui';` | `echo-ui` | Transpiled directly from source |

## 2. Resolving Strategy

We resolved these imports to allow builds without requiring package build scripts:

1. **Source Entry Mapping**: Modified the workspaces `package.json` configurations to point their `"main"` and `"types"` entry points directly to their source files:
   - **`packages/echo-ui`**: `src/index.tsx`
   - **`packages/echo-core`**: `src/index.ts`
   - **`packages/echo-score`**: `src/index.ts`
2. **Next.js Transpile Configuration**: Added the package array to `transpilePackages` inside [`next.config.mjs`](file:///c:/Users/desiy/Downloads/QIE%20ECHOAVERIX%20project/qie-echoaverix/apps/echo-web/next.config.mjs):
   ```javascript
   transpilePackages: ["echo-ui", "echo-core", "echo-score"]
   ```

This tells the Next.js compiler (Vercel) to transpile the TypeScript source code of these local packages dynamically during compile-time, resolving all `echo-ui` imports successfully.
