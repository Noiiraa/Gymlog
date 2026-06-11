
// ─── HISTORIAL ───
function renderHistorial() {
  const el = document.getElementById('historial-list');
  const personasHistorial = [...new Set([
    ...config.personas,
    ...sessions.map(s => s.persona).filter(Boolean)
  ])].sort((a, b) => a.localeCompare(b));

  const filters = `<div class="history-tools">
    <div class="history-tools-title">Filtrar por persona</div>
    <div class="history-filters">
      <button class="history-filter-btn ${historialPersona === '' ? 'active' : ''}" onclick='setHistorialPersona("")'>Todas</button>
      ${personasHistorial.map(p => `<button class="history-filter-btn ${historialPersona === p ? 'active' : ''}" onclick='setHistorialPersona(${JSON.stringify(p)})'>${esc(p)}</button>`).join('')}
    </div>
  </div>`;

  const filtered = sessions
    .filter(s => !historialPersona || s.persona === historialPersona)
    .sort((a, b) => {
      const byFecha = String(b.fecha || '').localeCompare(String(a.fecha || ''));
      if (byFecha !== 0) return byFecha;
      return (b.id || 0) - (a.id || 0);
    });

  if (!filtered.length) {
    el.innerHTML = filters + '<div class="no-data">Sin entradas para este filtro</div>';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORIAL_PAGE_SIZE));
  historialPage = Math.min(Math.max(historialPage, 1), totalPages);
  const start = (historialPage - 1) * HISTORIAL_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + HISTORIAL_PAGE_SIZE);

  const summary = `<div class="history-summary">
    <span>${historialPersona ? esc(historialPersona) : 'Todas las personas'} · ${esc(filtered.length)} entradas</span>
    <span>${esc(start + 1)}-${esc(start + pageItems.length)} de ${esc(filtered.length)}</span>
  </div>`;

  const cards = pageItems.map(s => {
    const pc=personaColor(s.persona);
    return `<div class="entry-card" style="border-left-color:${groupColor(s.grupo)}">
      <div>
        <div class="entry-title">${esc(s.ejercicio || '—')}</div>
        <div class="entry-sub">${esc(formatDateDisplay(s.fecha))} · <span style="color:${pc}">${esc(s.persona)}</span> · ${esc(s.series)}×${esc(s.reps)} · ${esc(s.peso)}kg</div>
        ${s.fase_menstrual ? `<div class="fase-badge">🌙 ${esc(s.fase_menstrual)}</div>` : ''}
      </div>
      <div class="entry-actions">
        <button class="edit-btn" onclick="openEditEntry(${s.id})" title="Editar">✎</button>
        <button class="del-btn" onclick="deleteEntry(${s.id})" title="Borrar">×</button>
      </div>
    </div>`;
  }).join('');

  const pager = totalPages > 1 ? `<div class="history-pager">
    <button class="pager-btn" onclick="setHistorialPage(${historialPage - 1})" ${historialPage <= 1 ? 'disabled' : ''}>‹</button>
    <div class="pager-text">Página ${esc(historialPage)} / ${esc(totalPages)}</div>
    <button class="pager-btn" onclick="setHistorialPage(${historialPage + 1})" ${historialPage >= totalPages ? 'disabled' : ''}>›</button>
  </div>` : '';

  el.innerHTML = filters + summary + cards + pager;
}

function setHistorialPersona(persona) {
  historialPersona = persona;
  historialPage = 1;
  renderHistorial();
}

function setHistorialPage(page) {
  historialPage = page;
  renderHistorial();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fillSelectOptions(selectId, values, selectedValue) {
  const el = document.getElementById(selectId);
  const clean = [...new Set(values.filter(Boolean))];
  el.innerHTML = clean.map(v => `<option value="${esc(v)}"${v === selectedValue ? ' selected' : ''}>${esc(v)}</option>`).join('');
  if (selectedValue && !clean.includes(selectedValue)) {
    el.innerHTML = `<option value="${esc(selectedValue)}" selected>${esc(selectedValue)}</option>` + el.innerHTML;
  }
}

function renderEditEjercicioOptions() {
  const grupo = document.getElementById('edit-grupo').value;
  const ejs = config.ejercicios?.[grupo] || [];
  document.getElementById('edit-ejercicios-list').innerHTML = ejs
    .map(e => `<option value="${esc(e)}"></option>`)
    .join('');
}

function openEditEntry(id) {
  const entry = sessions.find(s => Number(s.id) === Number(id));
  if (!entry) {
    showToast('No encuentro ese registro');
    return;
  }

  document.getElementById('edit-id').value = entry.id;
  document.getElementById('edit-fecha').value = normalizeDateValue(entry.fecha);

  fillSelectOptions('edit-persona', [
    ...config.personas,
    ...sessions.map(s => s.persona)
  ], entry.persona);

  fillSelectOptions('edit-grupo', [
    ...Object.keys(config.ejercicios || {}),
    ...sessions.map(s => s.grupo)
  ], entry.grupo);

  document.getElementById('edit-ejercicio').value = entry.ejercicio || '';
  document.getElementById('edit-series').value = entry.series || '';
  document.getElementById('edit-reps').value = entry.reps || '';
  document.getElementById('edit-peso').value = entry.peso ?? '';
  document.getElementById('edit-fase').value = entry.fase_menstrual || '';
  renderEditEjercicioOptions();

  document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveEditEntry() {
  const id = Number(document.getElementById('edit-id').value);
  const entry = {
    fecha: document.getElementById('edit-fecha').value,
    persona: document.getElementById('edit-persona').value,
    grupo: document.getElementById('edit-grupo').value || 'Otros',
    ejercicio: document.getElementById('edit-ejercicio').value.trim(),
    series: parseInt(document.getElementById('edit-series').value, 10),
    reps: parseInt(document.getElementById('edit-reps').value, 10),
    peso: parseFloat(document.getElementById('edit-peso').value),
    fase_menstrual: document.getElementById('edit-fase').value || null
  };

  if (!id || !entry.fecha || !entry.persona || !entry.grupo || !entry.ejercicio || !entry.series || !entry.reps || Number.isNaN(entry.peso)) {
    alert('Revisa los campos: fecha, persona, grupo, ejercicio, series, reps y peso son obligatorios.');
    return;
  }

  try {
    const saved = await updateEntryDB(id, entry);
    sessions = sessions.map(s => Number(s.id) === id ? saved : s);
    sessionEntries = sessionEntries.map(s => Number(s.id) === id ? saved : s);

    updateHeaderStats();
    renderHistorial();
    renderSessionEntries();
    if (document.getElementById('page-progreso').classList.contains('active')) renderProgreso();

    closeEditModal();
    showToast('Registro actualizado');
  } catch (e) {
    showToast('Error actualizando registro');
    console.error(e);
  }
}

async function deleteEntry(id) {
  if (!confirm('¿Borrar esta entrada?')) return;
  try {
    await deleteEntryDB(id);
    sessions = sessions.filter(s=>s.id!==id);
    sessionEntries = sessionEntries.filter(s=>Number(s.id)!==Number(id));
    updateHeaderStats(); renderHistorial(); renderSessionEntries();
  } catch(e) { showToast('Error borrando'); }
}