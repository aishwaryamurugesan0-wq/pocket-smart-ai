// -----------------------------------------------------------------------
// localRecommendations.js
// -----------------------------------------------------------------------
// This is the "reliable local recommendation engine" the brief asks for:
// a deterministic, rule-based analyser that only ever looks at the real
// data passed into it (transactions, budgets, profile, savings goal). It
// never invents numbers and never claims to know something it wasn't
// given. This is what powers the app by default, with zero configuration
// and zero external API calls — see services/ai.js for how a real LLM
// can be layered on top of this when VITE_AI_API_KEY is set.
// -----------------------------------------------------------------------

import { totalIncome, totalExpenses, categoryTotals, monthlySeries, formatCurrency } from '../utils/calculations';

export function generateRecommendations({ transactions, budgets, profile }) {
  const currency = profile?.currency || 'INR';
  const notes = [];

  if (!transactions || transactions.length === 0) {
    return [
      {
        id: 'empty',
        tone: 'info',
        text: 'Add a few transactions and Pocket Smart AI will start analysing your spending automatically.',
      },
    ];
  }

  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);
  const remaining = income - expenses;
  const catTotals = categoryTotals(transactions, 'expense');

  // 1. Overall balance
  if (income > 0) {
    notes.push({
      id: 'balance',
      tone: remaining >= 0 ? 'positive' : 'warning',
      text: remaining >= 0
        ? `You have ${formatCurrency(remaining, currency)} remaining after your recorded expenses this period.`
        : `Your recorded expenses are ${formatCurrency(Math.abs(remaining), currency)} more than your recorded income this period.`,
    });
  }

  // 2. Budget-based warnings, using the same categories the Budget page uses
  (budgets || []).forEach((b) => {
    const spent = catTotals[b.category] || 0;
    const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    if (pct >= 100) {
      notes.push({
        id: `budget-${b.category}`,
        tone: 'warning',
        text: `Your ${b.category.toLowerCase()} spending has gone over the ${formatCurrency(b.amount, currency)} budget you set for this category.`,
      });
    } else if (pct >= 90) {
      notes.push({
        id: `budget-${b.category}`,
        tone: 'warning',
        text: `You're close to your ${b.category.toLowerCase()} budget — ${pct}% used so far.`,
      });
    } else if (pct >= 70) {
      notes.push({
        id: `budget-${b.category}`,
        tone: 'info',
        text: `Your ${b.category.toLowerCase()} spending is approaching its budget limit (${pct}% used).`,
      });
    }
  });

  // 3. Trend comparison: this month vs last month, per category
  const series = monthlySeries(transactions, 2);
  if (series.length === 2) {
    const [prev, curr] = series;
    if (prev.expenses > 0 && curr.expenses > prev.expenses * 1.15) {
      const diffPct = Math.round(((curr.expenses - prev.expenses) / prev.expenses) * 100);
      notes.push({
        id: 'trend-overall',
        tone: 'warning',
        text: `Your overall spending is up ${diffPct}% compared with last month.`,
      });
    }
  }

  // 4. Highest spending category
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0) {
    const [topCategory, topAmount] = sortedCats[0];
    notes.push({
      id: 'top-category',
      tone: 'info',
      text: `${topCategory} is your highest spending category so far, at ${formatCurrency(topAmount, currency)}.`,
    });
  }

  // 5. Savings suggestion
  if (income > 0) {
    const savingsRate = remaining / income;
    if (profile?.savings_goal && savingsRate < 0.1) {
      notes.push({
        id: 'savings-low',
        tone: 'warning',
        text: 'Based on your current spending pattern, you may want to increase your savings allocation to stay on track for your goal.',
      });
    } else if (savingsRate >= 0.3) {
      notes.push({
        id: 'savings-good',
        tone: 'positive',
        text: `You're saving a healthy share of your income this period — keep it up.`,
      });
    }
  }

  if (notes.length === 0) {
    notes.push({
      id: 'steady',
      tone: 'positive',
      text: 'Your spending looks steady with no unusual changes right now.',
    });
  }

  return notes;
}

