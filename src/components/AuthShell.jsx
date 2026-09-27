import React from 'react';
import { Wallet, ShieldCheck, PieChart, Sparkles } from 'lucide-react';

const PERKS = [
  { icon: PieChart, text: 'See exactly where every rupee goes, automatically categorised.' },
  { icon: Sparkles, text: 'Get plain-language recommendations based on your real spending.' },
  { icon: ShieldCheck, text: 'Your financial data stays private, protected by row-level security.' },
];

export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-paper dark:bg-ink-900">
      <div className="hidden lg:flex lg:w-[42%] bg-ink-800 text-white flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-moss-500 flex items-center justify-center">
            <Wallet size={19} />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-tight">Pocket Smart AI</p>
            <p className="text-xs text-ink-300">Your Smart Budget & Recommendation Assistant</p>
          </div>
        </div>
        <div>
          <h2 className="font-display font-bold text-3xl xl:text-4xl leading-tight mb-6">
            Know your money.<br />Spend with intention.
          </h2>
          <div className="space-y-5">
            {PERKS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <p className="text-sm text-ink-100 leading-snug pt-1.5">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-ink-400">Built for college project demonstrations — try the demo data option after signing up.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-moss-500 flex items-center justify-center text-white">
              <Wallet size={17} />
            </div>
            <p className="font-display font-bold text-lg">Pocket Smart AI</p>
          </div>
          <h1 className="font-display font-bold text-2xl text-ink-800 dark:text-paper mb-1">{title}</h1>
          <p className="text-sm text-ink-400 dark:text-ink-200 mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
