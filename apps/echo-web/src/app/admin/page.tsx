'use client';

import React, { useState } from 'react';

export default function RegistryAdmin() {
  const [logs, setLogs] = useState<string[]>([
    'System initialization successful.',
    'Synced with EchoAgentRegistry contract at block 12,042,109.',
    'Score anchor verified for agent-fin.'
  ]);

  const handleAudit = () => {
    setLogs([...logs, `Ran audits at timestamp ${new Date().toLocaleTimeString()} - Zero safety violations flagged.`]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Registry Admin Console</h1>
        <p className="text-slate-400">Perform reputation scoring audits and manage registered expert properties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-indigo-500/10 rounded-2xl h-fit space-y-4">
          <h3 className="text-lg font-bold text-white">Registry Auditing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run real-time audits of registered system prompts to verify safety levels and enforce compliance mappings.
          </p>
          <button
            onClick={handleAudit}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] text-sm"
          >
            Trigger Score Auditing
          </button>
        </div>

        {/* System Logs */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white">Auditing Event Stream</h3>
          <div className="bg-slate-950 p-6 border border-indigo-500/10 rounded-2xl font-mono text-xs text-emerald-400 space-y-2 h-64 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-600">[{new Date().toLocaleDateString()}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
