import React, { useMemo, useState } from 'react';
import { Search, Plus, ArrowUpDown, Inbox } from 'lucide-react';
import TransactionForm, { CATEGORIES } from '../components/TransactionForm';
import TransactionRow from '../components/TransactionRow';
import { Modal, Button, TextInput, Select, ConfirmDialog, EmptyState, Spinner } from '../components/ui';
import { useData } from '../context/DataContext';

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Amount: high to low' },
  { value: 'amount_asc', label: 'Amount: low to high' },
];

export default function Transactions() {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sort, setSort] = useState('date_desc');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = transactions.filter((t) => {
      if (search && !(`${t.description} ${t.category}`.toLowerCase().includes(search.toLowerCase()))) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (dateFilter !== 'all') {
        const d = new Date(t.transaction_date);
        if (dateFilter === '7d' && (now - d) / 86400000 > 7) return false;
        if (dateFilter === '30d' && (now - d) / 86400000 > 30) return false;
        if (dateFilter === 'month' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'date_desc') return new Date(b.transaction_date) - new Date(a.transaction_date);
      if (sort === 'date_asc') return new Date(a.transaction_date) - new Date(b.transaction_date);
      if (sort === 'amount_desc') return b.amount - a.amount;
      if (sort === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
    return list;
  }, [transactions, search, category, typeFilter, dateFilter, sort]);

  const handleAdd = async (data) => {
    await addTransaction(data);
    setShowForm(false);
  };

  const handleEditSubmit = async (data) => {
    await updateTransaction(editing.id, data);
    setEditing(null);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteTransaction(deleting.id);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading transactions…" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-xl">Transactions</h2>
          <p className="text-sm text-ink-400 dark:text-ink-200">Search, filter and manage everything you've recorded.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> Add transaction</Button>
      </div>

      <div className="card p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <TextInput className="pl-9" placeholder="Search description or category" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Income & expense</option>
          <option value="income">Income only</option>
          <option value="expense">Expense only</option>
        </Select>
        <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="month">This month</option>
        </Select>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-ink-400 dark:text-ink-200">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-1.5 text-xs text-ink-400 dark:text-ink-200">
          <ArrowUpDown size={13} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent outline-none text-ink-500 dark:text-paper">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card px-4">
        {filtered.length === 0 ? (
          <EmptyState icon={Inbox} title="No matching transactions" message="Try adjusting your search or filters, or add a new transaction." />
        ) : (
          filtered.map((t) => (
            <TransactionRow key={t.id} txn={t} onEdit={setEditing} onDelete={setDeleting} />
          ))
        )}
      </div>

      {showForm && (
        <Modal title="Add transaction" onClose={() => setShowForm(false)}>
          <TransactionForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit transaction" onClose={() => setEditing(null)}>
          <TransactionForm initial={editing} onSubmit={handleEditSubmit} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`This will permanently remove "${deleting.description || deleting.category}" and update your balance, budgets and charts.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={busy}
        />
      )}
    </div>
  );
}
