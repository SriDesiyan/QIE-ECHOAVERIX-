'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExchangeStore } from '../../store/useExchangeStore';
import { ExpertCard } from 'echo-ui';

export default function Exchange() {
  const router = useRouter();
  const { filteredExperts, searchQuery, selectedDomain, minScore, setExperts, setSearchQuery, setSelectedDomain, setMinScore, applyFilters } = useExchangeStore();

  useEffect(() => {
    // Seed dummy data for demo purposes if store is empty
    const dummyExperts = [
      {
        id: 'agent-fin',
        creator: '0x3D9bC838e1239dBdEE00732E904B46c43C116744',
        metadataUri: 'ipfs://QmFinGuru',
        name: 'FinanceGuru',
        domain: 'Finance',
        description: 'Premium AI assistant analyzing balance sheets, corporate treasury plans, cash flow modeling, and QIE asset metrics.',
        systemPrompt: 'You are a Finance Expert...',
        baseModel: 'meta-llama/llama-3-8b-instruct:free',
        activeVersion: 1,
        priceType: 'subscription' as const,
        priceAmount: 49.99,
        echoScore: 942
      },
      {
        id: 'agent-leg',
        creator: '0x8bF2d5c317E3F1c7e904B46c43C1167443D9bC83',
        metadataUri: 'ipfs://QmLegalAdv',
        name: 'LegalAdvisor',
        domain: 'Legal',
        description: 'Decentralized compliance legal auditor validating smart contracts, IP structures, royalty splits, and inheritance time-locks.',
        systemPrompt: 'You are a Legal Expert...',
        baseModel: 'meta-llama/llama-3-8b-instruct:free',
        activeVersion: 1,
        priceType: 'subscription' as const,
        priceAmount: 39.99,
        echoScore: 887
      },
      {
        id: 'agent-cod',
        creator: '0x94B46c43C1167443D9bC838e1239dBdEE00732E',
        metadataUri: 'ipfs://QmDevEngine',
        name: 'DevEngine',
        domain: 'Engineering',
        description: 'Next-gen code reviewer optimizing execution loops, gas costs on QIE VM, Solidity, Rust, and typescript scripts.',
        systemPrompt: 'You are a Dev Expert...',
        baseModel: 'google/gemma-2-9b-it:free',
        activeVersion: 2,
        priceType: 'pay_per_query' as const,
        priceAmount: 0.05,
        echoScore: 915
      }
    ];
    setExperts(dummyExperts);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDomain, minScore]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Echo Exchange™</h1>
        <p className="text-slate-400">Discover and license high-quality, verified AI experts built on QIE.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Panel */}
        <aside className="w-full md:w-64 space-y-6 p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl h-fit">
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-500 font-bold">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experts..."
              className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-500 font-bold">Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-sm"
            >
              <option value="All">All Domains</option>
              <option value="Finance">Finance</option>
              <option value="Legal">Legal</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-500 font-bold">Minimum EchoScore ({minScore})</label>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </aside>

        {/* Experts Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExperts.length > 0 ? (
            filteredExperts.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                onSelect={(id) => router.push(`/expert/${id}`)}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 font-semibold bg-slate-900/10 border border-indigo-500/5 rounded-2xl">
              No matching experts found. Try relaxing filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
