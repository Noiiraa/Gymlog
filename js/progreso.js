
// ─── PROGRESO ───
function renderProgreso() {
  renderVolumen();
  renderChartPersonaBtns();
  renderChartModeBtns();
  renderChartTargetSelect();
  renderChart();
}

function renderVolumen() {
  const map={};
  sessions.forEach(s=>{ if(s.grupo) map[s.grupo]=(map[s.grupo]||0)+1; });
  const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]);
  const max=sorted[0]?.[1]||1;
  document.getElementById('volumen-bars').innerHTML = sorted.map(([g,c])=>
    `<div class="bar-row">
      <div class="bar-labels"><span>${esc(g)}</span><span style="color:#64748b">${esc(c)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(c/max)*100}%;background:${groupColor(g)}"></div></div>
    </div>`).join('');
}

function renderChartPersonaBtns() {
  document.getElementById('chart-persona-btns').innerHTML = config.personas.map(p => {
    const c=personaColor(p), sel=chartPersona===p;
    return `<button class="btn-pill" onclick='selectChartPersona(${JSON.stringify(p)})'
      style="border-color:${sel?c:'rgba(255,233,237,.18)'};background:${sel?c+'22':'rgba(39,21,61,.58)'};color:${sel?c:'rgba(255,233,237,.62)'};font-weight:${sel?700:400}">${esc(p)}</button>`;
  }).join('');
}

function selectChartPersona(p) { chartPersona=p; renderChartPersonaBtns(); renderChart(); }

function renderChartModeBtns() {
  const modes = [
    {id:'ejercicio', label:'Máquinas'},
    {id:'grupo', label:'Grupos musculares'}
  ];
  document.getElementById('chart-mode-btns').innerHTML = modes.map(m => {
    const sel = chartMode === m.id;
    return `<button class="btn-pill" onclick='selectChartMode(${JSON.stringify(m.id)})'
      style="border-color:${sel?'#F6B6B7':'rgba(255,233,237,.18)'};background:${sel?'rgba(246,182,183,.22)':'rgba(39,21,61,.58)'};color:${sel?'#FFE9ED':'rgba(255,233,237,.62)'};font-weight:${sel?800:500}">${esc(m.label)}</button>`;
  }).join('');
}

function selectChartMode(mode) {
  chartMode = mode;
  renderChartModeBtns();
  renderChartTargetSelect();
  renderChart();
}

function renderChartTargetSelect() {
  const sel = document.getElementById('chart-target');
  const cur = sel.value;
  const all = chartMode === 'grupo'
    ? [...new Set(sessions.map(s=>s.grupo).filter(Boolean))].sort()
    : [...new Set(sessions.map(s=>s.ejercicio).filter(Boolean))].sort();

  document.getElementById('chart-title').textContent = chartMode === 'grupo'
    ? 'Evolución de volumen por grupo muscular'
    : 'Evolución de peso por máquina';

  sel.innerHTML = all.map(v =>
    `<option value="${esc(v)}"${v===cur?' selected':''}>${esc(v)}</option>`
  ).join('');

  if (all.length && !all.includes(sel.value)) sel.value = all[0];
}

function getChartData(target) {
  const filtered = sessions.filter(s =>
    s.persona === chartPersona &&
    isWithinChartDateRange(s.fecha) &&
    (chartMode === 'grupo' ? s.grupo === target : s.ejercicio === target)
  );

  if (chartMode === 'grupo') {
    return filtered.reduce((acc,s)=>{
      const volumen = Number(s.series || 0) * Number(s.reps || 0) * Number(s.peso || 0);
      const ex = acc.find(a=>a.fecha===s.fecha);
      if (ex) ex.valor += volumen; else acc.push({fecha:s.fecha, valor:volumen});
      return acc;
    },[]).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  }

  return filtered.reduce((acc,s)=>{
    const ex=acc.find(a=>a.fecha===s.fecha);
    const peso = Number(s.peso || 0);
    if(ex) ex.valor=Math.max(ex.valor,peso); else acc.push({fecha:s.fecha,valor:peso});
    return acc;
  },[]).sort((a,b)=>a.fecha.localeCompare(b.fecha));
}

function renderChart() {
  const target = document.getElementById('chart-target').value;
  const data = getChartData(target);
  const { from, to } = getChartDateRange();
  const note = document.getElementById('chart-date-note');
  if (note) {
    note.textContent = from || to
      ? `Filtro activo: ${from ? formatDateDisplay(from) : 'inicio'} → ${to ? formatDateDisplay(to) : 'hoy'}`
      : 'Sin filtro de fechas: se muestran todos los registros disponibles para este gráfico.';
  }

  const cont=document.getElementById('chart-container'), emp=document.getElementById('chart-empty');
  emp.textContent = chartMode === 'grupo'
    ? 'Necesitas al menos 2 días con este grupo muscular en el rango seleccionado'
    : 'Necesitas al menos 2 sesiones con este ejercicio en el rango seleccionado';
  if(data.length<2){ cont.style.display='none'; emp.style.display='block'; return; }
  cont.style.display='block'; emp.style.display='none';

  const color=personaColor(chartPersona);
  const unit = chartMode === 'grupo' ? ' kg de volumen' : ' kg';
  const label = chartMode === 'grupo' ? `Volumen · ${target}` : target;

  if(myChart) myChart.destroy();
  myChart=new Chart(document.getElementById('myChart').getContext('2d'),{
    type:'line',
    data:{labels:data.map(d=>formatDateDisplay(d.fecha)),datasets:[{
      label, data:data.map(d=>Number(d.valor.toFixed(1))),
      borderColor:color, backgroundColor:color+'22',
      pointBackgroundColor:color, pointRadius:5, pointHoverRadius:7,
      borderWidth:2.5, fill:true, tension:0.3
    }]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{backgroundColor:'#27153D',borderColor:'#F6B6B7',borderWidth:1,callbacks:{label:c=>`${c.parsed.y}${unit}`}}},
      scales:{
        x:{ticks:{color:'#FFE9ED',font:{size:10}},grid:{color:'rgba(255,233,237,.12)'}},
        y:{ticks:{color:'#FFE9ED',font:{size:10},callback:v=>v+unit},grid:{color:'rgba(255,233,237,.12)'}}
      }
    }
  });

  const diff=data.at(-1).valor-data[0].valor, pct=data[0].valor ? ((diff/data[0].valor)*100).toFixed(1) : '0.0';
  const statEl=document.getElementById('chart-stat');
  statEl.style.color=diff>=0?'#A6C9B6':'#F6B6B7';
  statEl.textContent=`${diff>=0?'↑':'↓'} ${Math.abs(diff).toFixed(1)}${unit} (${diff>=0?'+':''}${pct}%) desde inicio`;
}

function exportChart() {
  if(!myChart) return;
  const target=document.getElementById('chart-target').value;
  const a=document.createElement('a');
  a.download=`gymlog_${chartMode}_${chartPersona}_${target.replace(/\s+/g,'_')}.png`;
  a.href=myChart.toBase64Image('image/png',1); a.click();
}
