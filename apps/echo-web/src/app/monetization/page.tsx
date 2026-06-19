'use client';

import React from 'react';
import { RevenueChart } from 'echo-ui';

export default function Monetization() {
  const dummyAnalytics = [
    { label: 'Jan', amount: 150 },
    { label: 'Feb', amount: 320 },
    { label: 'Mar', amount: 480 },
    { label: 'Apr', amount: 610 },
    { label: 'May', amount: 840 },
    { label: 'Jun', amount: 1250 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Monetization Console</h1>
        <p className="text-slate-400">Monitor active subscription details and manage query payout allocations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings chart */}
        <div className="lg:col-span-2">
          <RevenueChart total={1250.75} analytics={dummyAnalytics} />
        </div>

        {/* Splits allocation overview */}
        <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-indigo-500/10 rounded-2xl h-fit space-y-4">
          <h3 className="text-lg font-bold text-white">Royalty Splits Ledger</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Revenue distributions are executed directly via the `EchoRoyaltySplitter` contract. Platform fees and collaborator splits are paid out instantly.
          </p>
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/5 flex justify-between items-center text-xs">
              <span className="font-bold text-white">Platform Treasury Share</span>
              <span className="font-mono text-indigo-400">2.5%</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/5 flex justify-between items-center text-xs">
              <span className="font-bold text-white">Collaborator Allocation</span>
              <span className="font-mono text-indigo-400">10.0%</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/5 flex justify-between items-center text-xs">
              <span className="font-bold text-white">Creator Net Share</span>
              <span className="font-mono text-indigo-400">87.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
