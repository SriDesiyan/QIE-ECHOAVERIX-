import time
import uuid
from fastapi import APIRouter, HTTPException, Depends
from src.core.database import db
from src.core.models import CreateModelRequest, AIRequest
from src.agents.safety_review_agent import SafetyReviewAgent
from src.agents.creator_profile_agent import CreatorProfileAgent
from src.agents.benchmark_agent import BenchmarkAgent
from src.agents.knowledge_rag_agent import KnowledgeRagAgent
from src.openrouterapi import OpenRouter
import os

router = APIRouter(prefix="/agents", tags=["Agents"])

safety_agent = SafetyReviewAgent()
profile_agent = CreatorProfileAgent()
benchmark_agent = BenchmarkAgent()
rag_agent = KnowledgeRagAgent()

# OpenRouter instance fallback
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "mock-key")
open_router = OpenRouter(OPENROUTER_API_KEY, os.getenv("APP_URL", ""), os.getenv("APP_TITLE", ""))

@router.post("/create")
def create_agent(request: CreateModelRequest):
    # 1. Run safety review
    safety_result = safety_agent.evaluate_prompt(request.system_prompt)
    if not safety_result["is_safe"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Prompt safety validation failed: {', '.join(safety_result['violations'])}"
        )
        
    # 2. Run initial benchmark to establish EchoScore
    bench = benchmark_agent.run_benchmark(request.system_prompt, request.domain)
    
    # 3. Write agent to DB
    agent_id = db.insert_agent(
        id=request.id,
        creator=request.creator,
        metadata_uri=request.metadata_uri,
        name=request.name,
        domain=request.domain,
        description=request.description,
        system_prompt=request.system_prompt,
        base_model=request.base_model,
        price_type=request.price_type,
        price_amount=request.price_amount,
        echo_score=bench["composite"]
    )
    
    # 4. Write score details
    db.insert_score(
        agent_id=agent_id,
        accuracy=bench["accuracy"],
        reliability=bench["reliability"],
        safety=bench["safety"],
        consistency=bench["consistency"],
        quality=bench["quality"],
        community=bench["community"],
        composite=bench["composite"]
    )
    
    return {"agent_id": agent_id, "echo_score": bench["composite"]}

@router.get("/{agent_id}")
def get_agent(agent_id: str):
    agent = db.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent expert not found")
    
    score = db.get_score(agent_id)
    return {"agent": agent, "score": score}

@router.delete("/{agent_id}")
def delete_agent(agent_id: str):
    agent = db.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent expert not found")
    db.delete_agent(agent_id)
    return {"message": f"Expert {agent_id} removed successfully"}

@router.post("/{agent_id}/query")
def query_agent(agent_id: str, request: AIRequest):
    agent = db.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent expert not found")
        
    # Retrieve RAG context from the agent's knowledge vaults
    vault_sources = db.get_knowledge_by_agent(agent_id)
    context = ""
    if vault_sources and request.messages:
        last_user_query = request.messages[-1].content
        context = rag_agent.retrieve_context(last_user_query, vault_sources)
        
    # Build actual messages payload
    messages = []
    
    # Prepend custom system prompt with retrieved RAG context
    system_content = agent.get("system_prompt", "")
    if context:
        system_content += f"\n\n[Retrieved Vault Knowledge Context]:\n{context}"
        
    messages.append({"role": "system", "content": system_content})
    for m in request.messages:
        messages.append({"role": m.role, "content": m.content})
        
    base_model = agent.get("base_model", "meta-llama/llama-3-8b-instruct:free")
    
    # Perform chat call
    try:
        response_text = open_router.get_chat(base_model, messages)
        # Log mock revenue for pay-per-query
        if agent.get("price_type") == "pay_per_query":
            db.insert_revenue(
                id=str(uuid.uuid4()),
                agent_id=agent_id,
                creator=agent.get("creator"),
                amount=agent.get("price_amount", 0.0),
                timestamp=int(time.time())
            )
        return {"response": response_text}
    except Exception as e:
        # Fallback simulated response
        sim_response = f"Hello! As the '{agent.get('name')}' expert specializing in {agent.get('domain')}, here is my guidance regarding: '{request.messages[-1].content}'. [Disclaimer: Simulated expert response due to API config.]"
        if agent.get("price_type") == "pay_per_query":
            db.insert_revenue(
                id=str(uuid.uuid4()),
                agent_id=agent_id,
                creator=agent.get("creator"),
                amount=agent.get("price_amount", 0.0),
                timestamp=int(time.time())
            )
        return {"response": sim_response}
