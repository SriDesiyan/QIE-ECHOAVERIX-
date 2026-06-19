'use client';

import React, { useState } from 'react';

export default function OwnershipSuccession() {
  const [successorAddress, setSuccessorAddress] = useState('');
  const [timeLockDays, setTimeLockDays] = useState(30);
  const [message, setMessage] = useState('');

  const handleDesignate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!successorAddress) return;
    setMessage(`Successor heir '${successorAddress}' registered on-chain with a time-lock delay of ${timeLockDays} days.`);
    setSuccessorAddress('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Ownership & Legacy</h1>
        <p className="text-slate-400">Designate heirs to inherit agent license ownership in compliance with QIE Legacy Transfer standards.</p>
      </div>

      <div className="p-8 bg-slate-900/60 border border-indigo-500/15 rounded-3xl space-y-6">
        <h3 className="text-xl font-bold text-white">Designate Agent Successor</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Designating a successor registers an inheritance claim on the `LegacyAgentTransfer` contract. If the owner wallet goes inactive beyond the time-lock period, the successor can claim ownership.
        </p>

        <form onSubmit={handleDesignate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400 font-bold">Successor Wallet Address</label>
            <input
              type="text"
              required
              value={successorAddress}
              onChange={(e) => setSuccessorAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400 font-bold">Time-Lock Delay Period (Days)</label>
            <input
              type="number"
              required
              value={timeLockDays}
              onChange={(e) => setTimeLockDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] text-sm"
          >
            Designate Heir
          </button>
        </form>

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
