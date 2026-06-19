import { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';

export function useEchoMesh() {
  const [loading, setLoading] = useState(false);
  const { setSession, setRouting } = useMeshStore();
  const backendUrl = process.env.NEXT_PUBLIC_ORACLE_URL || 'http://localhost:8000';
  const token = process.env.NEXT_PUBLIC_BEARER_TOKEN || 'mock-token';

  const executeMeshQuery = async (query: string, userAddress: string) => {
    setLoading(true);
    setRouting(true);
    try {
      const response = await fetch(`${backendUrl}/mesh/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, user_address: userAddress })
      });
      if (!response.ok) throw new Error('Mesh routing failed');
      const data = await response.json();
      setSession({
        query,
        response: data.response,
        attribution: data.attribution,
        expertsConsulted: data.experts_consulted
      });
      return data;
    } catch (error) {
      console.error(error);
      // Fallback mockup responses for UI showcase
      const fallbackData = {
        response: `### [FinanceGuru - Finance Perspective]\nWe advise analyzing asset reserves and allocating capital effectively.\n\n### [LegalAdvisor - Legal Perspective]\nWe recommend drafting structured license splits on the QIE network to protect intellectual property.`,
        attribution: {
          'agent-fin': { name: 'FinanceGuru', domain: 'Finance', weight: 60 },
          'agent-leg': { name: 'LegalAdvisor', domain: 'Legal', weight: 40 }
        },
        experts_consulted: ['FinanceGuru', 'LegalAdvisor']
      };
      setSession({
        query,
        response: fallbackData.response,
        attribution: fallbackData.attribution,
        expertsConsulted: fallbackData.experts_consulted
      });
      return fallbackData;
    } finally {
      setLoading(false);
      setRouting(false);
    }
  };

  return {
    loading,
    executeMeshQuery
  };
}
