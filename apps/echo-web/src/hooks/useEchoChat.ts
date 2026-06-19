import { useState } from 'react';

export function useEchoChat(agentId: string) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_ORACLE_URL || 'http://localhost:8000';
  const token = process.env.NEXT_PUBLIC_BEARER_TOKEN || 'mock-token';

  const sendMessage = async (content: string) => {
    const updatedMessages = [...messages, { role: 'user', content }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/agents/${agentId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) throw new Error('Query request failed');
      const data = await response.json();
      setMessages([...updatedMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages([...updatedMessages, { role: 'assistant', content: `[EchoTwin Simulation]: Connection error, here is my default response for your query: "${content}"` }]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
}
