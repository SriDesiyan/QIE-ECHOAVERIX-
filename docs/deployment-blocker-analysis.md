# QIE EchoAverix — Deployment Blocker Analysis

This document details the audit and analysis of the deployment blockers discovered during the integration and platform hosting phases.

## 1. Backend Deployment Blocker (Render)

### Root Cause
The backend application was failing to deploy on Render with the error `gunicorn: command not found` while trying to execute `gunicorn myproject.wsgi`. This is a Django-specific configuration that does not align with a FastAPI-based asynchronous web service. 

### Resolving Strategy
- We will replace any WSGI/Django assumptions with a valid ASGI startup command:
  `python -m uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- We will define this start command in the repository configuration using a `render.yaml` specification file and a `Procfile` inside the backend directory, instructing Render's runner environment to start the server correctly on the dynamically assigned `$PORT`.

---

## 2. Frontend Import Resolution Blocker (Vercel)

### Root Cause
The Vercel Next.js build failed with:
`Module not found: Can't resolve 'echo-ui'` in `./src/app/monetization/page.tsx`

This error occurs because:
1. **Unbuilt Workspaces**: The workspace packages (`echo-ui`, `echo-core`, and `echo-score`) point to `dist/index.js` in their `package.json` entry points. However, a clean Vercel clone does not build these local packages before running the web compile. Thus, the `dist` folders do not exist.
2. **Missing Next.js Transpilation**: By default, Next.js does not compile local files symlinked inside `node_modules` unless they are explicitly listed in `transpilePackages`.

### Resolving Strategy
- **Direct Source Resolution**: We will modify the `package.json` files for the workspaces packages to point their `"main"` and `"types"` entries directly to their source files (`src/index.ts` / `src/index.tsx`). This allows Next.js to load them directly from source code.
- **Transpile Configuration**: We will add `transpilePackages: ["echo-ui", "echo-core", "echo-score"]` inside `apps/echo-web/next.config.mjs` to ensure the Next.js compiler transpiles their TypeScript and JSX assets.
