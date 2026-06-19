from src.agents.mesh_orchestrator_agent import MeshOrchestratorAgent

class MeshRouter:
    def __init__(self):
        self.orchestrator = MeshOrchestratorAgent()

    def route_query(self, query: str, active_experts: list) -> list:
        return self.orchestrator.determine_routing(query, active_experts)
