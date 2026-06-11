// ─── SUPABASE SESSIONS ───
function setSyncing(state) {
  const dot = document.getElementById('sync-dot');
  dot.className = 'sync-dot' + (state === 'syncing' ? ' syncing' : state === 'error' ? ' error' : '');
}

async function loadSessions() {
  setSyncing('syncing');
  try {
    const { data, error } = await sbClient.from('sesiones').select('*').order('fecha', {ascending:true}).order('id', {ascending:true});
    if (error) throw error;
    sessions = data || [];
    // Import historical if DB is empty
    // Import histórico desactivado en producción.
    // Si necesitas importar datos antiguos, hazlo una sola vez desde Supabase SQL o desde un script controlado.
    setSyncing('ok');
    updateHeaderStats();
    renderSessionEntries();
  } catch(e) {
    setSyncing('error'); showToast('Error cargando datos'); console.error(e);
  }
}

async function importHistorical() {
  setSyncing('syncing');
  try {
    const rows = HISTORICAL.map(h => ({fecha:h.fecha, persona:h.persona, grupo:h.grupo, ejercicio:h.ejercicio, series:h.series, reps:h.reps, peso:h.peso}));
    const { error } = await sbClient.from('sesiones').insert(rows);
    if (error) throw error;
    showToast('✅ Datos históricos importados');
    await loadSessions();
  } catch(e) {
    setSyncing('error'); showToast('Error importando histórico'); console.error(e);
  }
}

async function insertEntry(entry) {
  const { data, error } = await sbClient.from('sesiones').insert([{
    fecha: entry.fecha, persona: entry.persona, grupo: entry.grupo,
    ejercicio: entry.ejercicio, series: entry.series, reps: entry.reps, peso: entry.peso,
    fase_menstrual: entry.fase_menstrual || null
  }]).select().single();
  if (error) throw error;
  return data;
}

async function deleteEntryDB(id) {
  const { error } = await sbClient.from('sesiones').delete().eq('id', id);
  if (error) throw error;
}

async function updateEntryDB(id, entry) {
  const { data, error } = await sbClient.from('sesiones').update({
    fecha: entry.fecha,
    persona: entry.persona,
    grupo: entry.grupo,
    ejercicio: entry.ejercicio,
    series: entry.series,
    reps: entry.reps,
    peso: entry.peso,
    fase_menstrual: entry.fase_menstrual || null
  }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}