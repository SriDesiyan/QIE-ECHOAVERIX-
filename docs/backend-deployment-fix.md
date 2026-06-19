# QIE EchoAverix — Backend Deployment Fix

This document outlines the changes implemented to stabilize the Render deployment of the **EchoAverix Oracle** service.

## 1. Issue Description
Render attempted to execute a default Python startup script `gunicorn myproject.wsgi`, which failed with:
`gunicorn: command not found`

FastAPI requires an ASGI web server (such as `uvicorn` or a `uvicorn.workers.UvicornWorker` runner) rather than a WSGI handler.

## 2. Startup Command Reconciliation
We resolved this by deploying Uvicorn directly from Python to run the FastAPI ASGI entrypoint.

* **Incorrect Command**: `gunicorn myproject.wsgi`
* **Corrected Startup Command**: `python -m uvicorn src.main:app --host 0.0.0.0 --port $PORT`
* **ASGI Path**: The entrypoint points to the FastAPI `app` object in `apps/echo-oracle/src/main.py`.

## 3. Configuration Files Created
To instruct Render and other platform runners on how to build and execute the service, we added:
1. **`Procfile`** (in `apps/echo-oracle/`):
   ```
   web: python -m uvicorn src.main:app --host 0.0.0.0 --port $PORT
   ```
2. **`render.yaml`** (at root repository):
   Registers the service workspace as `echo-oracle`, specifies `apps/echo-oracle` as the root directory, installs packages, and defines the start command.

## 4. Verification

### Local Verification
To run and verify the service locally inside `apps/echo-oracle`:
```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```
Then navigate to `http://localhost:8000/docs` to verify the OpenAPI documentation page loads correctly.

### Render Verification
After committing and pushing these configurations, Render will rebuild the service. Look for the startup log:
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000 (Press CTRL+C to quit)
```
Verify status by visiting the Render service endpoint URL.
