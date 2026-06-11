// ─── SUPABASE CREDENTIALS ───
const SUPABASE_URL = "https://ialngggvnlrzxdxczicu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbG5nZ2d2bmxyenhkeGN6aWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTM1NTcsImV4cCI6MjA5NjQyOTU1N30.O2NvquZjKDMPUnzmJORYyEwtVYxomWR9KFSwjpPLpO0";

const CONFIG_KEY = "gymlog_config_v2";

const GROUP_COLORS = {
  Pecho:"#F6B6B7",Espalda:"#A6C9B6",Piernas:"#3E828E",
  Brazos:"#FFE9ED",Hombros:"#6CA9B6",Torso:"#DFA7B2",
  Abdominal:"#B7D6C4",Otros:"#9E89B3"
};
const PERSONA_COLORS = ["#F6B6B7","#A6C9B6","#3E828E","#FFE9ED","#9E89B3","#DFA7B2","#7DB7B7","#C7DCCF"];

const DEFAULT_CONFIG = {
  personas: ["María","Juanmi","Bea"],
  ejercicios: {
    Pecho:["Press de pecho","Chest press","Jalón de pecho divergente","Remo sentado divergente","Rear delt","pec fly"],
    Espalda:["Máquina de jalón al pecho","Dominadas asistidas","Polea alta","Polea alta barbilla","Espalda final del todo","seated row","back extension","Upper back","Remo polea (espejo)"],
    Piernas:["Prensa de piernas","Extensión de piernas","Flexión de piernas sentado","Abductor para fuera","Abductor para dentro","Prone leg curl","Caballito","Glute trainer"],
    Brazos:["Curl bicep","Pesitas biceps","Polea biceps (dos manos)","Polea biceps (una mano)","Seated triceps press","seated triceps"],
    Hombros:["Press hombros","Elevaciones laterales","Elevaciones frontales","Rear delt","Shoulders press","Hombros máquina"],
    Torso:["Remo sentado divergente","Remo polea (espejo)","Jalón de pecho divergente","Polea espalda lateral"],
    Abdominal:["Cintura polea","Rotary torso","Total abdominal","Crunch máquina","Plancha"],
    Otros:[]
  }
};