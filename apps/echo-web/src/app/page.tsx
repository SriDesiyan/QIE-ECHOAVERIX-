import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold tracking-wider uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          The Future of Decentralized AI Expertise
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          Create, Own, Verify & Monetize AI Expertise on QIE
        </h1>
        <p className="text-lg md:text-xl text-echo-text-muted max-w-2xl mx-auto">
          EchoAverix turns raw prompts into benchmarked, versioned, licensed, and collaborative on-chain experts called EchoTwins™.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/exchange"
            className="py-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            Explore Echo Exchange™
          </Link>
          <Link
            href="/studio"
            className="py-3 px-8 bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/40 text-white font-bold rounded-xl transition-all"
          >
            Deploy Expert Studio
          </Link>
        </div>
      </section>

      {/* 7-Layer Architecture Section */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-black text-white">Branded 7-Layer Architecture</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Our protocol architecture verifies ownership, controls usage licensing, and orchestrates multi-agent intelligence on-chain.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl">
            <span className="text-xs font-bold text-indigo-400 font-mono">Layer 1 & 2</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">QIE Pass & Registry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Secures identity validation and registers agent ownership (EchoTwin) with incrementing version histories on the QIE registry.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl">
            <span className="text-xs font-bold text-indigo-400 font-mono">Layer 3 & 4</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Vaults & EchoScore™</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Attaches custom knowledge vectors and runs initial safety and dimension benchmarks to output a composite reputation rating (0-1000).</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl">
            <span className="text-xs font-bold text-indigo-400 font-mono">Layer 5 & 6</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Exchange & EchoMesh™</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Handles subscription, pay-per-query, and trials on the Exchange, while EchoMesh orchestrates concurrent queries to multiple experts.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-indigo-500/10 rounded-2xl">
            <span className="text-xs font-bold text-indigo-400 font-mono">Layer 7</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Legacy Transfer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Enables inheritance designation and ownership succession execution for AI assets with time-locked contracts.</p>
          </div>
        </div>
      </section>

      {/* Subsystem Features Promo */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            The App Store + GitHub + LinkedIn of AI Experts
          </h2>
          <p className="text-slate-300">
            EchoAverix introduces EchoScore™, an immutable benchmarking index verifying the accuracy and safety of expert agents, combined with EchoMesh™ multi-agent orchestration for solving complex query prompts.
          </p>
          <ul className="space-y-3 font-semibold text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Verified provenance anchored on the QIE network.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Subscriptions paid automatically in QUSDC.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Time-locked successors designate ownership inheritance.
            </li>
          </ul>
        </div>
        <div className="p-8 bg-slate-900/60 border border-indigo-500/15 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Live Benchmark Preview</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/5 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">FinanceGuru</h4>
                <p className="text-xs text-slate-500">Corporate reserves and capital optimizer</p>
              </div>
              <div className="inline-flex items-center px-2 py-0.5 border border-emerald-500 text-emerald-400 rounded-full text-xs font-mono">
                EchoScore™ 942
              </div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/5 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">LegalAdvisor</h4>
                <p className="text-xs text-slate-500">Decentralized IP licensing compliance</p>
              </div>
              <div className="inline-flex items-center px-2 py-0.5 border border-indigo-500 text-indigo-400 rounded-full text-xs font-mono">
                EchoScore™ 887
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
