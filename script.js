const $ = id => document.getElementById(id);

/* ---------- Page switching ---------- */
function go(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === page));
  document.querySelectorAll('.nav').forEach(n => n.classList.toggle('active', n.dataset.go === page));
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-go]').forEach(el => el.onclick = () => go(el.dataset.go));

/* ---------- Templates & explanations ---------- */
const FONTS = {S:'Georgia,serif', A:'Segoe UI,Arial,sans-serif', M:'Consolas,monospace', T:'Trebuchet MS,sans-serif', P:'Palatino Linotype,serif', V:'Verdana,sans-serif', C:'Arial Narrow,Arial,sans-serif'};
// [key, name, layout, font, accent, headerBg, headerText, best-for, description]
const TPL = [
 ['classic','Classic','center','S','#333','','','Government jobs|Banking|Campus placements','Serif font and a centered heading. A traditional layout recruiters in conservative companies expect.'],
 ['modern','Modern','band','A','#4f46e5','#1e293b','#fff','Web Development|IT companies|Startups','Dark header band with colored section titles. Professional and creative at the same time.'],
 ['minimal','Minimal','thin','A','#666','','','Cyber Security|ATS scanning|Experienced roles','Clean, light and spacious. Content comes first, so resume scanners read it easily.'],
 ['creative','Creative','band','A','#7c3aed','linear-gradient(90deg,#7c3aed,#3b82f6)','#fff','UI/UX Design|Data Science|Freshers','Purple-blue gradient header that stands out. Great for showing projects and personality.'],
 ['tech','Tech','band','M','#0f766e','#0b1220','#22d3ee','Developers|DevOps|Software jobs','Monospace font and terminal-style header for engineers who want a hacker look.'],
 ['executive','Executive','center','P','#1f2937','','','Senior roles|Managers|Finance','Elegant centered serif layout with a formal tone for experienced professionals.'],
 ['corporate','Corporate','bar','A','#1d4ed8','','','Business Analyst|MBA|Corporate jobs','Blue side-bar section titles. Looks neat and trustworthy in office environments.'],
 ['professional','Professional','band','A','#0f4c81','#0f4c81','#fff','All engineering jobs|IT services|MNCs','Solid navy header band. A safe choice for almost any engineering resume.'],
 ['ocean','Ocean','band','T','#0e7490','linear-gradient(90deg,#0e7490,#06b6d4)','#fff','Cloud|Data Science|Analysts','Fresh teal gradient header. Friendly but still professional.'],
 ['sunset','Sunset','band','T','#ea580c','linear-gradient(90deg,#f97316,#ec4899)','#fff','Marketing|Design|Freshers','Warm orange-pink gradient that gives energy and personality.'],
 ['forest','Forest','bar','P','#166534','','','Civil|Environmental|Agriculture','Calm green accents with a serif font. Suits field and site-based careers.'],
 ['royal','Royal','chip','S','#6d28d9','','','Academia|Research|M.Tech','Section titles in purple label boxes. Good for research and academic profiles.'],
 ['crimson','Crimson','bar','A','#b91c1c','','','Sales|Management|Leadership','Bold red accent bars that show confidence and drive.'],
 ['slate','Slate','thin','A','#475569','','','Consultants|Experienced roles|Freelancers','Quiet grey-blue tones. Lets your achievements speak.'],
 ['inkmono','Ink Mono','plain','M','#111','','','Developers|Hardware|Open-source','Plain black monospace text with underlined headings. Simple and technical.'],
 ['blueprint','Blueprint','band','M','#1e3a8a','#1e3a8a','#bfdbfe','Civil|Mechanical|Design Engineers','Blueprint-style dark blue header with a technical drawing feel.'],
 ['circuit','Circuit','chip','M','#047857','','','VLSI|Embedded|Electronics','Green chip-style titles inspired by circuit boards.'],
 ['robotic','Robotics','band','V','#d97706','#111827','#f59e0b','Robotics|Automation|Control Systems','Dark header with amber highlight, like an industrial control panel.'],
 ['cyber','Cyber','band','M','#15803d','#020617','#4ade80','Cyber Security|Ethical Hacking|SOC jobs','Black header with green text, inspired by a security terminal.'],
 ['datalab','Data Lab','bar','T','#7c3aed','','','Data Science|Machine Learning|Analytics','Purple side-bars with a rounded font. Good for project-heavy data resumes.'],
 ['pastel','Pastel','chip','T','#ec4899','','','UI/UX|Creative roles|Freshers','Soft pink label titles. Light, modern and friendly.'],
 ['elegant','Elegant','center','P','#92400e','','','Teaching|Writing|HR','Warm brown accents with a classic serif font.'],
 ['compact','Compact','thin','C','#0f766e','','','Long resumes|ATS scanning|Experienced roles','Condensed font that fits more content on a page.'],
 ['bold','Bold','chip','V','#111827','','','Leadership|Startups|Sales','Heavy black label titles that make each section stand out.'],
 ['fresher','Fresher','bar','A','#2563eb','','','Freshers|Internships|Campus drives','Simple blue layout that highlights education, projects and skills.']
];
const templates = {};
TPL.forEach(([k, n, l, f, ac, hd, hc, best, d]) => templates[k] = {n, l, f, ac, hd, hc, best: best.split('|'), d});
const tplStyle = t => `--ac:${t.ac};--hd:${t.hd || t.ac};--hc:${t.hc || '#fff'};--ff:${FONTS[t.f]}`;
function cardHTML(k) {
  const t = templates[k];
  return `<div class="tcard"><div class="thumb ${t.l}" style="${tplStyle(t)}"><div class="h"></div><i></i><i style="width:70%"></i><i></i><i style="width:50%"></i></div>
    <h3>${t.n}</h3><p>${t.d}</p><div>${t.best.map(b => `<span class="tag">${b}</span>`).join('')}</div>
    <p></p><button class="btn" data-use="${k}">Use this template</button></div>`;
}
$('homeTemplates').innerHTML = Object.keys(templates).slice(0, 10).map(cardHTML).join('');
$('tplGrid').innerHTML = Object.keys(templates).map(cardHTML).join('');
$('template').innerHTML = Object.keys(templates).map(k => `<option value="${k}">${templates[k].n}</option>`).join('');
document.querySelectorAll('[data-use]').forEach(b => b.onclick = () => { $('template').value = b.dataset.use; render(); go('builder'); });

