import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingDown, TrendingUp, PiggyBank, Gauge, Plus, Database, Inbox } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import SummaryCard from '../components/SummaryCard';
import TransactionRow from '../components/TransactionRow';
import TransactionForm from '../components/TransactionForm';
import RecommendationCard from '../components/RecommendationCard';
import BudgetCard from '../components/BudgetCard';
import { Modal, Button, EmptyState, Spinner } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { totalIncome, totalExpenses, balance, categoryTotals, monthlySeries, formatCurrency, currentMonthKey, transactionsForMonth, budgetProgress } from '../utils/calculations';

export default function Dashboard() {
  const { transactions, budgets, savingsGoals, loading, addTransaction, loadDemoData, hasDemoData } = useData();
  const { profile } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const currency = profile?.currency;

  const { month, year } = currentMonthKey();
  const monthTxns = useMemo(() => transactionsForMonth(transactions, month, year), [transactions, month, year]);

  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);
  const remaining = balance(transactions);
  const savings = income - expenses;
  const monthlyBudgetTotal = budgets.filter((b) => b.month === month && b.year === year).reduce((s, b) => s + Number(b.amount), 0);
  const monthlySpentTotal = totalExpenses(monthTxns);
  const budgetUsedPct = monthlyBudgetTotal > 0 ? Math.round((monthlySpentTotal / monthlyBudgetTotal) * 100) : 0;

  const series = useMemo(() => monthlySeries(transactions, 6), [transactions]);
  const catTotals = categoryTotals(monthTxns, 'expense');
  const thisMonthBudgets = budgets.filter((b) => b.month === month && b.year === year).slice(0, 4);
  const activeGoal = savingsGoals[0];

  const handleAdd = async (data) => {
    await addTransaction(data);
    setShowAdd(false);
  };

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      await loadDemoData();
    } finally {
      setLoadingDemo(false);
    }
  };

  if (loading) return <Spinner label="Loading your dashboard…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-xl">Dashboard</h2>
          <p className="text-sm text-ink-400 dark:text-ink-200">A live snapshot of your money, updated with every transaction.</p>
        </div>
        <div className="flex items-center gap-2">
          {!hasDemoData && transactions.length === 0 && (
            <Button variant="outline" onClick={handleLoadDemo} loading={loadingDemo}>
              <Database size={16} /> Load demo data
            </Button>
          )}
          <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add transaction</Button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            message="Add your first transaction to start tracking your budget, or load sample data to try the app out for a demonstration."
            action={<Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add your first transaction</Button>}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <SummaryCard label="Total Income" value={formatCurrency(income, currency)} icon={TrendingUp} tone="moss" />
            <SummaryCard label="Total Expenses" value={formatCurrency(expenses, currency)} icon={TrendingDown} tone="clay" />
            <SummaryCard label="Remaining Balance" value={formatCurrency(remaining, currency)} icon={Wallet} tone="ink" />
            <SummaryCard label="Savings" value={formatCurrency(savings, currency)} icon={PiggyBank} />
            <SummaryCard label="Budget Used" value={`${budgetUsedPct}%`} icon={Gauge} sub={monthlyBudgetTotal > 0 ? `of ${formatCurrency(monthlyBudgetTotal, currency)} this month` : 'No budgets set yet'} />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-semibold text-sm">Spending overview</p>
                <Link to="/analytics" className="text-xs text-moss-600 hover:underline">View analytics</Link>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={series} margin={{ left: -20, right: 8 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1F6F5C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#1F6F5C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C4622D" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#C4622D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4DE" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#8C97B2' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8C97B2' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" stroke="#1F6F5C" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
                  <Area type="monotone" dataKey="expenses" stroke="#C4622D" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <RecommendationCard compact />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-semibold text-sm">Recent transactions</p>
                <Link to="/transactions" className="text-xs text-moss-600 hover:underline">View all</Link>
              </div>
              <div>
                {transactions.slice(0, 6).map((t) => <TransactionRow key={t.id} txn={t} compact />)}
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-semibold text-sm">Savings progress</p>
                <Link to="/savings" className="text-xs text-moss-600 hover:underline">Manage</Link>
              </div>
              {activeGoal ? (
                <SavingsMini goal={activeGoal} currency={currency} />
              ) : (
                <p className="text-sm text-ink-400 dark:text-ink-200">No savings goal set yet. Head to the Savings page to create one.</p>
              )}
            </div>
          </div>

          {thisMonthBudgets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-semibold text-sm">Budget progress</p>
                <Link to="/budget" className="text-xs text-moss-600 hover:underline">Manage budgets</Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {thisMonthBudgets.map((b) => (
                  <BudgetCard key={b.id} budget={b} spent={catTotals[b.category] || 0} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showAdd && (
        <Modal title="Add transaction" onClose={() => setShowAdd(false)}>
          <TransactionForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}

function SavingsMini({ goal, currency }) {
  const pct = Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100);
  return (
    <div>
      <p className="text-sm font-medium text-ink-800 dark:text-paper">{goal.name}</p>
      <p className="text-xs text-ink-400 dark:text-ink-200 mb-2">{formatCurrency(goal.current_amount, currency)} of {formatCurrency(goal.target_amount, currency)}</p>
      <div className="progress-track">
        <div className="progress-fill bg-moss-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-ink-400 dark:text-ink-200 mt-2">{pct}% there</p>
    </div>
  );
}
