import React from 'react';
import { X, Inbox, AlertTriangle } from 'lucide-react';

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 dark:text-paper">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="text-xs text-ink-300 mt-1">{hint}</p>}
      {error && <p className="text-xs text-berry-500 mt-1">{error}</p>}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-white dark:bg-ink-700 text-ink-800 dark:text-paper placeholder:text-ink-300 outline-none transition-colors ${
        props.error ? 'border-berry-500' : 'border-ink-100 dark:border-ink-600 focus:border-moss-500'
      } ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-white dark:bg-ink-700 text-ink-800 dark:text-paper outline-none transition-colors ${
        props.error ? 'border-berry-500' : 'border-ink-100 dark:border-ink-600 focus:border-moss-500'
      } ${props.className || ''}`}
    >
      {props.children}
    </select>
  );
}

export function Button({ variant = 'primary', size = 'md', className = '', children, loading, disabled, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-moss-500 hover:bg-moss-600 text-white',
    secondary: 'bg-ink-50 dark:bg-ink-700 hover:bg-ink-100 dark:hover:bg-ink-600 text-ink-700 dark:text-paper',
    danger: 'bg-berry-500 hover:bg-berry-600 text-white',
    ghost: 'hover:bg-ink-50 dark:hover:bg-ink-700 text-ink-600 dark:text-paper',
    outline: 'border border-ink-100 dark:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-700 text-ink-700 dark:text-paper',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
      {children}
    </button>
  );
}

export function Modal({ title, onClose, children, footer, size = 'md' }) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-white dark:bg-ink-800 rounded-t-2xl sm:rounded-2xl shadow-pop max-h-[90vh] overflow-y-auto animate-slide-up`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-50 dark:border-ink-700 sticky top-0 bg-white dark:bg-ink-800">
          <h3 className="font-display font-semibold text-base">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink-400 hover:text-ink-700 dark:hover:text-paper">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-ink-50 dark:border-ink-700 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading, danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm" footer={(
      <>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    )}>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-berry-50 text-berry-500 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} />
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-100">{message}</p>
      </div>
    </Modal>
  );
}

export function EmptyState({ title, message, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl bg-ink-50 dark:bg-ink-700 text-ink-300 flex items-center justify-center mb-4">
        <Icon size={26} />
      </div>
      <p className="font-display font-semibold text-ink-700 dark:text-paper mb-1">{title}</p>
      <p className="text-sm text-ink-400 dark:text-ink-200 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink-400 dark:text-ink-200">
      <span className="w-5 h-5 rounded-full border-2 border-moss-100 border-t-moss-500 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Badge({ children, tone = 'ink' }) {
  const tones = {
    ink: 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-paper',
    moss: 'bg-moss-50 text-moss-600 dark:bg-moss-700/30 dark:text-moss-100',
    gold: 'bg-gold-50 text-gold-600 dark:bg-gold-500/20 dark:text-gold-100',
    clay: 'bg-clay-50 text-clay-600 dark:bg-clay-500/20 dark:text-clay-100',
    berry: 'bg-berry-50 text-berry-600 dark:bg-berry-500/20 dark:text-berry-100',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
