import json
import openai

class OpenRouter:
    def __init__(self, api_key: str, app_url: str, app_title: str) -> None:
        self.api_key = api_key
        self.app_url = app_url
        self.app_title = app_title
        self.client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key or "mock-key",
        )
        
    def list_models(self) -> list:
        # Standard free and premium models as of 2026
        models_dict = {
            'Meta: Llama 3 8B Instruct (free)': 'meta-llama/llama-3-8b-instruct:free',
            'Mistral 7B Instruct (free)': 'mistralai/mistral-7b-instruct:free',
            'Google: Gemma 2 9B (free)': 'google/gemma-2-9b-it:free',
            'Microsoft: Phi 3 Medium (free)': 'microsoft/phi-3-medium-128k-instruct:free',
            'OpenAI: GPT-4o Mini': 'openai/gpt-4o-mini',
            'Anthropic: Claude 3.5 Sonnet': 'anthropic/claude-3.5-sonnet'
        }
        return [{"name": name, "id": model_id} for name, model_id in models_dict.items()]
    
    def get_chat(self, model: str, messages: list) -> str:
        if not self.api_key or self.api_key == "mock-key":
            return f"[Simulated Response from {model}] System prompts and constraints simulated successfully."
            
        try:
            completion = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": self.app_url,
                    "X-Title": self.app_title,
                },
                model=model,
                messages=messages
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"OpenRouter get_chat error: {e}")
            return f"[Fallback EchoAverix response due to error: {e}]"
