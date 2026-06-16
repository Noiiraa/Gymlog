
// ─── AJUSTES ───
function renderAjustes() {
  renderPersonasChips(); renderGruposChips(); renderSelGrupoEj(); renderEjerciciosAdmin();
}

function renderPersonasChips() {
  document.getElementById('personas-chips').innerHTML = config.personas.map(p=>{
    const c=personaColor(p);
    return `<span class="chip" style="border:1px solid ${c}44">
      <span style="color:${c};font-weight:700">${esc(p)}</span>
      <button class="chip-del" onclick='removePersona(${JSON.stringify(p)})'>×</button></span>`;
  }).join('');
}
function addPersona() {
  const v=document.getElementById('new-persona').value.trim();
  if(!v||config.personas.includes(v)) return;
  config.personas.push(v); saveConfigLocal();
  document.getElementById('new-persona').value='';
  renderAjustes(); renderPersonaBtns();
}
function removePersona(p) {
  if(config.personas.length<=1) return;
  config.personas=config.personas.filter(x=>x!==p); saveConfigLocal();
  renderAjustes(); renderPersonaBtns();
}

function renderGruposChips() {
  document.getElementById('grupos-chips').innerHTML = Object.keys(config.ejercicios).map(g=>
    `<span class="chip" style="background:${groupColor(g)}22;color:${groupColor(g)}">${esc(g)}</span>`
  ).join('');
}
function addGrupo() {
  const v=document.getElementById('new-grupo').value.trim();
  if(!v||config.ejercicios[v]) return;
  config.ejercicios[v]=[]; saveConfigLocal();
  document.getElementById('new-grupo').value='';
  renderAjustes(); renderGrupoBtns();
}

function renderSelGrupoEj() {
  const sel=document.getElementById('sel-grupo-ej'), cur=sel.value;
  sel.innerHTML=sortAlpha(Object.keys(config.ejercicios)).map(g=>`<option value="${esc(g)}"${g===cur?' selected':''}>${esc(g)}</option>`).join('');
}
function renderEjerciciosAdmin() {
  const g = document.getElementById('sel-grupo-ej').value;
  const list = sortAlpha(config.ejercicios[g] || []);
  document.getElementById('ejercicios-admin-chips').innerHTML = list.map(e=>
    `<span class="chip"><span style="color:rgba(255,233,237,.72)">${esc(e)}</span>
     <button class="chip-del" onclick='removeEjercicio(${JSON.stringify(g)}, ${JSON.stringify(e)})'>×</button></span>`
  ).join('')||'<span style="color:rgba(255,233,237,.45);font-size:12px">Sin ejercicios</span>';
}
function addEjercicio() {
  const g=document.getElementById('sel-grupo-ej').value, v=document.getElementById('new-ejercicio').value.trim();
  if(!v||!g||(config.ejercicios[g]||[]).includes(v)) return;
  config.ejercicios[g]=[...(config.ejercicios[g]||[]),v]; saveConfigLocal();
  document.getElementById('new-ejercicio').value=''; renderEjerciciosAdmin();
}
function removeEjercicio(g,e) {
  config.ejercicios[g]=config.ejercicios[g].filter(x=>x!==e); saveConfigLocal(); renderEjerciciosAdmin();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeEditModal();
});