const REQUIRED_COUNT = 178;
let emergencyTimer = null, emergencyCountdown = 5;
let pulseInterval = null, pulseProgress = 0;
let breathingTimer = null, breathingCycle = null;


 
function goTo(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
 
function goHome(){
  clearInterval(emergencyTimer);
  clearInterval(pulseInterval);
  clearTimeout(breathingTimer);
  clearTimeout(breathingCycle);
  goTo('page-home');
}
 
/* ---------- PAGE 1 ---------- */
const input = document.getElementById('reading-input');
const countVal = document.getElementById('count-val');
input.addEventListener('input', updateCount);
 
function parseValues(){
  return input.value.split(',').map(v => v.trim()).filter(v => v.length > 0).map(Number);
}
function updateCount(){
  const vals = parseValues().filter(v => !isNaN(v));
  countVal.textContent = `${vals.length} / ${REQUIRED_COUNT}`;
}
 
const SEIZURE_SAMPLE_1 = [386,382,356,331,320,315,307,272,244,232,237,258,212,2,-267,-605,-850,-1001,-1109,-1090,-967,-746,-464,-152,118,318,427,473,485,447,397,339,312,314,326,335,332,324,310,312,309,309,303,297,295,295,293,286,279,283,301,308,285,252,215,194,169,111,-74,-388,-679,-892,-949,-972,-1001,-1006,-949,-847,-668,-432,-153,72,226,326,392,461,495,513,511,496,479,453,440,427,414,399,385,385,404,432,444,437,418,392,373,363,365,372,385,388,383,371,360,353,334,303,252,200,153,151,143,48,-206,-548,-859,-1067,-1069,-957,-780,-597,-460,-357,-276,-224,-210,-350,-930,-1413,-1716,-1360,-662,-96,243,323,241,29,-167,-228,-136,27,146,229,269,297,307,303,305,306,307,280,231,159,85,51,43,62,63,63,69,89,123,136,127,102,95,105,131,163,168,164,150,146,152,157,156,154,143,129];

const SEIZURE_SAMPLE_2 = [-167,-230,-280,-315,-338,-369,-405,-392,-298,-140,27,146,211,223,214,187,167,166,179,192,190,168,129,85,43,4,-28,-47,-43,-24,-7,12,32,43,12,-70,-181,-292,-374,-410,-382,-335,-232,-128,-6,106,233,312,423,550,695,816,839,769,661,525,383,292,267,339,451,537,564,534,444,305,160,27,-74,-147,-205,-242,-274,-304,-331,-355,-372,-380,-370,-341,-299,-257,-235,-249,-300,-381,-399,-345,-183,17,178,274,288,265,229,193,160,106,34,-51,-120,-166,-189,-207,-225,-242,-251,-255,-237,-202,-120,19,186,340,441,465,410,288,130,-16,-123,-194,-232,-255,-272,-266,-255,-209,-168,-142,-148,-169,-180,-174,-107,12,206,419,596,683,679,596,472,330,168,26,-63,-73,-37,25,61,67,53,28,-6,-44,-92,-154,-211,-257,-258,-168,-32,140,277,366,408,416,415,423,434,416,374,319,268,215,165,103];

const NORMAL_SAMPLE_1 = [-105,-101,-96,-92,-89,-95,-102,-100,-87,-79,-72,-68,-74,-80,-83,-73,-68,-61,-58,-59,-64,-79,-84,-97,-94,-84,-77,-75,-72,-68,-76,-76,-72,-67,-69,-69,-69,-67,-68,-69,-67,-66,-58,-54,-56,-70,-80,-82,-85,-74,-70,-71,-82,-88,-93,-97,-89,-87,-83,-70,-50,-37,-31,-32,-39,-54,-64,-68,-67,-69,-63,-60,-63,-55,-43,-37,-27,-31,-35,-47,-58,-63,-74,-73,-67,-60,-56,-49,-46,-57,-58,-62,-63,-63,-61,-56,-65,-62,-57,-61,-63,-66,-69,-86,-89,-86,-83,-87,-80,-69,-62,-57,-60,-60,-68,-58,-53,-57,-66,-66,-73,-78,-73,-84,-92,-97,-88,-81,-72,-61,-66,-72,-88,-90,-88,-77,-58,-53,-61,-69,-66,-74,-69,-61,-51,-45,-45,-49,-58,-64,-78,-80,-90,-87,-83,-78,-64,-38,-22,-29,-42,-51,-68,-71,-69,-69,-74,-74,-80,-82,-81,-80,-77,-85,-77,-72,-69,-65];

const NORMAL_SAMPLE_2 = [92,49,0,-32,-51,-65,-37,-19,-25,-29,-52,-62,-85,-107,-97,-69,-46,-37,-48,-59,-58,-61,-83,-127,-147,-165,-175,-183,-218,-259,-298,-275,-243,-214,-239,-258,-283,-285,-271,-262,-250,-237,-211,-193,-189,-183,-174,-170,-164,-182,-165,-153,-116,-87,-68,-48,-44,-71,-95,-103,-94,-79,-62,-59,-59,-52,-58,-49,-70,-59,-53,-55,-54,-63,-43,-24,6,28,48,74,98,92,103,89,97,62,19,-11,-46,-59,-43,-37,-30,-22,-26,-42,-53,-71,-40,-13,28,23,22,12,-5,-25,-78,-85,-104,-106,-85,-96,-62,-72,-71,-57,-37,-34,-23,-31,-25,-14,14,18,18,11,-9,-34,-46,-73,-65,-82,-66,-59,-75,-67,-77,-92,-73,-40,-19,-14,-8,2,39,40,31,20,22,32,25,5,-17,-3,5,24,22,13,3,-11,-23,-39,-43,-32,-18,-30,-51,-72,-80,-56,-41,-40,-43,-32,-13,-1,-7,-44];

function fillSample(kind){
  let vals;
  if(kind === 'normal'){
    fillSample._normalToggle = !fillSample._normalToggle;
    vals = fillSample._normalToggle ? NORMAL_SAMPLE_1 : NORMAL_SAMPLE_2;
  } else {
    fillSample._seizureToggle = !fillSample._seizureToggle;
    vals = fillSample._seizureToggle ? SEIZURE_SAMPLE_1 : SEIZURE_SAMPLE_2;
  }
  input.value = vals.join(',');
  updateCount();
  document.getElementById('status-note').textContent = '';
}
 
async function runAnalysis(){
  const vals = parseValues().filter(v => !isNaN(v));
  const note = document.getElementById('status-note');
  const analyzeBtn = document.getElementById('analyze-btn');

  if(vals.length !== REQUIRED_COUNT){
    note.textContent = `Need exactly ${REQUIRED_COUNT} values (entered ${vals.length})`;
    note.style.color = 'var(--red-2)';
    return;
  }
  
  note.style.color = 'var(--text-dim)';
  note.textContent = 'Running model inference...';
  if (analyzeBtn) analyzeBtn.disabled = true;

  try {
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: vals })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || 'Server error occurred');
    }

    note.textContent = '';
    showResult(data.is_seizure);

  } catch (err) {
    note.textContent = `API Error: ${err.message}`;
    note.style.color = 'var(--red-2)';
  } finally {
    if (analyzeBtn) analyzeBtn.disabled = false;
  }
}
 
