class KnowledgeRagAgent:
    def __init__(self):
        pass

    def retrieve_context(self, query: str, knowledge_sources: list) -> str:
        if not knowledge_sources:
            return ""
        
        # Simple keywords retrieval simulator
        matched_chunks = []
        words = query.lower().split()
        for source in knowledge_sources:
            content = source.get("source_content", "")
            # check relevance
            matches = sum(1 for w in words if w in content.lower())
            if matches > 0:
                matched_chunks.append((matches, content[:300] + "..."))
        
        # Sort by match counts
        matched_chunks.sort(key=lambda x: x[0], reverse=True)
        retrieved = [chunk[1] for chunk in matched_chunks[:2]]
        
        return "\n\n".join(retrieved) if retrieved else "No direct matching knowledge context found in vault."
