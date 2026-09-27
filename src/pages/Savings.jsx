import React, { useState } from 'react';
import { Plus, PiggyBank, Pencil, Trash2 } from 'lucide-react';
import { Modal, Button, Field, TextInput, ConfirmDialog, EmptyState, Spinner } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { validateSavingsGoal, hasErrors } from '../utils/validation';
import { formatCurrency, monthsBetween } from '../utils/calculations';

function GoalForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    targetAmount: initial?.target_amount ?? '',
    currentAmount: initial?.current_amount ?? '0',
    targetDate: initial?.target_date || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateSavingsGoal(form);
    setErrors(validation);
    if (hasErrors(validation)) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name,
        target_amount: Number(form.targetAmount),
        current_amount: Number(form.currentAmount) || 0,
        target_date: form.targetDate || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Goal name" error={errors.name}>
        <TextInput placeholder="e.g. Emergency Fund" value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Target amount (₹)" error={errors.targetAmount}>
          <TextInput type="number" min="0" placeholder="60000" value={form.targetAmount} error={errors.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} />
        </Field>
        <Field label="Currently saved (₹)" error={errors.currentAmount}>
          <TextInput type="number" min="0" placeholder="0" value={form.currentAmount} error={errors.currentAmount} onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))} />
        </Field>
      </div>
      <Field label="Target date (optional)">
        <TextInput type="date" value={form.targetDate || ''} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Save changes' : 'Create goal'}</Button>
      </div>
    </form>
  );
}

function GoalCard({ goal, onEdit, onDelete, currency }) {
  const remaining = Math.max(Number(goal.target_amount) - Number(goal.current_amount), 0);
  const pct = Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100);
  let monthlyRequired = null;
  if (goal.target_date) {
    const months = monthsBetween(new Date(), goal.target_date);
    monthlyRequired = remaining / months;
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-moss-50 text-moss-600 flex items-center justify-center"><PiggyBank size={17} /></div>
          <div>
            <p className="font-display font-semibold text-ink-800 dark:text-paper">{goal.name}</p>
            {goal.target_date && <p className="text-xs text-ink-400 dark:text-ink-200">Target: {new Date(goal.target_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(goal)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700" aria-label="Edit goal"><Pencil size={15} /></button>
          <button onClick={() => onDelete(goal)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-berry-50 hover:text-berry-500" aria-label="Delete goal"><Trash2 size={15} /></button>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill bg-moss-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div>
          <p className="text-xs text-ink-400 dark:text-ink-200">Saved</p>
          <p className="font-display font-semibold text-sm tabular">{formatCurrency(goal.current_amount, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 dark:text-ink-200">Remaining</p>
          <p className="font-display font-semibold text-sm tabular">{formatCurrency(remaining, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 dark:text-ink-200">Progress</p>
          <p className="font-display font-semibold text-sm tabular">{pct}%</p>
        </div>
      </div>
      {monthlyRequired !== null && (
        <p className="text-xs text-ink-400 dark:text-ink-200 mt-3 pt-3 border-t border-ink-50 dark:border-ink-700">
          Suggested monthly saving: <span className="font-medium text-ink-600 dark:text-paper">{formatCurrency(monthlyRequired, currency)}</span> to reach this goal on time.
        </p>
      )}
    </div>
  );
}

export default function Savings() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, loading } = useData();
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSave = async (data) => {
    if (editing) await updateSavingsGoal(editing.id, data);
    else await addSavingsGoal(data);
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteSavingsGoal(deleting.id);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading savings goals…" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-xl">Savings Goals</h2>
          <p className="text-sm text-ink-400 dark:text-ink-200">Set a target and track your progress toward it.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> New goal</Button>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="card">
          <EmptyState icon={PiggyBank} title="No savings goals yet" message="Create a goal like an emergency fund or a trip, and Pocket Smart AI will suggest how much to save each month." action={<Button onClick={() => setShowForm(true)}><Plus size={16} /> Create a goal</Button>} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {savingsGoals.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={(goal) => setEditing(goal)} onDelete={setDeleting} currency={profile?.currency} />
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <Modal title={editing ? 'Edit savings goal' : 'New savings goal'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <GoalForm initial={editing} onSubmit={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this goal?"
          message={`This will permanently remove "${deleting.name}".`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={busy}
        />
      )}
    </div>
  );
}
