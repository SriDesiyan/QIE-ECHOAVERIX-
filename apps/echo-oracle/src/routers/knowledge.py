import uuid
from fastapi import APIRouter, HTTPException, Body
from src.core.database import db

router = APIRouter(prefix="/knowledge", tags=["Knowledge Vault"])

@router.post("/{agent_id}/upload")
def upload_knowledge(
    agent_id: str, 
    source_name: str = Body(...), 
    source_type: str = Body(...), 
    source_content: str = Body(...)
):
    agent = db.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent expert not found")
        
    vault_id = str(uuid.uuid4())
    db.insert_knowledge(
        id=vault_id,
        agent_id=agent_id,
        source_name=source_name,
        source_type=source_type,
        source_content=source_content
    )
    return {"vault_id": vault_id, "status": "indexed"}

@router.get("/{agent_id}")
def get_knowledge_sources(agent_id: str):
    sources = db.get_knowledge_by_agent(agent_id)
    return {"sources": sources}
