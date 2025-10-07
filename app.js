
let state = {
  progress: 0,
  quizzes: {},
  currentQuiz: null
};

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
  if(id==='schedule'){renderWeeks();}
  if(id==='quizzes'){renderQuizList();}
}
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> showPage(btn.dataset.target));
});

// Progress
function setProgress(pct){
  const bar = document.getElementById('progressBar');
  bar.style.width = pct + '%';
  document.getElementById('progressText').textContent = pct + '% complete';
  state.progress = pct;
}

// Weeks content
const plan = [
  {title:'Week 1 – Foundations & Operations', days:[
    'System structure & dispatch priorities',
    'Scene size-up & ICS / radio etiquette',
    'Documentation & legal (refusals, AOB, transfer of care)',
    'Lifting/moving, stair chair, stretcher operations',
    'Quiz: Operations & Documentation'
  ]},
  {title:'Week 2 – Medical Emergencies & Assessment', days:[
    'Primary vs secondary assessment — OPQRST/SAMPLE',
    'Cardiac & respiratory — chest pain, CHF/COPD/asthma, allergic',
    'Diabetic, seizure, stroke (RACE)',
    'Overdose & AMS — airway first, naloxone per protocol',
    'Quiz: Medical (15 Qs)'
  ]},
  {title:'Week 3 – Trauma & Special Populations', days:[
    'Trauma primary survey — airway, bleeding control',
    'Chest/abdominal trauma — rapid transport criteria',
    'Burns & extremities — pain, splinting',
    'OB/Peds — delivery basics, neonatal care',
    'Quiz: Trauma & OB/Peds'
  ]},
  {title:'Week 4 – Advanced Skills, Pharm & Integration', days:[
    'IV/IO review — sites, complications',
    'Medication review — Epi, Naloxone, Nitro, Dextrose, Diphenhydramine, Ondansetron',
    'Rhythms — NSR, brady, tachy, VT/VF, PEA/asystole',
    'Special ops — HAZMAT awareness, START/JumpSTART triage',
    'Final Quiz: 25 mixed scenarios'
  ]}
];

function renderWeeks(){
  const wrap = document.getElementById('weeks');
  if(!wrap.dataset.rendered){
    plan.forEach((week,i)=>{
      const div = document.createElement('div');
      div.className = 'card';
      const details = document.createElement('details');
      if(i===0) details.open = true;
      const sum = document.createElement('summary');
      sum.textContent = week.title;
      details.appendChild(sum);
      const ul = document.createElement('ul');
      week.days.forEach((d,idx)=>{
        const li = document.createElement('li');
        li.textContent = `Day ${idx+1} — ${d}`;
        ul.appendChild(li);
      });
      details.appendChild(ul);
      div.appendChild(details);
      wrap.appendChild(div);
    });
    wrap.dataset.rendered = '1';
  }
}

// Quizzes
async function renderQuizList(){
  if(Object.keys(state.quizzes).length===0){
    state.quizzes = await loadQuizzes();
  }
  const list = document.getElementById('quizList');
  list.innerHTML='';
  Object.keys(state.quizzes).forEach(name=>{
    const card = document.createElement('div');
    card.className='card';
    const h = document.createElement('h3');
    h.textContent = name;
    const b = document.createElement('button');
    b.className='cta';
    b.textContent='Start';
    b.onclick = ()=> startQuiz(name);
    card.appendChild(h); card.appendChild(b);
    list.appendChild(card);
  });
}

