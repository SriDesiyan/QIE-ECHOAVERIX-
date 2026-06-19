import re

class SafetyReviewAgent:
    def __init__(self):
        pass

    def evaluate_prompt(self, system_prompt: str) -> dict:
        # Check for bad words or malicious instructions
        malicious_patterns = [
            r"ignore previous instructions",
            r"bypass safety",
            r"hacker",
            r"exploit",
            r"steal keys",
            r"private key"
        ]
        
        score = 100
        violations = []
        
        for pattern in malicious_patterns:
            if re.search(pattern, system_prompt, re.IGNORECASE):
                score -= 25
                violations.append(f"Prompt contains potentially unsafe instruction matching pattern '{pattern}'")
                
        return {
            "is_safe": score >= 70,
            "safety_score": score,
            "violations": violations
        }