// -----------------------------------------------------------------------
// Rule-based chat: answers only using the real data it's given. Handles
// the sample questions from the project brief plus reasonable variants.
// -----------------------------------------------------------------------
export function answerChatQuestion(question, { transactions, budgets, profile }) {
  const q = question.toLowerCase();
  const currency = profile?.currency || 'INR';
  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);
  const remaining = income - expenses;
  const catTotals = categoryTotals(transactions, 'expense');

  const matchCategory = () => {
    const cats = Object.keys(catTotals).concat((profile?.categories || []));
    return cats.find((c) => q.includes(c.toLowerCase()));
  };

  if (transactions.length === 0) {
    return "You don't have any transactions recorded yet, so I can't calculate that. Add a transaction and ask me again.";
  }

  if (/(afford|can i buy|can i spend)/.test(q)) {
    const priceMatch = q.match(/[\d,]+(\.\d+)?/);
    if (priceMatch) {
      const price = Number(priceMatch[0].replace(/,/g, ''));
      const after = remaining - price;
      if (after >= 0) {
        return `That would leave you with ${formatCurrency(after, currency)} after the purchase, based on your recorded balance of ${formatCurrency(remaining, currency)}. It looks affordable, but consider your upcoming bills too.`;
      }
      return `That purchase would put you ${formatCurrency(Math.abs(after), currency)} past your current recorded balance of ${formatCurrency(remaining, currency)}. It would significantly affect your budget.`;
    }
    return `Your current available balance is ${formatCurrency(remaining, currency)}. Tell me the price and I can work out whether it fits.`;
  }

  if (/how much (do i have left|is left|remaining|left)/.test(q) || /left over/.test(q)) {
    return `You have ${formatCurrency(remaining, currency)} remaining after your recorded income and expenses.`;
  }

  if (/(spend|spent).*(this month|so far|total)/.test(q) && !matchCategory()) {
    return `You've spent ${formatCurrency(expenses, currency)} in total from your recorded transactions.`;
  }

  const category = matchCategory();
  if (category && /(spend|spent)/.test(q)) {
    const amount = catTotals[category] || 0;
    const budget = (budgets || []).find((b) => b.category.toLowerCase() === category.toLowerCase());
    let extra = '';
    if (budget) {
      const pct = budget.amount > 0 ? Math.round((amount / budget.amount) * 100) : 0;
      extra = ` That's ${pct}% of your ${formatCurrency(budget.amount, currency)} ${category.toLowerCase()} budget.`;
    }
    return `You've spent ${formatCurrency(amount, currency)} on ${category.toLowerCase()} so far.${extra}`;
  }

  if (/(most|highest|biggest).*(categor|spend)/.test(q)) {
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return "You don't have any expense transactions yet.";
    const [cat, amt] = sorted[0];
    return `You're spending the most on ${cat}, with ${formatCurrency(amt, currency)} recorded so far.`;
  }

  if (/biggest expense/.test(q)) {
    const expenseTxns = transactions.filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 3);
    if (expenseTxns.length === 0) return "You don't have any expenses recorded yet.";
    return `Your biggest recorded expenses are: ${expenseTxns.map((t) => `${t.description || t.category} (${formatCurrency(t.amount, currency)})`).join(', ')}.`;
  }

  if (/how much should i save/.test(q)) {
    if (!profile?.savings_goal) {
      return "You haven't set a savings goal yet. Add one on the Savings page and I can suggest a monthly amount.";
    }
    return `Your monthly savings goal is ${formatCurrency(profile.savings_goal, currency)}. Based on your recorded income and expenses, you currently have ${formatCurrency(remaining, currency)} available.`;
  }

  if (/reduce (my )?spending|where can i (cut|reduce|save)/.test(q)) {
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return "You don't have enough expense data yet for me to suggest anything specific.";
    const [cat, amt] = sorted[0];
    return `${cat} is your largest expense category at ${formatCurrency(amt, currency)}. That's usually the best place to look first for savings.`;
  }

  if (/income/.test(q)) {
    return `Your total recorded income is ${formatCurrency(income, currency)}.`;
  }

  return "I can only answer using your recorded data. Try asking things like \"how much did I spend on food\", \"how much do I have left\", or \"can I afford a ₹2,000 purchase\".";
}
