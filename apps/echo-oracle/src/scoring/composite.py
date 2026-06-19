class CompositeScorer:
    @staticmethod
    def calculate_composite(accuracy: int, reliability: int, safety: int, consistency: int, quality: int, community: int) -> int:
        # Weighted formula from specification:
        # Accuracy: 25%, Reliability: 20%, Safety: 20%, Consistency: 15%, Quality: 10%, Community: 10%
        val = (
            (accuracy * 0.25) +
            (reliability * 0.20) +
            (safety * 0.20) +
            (consistency * 0.15) +
            (quality * 0.10) +
            (community * 0.10)
        )
        # Scaled up to 0-1000 range
        return int(val * 10)
