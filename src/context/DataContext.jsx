import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import db from '../services/localStore';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { budgetProgress, categoryTotals, currentMonthKey, transactionsForMonth } from '../utils/calculations';
import { buildDemoTransactions, buildDemoBudgets, buildDemoSavingsGoal } from '../services/demoData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [t, b, g, n] = await Promise.all([
        db.transactions.list(user.id),
        db.budgets.list(user.id),
        db.savingsGoals.list(user.id),
        db.notifications.list(user.id),
      ]);
      setTransactions(t);
      setBudgets(b);
      setSavingsGoals(g);
      setNotifications(n);
    } catch (err) {
      console.error(err);
      showToast('Could not load your data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) loadAll();
    else {
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
      setNotifications([]);
      setLoading(false);
    }
  }, [user, loadAll]);

  const notify = useCallback(async (title, message, type = 'info') => {
    if (!user) return;
    const row = await db.notifications.create(user.id, { title, message, type });
    setNotifications((prev) => [row, ...prev]);
  }, [user]);

  // ---------------- Transactions ----------------
  const addTransaction = useCallback(async (data) => {
    const row = await db.transactions.create(user.id, data);
    setTransactions((prev) => [row, ...prev]);

    if (data.type === 'expense') {
      const { month, year } = currentMonthKey();
      const monthTxns = transactionsForMonth([...transactions, row], month, year);
      const catSpent = categoryTotals(monthTxns, 'expense')[data.category] || 0;
      const budget = budgets.find((b) => b.category === data.category && b.month === month && b.year === year);
      if (budget) {
        const progress = budgetProgress(budget.amount, catSpent);
        if (progress.status === 'exceeded') {
          await notify('Budget exceeded', `You've gone over your ${data.category} budget for this month.`, 'warning');
        } else if (progress.status === 'near') {
          await notify('Budget nearly used up', `You've used ${progress.percentageUsed}% of your ${data.category} budget.`, 'warning');
        } else if (progress.status === 'approaching') {
          await notify('Approaching budget', `You've used ${progress.percentageUsed}% of your ${data.category} budget.`, 'info');
        }
      }
    }
    await notify('Transaction added', `${data.type === 'income' ? 'Income' : 'Expense'} of ${data.amount} recorded under ${data.category}.`, 'success');
    return row;
  }, [user, transactions, budgets, notify]);

  const updateTransaction = useCallback(async (id, patch) => {
    const row = await db.transactions.update(user.id, id, patch);
    setTransactions((prev) => prev.map((t) => (t.id === id ? row : t)));
    showToast('Transaction updated.', 'success');
    return row;
  }, [user, showToast]);

  const deleteTransaction = useCallback(async (id) => {
    await db.transactions.remove(user.id, id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted.', 'success');
  }, [user, showToast]);

  // ---------------- Budgets ----------------
  const upsertBudget = useCallback(async (data) => {
    const row = await db.budgets.upsert(user.id, data);
    setBudgets((prev) => {
      const exists = prev.some((b) => b.id === row.id);
      return exists ? prev.map((b) => (b.id === row.id ? row : b)) : [...prev, row];
    });
    showToast('Budget saved.', 'success');
    return row;
  }, [user, showToast]);

  const deleteBudget = useCallback(async (id) => {
    await db.budgets.remove(user.id, id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Budget removed.', 'success');
  }, [user, showToast]);

  // ---------------- Savings goals ----------------
  const addSavingsGoal = useCallback(async (data) => {
    const row = await db.savingsGoals.create(user.id, data);
    setSavingsGoals((prev) => [...prev, row]);
    showToast('Savings goal created.', 'success');
    return row;
  }, [user, showToast]);

  const updateSavingsGoal = useCallback(async (id, patch) => {
    const row = await db.savingsGoals.update(user.id, id, patch);
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? row : g)));
    if (Number(patch.current_amount) >= Number(row.target_amount)) {
      await notify('Savings goal reached!', `You've hit your "${row.name}" goal. Nicely done.`, 'success');
    } else {
      showToast('Savings goal updated.', 'success');
    }
    return row;
  }, [user, showToast, notify]);

  const deleteSavingsGoal = useCallback(async (id) => {
    await db.savingsGoals.remove(user.id, id);
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Savings goal removed.', 'success');
  }, [user, showToast]);

  // ---------------- Notifications ----------------
  const markNotificationRead = useCallback(async (id) => {
    await db.notifications.markRead(user.id, id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [user]);

  const markAllNotificationsRead = useCallback(async () => {
    await db.notifications.markAllRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user]);

  // ---------------- Demo data ----------------
  const loadDemoData = useCallback(async () => {
    const demoTxns = buildDemoTransactions();
    const inserted = await db.transactions.bulkInsert(user.id, demoTxns);
    setTransactions((prev) => [...inserted, ...prev]);

    const demoBudgets = buildDemoBudgets();
    const budgetRows = [];
    for (const b of demoBudgets) {
      // eslint-disable-next-line no-await-in-loop
      const row = await db.budgets.upsert(user.id, b);
      budgetRows.push(row);
    }
    setBudgets((prev) => {
      const ids = new Set(budgetRows.map((r) => r.id));
      return [...prev.filter((b) => !ids.has(b.id)), ...budgetRows];
    });

    const demoGoal = { ...buildDemoSavingsGoal() };
    const goalRow = await db.savingsGoals.create(user.id, demoGoal);
    setSavingsGoals((prev) => [...prev, goalRow]);

    await notify('Demo data loaded', 'Sample transactions, budgets and a savings goal were added for your demonstration.', 'info');
    showToast('Demo data loaded successfully.', 'success');
  }, [user, notify, showToast]);

  const removeDemoData = useCallback(async () => {
    await db.transactions.removeWhere(user.id, (t) => t.is_demo);
    const goals = await db.savingsGoals.list(user.id);
    const demoGoals = goals.filter((g) => g.is_demo);
    // eslint-disable-next-line no-restricted-syntax
    for (const g of demoGoals) {
      // eslint-disable-next-line no-await-in-loop
      await db.savingsGoals.remove(user.id, g.id);
    }
    await loadAll();
    showToast('Demo data removed.', 'success');
  }, [user, loadAll, showToast]);

  const hasDemoData = useMemo(() => transactions.some((t) => t.is_demo) || savingsGoals.some((g) => g.is_demo), [transactions, savingsGoals]);

  const value = {
    loading,
    transactions,
    budgets,
    savingsGoals,
    notifications,
    hasDemoData,
    reload: loadAll,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    upsertBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    markNotificationRead,
    markAllNotificationsRead,
    loadDemoData,
    removeDemoData,
    notify,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
