'use client';

import React from 'react';

export default function MorphButton() {
  const triggerMorph = () => {
    window.dispatchEvent(new CustomEvent('morph-particle-shape'));
  };

  return (
    <button
      onClick={triggerMorph}
      className="fixed left-1/2 bottom-6 -translate-x-1/2 py-3 px-8 bg-slate-900/60 border border-indigo-500/25 hover:border-indigo-500/50 hover:bg-slate-900/80 text-indigo-200 hover:text-white font-bold rounded-full transition-all z-50 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-md text-sm cursor-pointer"
      style={{
        transform: 'translateX(-50%)',
      }}
    >
      Morph Shape
    </button>
  );
}
