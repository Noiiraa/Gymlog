// ─── STATE ───
let sbClient = null;
let sessions = [];
let config = {};
let selectedPersona = "", selectedGrupo = "", selectedEjercicio = "";
let sessionEntries = [], chartPersona = "", chartMode = "ejercicio", myChart = null;
let historicalImported = false;
const HISTORIAL_PAGE_SIZE = 25;
let historialPage = 1;
let historialPersona = "";