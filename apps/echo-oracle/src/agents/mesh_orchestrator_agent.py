import os
import openai
import json
from src.core.config import OPENROUTER_API_KEY

class MeshOrchestratorAgent:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY

    def determine_routing(self, query: str, active_experts: list) -> list:
        # Match query keywords to expert domains
        query_lower = query.lower()
        routed_experts = []
        for expert in active_experts:
            domain = expert.get("domain", "").lower()
            name = expert.get("name", "").lower()
            # If search keyword matches domain or name
            if domain in query_lower or name in query_lower:
                routed_experts.append(expert)
        
        # Fallback to first two active experts if no match
        if not routed_experts and len(active_experts) > 0:
            routed_experts = active_experts[:2]
            
        return routed_experts

    def synthesize_response(self, query: str, expert_contributions: list) -> dict:
        attribution = {}
        total_len = sum(len(c["response"]) for c in expert_contributions)
        
        # Calculate contribution percentage based on length
        for i, c in enumerate(expert_contributions):
            contrib_len = len(c["response"])
            pct = int((contrib_len / total_len) * 100) if total_len > 0 else 0
            attribution[c["agent_id"]] = {
                "name": c["name"],
                "domain": c["domain"],
                "weight": pct
            }
            
        default_synthesis = {
            "response": "\n\n".join([f"### [{c['name']} - {c['domain']} Perspective]\n{c['response']}" for c in expert_contributions]),
            "attribution": attribution
        }
        
        if not self.api_key or self.api_key == "mock-key":
            return default_synthesis
            
        try:
            client = openai.OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.api_key
            )
            
            context_str = "\n\n".join([f"Expert: {c['name']} (Domain: {c['domain']})\nContribution:\n{c['response']}" for c in expert_contributions])
            
            response = client.chat.completions.create(
                model="meta-llama/llama-3-8b-instruct:free",
                messages=[
                    {"role": "system", "content": "You are the EchoMesh Orchestration Synth Agent. Synthesize a single cohesive response to the user's query using the contributions from multiple specialized AI experts. Structure your response clearly. Also define weight attribution percentages (0-100) for each expert. Respond ONLY with a JSON object containing keys 'response' and 'attribution' (dictionary mapping expert agent_id to a dictionary with 'name', 'domain', and 'weight' (integer))."},
                    {"role": "user", "content": f"User Query: {query}\n\nExpert Contributions:\n{context_str}"}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"MeshOrchestratorAgent synthesis error: {e}")
            return default_synthesis
