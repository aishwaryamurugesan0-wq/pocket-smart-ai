import React, { useMemo } from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { EmptyState, Spinner } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { categoryTotals, monthlySeries, formatCurrency, totalIncome, totalExpenses } from '../utils/calculations';

const PIE_COLORS = ['#1F6F5C', '#C4622D', '#B98A2E', '#9B2C46', '#5C6A8C', '#2C8A73', '#D97B45', '#3A4666', '#946E22', '#7C2138'];

export default function Analytics() {
  const { transactions, loading } = useData();
  const { profile } = useAuth();
  const currency = profile?.currency;

  const catTotals = categoryTotals(transactions, 'expense');
  const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));
  const series = useMemo(() => monthlySeries(transactions, 6), [transactions]);
  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);

  if (loading) return <Spinner label="Loading analytics…" />;

  if (transactions.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display font-bold text-xl">Analytics</h2>
          <p className="text-sm text-ink-400 dark:text-ink-200">Understand your spending patterns at a glance.</p>
        </div>
        <div className="card">
          <EmptyState icon={PieIcon} title="No data to analyse yet" message="Add some transactions to see your spending analytics." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-xl">Analytics</h2>
        <p className="text-sm text-ink-400 dark:text-ink-200">Understand your spending patterns at a glance, drawn straight from your recorded transactions.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <p className="font-display font-semibold text-sm mb-4">Expense by category</p>
          {pieData.length === 0 ? (
            <p className="text-sm text-ink-400 py-10 text-center">No expenses recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <p className="font-display font-semibold text-sm mb-4">Income vs expenses</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4DE" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#8C97B2' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8C97B2' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill="#1F6F5C" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#C4622D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="font-display font-semibold text-sm mb-4">Monthly spending</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={series} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4DE" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#8C97B2' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8C97B2' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
              <Bar dataKey="expenses" name="Expenses" fill="#C4622D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="font-display font-semibold text-sm mb-4">Spending trend</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4DE" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#8C97B2' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8C97B2' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#C4622D" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5 flex items-center justify-around text-center flex-wrap gap-4">
        <div>
          <p className="text-xs text-ink-400 dark:text-ink-200">Total income</p>
          <p className="font-display font-bold text-lg text-moss-600">{formatCurrency(income, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 dark:text-ink-200">Total expenses</p>
          <p className="font-display font-bold text-lg text-clay-600">{formatCurrency(expenses, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 dark:text-ink-200">Net</p>
          <p className="font-display font-bold text-lg">{formatCurrency(income - expenses, currency)}</p>
        </div>
      </div>
    </div>
  );
}
