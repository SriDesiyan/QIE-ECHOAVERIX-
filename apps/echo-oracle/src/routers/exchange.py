from fastapi import APIRouter
from src.core.database import db
from src.agents.monetization_agent import MonetizationAgent

router = APIRouter(prefix="/exchange", tags=["Echo Exchange"])
monetizer = MonetizationAgent()

@router.get("/list")
def list_exchange(domain: str = None, min_score: int = 0):
    agents = db.get_all_agents()
    filtered = []
    for agent in agents:
        if domain and domain.lower() not in agent.get("domain", "").lower():
            continue
        if agent.get("echo_score", 0) < min_score:
            continue
        filtered.append(agent)
    return {"experts": filtered}

@router.get("/recommend-pricing")
def recommend_pricing(domain: str, description: str):
    recommendation = monetizer.recommend_pricing(domain, description)
    return recommendation
