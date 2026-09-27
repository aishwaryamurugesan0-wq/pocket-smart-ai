import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { Field, TextInput, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateLogin, hasErrors } from '../utils/validation';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateLogin(form);
    setErrors(validation);
    setFormError('');
    if (hasErrors(validation)) return;
    setSubmitting(true);
    try {
      await login(form);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Could not log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see where your money stands.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-sm text-berry-500 bg-berry-50 rounded-lg px-3 py-2">{formError}</p>}
        <Field label="Email" error={errors.email}>
          <TextInput type="email" autoComplete="email" placeholder="you@example.com" value={form.email} error={errors.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field label="Password" error={errors.password}>
          <TextInput type="password" autoComplete="current-password" placeholder="••••••••" value={form.password} error={errors.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-moss-600 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={submitting}>Log in</Button>
      </form>
      <p className="text-sm text-ink-400 dark:text-ink-200 mt-6 text-center">
        Don't have an account? <Link to="/register" className="text-moss-600 font-medium hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}
