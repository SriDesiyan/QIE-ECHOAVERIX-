import sys
import logging
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import BEARER_TOKEN, APP_TITLE
from src.routers import agents, echoscore, knowledge, exchange, licensing, mesh, analytics

logging.basicConfig(stream=sys.stdout, level=logging.INFO)

bearer_scheme = HTTPBearer()

def validate_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if credentials.scheme != "Bearer" or credentials.credentials != BEARER_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing access token")
    return credentials

app = FastAPI(
    title=APP_TITLE,
    summary="AI Oracle & Multi-Agent Collaboration Engine",
    description="Decentralized intelligence network on the QIE chain.",
    version="1.0.0",
    dependencies=[Depends(validate_token)]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "online", "service": "QIE EchoAverix Oracle"}

# Register routers
app.include_router(agents.router)
app.include_router(echoscore.router)
app.include_router(knowledge.router)
app.include_router(exchange.router)
app.include_router(licensing.router)
app.include_router(mesh.router)
app.include_router(analytics.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
