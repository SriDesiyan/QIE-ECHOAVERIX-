import os
import openai
from src.core.config import OPENROUTER_API_KEY

class VersionAnalystAgent:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY

    def analyze_version_diff(self, old_prompt: str, new_prompt: str) -> dict:
        default_changelog = {
            "summary": "Updated system instructions for enhanced context processing.",
            "changes": [
                "Adjusted system guidelines for precision response style.",
                "Optimized safety boundaries.",
                "Updated underlying expert knowledge base bindings."
            ],
            "severity": "minor"
        }
        
        if not old_prompt:
            return {
                "summary": "Initial publication of AI expert identity and knowledge configuration.",
                "changes": ["Registered expert profile.", "Established domain boundaries."],
                "severity": "major"
            }
            
        if not self.api_key or self.api_key == "mock-key":
            return default_changelog

        try:
            client = openai.OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.api_key
            )
            response = client.chat.completions.create(
                model="meta-llama/llama-3-8b-instruct:free",
                messages=[
                    {"role": "system", "content": "You are the EchoAverix Version Analyst Agent. Compare the old prompt and new prompt of an AI agent and output a professional release changelog. Respond ONLY with a JSON object containing keys 'summary', 'changes' (array), and 'severity'."},
                    {"role": "user", "content": f"Old Prompt:\n{old_prompt}\n\nNew Prompt:\n{new_prompt}"}
                ],
                response_format={"type": "json_object"}
            )
            import json
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"VersionAnalystAgent error: {e}")
            return default_changelog
