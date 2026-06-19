class MeshAttribution:
    def __init__(self):
        pass

    def calculate_attribution(self, contributions: list) -> dict:
        attribution = {}
        total_len = sum(len(c["response"]) for c in contributions)
        for c in contributions:
            contrib_len = len(c["response"])
            pct = int((contrib_len / total_len) * 100) if total_len > 0 else 0
            attribution[c["agent_id"]] = {
                "name": c["name"],
                "domain": c["domain"],
                "weight": pct
            }
        return attribution
