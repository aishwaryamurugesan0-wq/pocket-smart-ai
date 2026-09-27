// Realistic sample data for project demonstrations (spec section 27).
// Every row is tagged is_demo: true so it can be identified and removed
// as a whole later.

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function buildDemoTransactions() {
  return [
    { type: 'income', amount: 30000, category: 'Other', description: 'Monthly salary', payment_method: 'Bank Transfer', transaction_date: daysAgo(27), is_demo: true },
    { type: 'expense', amount: 1200, category: 'Food', description: 'Groceries', payment_method: 'UPI', transaction_date: daysAgo(25), is_demo: true },
    { type: 'expense', amount: 800, category: 'Food', description: 'Dinner out', payment_method: 'Credit Card', transaction_date: daysAgo(20), is_demo: true },
    { type: 'expense', amount: 1500, category: 'Food', description: 'Weekly groceries', payment_method: 'UPI', transaction_date: daysAgo(9), is_demo: true },
    { type: 'expense', amount: 1200, category: 'Transport', description: 'Fuel', payment_method: 'Debit Card', transaction_date: daysAgo(22), is_demo: true },
    { type: 'expense', amount: 800, category: 'Transport', description: 'Cab rides', payment_method: 'UPI', transaction_date: daysAgo(11), is_demo: true },
    { type: 'expense', amount: 4000, category: 'Education', description: 'Course fee', payment_method: 'Bank Transfer', transaction_date: daysAgo(18), is_demo: true },
    { type: 'expense', amount: 1500, category: 'Shopping', description: 'New shoes', payment_method: 'Credit Card', transaction_date: daysAgo(15), is_demo: true },
    { type: 'expense', amount: 1000, category: 'Shopping', description: 'Clothes', payment_method: 'UPI', transaction_date: daysAgo(6), is_demo: true },
    { type: 'expense', amount: 1800, category: 'Bills', description: 'Electricity + Wi-Fi', payment_method: 'Bank Transfer', transaction_date: daysAgo(19), is_demo: true },
    { type: 'expense', amount: 1200, category: 'Bills', description: 'Mobile recharge + subscriptions', payment_method: 'UPI', transaction_date: daysAgo(4), is_demo: true },
    { type: 'expense', amount: 900, category: 'Entertainment', description: 'Movies & streaming', payment_method: 'Credit Card', transaction_date: daysAgo(13), is_demo: true },
    { type: 'expense', amount: 600, category: 'Entertainment', description: 'Weekend outing', payment_method: 'Cash', transaction_date: daysAgo(2), is_demo: true },
    { type: 'expense', amount: 500, category: 'Health', description: 'Pharmacy', payment_method: 'Cash', transaction_date: daysAgo(8), is_demo: true },
  ];
}

export function buildDemoBudgets() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return [
    { category: 'Food', amount: 5000, month, year },
    { category: 'Transport', amount: 2000, month, year },
    { category: 'Shopping', amount: 3000, month, year },
    { category: 'Education', amount: 4000, month, year },
    { category: 'Bills', amount: 3000, month, year },
    { category: 'Entertainment', amount: 1500, month, year },
  ];
}

export function buildDemoSavingsGoal() {
  const target = new Date();
  target.setMonth(target.getMonth() + 6);
  return {
    name: 'Emergency Fund',
    target_amount: 60000,
    current_amount: 12000,
    target_date: target.toISOString().slice(0, 10),
    is_demo: true,
  };
}
