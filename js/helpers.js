// ─── HELPERS ───
function personaColor(p) {
  const i = config.personas.indexOf(p);
  return i >= 0 ? PERSONA_COLORS[i % PERSONA_COLORS.length] : "#94a3b8";
}
function groupColor(g) { return GROUP_COLORS[g] || "#94a3b8"; }

function showToast(msg, duration=2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function updateHeaderStats() {
  const days = new Set(sessions.map(s => s.fecha)).size;
  document.getElementById('header-stats').textContent = `${days} sesiones · ${sessions.length} entradas`;
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDateDisplay(value) {
  if (!value) return '';
  const s = String(value);

  // Supabase date normally arrives as YYYY-MM-DD.
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;

  // Fallback for any valid Date-like value.
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return s;
}

function normalizeDateValue(value) {
  if (!value) return '';
  const s = String(value);
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

function getChartDateRange() {
  const from = document.getElementById('chart-date-from')?.value || '';
  const to = document.getElementById('chart-date-to')?.value || '';
  return { from, to };
}

function isWithinChartDateRange(fecha) {
  const date = normalizeDateValue(fecha);
  const { from, to } = getChartDateRange();
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function setChartDatePreset(mode) {
  const fromEl = document.getElementById('chart-date-from');
  const toEl = document.getElementById('chart-date-to');
  if (!fromEl || !toEl) return;

  if (mode === 'all') {
    fromEl.value = '';
    toEl.value = '';
    renderChart();
    return;
  }

  if (mode === 'last90') {
    const dates = sessions.map(s => normalizeDateValue(s.fecha)).filter(Boolean).sort();
    const maxDate = dates.at(-1) || new Date().toISOString().split('T')[0];
    const d = new Date(maxDate + 'T00:00:00');
    d.setDate(d.getDate() - 90);
    fromEl.value = d.toISOString().split('T')[0];
    toEl.value = maxDate;
    renderChart();
  }
}