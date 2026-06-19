from pydantic import BaseModel
from typing import List, Dict, Optional

class Message(BaseModel):
    role: str
    content: str

class AIRequest(BaseModel):
    messages: List[Message]

class CreateModelRequest(BaseModel):
    id: str
    creator: str
    metadata_uri: str
    name: str
    domain: str
    description: str
    system_prompt: str
    base_model: str
    price_type: str
    price_amount: float

class LicensePurchaseRequest(BaseModel):
    agent_id: str
    user_address: str
    license_type: str
    duration_days: int

class MeshQueryRequest(BaseModel):
    query: str
    user_address: str

class ScoreUpdateRequest(BaseModel):
    accuracy: int
    reliability: int
    safety: int
    consistency: int
    quality: int
    community: int
