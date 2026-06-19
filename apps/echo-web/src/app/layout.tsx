import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(() => import('../components/ParticleBackground'), {
  ssr: false
});
const MorphButton = dynamic(() => import('../components/MorphButton'), {
  ssr: false
});

export const metadata: Metadata = {
  title: "QIE EchoAverix — Decentralized AI Expert Agent Marketplace",
  description: "Create, Own, Verify, and Monetize Trusted AI Expertise on QIE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-echo-bg-primary text-echo-text-primary relative">
        <ParticleBackground />
        <MorphButton />
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 glassmorphism border-b border-indigo-500/10 py-4 px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent group-hover:opacity-95 transition-all">
              EchoAverix™
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-echo-text-muted">
            <Link href="/exchange" className="hover:text-indigo-400 transition-colors">Exchange</Link>
            <Link href="/studio" className="hover:text-indigo-400 transition-colors">Studio</Link>
            <Link href="/echoscore" className="hover:text-indigo-400 transition-colors">EchoScore</Link>
            <Link href="/mesh" className="hover:text-indigo-400 transition-colors">EchoMesh</Link>
            <Link href="/monetization" className="hover:text-indigo-400 transition-colors">Monetization</Link>
            <Link href="/ownership" className="hover:text-indigo-400 transition-colors">Ownership</Link>
            <Link href="/admin" className="hover:text-indigo-400 transition-colors">Registry Admin</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              QIE Wallet Connect
            </button>
          </div>
        </header>

        {/* Core Layout Main Section */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full glassmorphism border-t border-indigo-500/10 py-8 px-6 md:px-12 text-center text-xs text-echo-text-muted">
          <p>© 2026 QIE EchoAverix. Powered by QIE Blockchain. All Rights Reserved.</p>
          <div className="flex justify-center gap-4 mt-2 font-semibold">
            <a href="https://qie.space" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">QIE Network</a>
            <span>•</span>
            <Link href="/ownership" className="hover:text-indigo-400">Ownership Succession</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
