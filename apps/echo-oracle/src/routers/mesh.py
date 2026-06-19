import time
from fastapi import APIRouter, HTTPException
from src.core.database import db
from src.core.models import MeshQueryRequest
from src.agents.mesh_orchestrator_agent import MeshOrchestratorAgent

router = APIRouter(prefix="/mesh", tags=["EchoMesh"])
orchestrator = MeshOrchestratorAgent()

@router.post("/query")
def query_mesh(request: MeshQueryRequest):
    # Get all registered experts
    experts = db.get_all_agents()
    if not experts:
        raise HTTPException(status_code=404, detail="No experts registered in Echo Exchange")
        
    # Route query to find relevant experts
    target_experts = orchestrator.determine_routing(request.query, experts)
    if not target_experts:
        # Fallback to whatever is available
        target_experts = experts[:2]
        
    # Simulate queries to individual experts
    contributions = []
    for expert in target_experts:
        expert_prompt = expert.get("system_prompt", "")
        # Mocking individual responses
        expert_response = f"From {expert.get('name')}'s analysis of '{request.query}': Based on my system guidelines as a {expert.get('domain')} expert, I advise prioritizing optimal structures and addressing core parameters."
        
        contributions.append({
            "agent_id": expert.get("id"),
            "name": expert.get("name"),
            "domain": expert.get("domain"),
            "response": expert_response
        })
        
    # Synthesize outputs
    synthesized = orchestrator.synthesize_response(request.query, contributions)
    
    return {
        "query": request.query,
        "experts_consulted": [e.get("name") for e in target_experts],
        "response": synthesized["response"],
        "attribution": synthesized["attribution"]
    }