/* ---------- Resume builder ---------- */
const fields = ['name','title','email','phone','location','link','summary','skills','education','experience','projects','achievements'];
const certData = [];
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lines = id => $(id).value.split('\n').map(l => l.trim()).filter(Boolean);
const list = (arr, fmt) => arr.length ? arr.map(fmt).join('') : '';
const section = (t, body) => body ? `<h3>${t}</h3>${body}` : '';

const style = {font:'', color:'', text:'', size:13};

function render() {
  const tpl = $('template').value;
  $('tplInfo').textContent = templates[tpl].d + ' Best for: ' + templates[tpl].best.join(', ') + '.';
  const v = id => esc($(id).value.trim());
  const contact = [v('email'), v('phone'), v('location'), v('link')].filter(Boolean).join(' • ');
  const skills = $('skills').value.split(',').map(s => s.trim()).filter(Boolean);
  const row = l => `<div class="row">${esc(l).split('|').map((p, i) => i === 0 ? `<b>${p.trim()}</b>` : p.trim()).join(' — ')}</div>`;

  $('resume').className = 'resume ' + templates[tpl].l;
  let st = tplStyle(templates[tpl]);
  if (style.font) st += `;--ff:${style.font}`;
  if (style.color) st += `;--ac:${style.color};--hd:${style.color}`;
  if (style.text) st += `;color:${style.text}`;
  st += `;font-size:${style.size}px`;
  $('resume').style.cssText = st;
  $('sizeVal').textContent = style.size;
  $('resume').innerHTML = `
    <div class="head">
      <h1>${v('name') || 'Your Name'}</h1>
      <div class="role">${v('title') || 'Your Job Title'}</div>
      <div class="contact">${contact || 'email • phone • location'}</div>
    </div>
    ${section('Summary', v('summary') && `<div>${v('summary')}</div>`)}
    ${section('Skills', skills.length && esc(skills.join(' • ')))}
    ${section('Education', list(lines('education'), row))}
    ${section('Experience', list(lines('experience'), row))}
    ${section('Projects', list(lines('projects'), row))}
    ${section('Achievements', list(lines('achievements'), l => `<div class="row">• ${esc(l)}</div>`))}
    ${section('Certificates', certData.length && `<div class="certs">${certData.map(c =>
        c.img ? `<img src="${c.img}" alt="${esc(c.name)}" title="${esc(c.name)}">` : `<div class="row">📄 ${esc(c.name)}</div>`).join('')}</div>`)}
  `;
  try { localStorage.setItem('resumeData', JSON.stringify({...Object.fromEntries(fields.map(f => [f, $(f).value])), template: tpl, style})); } catch (e) {}
}

