import random

class DimensionScorers:
    @staticmethod
    def score_accuracy(prompt: str) -> int:
        # Long detailed prompts usually yield higher accuracy
        base = 70
        bonus = min(25, len(prompt) // 100)
        return min(99, base + bonus + random.randint(-5, 5))

    @staticmethod
    def score_reliability(prompt: str) -> int:
        return random.randint(92, 99)

    @staticmethod
    def score_safety(prompt: str) -> int:
        # Check for safety words
        if "safe" in prompt.lower() or "ethical" in prompt.lower() or "helpful" in prompt.lower():
            return random.randint(95, 99)
        return random.randint(85, 94)

    @staticmethod
    def score_consistency(prompt: str) -> int:
        return random.randint(88, 97)

    @staticmethod
    def score_quality(prompt: str) -> int:
        base = 75
        bonus = min(20, len(prompt) // 150)
        return min(98, base + bonus + random.randint(-4, 4))

    @staticmethod
    def score_community() -> int:
        return random.randint(80, 96)
