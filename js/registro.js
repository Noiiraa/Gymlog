
// ─── REGISTRO ───
function initRegistro() {
  const fechaEl = document.getElementById('reg-fecha');
  fechaEl.value = fechaEl.value || new Date().toISOString().split('T')[0];
  fechaEl.onchange = renderSessionEntries;
  renderPersonaBtns();
  renderGrupoBtns();
  renderSessionEntries();
}

function renderPersonaBtns() {
  document.getElementById('persona-btns').innerHTML = config.personas.map(p => {
    const c = personaColor(p), sel = selectedPersona===p;
    return `<button class="persona-btn" onclick='selectPersona(${JSON.stringify(p)})'
      style="border-color:${sel?c:'rgba(255,233,237,.18)'};background:${sel?c+'22':'rgba(39,21,61,.58)'};color:${sel?c:'rgba(255,233,237,.72)'}">${esc(p)}</button>`;
  }).join('');
}

function selectPersona(p) { selectedPersona=p; renderPersonaBtns(); updateSaveBtn(); }

function renderGrupoBtns() {
  document.getElementById('grupo-btns').innerHTML = sortAlpha(Object.keys(config.ejercicios)).map(g => {
    const c=groupColor(g), sel=selectedGrupo===g;
    return `<button class="btn-pill" onclick='selectGrupo(${JSON.stringify(g)})'
      style="border-color:${sel?c:'rgba(255,233,237,.18)'};background:${sel?c+'22':'rgba(39,21,61,.58)'};color:${sel?c:'rgba(255,233,237,.72)'}">${esc(g)}</button>`;
  }).join('');
}

function selectGrupo(g) {
  selectedGrupo=g; selectedEjercicio="";
  renderGrupoBtns(); renderEjercicioBtns(); updateSaveBtn();
}

function renderEjercicioBtns() {
  const sec = document.getElementById('ejercicio-section');
  if (!selectedGrupo) { sec.style.display='none'; return; }
  sec.style.display='block';

  const ejs = sortAlpha(config.ejercicios[selectedGrupo] || []);
  const placeholder = ejs.length ? 'Busca o elige un ejercicio...' : 'Escribe un ejercicio...';

  document.getElementById('ejercicio-list').innerHTML = `
    <div style="position:relative">
      <input
        class="input ej-select-input"
        id="reg-ejercicio"
        placeholder="${placeholder}"
        value="${esc(selectedEjercicio)}"
        autocomplete="off"
        style="padding-right:36px"
        onfocus="openEjercicioDropdown()"
        onblur="setTimeout(closeEjercicioDropdown, 150)"
        oninput="onEjercicioInput(this.value)"
      />
      <span style="position:absolute;right:14px;top:14px;color:rgba(255,233,237,.45);font-size:12px;pointer-events:none">▾</span>
      <div id="ejercicio-options-list"
           style="display:none;position:absolute;top:100%;left:0;right:0;background:#27153D;border:1px solid rgba(255,233,237,.18);border-top:none;border-radius:0 0 13px 13px;z-index:100;max-height:230px;overflow-y:auto;box-shadow:0 8px 24px rgba(12,5,24,.32)"></div>
    </div>
  `;
}

function openEjercicioDropdown() {
  const list = document.getElementById('ejercicio-options-list');
  const input = document.getElementById('reg-ejercicio');
  if (!list) return;
  renderEjercicioDropdownOptions(input?.value || '');
  list.style.display = 'block';
  if (input) {
    input.style.borderBottomLeftRadius = '0';
    input.style.borderBottomRightRadius = '0';
    input.style.borderBottomColor = 'transparent';
  }
}

function closeEjercicioDropdown() {
  const list = document.getElementById('ejercicio-options-list');
  const input = document.getElementById('reg-ejercicio');
  if (list) list.style.display = 'none';
  if (input) {
    input.style.borderBottomLeftRadius = '';
    input.style.borderBottomRightRadius = '';
    input.style.borderBottomColor = '';
  }
}

function onEjercicioInput(val) {
  selectedEjercicio = val.trim();
  const list = document.getElementById('ejercicio-options-list');
  renderEjercicioDropdownOptions(val);
  if (list) list.style.display = 'block';
  updateSaveBtn();
}

