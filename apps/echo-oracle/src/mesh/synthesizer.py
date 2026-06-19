from src.agents.mesh_orchestrator_agent import MeshOrchestratorAgent

class MeshSynthesizer:
    def __init__(self):
        self.orchestrator = MeshOrchestratorAgent()

    def synthesize(self, query: str, contributions: list) -> dict:
        return self.orchestrator.synthesize_response(query, contributions)
