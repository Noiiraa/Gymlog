// ─── CONFIG (localStorage) ───
function loadConfig() {
  try { const r = localStorage.getItem(CONFIG_KEY); config = r ? JSON.parse(r) : null; } catch {}
  if (!config) { config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); saveConfigLocal(); }
  chartPersona = config.personas[0] || "María";
  initRegistro();
  document.getElementById('reg-peso').addEventListener('input', updateSaveBtn);
}
function saveConfigLocal() { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }

// ─── TABS ───
function showTab(t) {
  document.querySelectorAll('.tab').forEach((b,i) => {
    b.classList.toggle('active', ['registro','historial','progreso','ajustes'][i] === t);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+t).classList.add('active');
  if (t==='registro') renderSessionEntries();
  if (t==='historial') renderHistorial();
  if (t==='progreso') renderProgreso();
  if (t==='ajustes') renderAjustes();
}

// ─── BOOT ───
initSupabase();