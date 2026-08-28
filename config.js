// English with Mariami — Supabase configuration
// ერთი საერთო Auth სისტემა მთელი საიტისთვის.

const SUPABASE_URL =
  'https://vtdhvsfqhwesxtwmduew.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';


// Supabase JS-ის შემოწმება
if (!window.supabase) {
  throw new Error(
    'Supabase JS library failed to load.'
  );
}


// კონფიგურაციის შემოწმება
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase configuration is missing.'
  );
}


// ერთი საერთო Supabase Client
const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );


// მთელ საიტზე ხელმისაწვდომი Client
window.__ENGLISH_MARIAMI_SUPABASE_CLIENT =
  supabaseClient;

window.supabaseClient =
  supabaseClient;
