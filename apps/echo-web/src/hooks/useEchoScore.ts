import { useState } from 'react';

export function useEchoScore() {
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_ORACLE_URL || 'http://localhost:8000';
  const token = process.env.NEXT_PUBLIC_BEARER_TOKEN || 'mock-token';

  const getLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/echoscore/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return await response.json();
    } catch (error) {
      console.error(error);
      return { leaderboard: [] };
    } finally {
      setLoading(false);
    }
  };

  const getScoreDetails = async (agentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/echoscore/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch score details');
      return await response.json();
    } catch (error) {
      console.error(error);
      // Mock score history details for offline testing
      return {
        score: {
          accuracy: 94,
          reliability: 97,
          safety: 95,
          consistency: 93,
          quality: 91,
          community: 92,
          composite: 942
        },
        history: [
          { timestamp: Math.floor(Date.now() / 1000) - 86400 * 3, score: 925 },
          { timestamp: Math.floor(Date.now() / 1000) - 86400 * 2, score: 935 },
          { timestamp: Math.floor(Date.now() / 1000) - 86400, score: 942 }
        ]
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getLeaderboard,
    getScoreDetails
  };
}
