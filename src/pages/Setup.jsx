import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight } from 'lucide-react';
import { Field, TextInput, Select, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
];

const BUDGET_STYLES = [
  { value: 'balanced', label: 'Balanced — spend and save evenly' },
  { value: 'saver', label: 'Saver — prioritise saving over spending' },
  { value: 'flexible', label: 'Flexible — track loosely, review monthly' },
];

const ALL_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Entertainment', 'Health', 'Travel', 'Family', 'Other'];

export default function Setup() {
  const { updateProfile, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    monthly_income: '',
    currency: 'INR',
    savings_goal: '',
    budget_style: 'balanced',
    categories: profile?.categories || ALL_CATEGORIES.slice(0, 6),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.categories.length === 0) {
      setError('Choose at least one spending category to track.');
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({
        monthly_income: Number(form.monthly_income) || 0,
        currency: form.currency,
        savings_goal: Number(form.savings_goal) || 0,
        budget_style: form.budget_style,
        categories: form.categories,
        onboarded: true,
      });
      showToast('You\'re all set up!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong saving your setup.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 rounded-xl bg-moss-500 flex items-center justify-center text-white"><Wallet size={17} /></div>
          <p className="font-display font-bold text-lg">Pocket Smart AI</p>
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="font-display font-bold text-xl mb-1">Let's set up your budget</h1>
          <p className="text-sm text-ink-400 dark:text-ink-200 mb-6">This helps Pocket Smart AI tailor your dashboard and recommendations. You can change all of this later in Settings.</p>
          {error && <p className="text-sm text-berry-500 bg-berry-50 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Monthly income">
                <TextInput type="number" min="0" placeholder="30000" value={form.monthly_income}
                  onChange={(e) => setForm((f) => ({ ...f, monthly_income: e.target.value }))} />
              </Field>
              <Field label="Currency">
                <Select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Monthly savings goal">
              <TextInput type="number" min="0" placeholder="5000" value={form.savings_goal}
                onChange={(e) => setForm((f) => ({ ...f, savings_goal: e.target.value }))} />
            </Field>
            <Field label="Preferred budget style">
              <Select value={form.budget_style} onChange={(e) => setForm((f) => ({ ...f, budget_style: e.target.value }))}>
                {BUDGET_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </Field>
            <div>
              <span className="text-sm font-medium text-ink-700 dark:text-paper">Main spending categories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.categories.includes(cat)
                        ? 'bg-moss-500 border-moss-500 text-white'
                        : 'border-ink-100 dark:border-ink-600 text-ink-500 dark:text-paper'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Go to my dashboard <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
