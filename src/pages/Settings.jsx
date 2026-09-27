import React, { useState } from 'react';
import { Sun, Moon, Database, Trash2, LogOut } from 'lucide-react';
import { Field, TextInput, Select, Button, ConfirmDialog } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { isValidEmail } from '../utils/validation';
import { isExternalAiConfigured } from '../services/ai';
import { isSupabaseConfigured } from '../services/supabaseClient';

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
];

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-moss-500' : 'bg-ink-100 dark:bg-ink-600'}`}
      aria-pressed={checked}
      aria-label={label}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function Settings() {
  const { profile, updateProfile, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const { hasDemoData, removeDemoData, loadDemoData } = useData();

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    currency: profile?.currency || 'INR',
    monthly_income: profile?.monthly_income || 0,
    savings_goal: profile?.savings_goal || 0,
    notification_preference: profile?.notification_preference ?? true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmClearDemo, setConfirmClearDemo] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }
    if (Number(form.monthly_income) < 0 || Number(form.savings_goal) < 0) {
      setErrors({ monthly_income: 'Values cannot be negative.' });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name,
        currency: form.currency,
        monthly_income: Number(form.monthly_income),
        savings_goal: Number(form.savings_goal),
        notification_preference: form.notification_preference,
      });
      showToast('Settings saved.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-display font-bold text-xl">Settings</h2>
        <p className="text-sm text-ink-400 dark:text-ink-200">Update your profile, preferences and data.</p>
      </div>

      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <p className="font-display font-semibold text-sm">Profile</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name">
            <TextInput value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </Field>
          <Field label="Email" error={errors.email} hint="Used for login only in this demo build.">
            <TextInput type="email" value={form.email} error={errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} disabled />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Currency">
            <Select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Monthly income" error={errors.monthly_income}>
            <TextInput type="number" min="0" value={form.monthly_income} error={errors.monthly_income} onChange={(e) => setForm((f) => ({ ...f, monthly_income: e.target.value }))} />
          </Field>
        </div>
        <Field label="Monthly savings goal">
          <TextInput type="number" min="0" value={form.savings_goal} onChange={(e) => setForm((f) => ({ ...f, savings_goal: e.target.value }))} />
        </Field>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-medium text-ink-700 dark:text-paper">Notifications</p>
            <p className="text-xs text-ink-400 dark:text-ink-200">Receive budget and savings alerts</p>
          </div>
          <Toggle checked={form.notification_preference} onChange={(v) => setForm((f) => ({ ...f, notification_preference: v }))} label="Toggle notifications" />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving}>Save changes</Button>
        </div>
      </form>

      <div className="card p-5">
        <p className="font-display font-semibold text-sm mb-4">Appearance</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-700 dark:text-paper">Theme</p>
            <p className="text-xs text-ink-400 dark:text-ink-200">Choose light or dark mode. Your choice is remembered.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')} className={`w-10 h-10 rounded-lg flex items-center justify-center border ${theme === 'light' ? 'bg-moss-500 border-moss-500 text-white' : 'border-ink-100 dark:border-ink-600 text-ink-500 dark:text-paper'}`} aria-label="Light mode"><Sun size={17} /></button>
            <button onClick={() => setTheme('dark')} className={`w-10 h-10 rounded-lg flex items-center justify-center border ${theme === 'dark' ? 'bg-moss-500 border-moss-500 text-white' : 'border-ink-100 dark:border-ink-600 text-ink-500 dark:text-paper'}`} aria-label="Dark mode"><Moon size={17} /></button>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="font-display font-semibold text-sm mb-4">Demo data</p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-ink-400 dark:text-ink-200 max-w-sm">
            {hasDemoData ? 'Sample data is currently loaded, useful for a project demonstration.' : 'Load realistic sample transactions, budgets and a savings goal for a quick demo.'}
          </p>
          {hasDemoData ? (
            <Button variant="outline" onClick={() => setConfirmClearDemo(true)}><Trash2 size={15} /> Remove demo data</Button>
          ) : (
            <Button variant="outline" onClick={loadDemoData}><Database size={15} /> Load demo data</Button>
          )}
        </div>
      </div>

      <div className="card p-5">
        <p className="font-display font-semibold text-sm mb-3">System status</p>
        <div className="space-y-2 text-xs text-ink-400 dark:text-ink-200">
          <p>Database: {isSupabaseConfigured ? 'Connected to Supabase' : 'Using local browser storage (fully functional — see README to connect Supabase)'}</p>
          <p>AI engine: {isExternalAiConfigured ? 'Connected external AI model' : 'Using the built-in local recommendation engine'}</p>
        </div>
      </div>

      <Button variant="outline" onClick={logout} className="w-full sm:w-auto"><LogOut size={16} /> Log out</Button>

      {confirmClearDemo && (
        <ConfirmDialog
          title="Remove demo data?"
          message="This deletes every sample transaction, budget and goal that was loaded for demonstration. Your own real entries are not affected."
          onConfirm={async () => { setBusy(true); try { await removeDemoData(); setConfirmClearDemo(false); } finally { setBusy(false); } }}
          onCancel={() => setConfirmClearDemo(false)}
          loading={busy}
        />
      )}
    </div>
  );
}
