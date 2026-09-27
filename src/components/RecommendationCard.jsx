import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { getRecommendations, isExternalAiConfigured } from '../services/ai';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

const TONE_ICON = { positive: TrendingUp, warning: AlertTriangle, info: Info };
const TONE_STYLE = {
  positive: 'bg-moss-50 text-moss-600',
  warning: 'bg-gold-50 text-gold-600',
  info: 'bg-ink-50 text-ink-500 dark:bg-ink-700 dark:text-paper',
};

export default function RecommendationCard({ compact = false }) {
  const { transactions, budgets } = useData();
  const { profile } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getRecommendations({ transactions, budgets, profile }).then((r) => {
      if (active) setRecs(r);
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length, budgets.length, profile?.savings_goal]);

  const list = compact ? recs.slice(0, 3) : recs;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-moss-500 text-white flex items-center justify-center">
          <Sparkles size={15} />
        </div>
        <div>
          <p className="font-display font-semibold text-sm">Pocket Smart AI recommendations</p>
          <p className="text-[11px] text-ink-300">{isExternalAiConfigured ? 'Powered by your connected AI model' : 'Based on your recorded data'}</p>
        </div>
      </div>
      {loading ? (
        <Spinner label="Analysing your spending…" />
      ) : (
        <div className="space-y-2.5">
          {list.map((r) => {
            const Icon = TONE_ICON[r.tone] || Info;
            return (
              <div key={r.id} className="flex gap-2.5 items-start">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TONE_STYLE[r.tone] || TONE_STYLE.info}`}>
                  <Icon size={14} />
                </div>
                <p className="text-sm text-ink-600 dark:text-ink-100 leading-snug">{r.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
