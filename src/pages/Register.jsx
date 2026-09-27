import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { Field, TextInput, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateRegister, hasErrors } from '../utils/validation';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateRegister(form);
    setErrors(validation);
    setFormError('');
    if (hasErrors(validation)) return;
    setSubmitting(true);
    try {
      await register(form);
      showToast('Account created. Let\'s set up your budget.', 'success');
      navigate('/setup');
    } catch (err) {
      setFormError(err.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Takes less than a minute to get started.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-sm text-berry-500 bg-berry-50 rounded-lg px-3 py-2">{formError}</p>}
        <Field label="Full name" error={errors.fullName}>
          <TextInput type="text" autoComplete="name" placeholder="Priya Sharma" value={form.fullName} error={errors.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        </Field>
        <Field label="Email" error={errors.email}>
          <TextInput type="email" autoComplete="email" placeholder="you@example.com" value={form.email} error={errors.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field label="Password" error={errors.password} hint="At least 6 characters.">
          <TextInput type="password" autoComplete="new-password" placeholder="••••••••" value={form.password} error={errors.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          <TextInput type="password" autoComplete="new-password" placeholder="••••••••" value={form.confirmPassword} error={errors.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={submitting}>Create account</Button>
      </form>
      <p className="text-sm text-ink-400 dark:text-ink-200 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-moss-600 font-medium hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
