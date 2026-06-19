import { EchoScoreResult } from 'echo-core';

export const ECHO_SCORE_WEIGHTS = {
  accuracy: 0.25,
  reliability: 0.20,
  safety: 0.20,
  consistency: 0.15,
  quality: 0.10,
  community: 0.10
};

export function calculateCompositeScore(dims: Omit<EchoScoreResult, 'agentId' | 'composite'>): number {
  const sum = 
    dims.accuracy * ECHO_SCORE_WEIGHTS.accuracy +
    dims.reliability * ECHO_SCORE_WEIGHTS.reliability +
    dims.safety * ECHO_SCORE_WEIGHTS.safety +
    dims.consistency * ECHO_SCORE_WEIGHTS.consistency +
    dims.quality * ECHO_SCORE_WEIGHTS.quality +
    dims.community * ECHO_SCORE_WEIGHTS.community;
  return Math.round(sum * 10);
}

export type ScoreTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export function getScoreBadge(score: number): { tier: ScoreTier; color: string } {
  if (score >= 900) return { tier: 'Diamond', color: '#10b981' }; // Emerald/Green
  if (score >= 800) return { tier: 'Platinum', color: '#6366f1' }; // Indigo
  if (score >= 600) return { tier: 'Gold', color: '#f59e0b' }; // Amber/Gold
  if (score >= 300) return { tier: 'Silver', color: '#94a3b8' }; // Slate/Silver
  return { tier: 'Bronze', color: '#b45309' }; // Bronze
}

export function calculateCreatorReputation(agentScores: number[]): number {
  if (agentScores.length === 0) return 0;
  const sum = agentScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / agentScores.length);
}
