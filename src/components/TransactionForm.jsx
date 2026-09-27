import React, { useState } from 'react';
import { Field, TextInput, Select, Button } from './ui';
import { validateTransaction, hasErrors } from '../utils/validation';

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Entertainment', 'Health', 'Travel', 'Family', 'Other'];
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    type: initial?.type || 'expense',
    amount: initial?.amount ?? '',
    category: initial?.category || 'Food',
    description: initial?.description || '',
    transaction_date: initial?.transaction_date || todayStr(),
    payment_method: initial?.payment_method || 'UPI',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateTransaction(form);
    setErrors(validation);
    if (hasErrors(validation)) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {['expense', 'income'].map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => update('type', t)}
            className={`py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
              form.type === t
                ? t === 'income' ? 'bg-moss-500 border-moss-500 text-white' : 'bg-clay-500 border-clay-500 text-white'
                : 'border-ink-100 dark:border-ink-600 text-ink-500 dark:text-paper'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Field label="Amount (₹)" error={errors.amount}>
        <TextInput
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          error={errors.amount}
          onChange={(e) => update('amount', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" error={errors.category}>
          <Select value={form.category} onChange={(e) => update('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Payment method">
          <Select value={form.payment_method} onChange={(e) => update('payment_method', e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </Field>
      </div>

      <Field label="Description">
        <TextInput
          type="text"
          placeholder="e.g. Groceries for the week"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={120}
        />
      </Field>

      <Field label="Date" error={errors.transaction_date}>
        <TextInput
          type="date"
          value={form.transaction_date}
          error={errors.transaction_date}
          max={todayStr()}
          onChange={(e) => update('transaction_date', e.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Save changes' : 'Add transaction'}</Button>
      </div>
    </form>
  );
}