function startQuiz(name){
  state.currentQuiz = JSON.parse(JSON.stringify(state.quizzes[name])); // clone
  document.getElementById('quizRunner').classList.remove('hidden');
  document.getElementById('quizTitle').textContent = name;
  const cont = document.getElementById('quizContainer');
  cont.innerHTML='';
  state.currentQuiz.forEach((item,idx)=>{
    const block = document.createElement('div');
    block.className='card';
    const q = document.createElement('p');
    q.innerHTML = `<strong>Q${idx+1}.</strong> ${item.q}`;
    block.appendChild(q);
    item.choices.forEach((c,i)=>{
      const id = `q${idx}_c${i}`;
      const label = document.createElement('label');
      label.style.display='block';
      label.innerHTML = `<input type="radio" name="q${idx}" value="${i}"> ${c}`;
      block.appendChild(label);
    });
    cont.appendChild(block);
  });
  document.getElementById('quizResults').innerHTML='';
}

document.getElementById('submitQuiz').addEventListener('click', ()=>{
  const mode = loadQuizMode();
  if(!state.currentQuiz) return;
  let correct=0, total=state.currentQuiz.length, unanswered=0;
  const results = [];
  state.currentQuiz.forEach((item,idx)=>{
    const chosen = document.querySelector(`input[name="q${idx}"]:checked`);
    const sel = chosen ? parseInt(chosen.value) : -1;
    if(sel===-1) unanswered++;
    const isRight = sel===item.answer;
    if(isRight) correct++;
    results.push({idx, isRight, rationale:item.rationale});
  });
  const out = document.getElementById('quizResults');
  if(mode==='nontimed' && unanswered>0){
    out.innerHTML = `<div class="card">You have ${unanswered} unanswered question(s). You can answer them now or submit anyway.</div>`;
    return;
  }
  out.innerHTML = `<h4>Score: ${correct} / ${total}</h4>` + results.map(r=>{
    return `<div class="card"><strong>Q${r.idx+1}:</strong> ${r.isRight ? '✅ Correct' : '❌ Incorrect'}<br/><em>${r.rationale}</em></div>`
  }).join('');
  bumpProgressAfterQuiz();
});
  });
  const out = document.getElementById('quizResults');
  out.innerHTML = `<h4>Score: ${correct} / ${total}</h4>` + results.map(r=>{
    return `<div class="card"><strong>Q${r.idx+1}:</strong> ${r.isRight ? '✅ Correct' : '❌ Incorrect'}<br/><em>${r.rationale}</em></div>`
  }).join('');
  bumpProgressAfterQuiz();
});

// Charting examples
const examples = {
  refusal: `Presented exam findings to the patient who verbalized understanding and declined EMS treatment and transport. Risks, benefits, and alternatives (including potential for condition to worsen) were explained. Patient demonstrated decision-making capacity, signed refusal documentation, and was advised to call 911 for any worsening symptoms and to follow up with a primary care/urgent care/ED as needed. Vitals obtained and documented. PCR and AOB handled per policy.`,
  cp: `Times approximate. Patient contact established; primary assessment initiated while obtaining HPI. 12‑lead acquired prior to nitroglycerin and transmitted. Patient placed on stretcher and secured; IV access established; medications administered per protocol with ongoing reassessment. Transported without incident; verbal and written handoff to ED RN; signatures obtained.`
};
function reveal(key){
  const el = document.getElementById(key+'Output');
  el.textContent = examples[key];
  el.classList.remove('hidden');
}

// Shift prep
const prep = [
  {title:'Vitals Norms (Adult)', body:'HR 60–100 • RR 12–20 • SBP ≥ 90 • SpO₂ 94–99% (unless COPD baseline)'},
  {title:'Airway Checklist', body:'Suction ready • OPA/NPA sized • BVM with O₂ • Monitor & ETCO₂ • Consider CPAP if indicated'},
  {title:'Meds Quick Ref', body:'Epi 1:1,000 IM (anaphylaxis) • Naloxone IN/IV • Nitro (if BP ok, no PDEi) • Dextrose for hypoglycemia'},
  {title:'Scales', body:'RACE (stroke) • GCS • APGAR • Rule of 9s'},
];
const cardsWrap = document.getElementById('prepCards');
prep.forEach(p=>{
  const c = document.createElement('div'); c.className='card';
  c.innerHTML = `<h3>${p.title}</h3><p>${p.body}</p>`;
  cardsWrap.appendChild(c);
});


