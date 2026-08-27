<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function requireLogin() {
  const { data: { session } } =
    await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  return session;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

async function getMyProfile() {
  const { data: { user } } =
    await supabaseClient.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
</script>
