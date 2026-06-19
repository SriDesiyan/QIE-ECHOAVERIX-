from fastapi import APIRouter
from src.core.database import db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/revenue/{creator_address}")
def get_creator_revenue(creator_address: str):
    records = db.get_revenue_by_creator(creator_address)
    total_earned = sum(r.get("amount", 0.0) for r in records)
    
    # Summarize by agent
    by_agent = {}
    for r in records:
        agent_id = r.get("agent_id")
        by_agent[agent_id] = by_agent.get(agent_id, 0.0) + r.get("amount", 0.0)
        
    return {
        "creator": creator_address,
        "total_earned": total_earned,
        "by_agent": by_agent,
        "history": records
    }
