/* English with Mariami — public Supabase browser configuration.
   This uses the publishable key, never a service_role/secret key. */

window.SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';

window.SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

window.supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

window.__ENGLISH_MARIAMI_SUPABASE_CLIENT =
  window.supabaseClient;
