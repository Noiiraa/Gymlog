// ─── CREDENTIALS ───
async function initSupabase() {
  try {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const loginScreen = document.getElementById('login-screen');
    const app = document.getElementById('app');

    if (loginScreen) loginScreen.style.display = 'none';
    if (app) app.style.display = 'none';

    const { data, error } = await sbClient.auth.getSession();
    if (error) throw error;

    if (data.session) {
      await startApp();
    } else {
      loginScreen.style.display = 'flex';
    }

    sbClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        startApp();
      } else {
        sessions = [];
        sessionEntries = [];
        app.style.display = 'none';
        loginScreen.style.display = 'flex';
      }
    });

  } catch(e) {
    alert('Error inicializando Supabase: ' + e.message);
    console.error(e);
  }
}