function renderEjercicioDropdownOptions(query) {
  const list = document.getElementById('ejercicio-options-list');
  if (!list || !selectedGrupo) return;

  const q = normalizeSearch(query);
  const all = sortAlpha(config.ejercicios[selectedGrupo] || []);
  const ejs = all.filter(e => !q || normalizeSearch(e).includes(q));

  if (!ejs.length) {
    list.innerHTML = `<div style="padding:12px 13px;font-size:13px;color:rgba(255,233,237,.55)">${query ? 'Sin coincidencias' : 'Sin ejercicios — escribe uno nuevo'}</div>`;
    return;
  }

  list.innerHTML = ejs.map(e => {
    const sel = e === selectedEjercicio;
    return `<div
      data-value="${esc(e)}"
      onmousedown="event.preventDefault()"
      onclick="selectEjercicioOption(this.dataset.value)"
      style="padding:12px 13px;font-size:14px;cursor:pointer;color:${sel?'#F6B6B7':'#FFE9ED'};font-weight:${sel?'700':'400'};background:${sel?'rgba(255,233,237,.10)':'transparent'};border-bottom:1px solid rgba(255,233,237,.07)"
      onmouseover="this.style.background='rgba(255,233,237,.10)'"
      onmouseout="this.style.background='${sel?'rgba(255,233,237,.10)':'transparent'}'"
    >${esc(e)}</div>`;
  }).join('');
}

function selectEjercicioOption(val) {
  selectedEjercicio = val;
  const input = document.getElementById('reg-ejercicio');
  if (input) input.value = val;
  closeEjercicioDropdown();
  updateSaveBtn();
}

function updateSaveBtn() {
  const btn = document.getElementById('btn-save');
  const peso = document.getElementById('reg-peso').value;
  const ok = selectedPersona && selectedEjercicio && peso;
  btn.disabled = !ok;
  btn.className = 'btn-save'+(ok?' ready':'');
}

async function saveEntry() {
  const peso = parseFloat(document.getElementById('reg-peso').value);
  if (!selectedPersona||!selectedEjercicio||!peso) return;
  const entry = {
    fecha: document.getElementById('reg-fecha').value,
    persona: selectedPersona, grupo: selectedGrupo||'Otros',
    ejercicio: selectedEjercicio,
    series: parseInt(document.getElementById('reg-series').value),
    reps: parseInt(document.getElementById('reg-reps').value),
    peso,
    fase_menstrual: document.getElementById('reg-fase').value || null
  };
  const btn = document.getElementById('btn-save');
  btn.textContent='Guardando...'; btn.className='btn-save saving'; btn.disabled=true;
  try {
    const saved = await insertEntry(entry);
    sessions.push(saved);
    document.getElementById('reg-peso').value='';
    updateHeaderStats();
    renderSessionEntries();
    btn.textContent='✓ Guardado'; btn.className='btn-save done';
    setTimeout(()=>{ btn.textContent='Guardar serie'; updateSaveBtn(); },1400);
  } catch(e) {
    btn.textContent='Error — reintentar'; btn.className='btn-save ready'; btn.disabled=false;
    showToast('Error guardando. Comprueba la conexión.'); console.error(e);
  }
}

function getRegistroFecha() {
  return document.getElementById('reg-fecha')?.value || new Date().toISOString().split('T')[0];
}

function getRegistroDayEntries() {
  const fecha = getRegistroFecha();
  return sessions
    .filter(s => normalizeDateValue(s.fecha) === fecha)
    .sort((a, b) => (b.id || 0) - (a.id || 0));
}

function renderSessionEntries() {
  const box = document.getElementById('session-entries');
  const listEl = document.getElementById('session-list');
  const titleEl = document.getElementById('session-count');
  if (!box || !listEl || !titleEl) return;

  const fecha = getRegistroFecha();
  const entries = getRegistroDayEntries();

  if (!entries.length) {
    box.style.display='none';
    listEl.innerHTML = '';
    return;
  }

  box.style.display='block';
  titleEl.textContent = `Entradas del ${formatDateDisplay(fecha)} (${entries.length})`;
  listEl.innerHTML = entries.map(e =>
    `<div class="entry-card" style="border-left-color:${groupColor(e.grupo)}">
      <div>
        <div class="entry-title">${esc(e.ejercicio)}</div>
        <div class="entry-sub">${esc(e.persona)} · ${esc(e.grupo || 'Otros')} · ${esc(e.series)}×${esc(e.reps)} · ${esc(e.peso)}kg</div>
        ${e.fase_menstrual ? `<div class="fase-badge">🌙 ${esc(e.fase_menstrual)}</div>` : ''}
      </div>
      <div class="entry-actions">
        <button class="edit-btn" onclick="openEditEntry(${e.id})" title="Editar">✎</button>
        <button class="del-btn" onclick="deleteEntry(${e.id})" title="Borrar">×</button>
      </div>
    </div>`).join('');
}