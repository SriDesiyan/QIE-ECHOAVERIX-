'use client';

import React, { useState } from 'react';
import { useEchoMesh } from '../../hooks/useEchoMesh';
import { useMeshStore } from '../../store/useMeshStore';
import { MeshResultView } from 'echo-ui';

export default function EchoMesh() {
  const { executeMeshQuery, loading } = useEchoMesh();
  const { query, response, attribution, expertsConsulted, isRouting } = useMeshStore();
  const [inputText, setInputText] = useState('');

  const handleRun = () => {
    if (!inputText.trim()) return;
    executeMeshQuery(inputText, '0x3D9bC838e1239dBdEE00732E904B46c43C116744');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">EchoMesh™ Sandbox</h1>
        <p className="text-slate-400">Route complex queries to multiple specialized expert twins concurrently.</p>
      </div>

      <div className="p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white">Ask EchoMesh™</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Draft a financial model for a software startup and outline the legal licensing steps"
            className="flex-1 bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm font-medium"
          />
          <button
            onClick={handleRun}
            disabled={loading}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(99,102,241,0.25)]"
          >
            {loading ? 'Routing...' : 'Execute'}
          </button>
        </div>
      </div>

      {isRouting && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-slate-900/20 border border-indigo-500/5 rounded-2xl">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-sm font-bold text-indigo-400 animate-pulse">Orchestrating agents and synthesizing perspective models...</span>
        </div>
      )}

      {query && !isRouting && (
        <MeshResultView
          query={query}
          response={response}
          attribution={attribution}
        />
      )}
    </div>
  );
}
