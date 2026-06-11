
// ─── AUTH ───
async function startApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  loadConfig();
  await loadSessions();

  const { data } = await sbClient.auth.getUser();
  const email = data?.user?.email || 'usuario';

  const conn = document.getElementById('conn-info');
  if (conn) conn.textContent = `Sesión iniciada como: ${email}`;
}

async function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Introduce email y contraseña');
    return;
  }

  try {
    const { error } = await sbClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    document.getElementById('login-password').value = '';
    showToast('Sesión iniciada');
  } catch (e) {
    alert('No se pudo iniciar sesión: ' + e.message);
    console.error(e);
  }
}

async function logout() {
  try {
    const { error } = await sbClient.auth.signOut();
    if (error) throw error;

    sessions = [];
    sessionEntries = [];
    showToast('Sesión cerrada');
  } catch (e) {
    alert('Error cerrando sesión: ' + e.message);
    console.error(e);
  }
}