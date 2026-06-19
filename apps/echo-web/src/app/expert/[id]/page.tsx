'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEchoAgent } from '../../../hooks/useEchoAgent';
import { useEchoScore } from '../../../hooks/useEchoScore';
import { useEchoChat } from '../../../hooks/useEchoChat';
import { ScoreRadarChart, PricingPanel, OwnershipBadge, DomainBadge, VersionTimeline } from 'echo-ui';

export default function ExpertDetail() {
  const { id } = useParams() as { id: string };
  const { getAgent } = useEchoAgent();
  const { getScoreDetails } = useEchoScore();
  const { messages, sendMessage, loading: chatLoading } = useEchoChat(id);

  const [expert, setExpert] = useState<any>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (id) {
      getAgent(id).then((res) => {
        if (res) {
          setExpert(res.agent);
        } else {
          // Fallback dummy for visualization
          setExpert({
            id,
            name: id.includes('fin') ? 'FinanceGuru' : id.includes('leg') ? 'LegalAdvisor' : 'CustomExpert',
            domain: id.includes('fin') ? 'Finance' : id.includes('leg') ? 'Legal' : 'General',
            description: 'AI expert assistant providing specialized domain logic, anchored to the QIE Registry.',
            priceType: 'subscription',
            priceAmount: 29.99,
            creator: '0x3D9bC838e1239dBdEE00732E904B46c43C116744'
          });
        }
      });

      getScoreDetails(id).then((res) => {
        if (res) {
          setScoreData(res);
        }
      });
    }
  }, [id]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  if (!expert) return <div className="text-center py-20 text-slate-500 font-bold">Loading expert profile...</div>;

  return (
    <div className="space-y-8">
      {/* Top Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 border border-indigo-500/10 rounded-3xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-white">{expert.name}</h1>
            <DomainBadge domain={expert.domain} />
          </div>
          <p className="text-sm text-slate-400 max-w-xl">{expert.description}</p>
          <div className="pt-2">
            <OwnershipBadge creator={expert.creator} />
          </div>
        </div>
        {scoreData && (
          <div className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Composite Rating</span>
            <div className="text-2xl font-black font-mono">EchoScore {scoreData.score.composite}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Radar charts & version history */}
        <div className="lg:col-span-1 space-y-8">
          {scoreData && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">EchoScore™ Dimensions</h3>
              <ScoreRadarChart result={scoreData.score} />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Version Timeline</h3>
            <VersionTimeline
              versions={[
                {
                  version: 1,
                  date: '2026-06-19',
                  summary: 'Expert Published',
                  changelog: ['Registered on-chain identity.', 'Indexed core domain knowledge source.']
                }
              ]}
            />
          </div>
        </div>

        {/* Right Side: Pricing panel & Live expert chat playground */}
        <div className="lg:col-span-2 space-y-8">
          <PricingPanel expert={expert} />

          {/* Interactive Chat Panel */}
          <div className="flex flex-col h-[400px] bg-slate-900/60 border border-indigo-500/10 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-indigo-500/10">
              <h4 className="text-xs uppercase text-indigo-400 font-bold tracking-wider">Playground Session</h4>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-sm font-semibold">
                  Send a message to start conversing with {expert.name}.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-950 text-slate-200 border border-indigo-500/10 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-slate-950 border-t border-indigo-500/10 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask ${expert.name} a question...`}
                className="flex-1 bg-slate-900 border border-indigo-500/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={chatLoading}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
