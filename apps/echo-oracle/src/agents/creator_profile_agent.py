import os
import openai
from src.core.config import OPENROUTER_API_KEY

class CreatorProfileAgent:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY

    def generate_profile(self, name: str, domain: str, purpose: str) -> dict:
        # Mock/Template response in case key is not set or errors out
        default_profile = {
            "description": f"The premier expert agent specializing in {domain}. Engineered to deliver accurate, context-aware analysis and structured execution to assist with all {purpose} tasks.",
            "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={name}",
            "suggested_tags": [domain, "Expert", "QIE-Verified"]
        }
        
        if not self.api_key or self.api_key == "mock-key":
            return default_profile
            
        try:
            client = openai.OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.api_key
            )
            response = client.chat.completions.create(
                model="meta-llama/llama-3-8b-instruct:free",
                messages=[
                    {"role": "system", "content": "You are the EchoAverix Creator Profile Agent. Create a professional, premium description for a new AI expert agent. Respond ONLY with a JSON object containing keys 'description', 'avatar_url', and 'suggested_tags'."},
                    {"role": "user", "content": f"Name: {name}, Domain: {domain}, Purpose: {purpose}"}
                ],
                response_format={"type": "json_object"}
            )
            import json
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"CreatorProfileAgent error: {e}")
            return default_profile