/* ---------- PAGE 2: result ---------- */
function showResult(isSeizure){
  const holder = document.getElementById('pentagon-holder');
  const path = document.getElementById('pentagon-path');
  const label = document.getElementById('pentagon-label');
  const caption = document.getElementById('result-caption');
  const pillRow = document.getElementById('pill-row');
 
  clearInterval(emergencyTimer);
  emergencyCountdown = 5;
 
  if(isSeizure){
    holder.className = 'pentagon-holder glow-red';
    path.setAttribute('fill','url(#redGrad)');
    label.className = 'pentagon-label alert-text';
    label.textContent = 'ALERT';
    caption.textContent = '';
    pillRow.innerHTML = `
      <button class="pill pill-calling" id="calling-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="#8f2c1f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        calling emergency in <span id="countdown-num">5</span> sec..
      </button>
      <button class="pill pill-stop" onclick="markStable()">STOP (stable)</button>
    `;
    emergencyTimer = setInterval(() => {
      emergencyCountdown--;
      const el = document.getElementById('countdown-num');
      if(el) el.textContent = emergencyCountdown;
      if(emergencyCountdown <= 0){
        clearInterval(emergencyTimer);
        goTo('page-pulse');
        startPulse();
      }
    }, 1000);
  } else {
    holder.className = 'pentagon-holder glow-green';
    path.setAttribute('fill','url(#greenGrad)');
    label.className = 'pentagon-label stable-text';
    label.textContent = 'STABLE';
    caption.textContent = '';
    pillRow.innerHTML = `<button class="pill pill-aura" onclick="document.getElementById('bgAudio').play().catch(e => console.log(e)); startBreathing()">feeling aura?</button>`;
  }
  goTo('page-result');
}
 
function markStable(){
  clearInterval(emergencyTimer);
  showResult(false);
}
 
function handlePentagonClick(){ /* reserved for future detail view */ }
 