fields.concat('template').forEach(id => $(id).addEventListener('input', render));

$('fontSel').oninput = e => { style.font = e.target.value; render(); };
$('colorSel').oninput = e => { style.color = e.target.value; render(); };
$('textSel').oninput = e => { style.text = e.target.value; render(); };
$('sizeSel').oninput = e => { style.size = +e.target.value; render(); };
$('resetStyle').onclick = () => {
  Object.assign(style, {font:'', color:'', text:'', size:13});
  $('fontSel').value = ''; $('sizeSel').value = 13; $('colorSel').value = '#4f46e5'; $('textSel').value = '#222222';
  render();
};

$('certs').onchange = e => {
  certData.length = 0;
  const files = [...e.target.files];
  if (!files.length) return render();
  let pending = files.length;
  files.forEach(f => {
    if (f.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = () => { certData.push({name: f.name, img: r.result}); if (!--pending) render(); };
      r.readAsDataURL(f);
    } else { certData.push({name: f.name}); if (!--pending) render(); }
  });
};

$('exportBtn').onclick = () => { alert('In the print window choose "Save as PDF" as the destination.'); window.print(); };
$('clearBtn').onclick = () => { fields.forEach(f => $(f).value = ''); $('certs').value = ''; certData.length = 0; render(); };

// restore saved data
try {
  const saved = JSON.parse(localStorage.getItem('resumeData') || '{}');
  fields.forEach(f => { if (saved[f]) $(f).value = saved[f]; });
  if (saved.style) {
    Object.assign(style, saved.style);
    $('fontSel').value = style.font; $('sizeSel').value = style.size;
    if (style.color) $('colorSel').value = style.color;
    if (style.text) $('textSel').value = style.text;
  }
  if (saved.template && templates[saved.template]) $('template').value = saved.template;
} catch (e) {}
render();

