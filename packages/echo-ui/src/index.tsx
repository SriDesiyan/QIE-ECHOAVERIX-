import React from 'react';
import { EchoAgent, EchoScoreResult, LicenseTier } from 'echo-core';
import { getScoreBadge } from 'echo-score';

// 1. EchoScoreBadge — Premium animated score display
export const EchoScoreBadge: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ score, size = 'md' }) => {
  const { tier, color } = getScoreBadge(score);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-lg px-4 py-2 gap-2 font-bold'
  };

  return (
    <div
      style={{ borderColor: color, color }}
      className={`inline-flex items-center rounded-full border bg-slate-950/80 font-mono shadow-lg transition-all duration-300 hover:scale-105 ${sizeClasses[size]}`}
    >
      <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
      <span>EchoScore™ {score}</span>
      <span className="text-[10px] uppercase opacity-75 font-sans">({tier})</span>
    </div>
  );
};

// 2. ScoreRadarChart — Custom SVG Radar Chart for 6 dimensions
export const ScoreRadarChart: React.FC<{ result: Omit<EchoScoreResult, 'agentId' | 'composite'> }> = ({ result }) => {
  const dimensions = [
    { label: 'Accuracy', val: result.accuracy },
    { label: 'Reliability', val: result.reliability },
    { label: 'Safety', val: result.safety },
    { label: 'Consistency', val: result.consistency },
    { label: 'Quality', val: result.quality },
    { label: 'Community', val: result.community }
  ];

  const size = 300;
  const center = size / 2;
  const rMax = 100;

  // Calculate coordinates for vertices
  const points = dimensions.map((d, i) => {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const valueFactor = d.val / 100;
    const x = center + rMax * valueFactor * Math.cos(angle);
    const y = center + rMax * valueFactor * Math.sin(angle);
    return { x, y, label: d.label, val: d.val };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center p-4 bg-slate-900/60 rounded-2xl border border-indigo-500/10">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grids */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((factor, idx) => {
          const gridPoints = dimensions.map((_, i) => {
            const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
            const x = center + rMax * factor * Math.cos(angle);
            const y = center + rMax * factor * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={idx}
              points={gridPoints}
              fill="none"
              stroke="rgba(99, 102, 241, 0.1)"
              strokeWidth="1"
            />
          );
        })}
        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
          const x = center + rMax * Math.cos(angle);
          const y = center + rMax * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(99, 102, 241, 0.15)"
              strokeWidth="1"
            />
          );
        })}
        {/* Score polygon */}
        <polygon
          points={polygonPath}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366f1"
          strokeWidth="2"
        />
        {/* Corner labels */}
        {points.map((p, i) => {
          const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
          const lx = center + (rMax + 20) * Math.cos(angle);
          const ly = center + (rMax + 12) * Math.sin(angle);
          const anchor = i === 0 || i === 3 ? 'middle' : i < 3 ? 'start' : 'end';
          return (
            <g key={i}>
              <text
                x={lx}
                y={ly}
                fill="#94a3b8"
                fontSize="10"
                textAnchor={anchor}
                className="font-semibold"
              >
                {p.label} ({p.val})
              </text>
              <circle cx={p.x} cy={p.y} r="4" fill="#818cf8" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// 3. ExpertCard — Interactive marketplace list card
export const ExpertCard: React.FC<{ expert: EchoAgent; onSelect?: (id: string) => void }> = ({ expert, onSelect }) => {
  return (
    <div
      onClick={() => onSelect?.(expert.id)}
      className="cursor-pointer group flex flex-col justify-between p-6 bg-slate-900/40 rounded-2xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <DomainBadge domain={expert.domain} />
          <EchoScoreBadge score={expert.echoScore} size="sm" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {expert.name}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-3 mb-6">
          {expert.description}
        </p>
      </div>
      <div className="flex justify-between items-center border-t border-indigo-500/5 pt-4">
        <span className="text-xs uppercase text-slate-500 font-semibold">Price Tier</span>
        <span className="text-base font-bold text-white">
          {expert.priceType === 'free' ? 'Free' : `${expert.priceAmount} QUSDC`}
          <span className="text-xs text-slate-400 font-normal">
            {expert.priceType === 'subscription' ? '/mo' : expert.priceType === 'pay_per_query' ? '/query' : ''}
          </span>
        </span>
      </div>
    </div>
  );
};

// 4. PricingPanel — Licensing config UI panel
export const PricingPanel: React.FC<{ expert: EchoAgent; onSubscribe?: () => void }> = ({ expert, onSubscribe }) => {
  return (
    <div className="p-6 bg-slate-900/80 rounded-2xl border border-indigo-500/20 shadow-2xl">
      <h3 className="text-lg font-bold text-white mb-4">Licensing Plans</h3>
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-white">Access Tier</span>
            <span className="text-xs text-emerald-400 font-mono px-2 py-0.5 bg-emerald-500/10 rounded-full">ACTIVE SUBSCRIBER</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {expert.priceType === 'free' ? 'Free' : `${expert.priceAmount} QUSDC`}
          </span>
          <span className="text-xs text-slate-400 ml-1">
            {expert.priceType === 'subscription' ? 'per month' : expert.priceType === 'pay_per_query' ? 'per query' : 'forever'}
          </span>
        </div>
      </div>
      <button
        onClick={onSubscribe}
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
      >
        License Expert
      </button>
    </div>
  );
};

// 5. OwnershipBadge — QIE Pass verified provenance
export const OwnershipBadge: React.FC<{ creator: string }> = ({ creator }) => {
  const shortCreator = `${creator.slice(0, 6)}...${creator.slice(-4)}`;
  return (
    <div className="inline-flex items-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono">
      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      QIE Pass: {shortCreator}
    </div>
  );
};

// 6. DomainBadge — QIE domain suffix badge
export const DomainBadge: React.FC<{ domain: string }> = ({ domain }) => {
  return (
    <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 rounded-md uppercase tracking-wider">
      {domain}
    </span>
  );
};

// 7. LicenseIndicator — Active sub verification status helper
export const LicenseIndicator: React.FC<{ license?: LicenseTier }> = ({ license }) => {
  const isExpired = license ? license.expiryTime < Math.floor(Date.now() / 1000) : true;
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${!license || isExpired ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-2 ${!license || isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`} />
      {!license ? 'No License' : isExpired ? 'Expired' : 'License Active'}
    </div>
  );
};

// 8. MeshResultView — Multi-expert structured response view with contribution weighting
export const MeshResultView: React.FC<{
  query: string;
  response: string;
  attribution: Record<string, { name: string; domain: string; weight: number }>;
}> = ({ query, response, attribution }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl">
        <h4 className="text-xs uppercase text-indigo-400 font-semibold tracking-wider mb-1">Inquiry</h4>
        <p className="text-white text-base font-medium">{query}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(attribution).map(([id, info]) => (
          <div key={id} className="p-4 bg-slate-900/60 border border-indigo-500/10 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-indigo-400 font-semibold">{info.domain}</span>
              <h5 className="text-sm font-bold text-white">{info.name}</h5>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${info.weight}%` }} className="h-full bg-indigo-500" />
              </div>
              <span className="text-xs font-mono text-white font-bold">{info.weight}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl">
        <h4 className="text-xs uppercase text-indigo-400 font-semibold tracking-wider mb-4">Orchestrated Solution (EchoMesh™)</h4>
        <div className="text-slate-300 space-y-4 text-sm leading-relaxed whitespace-pre-line">
          {response}
        </div>
      </div>
    </div>
  );
};

// 9. VersionTimeline — Agent version timeline with descriptions
export const VersionTimeline: React.FC<{
  versions: Array<{ version: number; date: string; summary: string; changelog: string[] }>;
}> = ({ versions }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {versions.map((v, idx) => (
          <li key={v.version}>
            <div className="relative pb-8">
              {idx !== versions.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-indigo-500/10" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center ring-8 ring-slate-950">
                    <span className="text-xs font-bold text-indigo-400">v{v.version}</span>
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-slate-300 font-bold">{v.summary}</p>
                    <span className="text-xs text-slate-500 font-mono">{v.date}</span>
                  </div>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 mt-2">
                    {v.changelog.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 10. RevenueChart — Revenue and subscription analytics display
export const RevenueChart: React.FC<{ total: number; analytics: Array<{ label: string; amount: number }> }> = ({ total, analytics }) => {
  const maxVal = Math.max(...analytics.map(a => a.amount), 1);
  return (
    <div className="p-6 bg-slate-900/60 border border-indigo-500/10 rounded-2xl shadow-xl">
      <div className="mb-6">
        <span className="text-xs text-slate-500 uppercase font-semibold">Total Revenue Earned</span>
        <h3 className="text-3xl font-black text-white font-mono mt-1">{total} QUSDC</h3>
      </div>
      <div className="h-48 flex items-end gap-3 pt-6 border-b border-indigo-500/10">
        {analytics.map((a, idx) => {
          const heightPct = (a.amount / maxVal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group">
              <div className="w-full relative flex flex-col justify-end h-32">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-indigo-600 text-white font-bold text-[10px] py-0.5 px-1.5 rounded transition-transform font-mono shadow-md">
                  {a.amount}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t group-hover:from-indigo-500 group-hover:to-indigo-300 transition-colors"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-2 truncate w-full text-center">
                {a.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