/* ---------- PAGE 3: pulse delivery ---------- */
function startPulse(){
  clearInterval(pulseInterval);
  const durationMs = 30000;
  const stepMs = 60;
  let elapsed = 0;
  const pie = document.getElementById('pie');
  const label = document.getElementById('pie-label');
  label.textContent = 'Delivering...';
 
  pulseInterval = setInterval(() => {
    elapsed += stepMs;
    const elapsedFrac = Math.min(1, elapsed / durationMs);
    const deg = elapsedFrac * 360;
    pie.style.background = `conic-gradient(transparent 0deg, transparent ${deg}deg, var(--yellow) ${deg}deg, var(--yellow) 360deg)`;
    if(elapsedFrac >= 1){
      clearInterval(pulseInterval);
      label.textContent = 'Delivered';
    }
  }, stepMs);
}
function stopPulse(){
  clearInterval(pulseInterval);
  showResult(false);
}
 
/* ---------- breathing exercise ---------- */
function startBreathing(){

  clearInterval(emergencyTimer);
  clearInterval(pulseInterval);
  runBreathCycle();
}
function runBreathCycle(){
  clearInterval(breathingTimer);
  goTo('inhale-screen');
  animateBox('inhale-box', 4, () => {
    goTo('exhale-screen');
    animateBox('exhale-box', 6, () => {
      breathingTimer = setTimeout(runBreathCycle, 200);
    });
  });
}
function animateBox(boxId, seconds, onDone){
  const segs = document.querySelectorAll(`#${boxId} .segment`);
  segs.forEach(s => { s.style.transition = 'none'; s.style.opacity = '0'; });
  void document.getElementById(boxId).offsetWidth;
  const per = (seconds*1000) / segs.length;
  segs.forEach((s, i) => {
    s.style.transition = `opacity ${per*0.6}ms ease`;
    setTimeout(() => { s.style.opacity = '1'; }, i*per);
  });
  breathingCycle = setTimeout(() => { if(onDone) onDone(); }, seconds*1000);
}
function stopBreathing(){
  clearTimeout(breathingTimer);
  clearTimeout(breathingCycle);
  showResult(false);
}
 
/* ================= NEW: Seizure Diary page ================= */
let diaryDate = new Date();
let diaryMarkedDates = new Set(); // keys like "2026-7-13"
 
function initDiarySelects(){
  const monthSel = document.getElementById('diary-month');
  const yearSel = document.getElementById('diary-year');
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  monthSel.innerHTML = monthNames.map((m,i) => `<option value="${i}">${m}</option>`).join('');
  const thisYear = new Date().getFullYear();
  let yearOpts = '';
  for(let y = thisYear-5; y <= thisYear+5; y++){
    yearOpts += `<option value="${y}">${y}</option>`;
  }
  yearSel.innerHTML = yearOpts;
}
 
function renderDiary(){
  const monthSel = document.getElementById('diary-month');
  const yearSel = document.getElementById('diary-year');
  monthSel.value = diaryDate.getMonth();
  yearSel.value = diaryDate.getFullYear();
 
  const grid = document.getElementById('diary-grid');
  grid.innerHTML = '';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'diary-dow';
    el.textContent = d;
    grid.appendChild(el);
  });
 
  const year = diaryDate.getFullYear(), month = diaryDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
 
  for(let i=0;i<firstDay;i++){
    const el = document.createElement('div');
    el.className = 'diary-day empty';
    grid.appendChild(el);
  }
  for(let d=1; d<=daysInMonth; d++){
    const key = `${year}-${month}-${d}`;
    const el = document.createElement('div');
    el.className = 'diary-day' + (diaryMarkedDates.has(key) ? ' marked' : '');
    el.textContent = d;
    el.onclick = () => toggleDiaryDay(key, el);
    grid.appendChild(el);
  }
  document.getElementById('diary-save-note').textContent = '';
}
 
function toggleDiaryDay(key, el){
  if(diaryMarkedDates.has(key)){
    diaryMarkedDates.delete(key);
    el.classList.remove('marked');
  } else {
    diaryMarkedDates.add(key);
    el.classList.add('marked');
  }
}
 
function diaryPrevMonth(){ diaryDate = new Date(diaryDate.getFullYear(), diaryDate.getMonth()-1, 1); renderDiary(); }
function diaryNextMonth(){ diaryDate = new Date(diaryDate.getFullYear(), diaryDate.getMonth()+1, 1); renderDiary(); }
function diaryMonthChange(){
  diaryDate = new Date(diaryDate.getFullYear(), parseInt(document.getElementById('diary-month').value), 1);
  renderDiary();
}
function diaryYearChange(){
  diaryDate = new Date(parseInt(document.getElementById('diary-year').value), diaryDate.getMonth(), 1);
  renderDiary();
}
function addDiaryEntry(){
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  diaryMarkedDates.add(key);
  diaryDate = new Date(today.getFullYear(), today.getMonth(), 1);
  renderDiary();
}
function saveDiary(){
  const note = document.getElementById('diary-save-note');
  note.textContent = 'Saved!';
  setTimeout(() => { note.textContent = ''; }, 1500);
}
 
initDiarySelects();
renderDiary();
