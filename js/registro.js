
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
  const listId = 'ejercicio-options';
  const placeholder = ejs.length
    ? 'Busca o escribe un ejercicio...'
    : 'Escribe un ejercicio...';

  document.getElementById('ejercicio-list').innerHTML = `
    <input
      class="input"
      id="reg-ejercicio"
      list="${listId}"
      placeholder="${placeholder}"
      value="${esc(selectedEjercicio)}"
      onfocus="updateRegistroEjercicioOptions('')"
      oninput="selectEjercicio(this.value, true); updateRegistroEjercicioOptions(this.value)"
      autocomplete="off"
    />
    <datalist id="${listId}">
      ${ejs.map(e => `<option value="${esc(e)}"></option>`).join('')}
    </datalist>
    <div style="font-size:11px;color:var(--muted-2);margin-top:7px;line-height:1.4;">
      Empieza a escribir para buscar. También puedes escribir uno nuevo si no aparece.
    </div>
  `;
}

function updateRegistroEjercicioOptions(query = "") {
  const list = document.getElementById('ejercicio-options');
  if (!list || !selectedGrupo) return;

  const ejs = sortAlpha(config.ejercicios[selectedGrupo] || [])
    .filter(e => startsWithSearch(e, query));

  list.innerHTML = ejs
    .map(e => `<option value="${esc(e)}"></option>`)
    .join('');
}

function selectEjercicio(e, custom) {
  selectedEjercicio = e.trim();
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