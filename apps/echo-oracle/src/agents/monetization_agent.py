class MonetizationAgent:
    def __init__(self):
        pass

    def recommend_pricing(self, domain: str, description: str) -> dict:
        domain_lower = domain.lower()
        
        # High value domains
        if "finance" in domain_lower or "legal" in domain_lower or "medical" in domain_lower:
            return {
                "pricing_type": "subscription",
                "recommended_price": 49.99,
                "trial_days": 7,
                "reasoning": f"Critical experts in '{domain}' command higher trust. A subscription model with a 7-day trial is highly recommended."
            }
        # Development / Devops
        elif "code" in domain_lower or "dev" in domain_lower or "engineering" in domain_lower:
            return {
                "pricing_type": "pay_per_query",
                "recommended_price": 0.05,
                "trial_days": 3,
                "reasoning": "Technical query loads are transactional. Pay-per-query aligns best with developer integration patterns."
            }
        # Generic content / Marketing
        else:
            return {
                "pricing_type": "subscription",
                "recommended_price": 19.99,
                "trial_days": 14,
                "reasoning": "Standard utility models convert best with mid-tier monthly pricing and a longer trial window."
            }
        