// Tabs for protocols
document.querySelectorAll('#protocolTabs .tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#protocolTabs .tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('#protContent .prot-pane').forEach(p=>{
      if(p.dataset.tab===tab){ p.classList.remove('hidden'); } else { p.classList.add('hidden'); }
    });
  });
});

// Theme toggle + persistence
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme){
  if(theme==='dark'){ document.body.classList.add('dark'); themeToggle.textContent='☀️ Light Mode'; }
  else { document.body.classList.remove('dark'); themeToggle.textContent='🌙 Dark Mode'; }
  localStorage.setItem('nhrmc_theme', theme);
}
applyTheme(localStorage.getItem('nhrmc_theme')||'light');
themeToggle.addEventListener('click', ()=>{
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(newTheme);
});

// Persist progress
function loadProgress(){ return parseInt(localStorage.getItem('nhrmc_progress')||'0'); }
function saveProgress(p){ localStorage.setItem('nhrmc_progress', String(p)); }
setProgress(loadProgress());

// Override setProgress to also save
const _setProgress = setProgress;
setProgress = function(p){ _setProgress(p); saveProgress(p); }

// Count completed quizzes to boost progress
function bumpProgressAfterQuiz(){
  const count = parseInt(localStorage.getItem('nhrmc_quiz_count')||'0') + 1;
  localStorage.setItem('nhrmc_quiz_count', String(count));
  const pct = Math.min(100, loadProgress() + Math.round(100/8));
  setProgress(pct);
}

// Initialize
setProgress(0);


// ---- Quiz Mode (Non-timed by default) ----
function loadQuizMode(){ return localStorage.getItem('nhrmc_quiz_mode') || 'nontimed'; }
function saveQuizMode(m){ localStorage.setItem('nhrmc_quiz_mode', m); }
function applyQuizModeUI(){
  const mode = loadQuizMode();
  const note = document.getElementById('quizModeNote');
  const inputs = document.querySelectorAll('input[name="quizMode"]');
  inputs.forEach(el=>{
    el.checked = (el.value===mode);
    el.addEventListener('change', ()=>{ saveQuizMode(el.value); applyQuizModeUI(); });
  });
  if(note){
    note.textContent = (mode==='nontimed') ?
      'Non‑timed: take your time, review before submitting.' :
      'Timed: a countdown will appear (coming soon).';
  }
}
// Re-apply when quizzes page is shown
const _renderQuizList_apply = renderQuizList;
renderQuizList = async function(){ await _renderQuizList_apply(); applyQuizModeUI(); };
// ---- bootstrap: make the site clickable even if other code throws ----
function __wireNav() {
  // if your HTML uses <button class="nav-btn" data-target="...">
  const buttons = document.querySelectorAll('.nav-btn');
  if (buttons.length) {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          // showPage() already exists in your file; use it if present
          if (typeof showPage === 'function') {
            showPage(btn.dataset.target);
          } else {
            // minimal fallback: toggle sections by id
            document.querySelectorAll('main > section').forEach(s => s.classList.remove('visible'));
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('visible');
          }
        } catch (e) {
          console.error(e);
          alert('Navigation error: ' + e.message);
        }
      });
    });
  }
}

// optional: pre-load quizzes so quiz pages have data ready
async function __primeQuizzes() {
  try {
    if (typeof loadQuizzes === 'function') {
      window.QUIZZES = await loadQuizzes();
    }
  } catch (e) {
    console.error('Prime quizzes failed:', e);
  }
}

// Run after the page is ready. If you already call init(), this wraps it safely.
window.addEventListener('load', async () => {
  try {
    __wireNav();
    await __primeQuizzes();
    // default page
    if (typeof showPage === 'function') showPage('home');
  } catch (e) {
    console.error('Init error:', e);
    alert('JavaScript init error: ' + e.message);
  }
});
