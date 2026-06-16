
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

    <div style="height:12px"></div>

    <div class="history-tools-title">Filtrar por máquina</div>
    <div style="position:relative">
      <input
        class="input"
        id="historial-ej-input"
        placeholder="Busca o elige un ejercicio..."
        value="${esc(historialEjercicioQuery)}"
        autocomplete="off"
        style="padding-right:36px"
        onfocus="openHistorialEjDropdown()"
        onblur="setTimeout(closeHistorialEjDropdown, 150)"
        oninput="onHistorialEjInput(this.value)"
      />
      <span style="position:absolute;right:14px;top:14px;color:rgba(255,233,237,.45);font-size:12px;pointer-events:none">▾</span>
      <div id="historial-ej-options"
           style="display:none;position:absolute;top:100%;left:0;right:0;background:#27153D;border:1px solid rgba(255,233,237,.18);border-top:none;border-radius:0 0 13px 13px;z-index:100;max-height:230px;overflow-y:auto;box-shadow:0 8px 24px rgba(12,5,24,.32)"></div>
    </div>
  </div>`;

  const query = normalizeSearch(historialEjercicioQuery);

  const filtered = sessions
    .filter(s => !historialPersona || s.persona === historialPersona)
    .filter(s => {
      if (!query) return true;

      const ejercicio = normalizeSearch(s.ejercicio || '');
      const grupo = normalizeSearch(s.grupo || '');

      return ejercicio.includes(query) || grupo.includes(query);
    })
    .sort((a, b) => {
      const byFecha = String(b.fecha || '').localeCompare(String(a.fecha || ''));
      if (byFecha !== 0) return byFecha;
      return (b.id || 0) - (a.id || 0);
    });

  if (!filtered.length) {
    el.innerHTML = filters + '<div class="no-data">Sin entradas para esta búsqueda</div>';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORIAL_PAGE_SIZE));
  historialPage = Math.min(Math.max(historialPage, 1), totalPages);
  const start = (historialPage - 1) * HISTORIAL_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + HISTORIAL_PAGE_SIZE);

  const activeFilters = [
    historialPersona ? historialPersona : 'Todas las personas',
    historialEjercicioQuery ? `Máquina: "${historialEjercicioQuery}"` : ''
  ].filter(Boolean).join(' · ');

  const summary = `<div class="history-summary">
    <span>${esc(activeFilters)} · ${esc(filtered.length)} entradas</span>
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

function setHistorialEjercicioQuery(value) {
  historialEjercicioQuery = value;
  historialPage = 1;
  renderHistorial();
}

function clearHistorialEjercicioQuery() {
  historialEjercicioQuery = "";
  historialPage = 1;
  renderHistorial();
}

function _allHistorialEjercicios() {
  const fromConfig = Object.values(config.ejercicios || {}).flat();
  const fromSessions = sessions.map(s => s.ejercicio).filter(Boolean);
  return sortAlpha([...new Set([...fromConfig, ...fromSessions])]);
}

function openHistorialEjDropdown() {
  const list = document.getElementById('historial-ej-options');
  const input = document.getElementById('historial-ej-input');
  if (!list) return;
  _renderHistorialEjOptions(input?.value || '');
  list.style.display = 'block';
  if (input) {
    input.style.borderBottomLeftRadius = '0';
    input.style.borderBottomRightRadius = '0';
    input.style.borderBottomColor = 'transparent';
  }
}

function closeHistorialEjDropdown() {
  const list = document.getElementById('historial-ej-options');
  const input = document.getElementById('historial-ej-input');
  if (list) list.style.display = 'none';
  if (input) {
    input.style.borderBottomLeftRadius = '';
    input.style.borderBottomRightRadius = '';
    input.style.borderBottomColor = '';
  }
}

function onHistorialEjInput(val) {
  const list = document.getElementById('historial-ej-options');
  _renderHistorialEjOptions(val);
  if (list) list.style.display = 'block';
}

function _renderHistorialEjOptions(query) {
  const list = document.getElementById('historial-ej-options');
  if (!list) return;

  const q = normalizeSearch(query);
  const all = _allHistorialEjercicios();
  const ejs = all.filter(e => !q || normalizeSearch(e).includes(q));

  const clearRow = historialEjercicioQuery
    ? `<div
        onmousedown="event.preventDefault()"
        onclick="selectHistorialEjOption('')"
        style="padding:10px 13px;font-size:13px;cursor:pointer;color:rgba(255,233,237,.55);border-bottom:1px solid rgba(255,233,237,.07)"
        onmouseover="this.style.background='rgba(255,233,237,.08)'"
        onmouseout="this.style.background='transparent'"
      >× Quitar filtro</div>`
    : '';

  if (!ejs.length) {
    list.innerHTML = clearRow + `<div style="padding:12px 13px;font-size:13px;color:rgba(255,233,237,.55)">${query ? 'Sin coincidencias' : 'Sin ejercicios'}</div>`;
    return;
  }

  list.innerHTML = clearRow + ejs.map(e => {
    const sel = e === historialEjercicioQuery;
    return `<div
      data-value="${esc(e)}"
      onmousedown="event.preventDefault()"
      onclick="selectHistorialEjOption(this.dataset.value)"
      style="padding:12px 13px;font-size:14px;cursor:pointer;color:${sel?'#F6B6B7':'#FFE9ED'};font-weight:${sel?'700':'400'};background:${sel?'rgba(255,233,237,.10)':'transparent'};border-bottom:1px solid rgba(255,233,237,.07)"
      onmouseover="this.style.background='rgba(255,233,237,.10)'"
      onmouseout="this.style.background='${sel?'rgba(255,233,237,.10)':'transparent'}'"
    >${esc(e)}</div>`;
  }).join('');
}

function selectHistorialEjOption(val) {
  historialEjercicioQuery = val;
  historialPage = 1;
  closeHistorialEjDropdown();
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

function renderEditEjercicioOptions(query = null) {
  const grupo = document.getElementById('edit-grupo')?.value || '';
  const input = document.getElementById('edit-ejercicio');
  const list = document.getElementById('edit-ejercicios-list');

  if (!list) return;

  const search = query === null ? '' : query;

  const ejs = sortAlpha(config.ejercicios?.[grupo] || [])
    .filter(e => startsWithSearch(e, search));

  list.innerHTML = ejs
    .map(e => `<option value="${esc(e)}"></option>`)
    .join('');
}

function onEditGrupoChange() {
  const input = document.getElementById('edit-ejercicio');
  if (input) input.value = '';
  renderEditEjercicioOptions('');
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
  renderEditEjercicioOptions('');

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