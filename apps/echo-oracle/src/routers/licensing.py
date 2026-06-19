import time
import uuid
from fastapi import APIRouter, HTTPException
from src.core.database import db
from src.core.models import LicensePurchaseRequest

router = APIRouter(prefix="/licensing", tags=["Licensing"])

@router.post("/purchase")
def purchase_license(request: LicensePurchaseRequest):
    agent = db.get_agent(request.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent expert not found")
        
    license_id = str(uuid.uuid4())
    expiry = int(time.time()) + (request.duration_days * 86400)
    
    db.insert_license(
        id=license_id,
        agent_id=request.agent_id,
        user_address=request.user_address,
        license_type=request.license_type,
        expiry_time=expiry
    )
    
    # Track revenue for the creator
    db.insert_revenue(
        id=str(uuid.uuid4()),
        agent_id=request.agent_id,
        creator=agent.get("creator"),
        amount=agent.get("price_amount", 0.0) * (request.duration_days / 30.0 if request.license_type == "subscription" else 1.0),
        timestamp=int(time.time())
    )
    
    return {"license_id": license_id, "expiry_time": expiry, "status": "active"}

@router.get("/validate")
def validate_license(user_address: str, agent_id: str):
    license_record = db.get_license(user_address, agent_id)
    if not license_record:
        return {"authorized": False, "reason": "No active license found"}
        
    now = int(time.time())
    if license_record.get("expiry_time", 0) < now:
        return {"authorized": False, "reason": "License has expired"}
        
    return {"authorized": True, "license": license_record}
