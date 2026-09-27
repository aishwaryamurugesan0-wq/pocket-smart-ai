import React from 'react';

const TONE_STYLES = {
  moss: 'bg-moss-500 text-white',
  ink: 'bg-ink-800 text-white',
  clay: 'bg-clay-500 text-white',
  gold: 'bg-gold-500 text-white',
  plain: 'bg-white dark:bg-ink-800 text-ink-800 dark:text-paper border border-ink-50 dark:border-ink-700',
};

export default function SummaryCard({ label, value, icon: Icon, tone = 'plain', sub }) {
  const filled = tone !== 'plain';
  return (
    <div className={`rounded-xl2 p-5 shadow-card ${TONE_STYLES[tone]}`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm font-medium ${filled ? 'text-white/80' : 'text-ink-400 dark:text-ink-200'}`}>{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${filled ? 'bg-white/15' : 'bg-ink-50 dark:bg-ink-700 text-ink-500 dark:text-paper'}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
      <p className="font-display font-bold text-2xl tabular">{value}</p>
      {sub && <p className={`text-xs mt-1.5 ${filled ? 'text-white/70' : 'text-ink-300'}`}>{sub}</p>}
    </div>
  );
}
