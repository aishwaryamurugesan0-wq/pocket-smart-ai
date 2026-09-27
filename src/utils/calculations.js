// Pure calculation helpers. Every number shown in the UI is derived from
// the user's actual transactions/budgets at render time — nothing here is
// hardcoded, per the project spec.

export function sumByType(transactions, type) {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

export function totalIncome(transactions) {
  return sumByType(transactions, 'income');
}

export function totalExpenses(transactions) {
  return sumByType(transactions, 'expense');
}

export function balance(transactions) {
  return totalIncome(transactions) - totalExpenses(transactions);
}

export function categoryTotals(transactions, type = 'expense') {
  const totals = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount || 0);
    });
  return totals;
}

export function currentMonthKey(date = new Date()) {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

export function isSameMonth(dateStr, month, year) {
  const d = new Date(dateStr);
  return d.getMonth() + 1 === month && d.getFullYear() === year;
}

export function transactionsForMonth(transactions, month, year) {
  return transactions.filter((t) => isSameMonth(t.transaction_date, month, year));
}

export function budgetProgress(budget, spent) {
  const amount = Number(budget) || 0;
  const used = Number(spent) || 0;
  const percentageUsed = amount > 0 ? Math.round((used / amount) * 100) : 0;
  let status = 'normal';
  if (percentageUsed > 100) status = 'exceeded';
  else if (percentageUsed > 90) status = 'near';
  else if (percentageUsed >= 70) status = 'approaching';
  return {
    amount,
    spent: used,
    remaining: amount - used,
    percentageUsed,
    status,
  };
}

export const BUDGET_STATUS_LABEL = {
  normal: 'On track',
  approaching: 'Approaching limit',
  near: 'Near limit',
  exceeded: 'Over budget',
};

export const BUDGET_STATUS_COLOR = {
  normal: 'moss',
  approaching: 'gold',
  near: 'clay',
  exceeded: 'berry',
};

export function monthlySeries(transactions, monthsBack = 6) {
  const series = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const monthTxns = transactionsForMonth(transactions, month, year);
    series.push({
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      month,
      year,
      income: totalIncome(monthTxns),
      expenses: totalExpenses(monthTxns),
    });
  }
  return series;
}

export function formatCurrency(amount, currency = 'INR') {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || currency + ' ';
  const value = Number(amount) || 0;
  const formatted = Math.abs(value).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `${value < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function percentage(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function monthsBetween(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(months, 1);
}
