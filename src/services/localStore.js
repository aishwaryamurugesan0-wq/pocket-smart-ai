// -----------------------------------------------------------------------
// localStore.js
// -----------------------------------------------------------------------
// A small, dependency-free "database" built on window.localStorage.
//
// Every table below (users, profiles, transactions, budgets,
// savings_goals, notifications) mirrors the Supabase schema described in
// /supabase/schema.sql on purpose. That means the day you want to move
// from local storage to a real Supabase project, you swap the functions
// in this file for calls to `src/services/supabaseClient.js` and nothing
// else in the app has to change — every page talks to `db`, never to
// localStorage directly.
//
// This is what lets the project run and demo completely offline, with
// zero setup, while still being "upgrade-ready" for real deployment.
// -----------------------------------------------------------------------

const KEYS = {
  users: 'psa_users',
  profiles: 'psa_profiles',
  transactions: 'psa_transactions',
  budgets: 'psa_budgets',
  savingsGoals: 'psa_savings_goals',
  notifications: 'psa_notifications',
  session: 'psa_session',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error(`localStore: failed to read ${key}`, err);
    return [];
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`localStore: failed to write ${key}`, err);
    return false;
  }
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso() {
  return new Date().toISOString();
}

// A tiny artificial delay so loading states in the UI are visible and the
// app "feels" like it is really talking to a network database — this is
// exactly what a real Supabase call would look like from the UI's
// perspective (a promise that resolves after some latency).
function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------
// AUTH ("users" table + session)
// ---------------------------------------------------------------------

