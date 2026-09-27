import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { Field, TextInput, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isValidEmail } from '../utils/validation';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }
    setErrors({});
    setStep('reset');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setFormError('');
    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters.' });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ email, newPassword });
      showToast('Password updated. You can log in now.', 'success');
      navigate('/login');
    } catch (err) {
      setFormError(err.message || 'Could not reset your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll help you set a new one for this demo account.">
      {step === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <Field label="Email" error={errors.email}>
            <TextInput type="email" placeholder="you@example.com" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" size="lg">Continue</Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="flex items-center gap-2 text-moss-600 text-sm bg-moss-50 rounded-lg px-3 py-2">
            <CheckCircle2 size={16} /> Identity confirmed for {email}
          </div>
          {formError && <p className="text-sm text-berry-500 bg-berry-50 rounded-lg px-3 py-2">{formError}</p>}
          <Field label="New password" error={errors.newPassword}>
            <TextInput type="password" placeholder="••••••••" value={newPassword} error={errors.newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={submitting}>Update password</Button>
        </form>
      )}
      <p className="text-sm text-ink-400 dark:text-ink-200 mt-6 text-center">
        <Link to="/login" className="text-moss-600 font-medium hover:underline">Back to login</Link>
      </p>
    </AuthShell>
  );
}
