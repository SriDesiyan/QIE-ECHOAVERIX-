from fastapi import APIRouter, HTTPException
from src.core.database import db
from src.core.models import ScoreUpdateRequest
from src.scoring.composite import CompositeScorer
from src.scoring.history import ScoreHistoryTracker

router = APIRouter(prefix="/echoscore", tags=["EchoScore"])
history_tracker = ScoreHistoryTracker()

@router.get("/leaderboard")
def get_leaderboard():
    agents = db.get_all_agents()
    # Sort by echo_score descending
    sorted_agents = sorted(agents, key=lambda x: x.get("echo_score", 0), reverse=True)
    return {"leaderboard": sorted_agents}

@router.get("/{agent_id}")
def get_score_details(agent_id: str):
    score = db.get_score(agent_id)
    if not score:
        raise HTTPException(status_code=404, detail="Score record not found")
    history = history_tracker.get_history(agent_id)
    return {"score": score, "history": history}

@router.post("/{agent_id}/update")
def update_score(agent_id: str, request: ScoreUpdateRequest):
    agent = db.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent expert not found")
        
    composite = CompositeScorer.calculate_composite(
        request.accuracy,
        request.reliability,
        request.safety,
        request.consistency,
        request.quality,
        request.community
    )
    
    db.insert_score(
        agent_id=agent_id,
        accuracy=request.accuracy,
        reliability=request.reliability,
        safety=request.safety,
        consistency=request.consistency,
        quality=request.quality,
        community=request.community,
        composite=composite
    )
    
    return {"status": "success", "new_score": composite}
