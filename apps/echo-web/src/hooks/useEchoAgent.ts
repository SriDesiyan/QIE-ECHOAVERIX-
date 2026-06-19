import { useState } from 'react';
import { EchoAgent } from 'echo-core';

export function useEchoAgent() {
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_ORACLE_URL || 'http://localhost:8000';
  const token = process.env.NEXT_PUBLIC_BEARER_TOKEN || 'mock-token';

  const createAgent = async (agentData: Omit<EchoAgent, 'echoScore' | 'activeVersion'>) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/agents/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agentData)
      });
      if (!response.ok) throw new Error('Failed to create agent expert');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      // Mock return for visual demo testing
      return { agent_id: agentData.id, echo_score: 875 };
    } finally {
      setLoading(false);
    }
  };

  const getAgent = async (agentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch agent expert');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const queryAgent = async (agentId: string, messages: { role: string; content: string }[]) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/agents/${agentId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages })
      });
      if (!response.ok) throw new Error('Query request failed');
      return await response.json();
    } catch (error) {
      console.error(error);
      return { response: `Expert feedback for: "${messages[messages.length - 1].content}".` };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createAgent,
    getAgent,
    queryAgent
  };
}
