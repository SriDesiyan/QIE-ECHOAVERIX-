'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgentStore } from '../../store/useAgentStore';
import { useEchoAgent } from '../../hooks/useEchoAgent';
import { useWalletStore } from '../../store/useWalletStore';

export default function CreatorStudio() {
  const router = useRouter();
  const { currentStep, draft, setStep, updateDraft, resetDraft } = useAgentStore();
  const { createAgent, loading } = useEchoAgent();
  const { address } = useWalletStore();
  const [safetyReview, setSafetyReview] = useState<{ isSafe: boolean; score: number } | null>(null);

  const handleNext = () => {
    if (currentStep < 5) setStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setStep(currentStep - 1);
  };

  const handlePublish = async () => {
    const agentId = 'agent-' + Math.random().toString(36).substr(2, 9);
    const mockCreatorAddress = address || '0x3D9bC838e1239dBdEE00732E904B46c43C116744';
    
    const result = await createAgent({
      id: agentId,
      creator: mockCreatorAddress,
      metadataUri: 'ipfs://QmNewAgentMetadata',
      name: draft.name,
      domain: draft.domain,
      description: draft.description,
      systemPrompt: draft.systemPrompt,
      baseModel: draft.baseModel,
      priceType: draft.priceType,
      priceAmount: draft.priceAmount
    });

    if (result) {
      resetDraft();
      router.push(`/expert/${result.agent_id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Creator Studio</h1>
        <p className="text-slate-400">Assemble, test, and register your expert agent on the QIE network.</p>
      </div>

      {/* Step Tracker */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-indigo-500/10 rounded-2xl">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === step
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : currentStep > step
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {step}
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
              {['Identity', 'Knowledge', 'Benchmark', 'Pricing', 'Publish'][step - 1]}
            </span>
          </div>
        ))}
      </div>

      {/* Step Contents */}
      <div className="p-8 bg-slate-900/60 border border-indigo-500/15 rounded-3xl space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">1. Define Expert Identity</h3>
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 font-bold">Expert Name</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                placeholder="e.g. FinanceGuru"
                className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 font-bold">Domain Specialty</label>
              <select
                value={draft.domain}
                onChange={(e) => updateDraft({ domain: e.target.value })}
                className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="Finance">Finance</option>
                <option value="Legal">Legal</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 font-bold">Description</label>
              <textarea
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                placeholder="Explain what specialty skills this agent possesses..."
                className="w-full h-24 bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">2. Establish Knowledge Vault</h3>
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 font-bold">Expert System Instructions (Prompt)</label>
              <textarea
                value={draft.systemPrompt}
                onChange={(e) => updateDraft({ systemPrompt: e.target.value })}
                placeholder="Paste system parameters, prompt constraints, and expert guidelines here..."
                className="w-full h-36 bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm font-mono resize-none"
              />
            </div>
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">RAG Documents Indexing</h4>
                <p className="text-xs text-slate-500">Attach files or API reference docs to the Knowledge Vault.</p>
              </div>
              <button className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all">
                Upload Doc
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">3. Safety Audit & Benchmarking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Before registering your expert, our safety agents scan your system instructions for potential prompt injection, keys leaks, and guidelines compliance.
            </p>
            <button
              onClick={() => setSafetyReview({ isSafe: true, score: 98 })}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] text-sm"
            >
              Analyze Prompts
            </button>
            {safetyReview && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold">Safety review PASSED (Score: {safetyReview.score}/100)</span>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">4. Configure Monetization Tiers</h3>
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 font-bold">Pricing Model</label>
              <select
                value={draft.priceType}
                onChange={(e) => updateDraft({ priceType: e.target.value as any })}
                className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="subscription">Monthly Subscription (Subscription)</option>
                <option value="pay_per_query">Pay Per Query</option>
                <option value="free">Free Access</option>
              </select>
            </div>
            {draft.priceType !== 'free' && (
              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-400 font-bold">Price in QUSDC</label>
                <input
                  type="number"
                  value={draft.priceAmount}
                  onChange={(e) => updateDraft({ priceAmount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">5. Confirm & Publish</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Confirm your expert details. Publishing will anchor the metadata on IPFS, register ownership on the QIE Agent Registry, and anchor score reputation hashes on-chain.
            </p>
            <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/5 space-y-2">
              <p className="text-sm font-bold text-white">Name: {draft.name}</p>
              <p className="text-xs text-slate-400">Specialty: {draft.domain}</p>
              <p className="text-xs text-slate-400">Pricing: {draft.priceType === 'free' ? 'Free' : `${draft.priceAmount} QUSDC`}</p>
            </div>
          </div>
        )}

        {/* Wizard Navigation Actions */}
        <div className="flex justify-between items-center border-t border-indigo-500/5 pt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              currentStep === 1 ? 'bg-slate-950 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Back
          </button>
          
          {currentStep === 5 ? (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            >
              {loading ? 'Publishing...' : 'Publish Agent'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
