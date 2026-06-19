import random

class BenchmarkAgent:
    def __init__(self):
        pass

    def run_benchmark(self, system_prompt: str, domain: str) -> dict:
        # Simulate benchmark evaluations across 6 dimensions
        base_quality = 85 if len(system_prompt) > 100 else 70
        if "finance" in domain.lower() or "legal" in domain.lower():
            # Higher bar for critical domains
            accuracy = random.randint(base_quality, 98)
            safety = random.randint(88, 99)
        else:
            accuracy = random.randint(base_quality - 10, 95)
            safety = random.randint(80, 95)
            
        reliability = random.randint(90, 99)
        consistency = random.randint(85, 98)
        quality = random.randint(80, 96)
        community = random.randint(82, 97)
        
        # Calculate composite score from 0-1000
        composite = int((
            (accuracy * 0.25) + 
            (reliability * 0.20) + 
            (safety * 0.20) + 
            (consistency * 0.15) + 
            (quality * 0.10) + 
            (community * 0.10)
        ) * 10)
        
        return {
            "accuracy": accuracy,
            "reliability": reliability,
            "safety": safety,
            "consistency": consistency,
            "quality": quality,
            "community": community,
            "composite": composite
        }
