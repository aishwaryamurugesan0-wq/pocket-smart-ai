import React, { useMemo, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import BudgetCard from '../components/BudgetCard';
import { CATEGORIES } from '../components/TransactionForm';
import { Modal, Button, Field, TextInput, Select, ConfirmDialog, EmptyState, Spinner } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { validateBudget, hasErrors } from '../utils/validation';
import { currentMonthKey, transactionsForMonth, categoryTotals, formatCurrency } from '../utils/calculations';

function BudgetForm({ initial, existingCategories, onSubmit, onCancel }) {
  const [category, setCategory] = useState(initial?.category || CATEGORIES.find((c) => !existingCategories.includes(c)) || CATEGORIES[0]);
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateBudget({ category, amount });
    setErrors(validation);
    if (hasErrors(validation)) return;
    setSubmitting(true);
    try {
      await onSubmit({ category, amount: Number(amount) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Category" error={errors.category}>
        <Select value={category} disabled={!!initial} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Field>
      <Field label="Monthly budget amount (₹)" error={errors.amount}>
        <TextInput type="number" min="0" placeholder="5000" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>Save budget</Button>
      </div>
    </form>
  );
}

export default function Budget() {
  const { transactions, budgets, upsertBudget, deleteBudget, loading } = useData();
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const { month, year } = currentMonthKey();
  const monthTxns = useMemo(() => transactionsForMonth(transactions, month, year), [transactions, month, year]);
  const catTotals = categoryTotals(monthTxns, 'expense');
  const monthBudgets = budgets.filter((b) => b.month === month && b.year === year);

  const totalBudget = monthBudgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (catTotals[b.category] || 0), 0);

  const handleSave = async (data) => {
    await upsertBudget({ ...data, month, year });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteBudget(deleting.id);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading budgets…" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-xl">Budget</h2>
          <p className="text-sm text-ink-400 dark:text-ink-200">Set a monthly limit per category and track how close you are.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> New budget</Button>
      </div>

      {monthBudgets.length > 0 && (
        <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-ink-400 dark:text-ink-200">Total budgeted this month</p>
            <p className="font-display font-bold text-lg">{formatCurrency(totalBudget, profile?.currency)}</p>
          </div>
          <div className="w-px h-8 bg-ink-50 dark:bg-ink-700 hidden sm:block" />
          <div>
            <p className="text-xs text-ink-400 dark:text-ink-200">Spent so far</p>
            <p className="font-display font-bold text-lg">{formatCurrency(totalSpent, profile?.currency)}</p>
          </div>
          <div className="w-px h-8 bg-ink-50 dark:bg-ink-700 hidden sm:block" />
          <div>
            <p className="text-xs text-ink-400 dark:text-ink-200">Overall used</p>
            <p className="font-display font-bold text-lg">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</p>
          </div>
        </div>
      )}

      {monthBudgets.length === 0 ? (
        <div className="card">
          <EmptyState icon={Wallet} title="No budgets yet" message="Create a monthly budget for a category like Food or Transport to start tracking your spending against it." action={<Button onClick={() => setShowForm(true)}><Plus size={16} /> Create your first budget</Button>} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthBudgets.map((b) => (
            <BudgetCard key={b.id} budget={b} spent={catTotals[b.category] || 0} onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Create budget" onClose={() => setShowForm(false)}>
          <BudgetForm existingCategories={monthBudgets.map((b) => b.category)} onSubmit={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit ${editing.category} budget`} onClose={() => setEditing(null)}>
          <BudgetForm initial={editing} existingCategories={monthBudgets.map((b) => b.category)} onSubmit={handleSave} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove this budget?"
          message={`This removes your ${deleting.category} budget for this month. Your transactions won't be affected.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={busy}
        />
      )}
    </div>
  );
}
