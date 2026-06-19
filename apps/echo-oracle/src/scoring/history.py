import time
import random

class ScoreHistoryTracker:
    def __init__(self):
        pass

    def get_history(self, agent_id: str) -> list:
        # Returns simulated historical data points for score trends
        now = int(time.time())
        one_day = 86400
        
        # Base score starting point
        base_score = random.randint(750, 920)
        
        history = [
            {"timestamp": now - (5 * one_day), "score": base_score - 15},
            {"timestamp": now - (4 * one_day), "score": base_score - 10},
            {"timestamp": now - (3 * one_day), "score": base_score - 5},
            {"timestamp": now - (2 * one_day), "score": base_score + 2},
            {"timestamp": now - one_day, "score": base_score + 5},
            {"timestamp": now, "score": base_score}
        ]
        return history
