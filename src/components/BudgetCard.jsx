import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { budgetProgress, formatCurrency, BUDGET_STATUS_LABEL, BUDGET_STATUS_COLOR } from '../utils/calculations';
import { Badge } from './ui';
import { useAuth } from '../context/AuthContext';

const FILL_COLOR = {
  moss: 'bg-moss-500',
  gold: 'bg-gold-500',
  clay: 'bg-clay-500',
  berry: 'bg-berry-500',
};

export default function BudgetCard({ budget, spent, onEdit, onDelete }) {
  const { profile } = useAuth();
  const progress = budgetProgress(budget.amount, spent);
  const tone = BUDGET_STATUS_COLOR[progress.status];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-display font-semibold text-ink-800 dark:text-paper">{budget.category}</p>
          <p className="text-xs text-ink-400 dark:text-ink-200 mt-0.5">
            {formatCurrency(progress.spent, profile?.currency)} of {formatCurrency(progress.amount, profile?.currency)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge tone={tone}>{BUDGET_STATUS_LABEL[progress.status]}</Badge>
        </div>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${FILL_COLOR[tone]}`} style={{ width: `${Math.min(progress.percentageUsed, 100)}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-ink-400 dark:text-ink-200">
          {progress.remaining >= 0
            ? `${formatCurrency(progress.remaining, profile?.currency)} remaining`
            : `${formatCurrency(Math.abs(progress.remaining), profile?.currency)} over budget`}
        </p>
        <p className="text-xs font-medium text-ink-500 dark:text-ink-200">{progress.percentageUsed}%</p>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-1 mt-3 -mb-1">
          {onEdit && (
            <button onClick={() => onEdit(budget)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 hover:text-ink-700 dark:hover:text-paper" aria-label="Edit budget">
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(budget)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-berry-50 hover:text-berry-500" aria-label="Delete budget">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