/* ---------- Job eligibility ---------- */
// base = starting eligibility % for each qualification; skills = used for bonus match
const jobs = {
  web: [
    {t:'Front-End Developer', base:{diploma:65, btech:80}, skills:['html','css','javascript','react'], d:'Builds user interfaces for websites and web apps.'},
    {t:'Full-Stack Developer', base:{diploma:50, btech:75}, skills:['javascript','node','react','mongodb','sql'], d:'Works on both front-end and back-end systems.'},
    {t:'Web Designer (UI/UX)', base:{diploma:70, btech:70}, skills:['html','css','figma','photoshop'], d:'Designs layouts, visuals and user experience.'},
    {t:'WordPress Developer', base:{diploma:75, btech:70}, skills:['wordpress','php','html','css'], d:'Builds and customises WordPress sites.'},
    {t:'Software Engineer (Web)', base:{diploma:30, btech:85}, skills:['javascript','python','java','sql','git'], d:'Product-company role; B.Tech usually preferred.'}
  ],
  cyber: [
    {t:'SOC Analyst (L1)', base:{diploma:60, btech:78}, skills:['networking','siem','linux','security'], d:'Monitors alerts and responds to security incidents.'},
    {t:'Network Security Engineer', base:{diploma:55, btech:75}, skills:['networking','firewall','cisco','linux'], d:'Secures networks, firewalls and VPNs.'},
    {t:'Penetration Tester', base:{diploma:35, btech:72}, skills:['kali','python','owasp','networking','burp'], d:'Ethically hacks systems to find vulnerabilities.'},
    {t:'Security Analyst', base:{diploma:45, btech:80}, skills:['security','risk','linux','python'], d:'Analyses threats and improves security policies.'},
    {t:'IT Support (Security)', base:{diploma:80, btech:75}, skills:['windows','networking','troubleshooting'], d:'Entry-level role with security awareness duties.'}
  ],
  data: [
    {t:'Data Analyst', base:{diploma:55, btech:80}, skills:['excel','sql','python','power bi','tableau'], d:'Cleans data and builds reports and dashboards.'},
    {t:'Data Scientist', base:{diploma:25, btech:75}, skills:['python','machine learning','statistics','pandas','sql'], d:'Builds models and finds insights from large data.'},
    {t:'Machine Learning Engineer', base:{diploma:20, btech:72}, skills:['python','tensorflow','pytorch','machine learning','deep learning'], d:'Trains and deploys ML models into products.'},
    {t:'BI Developer', base:{diploma:50, btech:75}, skills:['power bi','tableau','sql','excel'], d:'Creates business intelligence dashboards.'},
    {t:'Data Engineer', base:{diploma:30, btech:78}, skills:['python','sql','spark','hadoop','etl'], d:'Builds pipelines that move and store data.'}
  ],
  cloud: [
    {t:'Cloud Support Associate', base:{diploma:70, btech:78}, skills:['aws','azure','linux','networking'], d:'Helps customers with cloud services and issues.'},
    {t:'DevOps Engineer', base:{diploma:40, btech:78}, skills:['docker','kubernetes','git','jenkins','linux'], d:'Automates build, test and deployment pipelines.'},
    {t:'System Administrator', base:{diploma:72, btech:75}, skills:['linux','windows','networking','bash'], d:'Maintains servers and company IT systems.'},
    {t:'Cloud Engineer', base:{diploma:35, btech:80}, skills:['aws','azure','terraform','python'], d:'Designs and manages cloud infrastructure.'}
  ]
};


