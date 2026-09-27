import React from 'react';
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { useAuth } from '../context/AuthContext';

export default function TransactionRow({ txn, onEdit, onDelete, compact = false }) {
  const { profile } = useAuth();
  const isIncome = txn.type === 'income';
  const date = new Date(txn.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: compact ? undefined : 'numeric' });

  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-ink-50 dark:border-ink-700 last:border-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-moss-50 text-moss-600' : 'bg-clay-50 text-clay-600'}`}>
        {isIncome ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-800 dark:text-paper truncate">{txn.description || txn.category}</p>
        <p className="text-xs text-ink-400 dark:text-ink-200">{txn.category} · {date}{!compact && ` · ${txn.payment_method}`}</p>
      </div>
      <p className={`font-display font-semibold tabular text-sm shrink-0 ${isIncome ? 'text-moss-600' : 'text-ink-800 dark:text-paper'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(txn.amount, profile?.currency)}
      </p>
      {!compact && (onEdit || onDelete) && (
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button onClick={() => onEdit(txn)} aria-label="Edit transaction" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 hover:text-ink-700 dark:hover:text-paper">
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(txn)} aria-label="Delete transaction" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-berry-50 hover:text-berry-500">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
