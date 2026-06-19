'use client';

import React, { useEffect, useState } from 'react';
import { useEchoScore } from '../../hooks/useEchoScore';
import { EchoScoreBadge } from 'echo-ui';

export default function EchoScoreDashboard() {
  const { getLeaderboard, loading } = useEchoScore();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    getLeaderboard().then((res) => {
      if (res && res.leaderboard && res.leaderboard.length > 0) {
        setLeaderboard(res.leaderboard);
      } else {
        // Fallback dummy ranking list
        setLeaderboard([
          { id: 'agent-fin', name: 'FinanceGuru', domain: 'Finance', echo_score: 942 },
          { id: 'agent-cod', name: 'DevEngine', domain: 'Engineering', echo_score: 915 },
          { id: 'agent-leg', name: 'LegalAdvisor', domain: 'Legal', echo_score: 887 }
        ]);
      }
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">EchoScore™ Dashboard</h1>
        <p className="text-slate-400">Track and compare the reputation ratings of registered expert agents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Explanation Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">EchoScore Formula</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every EchoTwin registered on the registry receives a composite rating from 0 to 1000 calculated by specialized safety auditing agents.
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-300">
              <div className="flex justify-between"><span>Accuracy</span><span>25%</span></div>
              <div className="flex justify-between"><span>Reliability</span><span>20%</span></div>
              <div className="flex justify-between"><span>Safety</span><span>20%</span></div>
              <div className="flex justify-between"><span>Consistency</span><span>15%</span></div>
              <div className="flex justify-between"><span>Response Quality</span><span>10%</span></div>
              <div className="flex justify-between"><span>Community Feedback</span><span>10%</span></div>
            </div>
          </div>
        </div>

        {/* Leaderboard Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white">Reputation Rankings</h3>
          <div className="bg-slate-900/60 border border-indigo-500/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 p-4 bg-slate-950 border-b border-indigo-500/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="col-span-2 text-center">Rank</span>
              <span className="col-span-5">Expert Name</span>
              <span className="col-span-3">Domain</span>
              <span className="col-span-2 text-right">Rating</span>
            </div>
            
            <div className="divide-y divide-indigo-500/5">
              {loading ? (
                <div className="text-center py-12 text-slate-500 font-semibold text-sm">Computing ratings...</div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 p-4 items-center text-sm font-semibold text-white">
                    <span className="col-span-2 text-center text-indigo-400">#{idx + 1}</span>
                    <span className="col-span-5 font-bold">{item.name}</span>
                    <span className="col-span-3 text-xs text-slate-400 uppercase tracking-wider">{item.domain}</span>
                    <span className="col-span-2 text-right">
                      <EchoScoreBadge score={item.echo_score} size="sm" />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