// helper: [title, diploma%, btech%, "skills", description, optional mtech%]
const add = (f, rows) => jobs[f] = rows.map(([t, d, b, s, x, m]) => ({t, base:{diploma:d, btech:b, ...(m ? {mtech:m} : {})}, skills:s.split(','), d:x}));
add('robotics', [
  ['Robotics Engineer', 35, 74, 'ros,python,c++,matlab,control', 'Designs, programs and tests robots.', 88],
  ['Control Systems Engineer', 40, 76, 'matlab,simulink,pid,plc,control', 'Designs controllers for machines and processes.', 88],
  ['PLC / Automation Engineer', 80, 78, 'plc,scada,hmi,automation', 'Programs industrial automation systems.'],
  ['Embedded Systems Engineer', 45, 78, 'c,c++,microcontroller,rtos,arduino', 'Writes firmware for robots and devices.', 90],
  ['Mechatronics Technician', 82, 72, 'sensors,arduino,plc,electronics', 'Builds and maintains robotic machines.']
]);
add('hardware', [
  ['VLSI Design Engineer', 15, 70, 'verilog,vhdl,cadence,synopsys,vlsi', 'Designs digital and analog chips.', 90],
  ['Verification Engineer', 15, 72, 'systemverilog,uvm,verilog,python', 'Tests chip designs before manufacturing.', 90],
  ['FPGA Engineer', 30, 72, 'fpga,verilog,vhdl,vivado', 'Builds hardware logic on FPGA boards.', 88],
  ['PCB Design Engineer', 70, 76, 'altium,kicad,pcb,orcad', 'Designs printed circuit boards.'],
  ['Hardware Test Engineer', 75, 74, 'oscilloscope,testing,electronics,labview', 'Tests and debugs electronic hardware.']
]);
add('electrical', [
  ['Electrical Design Engineer', 45, 78, 'autocad,etap,electrical design,matlab', 'Plans wiring, panels and power layouts.', 88],
  ['Power Systems Engineer', 35, 76, 'etap,power systems,matlab,protection', 'Works on grids, substations and protection.', 88],
  ['Maintenance Electrician / Technician', 85, 72, 'wiring,motors,plc,testing', 'Maintains electrical equipment in plants.'],
  ['Solar / Renewable Engineer', 60, 78, 'solar,pvsyst,autocad,energy', 'Designs and installs solar systems.', 86]
]);
add('mechanical', [
  ['Design Engineer (CAD)', 60, 78, 'solidworks,autocad,catia,creo', 'Creates 3D models and drawings of parts.', 88],
  ['Production / Manufacturing Engineer', 72, 76, 'lean,six sigma,cnc,production', 'Improves factory production processes.'],
  ['CAE / Simulation Engineer', 25, 72, 'ansys,fea,cfd,matlab', 'Simulates strength and heat flow of designs.', 90],
  ['Quality Engineer', 70, 76, 'quality,iso,six sigma,inspection', 'Makes sure products meet standards.'],
  ['Automobile Service Engineer', 80, 72, 'automobile,diagnostics,engine,maintenance', 'Diagnoses and repairs vehicle systems.']
]);
add('civil', [
  ['Site Engineer', 72, 78, 'autocad,site,estimation,surveying', 'Supervises construction work on site.'],
  ['Structural Engineer', 30, 76, 'staad,etabs,autocad,rcc', 'Designs safe building structures.', 90],
  ['Quantity Surveyor / Estimator', 68, 74, 'estimation,billing,excel,boq', 'Calculates material and project costs.'],
  ['Planning Engineer', 50, 76, 'primavera,ms project,planning,excel', 'Plans project schedules and resources.']
]);
add('business', [
  ['Business Analyst', 35, 74, 'excel,sql,power bi,communication', 'Connects business needs with technical teams.', 86],
  ['Project Coordinator', 65, 72, 'ms project,excel,communication,planning', 'Tracks tasks, teams and deadlines.'],
  ['Digital Marketing Executive', 70, 72, 'seo,social media,google ads,content', 'Runs online marketing campaigns.'],
  ['Operations Executive', 72, 72, 'excel,coordination,communication,erp', 'Keeps day-to-day company operations running.']
]);

function check() {
  const userSkills = $('skills').value.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const q = $('qual').value;
  const out = jobs[$('field').value].map(j => {
    const matched = j.skills.filter(s => userSkills.some(u => u.includes(s)));
    const base = j.base[q] ?? Math.min(95, j.base.btech + 8);
    const pct = Math.min(98, base + matched.length * 4);
    return {...j, pct, matched};
  }).sort((a, b) => b.pct - a.pct);

  $('results').innerHTML = out.map(j => `
    <div class="job">
      <h3>${j.t} — ${j.pct}%</h3>
      <p>${j.d}</p>
      <div>${j.skills.map(s => `<span class="tag">${s}${j.matched.includes(s) ? ' ✓' : ''}</span>`).join('')}</div>
      <div class="bar"><i style="width:${j.pct}%"></i></div>
    </div>`).join('');
}
$('checkBtn').onclick = check;
check();