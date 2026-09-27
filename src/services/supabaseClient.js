// -----------------------------------------------------------------------
// supabaseClient.js
// -----------------------------------------------------------------------
// The project runs entirely on src/services/localStore.js out of the box
// (no setup required). This file is the upgrade path to a real Supabase
// backend for a production deployment.
//
// To switch on real persistence + real auth:
//   1. Create a Supabase project.
//   2. Run supabase/schema.sql (in the project root) in the SQL editor.
//   3. Put your project URL + anon key into .env (see .env.example).
//   4. In src/context/DataContext.jsx and src/context/AuthContext.jsx,
//      swap the `db` import from `services/localStore` to a Supabase-backed
//      equivalent using the `supabase` client exported below. The table
//      names and columns already match 1:1, so each call is a straight
//      swap (e.g. `supabase.from('transactions').select('*')...`).
//
// Until you do that, `supabase` below is `null` and isSupabaseConfigured
// is `false` — the rest of the app checks that flag and never crashes if
// the environment variables are missing.
// -----------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

export default supabase;
