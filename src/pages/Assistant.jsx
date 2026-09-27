import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, ShoppingBag, MessageCircle } from 'lucide-react';
import { Button, Field, TextInput, Select, Badge } from '../components/ui';
import RecommendationCard from '../components/RecommendationCard';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { askAssistant } from '../services/ai';
import { balance, formatCurrency } from '../utils/calculations';
import { validatePurchase, hasErrors } from '../utils/validation';

const SUGGESTED_QUESTIONS = [
  'How much did I spend this month?',
  'What category am I spending the most on?',
  'How much money do I have left?',
  'Where can I reduce my spending?',
  'Show my biggest expenses.',
];

function ChatTab() {
  const { transactions, budgets } = useData();
  const { profile } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi, I'm Pocket Smart AI. Ask me anything about your recorded income, spending or budgets." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setSending(true);
    try {
      const answer = await askAssistant(question, { transactions, budgets, profile });
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: "Sorry, I couldn't work that out. Please try rephrasing." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card flex flex-col h-[560px] max-h-[70vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
              m.role === 'user' ? 'bg-moss-500 text-white rounded-br-sm' : 'bg-ink-50 dark:bg-ink-700 text-ink-700 dark:text-paper rounded-bl-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-ink-50 dark:bg-ink-700 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button key={q} onClick={() => send(q)} className="text-xs px-2.5 py-1 rounded-full border border-ink-100 dark:border-ink-600 text-ink-500 dark:text-paper hover:bg-ink-50 dark:hover:bg-ink-700">
            {q}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-ink-50 dark:border-ink-700 p-3 flex gap-2">
        <TextInput placeholder="Ask about your spending…" value={input} onChange={(e) => setInput(e.target.value)} />
        <Button type="submit" disabled={!input.trim()} loading={sending}><Send size={16} /></Button>
      </form>
    </div>
  );
}

function PurchaseTab() {
  const { transactions } = useData();
  const { profile } = useAuth();
  const currentBalance = balance(transactions);
  const [form, setForm] = useState({ itemName: '', price: '', need: 'need', priority: 'medium' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const evaluate = (e) => {
    e.preventDefault();
    const validation = validatePurchase({ itemName: form.itemName, price: form.price });
    setErrors(validation);
    if (hasErrors(validation)) return;

    const price = Number(form.price);
    const after = currentBalance - price;
    const pctOfBalance = currentBalance > 0 ? (price / currentBalance) * 100 : 100;

    let verdict = 'Within budget';
    let tone = 'moss';
    if (after < 0) {
      verdict = 'Would significantly affect your budget';
      tone = 'berry';
    } else if (pctOfBalance > 40 || (form.need === 'want' && pctOfBalance > 20)) {
      verdict = 'Consider carefully';
      tone = 'gold';
    }

    let explanation;
    if (verdict === 'Within budget') {
      explanation = `This purchase uses about ${Math.round(pctOfBalance)}% of your current available balance and still leaves you ${formatCurrency(after, profile?.currency)}.`;
    } else if (verdict === 'Consider carefully') {
      explanation = `This is a sizeable share (${Math.round(pctOfBalance)}%) of your available balance${form.need === 'want' ? ', and you marked it as a want rather than a need' : ''}. It's worth weighing against your other plans this month.`;
    } else {
      explanation = `This would take your balance below zero by ${formatCurrency(Math.abs(after), profile?.currency)}, based on your recorded income and expenses.`;
    }

    setResult({
      price,
      after,
      verdict,
      tone,
      explanation,
      savingsImpact: profile?.savings_goal
        ? after < profile.savings_goal
          ? `This may leave you short of your ${formatCurrency(profile.savings_goal, profile?.currency)} monthly savings goal.`
          : `Your savings goal of ${formatCurrency(profile.savings_goal, profile?.currency)} still looks achievable this month.`
        : null,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <form onSubmit={evaluate} className="card p-5 space-y-4">
        <p className="font-display font-semibold text-sm mb-1">Should I buy this?</p>
        <Field label="Item name" error={errors.itemName}>
          <TextInput placeholder="e.g. Wireless earbuds" value={form.itemName} error={errors.itemName} onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))} />
        </Field>
        <Field label="Price (₹)" error={errors.price}>
          <TextInput type="number" min="0" placeholder="2000" value={form.price} error={errors.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Need or want">
            <Select value={form.need} onChange={(e) => setForm((f) => ({ ...f, need: e.target.value }))}>
              <option value="need">Need</option>
              <option value="want">Want</option>
            </Select>
          </Field>
          <Field label="Priority (optional)">
            <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
        </div>
        <p className="text-xs text-ink-400 dark:text-ink-200">Available balance used for this check: {formatCurrency(currentBalance, profile?.currency)}</p>
        <Button type="submit" className="w-full"><ShoppingBag size={16} /> Evaluate purchase</Button>
      </form>

      <div className="card p-5">
        <p className="font-display font-semibold text-sm mb-4">Result</p>
        {!result ? (
          <p className="text-sm text-ink-400 dark:text-ink-200">Fill in the form and evaluate a purchase to see a recommendation here.</p>
        ) : (
          <div className="space-y-3">
            <Badge tone={result.tone}>{result.verdict}</Badge>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink-400 dark:text-ink-200">Current balance</p>
                <p className="font-display font-semibold tabular">{formatCurrency(currentBalance, profile?.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 dark:text-ink-200">Purchase price</p>
                <p className="font-display font-semibold tabular">{formatCurrency(result.price, profile?.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 dark:text-ink-200">Balance after</p>
                <p className="font-display font-semibold tabular">{formatCurrency(result.after, profile?.currency)}</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 dark:text-ink-100 leading-snug">{result.explanation}</p>
            {result.savingsImpact && <p className="text-sm text-ink-500 dark:text-ink-200 leading-snug border-t border-ink-50 dark:border-ink-700 pt-3">{result.savingsImpact}</p>}
            <p className="text-[11px] text-ink-300 pt-2">This is a guide based on your recorded data, not a financial guarantee.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Assistant() {
  const [tab, setTab] = useState('chat');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-xl flex items-center gap-2"><Sparkles size={20} className="text-moss-500" /> AI Assistant</h2>
        <p className="text-sm text-ink-400 dark:text-ink-200">Ask questions, get recommendations, or check a purchase before you make it.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('chat')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'chat' ? 'bg-moss-500 text-white' : 'bg-white dark:bg-ink-800 text-ink-500 dark:text-paper border border-ink-100 dark:border-ink-600'}`}>
          <MessageCircle size={15} /> Chat
        </button>
        <button onClick={() => setTab('purchase')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'purchase' ? 'bg-moss-500 text-white' : 'bg-white dark:bg-ink-800 text-ink-500 dark:text-paper border border-ink-100 dark:border-ink-600'}`}>
          <ShoppingBag size={15} /> Smart Purchase Check
        </button>
      </div>

      {tab === 'chat' ? (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2"><ChatTab /></div>
          <RecommendationCard />
        </div>
      ) : (
        <PurchaseTab />
      )}
    </div>
  );
}