async function hashPassword(password) {
  // Not cryptographically meaningful (this is a client-only demo store),
  // but it means raw passwords are never kept in localStorage as-is.
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const auth = {
  async register({ fullName, email, password }) {
    await delay();
    const users = read(KEYS.users);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const password_hash = await hashPassword(password);
    const user = { id: uid('user'), email: email.toLowerCase(), password_hash, full_name: fullName, created_at: nowIso() };
    users.push(user);
    write(KEYS.users, users);

    const profiles = read(KEYS.profiles);
    const profile = {
      id: uid('profile'),
      user_id: user.id,
      full_name: fullName,
      currency: 'INR',
      monthly_income: 0,
      savings_goal: 0,
      budget_style: 'balanced',
      categories: ['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Entertainment', 'Health', 'Travel', 'Family', 'Other'],
      onboarded: false,
      theme: 'light',
      notification_preference: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    profiles.push(profile);
    write(KEYS.profiles, profiles);

    write(KEYS.session, { user_id: user.id });
    return { user: { id: user.id, email: user.email, full_name: user.full_name }, profile };
  },

  async login({ email, password }) {
    await delay();
    const users = read(KEYS.users);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('No account found with this email.');
    const password_hash = await hashPassword(password);
    if (password_hash !== user.password_hash) throw new Error('Incorrect password.');
    write(KEYS.session, { user_id: user.id });
    const profile = read(KEYS.profiles).find((p) => p.user_id === user.id);
    return { user: { id: user.id, email: user.email, full_name: user.full_name }, profile };
  },

  async resetPassword({ email, newPassword }) {
    await delay();
    const users = read(KEYS.users);
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) throw new Error('No account found with this email.');
    users[idx].password_hash = await hashPassword(newPassword);
    write(KEYS.users, users);
    return true;
  },

  logout() {
    localStorage.removeItem(KEYS.session);
  },

  getSession() {
    const session = read(KEYS.session);
    if (!session || Array.isArray(session) || !session.user_id) return null;
    const user = read(KEYS.users).find((u) => u.id === session.user_id);
    if (!user) return null;
    return { id: user.id, email: user.email, full_name: user.full_name };
  },
};

// ---------------------------------------------------------------------
// PROFILES
// ---------------------------------------------------------------------

export const profilesTable = {
  async get(userId) {
    await delay(150);
    return read(KEYS.profiles).find((p) => p.user_id === userId) || null;
  },
  async update(userId, patch) {
    await delay(200);
    const profiles = read(KEYS.profiles);
    const idx = profiles.findIndex((p) => p.user_id === userId);
    if (idx === -1) throw new Error('Profile not found.');
    profiles[idx] = { ...profiles[idx], ...patch, updated_at: nowIso() };
    write(KEYS.profiles, profiles);
    return profiles[idx];
  },
};

// ---------------------------------------------------------------------
// TRANSACTIONS
// ---------------------------------------------------------------------

export const transactionsTable = {
  async list(userId) {
    await delay(250);
    return read(KEYS.transactions)
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  },
  async create(userId, data) {
    await delay(300);
    const rows = read(KEYS.transactions);
    const row = { id: uid('txn'), user_id: userId, created_at: nowIso(), ...data };
    rows.push(row);
    write(KEYS.transactions, rows);
    return row;
  },
  async update(userId, id, patch) {
    await delay(250);
    const rows = read(KEYS.transactions);
    const idx = rows.findIndex((t) => t.id === id && t.user_id === userId);
    if (idx === -1) throw new Error('Transaction not found.');
    rows[idx] = { ...rows[idx], ...patch };
    write(KEYS.transactions, rows);
    return rows[idx];
  },
  async remove(userId, id) {
    await delay(200);
    const rows = read(KEYS.transactions).filter((t) => !(t.id === id && t.user_id === userId));
    write(KEYS.transactions, rows);
    return true;
  },
  async bulkInsert(userId, list) {
    await delay(300);
    const rows = read(KEYS.transactions);
    const inserted = list.map((data) => ({ id: uid('txn'), user_id: userId, created_at: nowIso(), ...data }));
    write(KEYS.transactions, [...rows, ...inserted]);
    return inserted;
  },
  async removeWhere(userId, predicate) {
    await delay(200);
    const rows = read(KEYS.transactions);
    const kept = rows.filter((t) => !(t.user_id === userId && predicate(t)));
    write(KEYS.transactions, kept);
    return true;
  },
};

// ---------------------------------------------------------------------
// BUDGETS
// ---------------------------------------------------------------------

export const budgetsTable = {
  async list(userId) {
    await delay(200);
    return read(KEYS.budgets).filter((b) => b.user_id === userId);
  },
  async upsert(userId, { category, amount, month, year }) {
    await delay(200);
    const rows = read(KEYS.budgets);
    const idx = rows.findIndex((b) => b.user_id === userId && b.category === category && b.month === month && b.year === year);
    if (idx === -1) {
      const row = { id: uid('bud'), user_id: userId, category, amount, month, year, created_at: nowIso() };
      rows.push(row);
      write(KEYS.budgets, rows);
      return row;
    }
    rows[idx] = { ...rows[idx], amount };
    write(KEYS.budgets, rows);
    return rows[idx];
  },
  async remove(userId, id) {
    await delay(150);
    const rows = read(KEYS.budgets).filter((b) => !(b.id === id && b.user_id === userId));
    write(KEYS.budgets, rows);
    return true;
  },
};

// ---------------------------------------------------------------------
// SAVINGS GOALS
// ---------------------------------------------------------------------

export const savingsGoalsTable = {
  async list(userId) {
    await delay(200);
    return read(KEYS.savingsGoals).filter((g) => g.user_id === userId);
  },
  async create(userId, data) {
    await delay(200);
    const rows = read(KEYS.savingsGoals);
    const row = { id: uid('goal'), user_id: userId, created_at: nowIso(), ...data };
    rows.push(row);
    write(KEYS.savingsGoals, rows);
    return row;
  },
  async update(userId, id, patch) {
    await delay(200);
    const rows = read(KEYS.savingsGoals);
    const idx = rows.findIndex((g) => g.id === id && g.user_id === userId);
    if (idx === -1) throw new Error('Savings goal not found.');
    rows[idx] = { ...rows[idx], ...patch };
    write(KEYS.savingsGoals, rows);
    return rows[idx];
  },
  async remove(userId, id) {
    await delay(150);
    const rows = read(KEYS.savingsGoals).filter((g) => !(g.id === id && g.user_id === userId));
    write(KEYS.savingsGoals, rows);
    return true;
  },
};

// ---------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------

export const notificationsTable = {
  async list(userId) {
    await delay(150);
    return read(KEYS.notifications)
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  async create(userId, { title, message, type = 'info' }) {
    const rows = read(KEYS.notifications);
    const row = { id: uid('notif'), user_id: userId, title, message, type, read: false, created_at: nowIso() };
    rows.push(row);
    write(KEYS.notifications, rows);
    return row;
  },
  async markRead(userId, id) {
    const rows = read(KEYS.notifications);
    const idx = rows.findIndex((n) => n.id === id && n.user_id === userId);
    if (idx !== -1) {
      rows[idx].read = true;
      write(KEYS.notifications, rows);
    }
    return true;
  },
  async markAllRead(userId) {
    const rows = read(KEYS.notifications).map((n) => (n.user_id === userId ? { ...n, read: true } : n));
    write(KEYS.notifications, rows);
    return true;
  },
  async clear(userId) {
    const rows = read(KEYS.notifications).filter((n) => n.user_id !== userId);
    write(KEYS.notifications, rows);
    return true;
  },
};

export const db = {
  auth,
  profiles: profilesTable,
  transactions: transactionsTable,
  budgets: budgetsTable,
  savingsGoals: savingsGoalsTable,
  notifications: notificationsTable,
};

export default db;
