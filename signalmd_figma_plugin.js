// ============================================================
// SignalMD — Figma Plugin Code
// Paste this into: Figma → Plugins → Development → Open Console
// Or run via: Plugins → Development → New Plugin → paste & run
// ============================================================

// ── COLORS ──
const C = {
  bg:          { r: 0.941, g: 0.953, b: 0.969 },
  surface:     { r: 1,     g: 1,     b: 1     },
  surface2:    { r: 0.969, g: 0.976, b: 0.984 },
  navy:        { r: 0.043, g: 0.118, b: 0.208 },
  navy2:       { r: 0.082, g: 0.176, b: 0.290 },
  blue:        { r: 0.090, g: 0.376, b: 0.706 },
  blue2:       { r: 0.125, g: 0.459, b: 0.839 },
  blueLight:   { r: 0.886, g: 0.929, b: 0.980 },
  border:      { r: 0.867, g: 0.890, b: 0.925 },
  border2:     { r: 0.784, g: 0.816, b: 0.863 },
  text:        { r: 0.059, g: 0.122, b: 0.200 },
  text2:       { r: 0.239, g: 0.318, b: 0.400 },
  text3:       { r: 0.478, g: 0.573, b: 0.659 },
  text4:       { r: 0.659, g: 0.737, b: 0.812 },
  critical:    { r: 0.753, g: 0.224, b: 0.169 },
  critBg:      { r: 0.996, g: 0.949, b: 0.949 },
  critBorder:  { r: 0.988, g: 0.647, b: 0.647 },
  high:        { r: 0.706, g: 0.463, b: 0.051 },
  highBg:      { r: 1,     g: 0.984, b: 0.922 },
  highBorder:  { r: 0.988, g: 0.835, b: 0.255 },
  medium:      { r: 0.118, g: 0.494, b: 0.204 },
  medBg:       { r: 0.941, g: 1,     b: 0.957 },
  medBorder:   { r: 0.431, g: 0.906, b: 0.553 },
  green:       { r: 0.133, g: 0.773, b: 0.369 },
  amber:       { r: 0.851, g: 0.471, b: 0.024 },
  white:       { r: 1,     g: 1,     b: 1     },
};

const SIDEBAR_W = 200;
const HEADER_H  = 56;
const FW = 1440;
const FH = 900;

// ── HELPERS ──
function rect(parent, x, y, w, h, fill, corner=0) {
  const n = figma.createRectangle();
  n.x = x; n.y = y; n.resize(w, h);
  if (fill) n.fills = [{ type:'SOLID', color: fill }];
  else n.fills = [];
  if (corner) n.cornerRadius = corner;
  parent.appendChild(n);
  return n;
}

function border(parent, x, y, w, h, strokeColor, corner=0, sw=1) {
  const n = figma.createRectangle();
  n.x = x; n.y = y; n.resize(w, h);
  n.fills = [];
  n.strokes = [{ type:'SOLID', color: strokeColor }];
  n.strokeWeight = sw;
  n.strokeAlign = 'INSIDE';
  if (corner) n.cornerRadius = corner;
  parent.appendChild(n);
  return n;
}

async function text(parent, x, y, content, size, colorObj, bold=false, w=0) {
  await figma.loadFontAsync({ family: 'Inter', style: bold ? 'Bold' : 'Regular' });
  const n = figma.createText();
  n.fontName = { family: 'Inter', style: bold ? 'Bold' : 'Regular' };
  n.fontSize = size;
  n.fills = [{ type:'SOLID', color: colorObj }];
  n.characters = content;
  n.x = x; n.y = y;
  if (w) { n.textAutoResize = 'HEIGHT'; n.resize(w, 20); }
  parent.appendChild(n);
  return n;
}

function frame(name, x, y, w, h, fill) {
  const f = figma.createFrame();
  f.name = name;
  f.x = x; f.y = y;
  f.resize(w, h);
  f.fills = fill ? [{ type:'SOLID', color: fill }] : [{ type:'SOLID', color: C.bg }];
  f.clipsContent = true;
  return f;
}

function line(parent, x1, y1, x2, y2, color, w=1) {
  const v = figma.createVector();
  v.vectorPaths = [{
    windingRule: 'NONE',
    data: `M ${x1} ${y1} L ${x2} ${y2}`
  }];
  v.strokes = [{ type:'SOLID', color }];
  v.strokeWeight = w;
  v.fills = [];
  parent.appendChild(v);
  return v;
}

// ── TOPBAR ──
async function drawTopbar(f, wardLabel='All Wards') {
  rect(f, 0, 0, FW, HEADER_H, C.navy);
  // Logo box
  rect(f, 20, 14, 28, 28, C.blue, 7);
  await text(f, 25, 17, '+', 16, C.white, true);
  await text(f, 56, 19, 'SignalMD', 16, C.white, true);

  // Ward tabs
  const tabs = ['All Wards','Emergency','Cardiology','General','Neurology'];
  let tx = 200;
  for (const tab of tabs) {
    const isActive = tab === wardLabel;
    if (isActive) {
      rect(f, tx-8, 0, 110, HEADER_H, C.bg, 0);
      await text(f, tx, 18, tab, 12, C.navy, true);
    } else {
      await text(f, tx, 20, tab, 11, { r:0.5, g:0.6, b:0.7 });
    }
    tx += 120;
  }

  // Live badge
  rect(f, FW-220, 18, 8, 8, C.green, 4);
  await text(f, FW-208, 17, 'LIVE · Updated 12s ago', 10, C.text3);

  // Avatar
  rect(f, FW-44, 14, 28, 28, C.blue, 14);
  await text(f, FW-38, 19, 'DR', 10, C.white, true);
}

// ── SIDEBAR ──
async function drawSidebar(f, activeStep=0) {
  rect(f, 0, HEADER_H, SIDEBAR_W, FH - HEADER_H, C.navy);
  const steps = [
    ['01','Patient Intake'],
    ['02','Symptom Interview'],
    ['03','Severity Queue'],
    ['04','Doctor View'],
    ['05','Admission'],
  ];
  for (let i = 0; i < steps.length; i++) {
    const [num, label] = steps[i];
    const y = HEADER_H + 24 + i * 64;
    const isActive = i === activeStep;
    const isDone = i < activeStep;

    if (isActive) {
      rect(f, 0, y-4, SIDEBAR_W, 56, C.navy2);
      rect(f, 0, y-4, 3, 56, C.blue2);
    }

    // Icon circle
    const circFill = isDone ? { r:0.086, g:0.396, b:0.204 } : isActive ? C.blue2 : { r:0.118, g:0.196, b:0.275 };
    rect(f, 16, y+4, 26, 26, circFill, 13);
    await text(f, isDone ? 20 : 21, y+9, isDone ? '✓' : num, isDone ? 13 : 9, C.white, true);

    const labelColor = isActive ? C.white : isDone ? { r:0.427, g:0.722, b:0.541 } : C.text3;
    await text(f, 50, y+6, `Step ${num}`, 8, { r:0.239, g:0.376, b:0.502 });
    await text(f, 50, y+19, label, 11, labelColor, isActive);
  }
}

// ── STATS BAR ──
async function drawStatsBar(f, stats) {
  rect(f, 0, HEADER_H, FW, 66, C.surface);
  line(f, 0, HEADER_H+66, FW, HEADER_H+66, C.border);
  let sx = SIDEBAR_W + 24;
  for (const [val, label, sub, isRed, isAmber] of stats) {
    const col = isRed ? C.critical : isAmber ? C.amber : C.text;
    await text(f, sx, HEADER_H+8, val, 22, col, true);
    await text(f, sx, HEADER_H+36, label.toUpperCase(), 8, C.text3, true);
    await text(f, sx, HEADER_H+48, sub, 8, C.text4);
    line(f, sx+110, HEADER_H+14, sx+110, HEADER_H+54, C.border);
    sx += 130;
  }
  // New Patient button
  rect(f, FW-160, HEADER_H+16, 140, 34, C.blue, 7);
  await text(f, FW-142, HEADER_H+24, '+ New Patient', 12, C.white, true);
}

// ── TOOLBAR ──
async function drawToolbar(f, topY) {
  rect(f, 0, topY, FW, 48, C.surface);
  line(f, 0, topY+48, FW, topY+48, C.border);
  // Search
  rect(f, SIDEBAR_W+20, topY+8, 280, 32, C.surface2, 6);
  border(f, SIDEBAR_W+20, topY+8, 280, 32, C.border, 6);
  await text(f, SIDEBAR_W+36, topY+17, '⌕  Search name, ID, condition...', 11, C.text4);

  // Filter chips
  const chips = [['All','active'],['Critical',''],['High',''],['Moderate',''],['Low','']];
  let cx = SIDEBAR_W+316;
  for (const [chip, state] of chips) {
    const isActive = state==='active';
    rect(f, cx, topY+10, 64, 28, isActive ? C.navy : C.surface2, 14);
    if (!isActive) border(f, cx, topY+10, 64, 28, C.border, 14);
    await text(f, cx+10, topY+18, chip, 10, isActive ? C.white : C.text3, isActive);
    cx += 72;
  }

  // Sort
  rect(f, cx+10, topY+10, 160, 28, C.surface2, 6);
  border(f, cx+10, topY+10, 160, 28, C.border, 6);
  await text(f, cx+20, topY+18, 'Sort: AI Score ↓', 10, C.text2);

  await text(f, FW-130, topY+18, 'Showing 50 of 50', 10, C.text3);
}

// ── SEVERITY BADGE ──
async function drawBadge(f, x, y, label, style) {
  const styles = {
    critical: [C.critBg, C.critBorder, C.critical],
    high:     [C.highBg, C.highBorder, C.high],
    medium:   [C.medBg, C.medBorder, C.medium],
    low:      [C.blueLight, C.border, C.blue],
  };
  const [bg, bo, fg] = styles[style] || styles.critical;
  rect(f, x, y, 80, 22, bg, 11);
  border(f, x, y, 80, 22, bo, 11);
  await text(f, x+10, y+5, label, 9, fg, true);
}

// ══════════════════════════════════════════════════════════
// SCREEN 1 — PATIENT INTAKE
// ══════════════════════════════════════════════════════════
async function buildIntake() {
  const f = frame('01 — Patient Intake', 0, 0, FW, FH);
  await drawTopbar(f);
  await drawSidebar(f, 0);
  await drawStatsBar(f, [
    ['50','Total Patients','4 wards active',false,false],
    ['8','Critical','Immediate care',true,false],
    ['14','High Priority','Within 30 min',false,true],
    ['6','Docs On Call','3 available',false,false],
    ['47m','Avg Wait','↑ 8m baseline',false,false],
  ]);

  const CY = HEADER_H + 66;
  const CX = SIDEBAR_W + 24;

  // Page title
  await text(f, CX, CY+16, 'Patient Intake', 28, C.text, true);
  await text(f, CX, CY+52, 'Register new patient arrival', 13, C.text3);

  // Main card
  rect(f, CX, CY+72, FW-CX-24, 320, C.surface, 10);
  border(f, CX, CY+72, FW-CX-24, 320, C.border, 10);
  await text(f, CX+20, CY+88, 'PERSONAL INFORMATION', 9, C.text3, true);
  line(f, CX+20, CY+104, FW-44, CY+104, C.border);

  // Fields grid
  const fields = [
    ['First Name','Sarah'],['Last Name','Mitchell'],
    ['Date of Birth','04 / 12 / 1978'],['Patient ID','PT-2024-8821'],
    ['Gender','Female'],['Insurance','BlueCross PPO'],
  ];
  const colX = [CX+20, CX+260];
  const rowY = [CY+114, CY+170, CY+226];
  for (let i=0; i<fields.length; i++) {
    const [lbl, val] = fields[i];
    const fx = colX[i%2]; const fy = rowY[Math.floor(i/2)];
    await text(f, fx, fy, lbl, 9, C.text2, true);
    rect(f, fx, fy+14, 220, 36, C.surface2, 6);
    border(f, fx, fy+14, 220, 36, C.border, 6);
    await text(f, fx+10, fy+23, val, 12, C.text);
  }

  // Chief complaint
  await text(f, CX+20, CY+290, 'Chief Complaint', 9, C.text2, true);
  rect(f, CX+20, CY+306, FW-CX-64, 52, C.surface2, 6);
  border(f, CX+20, CY+306, FW-CX-64, 52, C.border, 6);
  await text(f, CX+30, CY+318, 'Severe chest pressure and SOB since this morning. Pain radiates to left arm.', 11, C.text, false, FW-CX-84);

  // Continue button
  rect(f, CX, CY+380, 220, 36, C.blue, 7);
  await text(f, CX+28, CY+389, 'Continue to Symptoms →', 12, C.white, true);

  figma.currentPage.appendChild(f);
  return f;
}

// ══════════════════════════════════════════════════════════
// SCREEN 2 — SEVERITY QUEUE (50 patients)
// ══════════════════════════════════════════════════════════
async function buildQueue() {
  const f = frame('03 — Severity Queue · 50 Patients', 1500, 0, FW, FH);
  await drawTopbar(f);
  await drawSidebar(f, 2);
  await drawStatsBar(f, [
    ['50','Total Patients','4 wards active',false,false],
    ['8','Critical','Immediate care',true,false],
    ['14','High Priority','Within 30 min',false,true],
    ['6','Docs On Call','3 available',false,false],
    ['47m','Avg Wait','↑ 8m baseline',false,false],
  ]);

  const TB = HEADER_H + 66;
  await drawToolbar(f, TB);

  const TABLE_Y = TB + 48;

  // Table container
  rect(f, SIDEBAR_W+20, TABLE_Y, FW-SIDEBAR_W-40, FH-TABLE_Y-20, C.surface, 10);
  border(f, SIDEBAR_W+20, TABLE_Y, FW-SIDEBAR_W-40, FH-TABLE_Y-20, C.border, 10);

  // Table header
  rect(f, SIDEBAR_W+20, TABLE_Y, FW-SIDEBAR_W-40, 36, C.surface2, 0);
  line(f, SIDEBAR_W+20, TABLE_Y+36, FW-20, TABLE_Y+36, C.border);
  const hcols = [[SIDEBAR_W+36,'#'],[SIDEBAR_W+68,'PATIENT'],[SIDEBAR_W+290,'SEVERITY'],
                 [SIDEBAR_W+420,'AI SCORE'],[SIDEBAR_W+530,'VITALS'],[SIDEBAR_W+680,'WAIT'],[SIDEBAR_W+760,'WARD'],[SIDEBAR_W+840,'ACTION']];
  for (const [hx,ht] of hcols) {
    await text(f, hx, TABLE_Y+11, ht, 8, C.text3, true);
  }

  // Patient rows — show 14 visible rows
  const patients = [
    ['Sarah Mitchell','46F · Chest Pain, SOB','critical',92,'14m','ED'],
    ['James Okafor','71M · Stroke Symptoms','critical',88,'22m','NEURO'],
    ['Priya Nair','34F · Abdominal Pain','high',67,'41m','GEN'],
    ['David Chen','55M · Fever, Cough','high',61,'58m','ED'],
    ['Aisha Kamara','28F · Migraine','medium',44,'1h 2m','NEURO'],
    ['Michael Torres','62M · Arrhythmia','medium',42,'1h 8m','CARD'],
    ['Elena Vasquez','39F · Resp. Distress','high',65,'35m','ED'],
    ['Carlos Kim','48M · HTN Crisis','medium',38,'1h 14m','CARD'],
    ['Mei Johnson','55F · Sepsis','critical',85,'18m','ED'],
    ['Robert Patel','70M · GI Bleed','high',63,'44m','GEN'],
    ['Jennifer Williams','33F · Appendicitis','medium',40,'1h 20m','GEN'],
    ['Ahmed Hassan','58M · Chest Pain','high',60,'52m','CARD'],
    ['Sofia Santos','26F · Fracture','low',22,'2h 4m','GEN'],
    ['Kevin Park','44M · Diabetic Crisis','medium',36,'1h 38m','ED'],
  ];

  const sevLabel = { critical:'● Critical', high:'● High', medium:'● Moderate', low:'● Low' };
  const ROW_H = 48;

  for (let ri=0; ri<patients.length; ri++) {
    const [name,meta,sev,score,wait,ward] = patients[ri];
    const ry = TABLE_Y + 36 + ri * ROW_H;
    const isSel = ri===0;

    // Row bg
    if (isSel) rect(f, SIDEBAR_W+21, ry, FW-SIDEBAR_W-42, ROW_H, C.blueLight);
    if (ri%2===0 && !isSel) rect(f, SIDEBAR_W+21, ry, FW-SIDEBAR_W-42, ROW_H, C.surface2);

    // Severity stripe
    const stripeCol = sev==='critical' ? C.critical : sev==='high' ? C.high : sev==='medium' ? C.medium : C.blue;
    rect(f, SIDEBAR_W+20, ry, 3, ROW_H, stripeCol);

    line(f, SIDEBAR_W+20, ry+ROW_H, FW-20, ry+ROW_H, C.border);

    // Rank
    await text(f, SIDEBAR_W+36, ry+17, String(ri+1), 10, C.text3, true);

    // Name + meta
    await text(f, SIDEBAR_W+68, ry+10, name, 12, C.text, true);
    await text(f, SIDEBAR_W+68, ry+26, meta, 10, C.text3);

    // Badge
    await drawBadge(f, SIDEBAR_W+290, ry+13, sevLabel[sev], sev);

    // Score bar
    const barW = 80;
    rect(f, SIDEBAR_W+420, ry+20, barW, 7, C.border, 3);
    rect(f, SIDEBAR_W+420, ry+20, Math.round(barW*score/100), 7, stripeCol, 3);
    await text(f, SIDEBAR_W+508, ry+16, String(score), 11, C.text, true);

    // Vitals (compact)
    await text(f, SIDEBAR_W+530, ry+10, 'HR 108 ↑', 9, sev==='critical'?C.critical:C.text2, true);
    await text(f, SIDEBAR_W+530, ry+22, 'BP 152/94 ↑', 9, sev==='critical'?C.critical:C.text2);
    await text(f, SIDEBAR_W+530, ry+34, 'SpO₂ 94%', 9, sev==='high'?C.high:C.text2);

    // Wait
    const waitCol = wait.includes('h') ? C.text2 : sev==='critical' ? C.critical : C.amber;
    await text(f, SIDEBAR_W+680, ry+17, wait, 11, waitCol, true);

    // Ward
    await text(f, SIDEBAR_W+760, ry+17, ward, 10, C.text3);

    // Action button
    if (sev==='critical') {
      rect(f, SIDEBAR_W+840, ry+11, 80, 28, C.critical, 5);
      await text(f, SIDEBAR_W+852, ry+19, 'See Now', 10, C.white, true);
    } else {
      rect(f, SIDEBAR_W+840, ry+11, 80, 28, C.surface, 5);
      border(f, SIDEBAR_W+840, ry+11, 80, 28, C.border, 5);
      await text(f, SIDEBAR_W+857, ry+19, 'View', 10, C.text2);
    }
  }

  // Scroll indicator
  await text(f, FW/2-60, FH-28, '+ 36 more patients below ↓', 10, C.text3);

  // Time Saved Panel
  const PX = FW - 240;
  rect(f, PX, TABLE_Y, 220, FH-TABLE_Y, C.navy, 0);
  line(f, PX, TABLE_Y, PX, FH, C.border);
  await text(f, PX+12, TABLE_Y+12, '⬤  SIGNALMD IMPACT', 8, { r:0.3,g:0.5,b:0.7 }, true);
  await text(f, PX+12, TABLE_Y+28, 'Time Saved This Shift', 10, C.white, true);
  line(f, PX+12, TABLE_Y+46, PX+208, TABLE_Y+46, { r:0.1,g:0.2,b:0.3 });

  await text(f, PX+30, TABLE_Y+56, '610', 36, { r:0.29,g:0.87,b:0.5 }, true);
  await text(f, PX+100, TABLE_Y+72, 'min saved', 9, { r:0.3,g:0.5,b:0.7 });

  line(f, PX+12, TABLE_Y+100, PX+208, TABLE_Y+100, { r:0.1,g:0.2,b:0.3 });

  const impactStats = [['50','Patients Triaged'],['8','Critical Fast-tracked'],['10.2h','Hours Returned'],['5','Steps Removed']];
  for (let i=0; i<impactStats.length; i++) {
    const [v,l] = impactStats[i];
    const iy = TABLE_Y+112+i*52;
    rect(f, PX+12, iy, 96, 44, { r:0.05,g:0.12,b:0.22 }, 7);
    await text(f, PX+20, iy+6, v, 16, { r:0.62,g:0.87,b:0.87 }, true);
    await text(f, PX+20, iy+26, l, 8, { r:0.3,g:0.5,b:0.7 });
  }

  // Steps eliminated
  line(f, PX+12, TABLE_Y+330, PX+208, TABLE_Y+330, { r:0.1,g:0.2,b:0.3 });
  await text(f, PX+12, TABLE_Y+340, 'WORKFLOW ELIMINATED', 7, { r:0.3,g:0.5,b:0.7 }, true);
  const cuts = ['Manual chart lookup','Paper symptom form','Verbal handoff','Queue sorting','EHR re-entry'];
  for (let i=0; i<cuts.length; i++) {
    await text(f, PX+12, TABLE_Y+358+i*22, '— '+cuts[i], 8, { r:0.25,g:0.38,b:0.5 });
  }
  await text(f, PX+12, TABLE_Y+476, '✓ Doctor confirms', 8, { r:0.29,g:0.87,b:0.5 }, true);

  figma.currentPage.appendChild(f);
  return f;
}

// ══════════════════════════════════════════════════════════
// SCREEN 3 — DOCTOR VIEW
// ══════════════════════════════════════════════════════════
async function buildDoctorView() {
  const f = frame('04 — Doctor View', 3000, 0, FW, FH);
  await drawTopbar(f);
  await drawSidebar(f, 3);
  await drawStatsBar(f, [
    ['50','Total Patients','4 wards active',false,false],
    ['8','Critical','Immediate care',true,false],
    ['14','High Priority','Within 30 min',false,true],
    ['6','Docs On Call','3 available',false,false],
    ['47m','Avg Wait','↑ 8m baseline',false,false],
  ]);

  const CY = HEADER_H + 66;
  const CX = SIDEBAR_W + 24;

  await text(f, CX, CY+16, 'Doctor View', 28, C.text, true);
  await text(f, CX, CY+52, 'Tiered AI diagnosis — Sarah Mitchell', 13, C.text3);
  await drawBadge(f, FW-210, CY+20, '● CRITICAL — Score 92', 'critical');

  const LW = 320; const RX = CX+LW+20;
  const RW = FW-RX-24;

  // Left patient card
  rect(f, CX, CY+72, LW, 220, C.surface, 10);
  border(f, CX, CY+72, LW, 220, C.border, 10);
  rect(f, CX, CY+72, LW, 72, C.navy, 10);
  rect(f, CX, CY+120, LW, 24, C.navy);
  await text(f, CX+14, CY+84, 'Sarah Mitchell', 20, C.white, true);
  await text(f, CX+14, CY+110, '46F · PT-2024-8821 · BlueCross PPO', 10, { r:0.56,g:0.72,b:0.85 });
  await drawBadge(f, CX+14, CY+128, '● Critical — Score 92', 'critical');

  const vitals = [['Heart Rate','108 bpm ↑',C.critical],['Blood Pressure','152/94 mmHg ↑',C.critical],
                  ['SpO₂','94% ↓',C.high],['Temperature','98.8°F',C.medium],
                  ['Pain Score','8 / 10',C.critical],['Resp. Rate','22/min ↑',C.high]];
  for (let i=0; i<vitals.length; i++) {
    const [lbl,val,col] = vitals[i];
    const vy = CY+158+i*22;
    await text(f, CX+14, vy, lbl, 10, C.text2);
    await text(f, CX+LW-14-val.length*6, vy, val, 10, col, true);
    if (i<vitals.length-1) line(f, CX+14, vy+18, CX+LW-14, vy+18, C.border);
  }

  // Medical history
  await text(f, CX, CY+306, 'MEDICAL HISTORY', 8, C.text3, true);
  line(f, CX, CY+320, CX+LW, CY+320, C.border);
  rect(f, CX, CY+328, LW, 130, C.surface, 10);
  border(f, CX, CY+328, LW, 130, C.border, 10);
  const hist = [['Hypertension Stage 2','Lisinopril 10mg · 2019'],['Hyperlipidemia','Atorvastatin 20mg · 2020'],
                ['Type 2 Diabetes','Metformin 500mg · 2021'],['Prior ED: Chest Pain','March 2023 — Discharged']];
  for (let i=0; i<hist.length; i++) {
    const hy = CY+338+i*28;
    await text(f, CX+14, hy, hist[i][0], 11, C.text, true);
    await text(f, CX+14, hy+13, hist[i][1], 9, C.text3);
    if (i<hist.length-1) line(f, CX+14, hy+26, CX+LW-14, hy+26, C.border);
  }

  // Right — Tiered diagnosis
  await text(f, RX, CY+72, 'SIGNALMD — TIERED DIAGNOSIS', 9, C.text3, true);
  line(f, RX, CY+88, RX+RW, CY+88, C.border);

  const tiers = [
    ['Tier 1 · Primary','Acute Myocardial Infarction (STEMI/NSTEMI)',87,C.blue,['Chest pressure','Left arm radiation','Diaphoresis','HTN+DM'],120],
    ['Tier 2 · Differential','Unstable Angina',61,C.high,['Chest pain pattern','Hyperlipidemia','SOB'],100],
    ['Tier 3 · Consider','Pulmonary Embolism',24,C.border2,['Dyspnea','Low SpO₂','Elevated RR'],96],
  ];
  let ty = CY+96;
  for (const [tlbl,tname,conf,acc,tags,th] of tiers) {
    rect(f, RX, ty, RW, th, C.surface, 10);
    border(f, RX, ty, RW, th, C.border, 10);
    rect(f, RX, ty, 4, th, acc, 0);
    await text(f, RX+16, ty+12, tname, 13, C.text, true);
    await text(f, RX+16, ty+30, `Confidence: ${conf}%`, 10, C.text2);
    rect(f, RX+16, ty+46, RW-32, 6, C.border, 3);
    rect(f, RX+16, ty+46, Math.round((RW-32)*conf/100), 6, acc===C.border2?C.border2:acc, 3);
    // Tags
    let tx2 = RX+16;
    for (const tg of tags) {
      const tw = tg.length*6+14;
      rect(f, tx2, ty+60, tw, 20, C.surface2, 8);
      border(f, tx2, ty+60, tw, 20, C.border, 8);
      await text(f, tx2+7, ty+64, tg, 8, C.text2);
      tx2+=tw+6;
    }
    ty+=th+12;
  }

  // Alert box
  rect(f, RX, ty, RW, 100, C.critBg, 8);
  border(f, RX, ty, RW, 100, C.critBorder, 8);
  await text(f, RX+14, ty+12, '⚠  IMMEDIATE ACTIONS RECOMMENDED', 9, C.critical, true);
  const acts = ['12-lead ECG','Troponin I/T','Chest X-Ray','Aspirin 325mg','IV Access','Cardiology Consult'];
  let ax=RX+14; let ay=ty+32;
  for (const act of acts) {
    const aw = act.length*6+16;
    if (ax+aw > RX+RW-10) { ax=RX+14; ay+=26; }
    rect(f, ax, ay, aw, 22, C.surface, 5);
    border(f, ax, ay, aw, 22, C.critBorder, 5);
    await text(f, ax+8, ay+6, act, 9, C.critical, true);
    ax+=aw+6;
  }

  // Admit button
  rect(f, RX+RW-200, FH-60, 196, 38, C.critical, 7);
  await text(f, RX+RW-180, FH-47, 'Confirm & Admit →', 13, C.white, true);

  figma.currentPage.appendChild(f);
  return f;
}

// ══════════════════════════════════════════════════════════
// SCREEN 4 — ADMISSION CONFIRMATION
// ══════════════════════════════════════════════════════════
async function buildAdmission() {
  const f = frame('05 — Admission Confirmed', 4500, 0, FW, FH);
  await drawTopbar(f);
  await drawSidebar(f, 4);

  const cw=460, ch=320;
  const cx=FW/2-cw/2, cy=FH/2-ch/2;
  rect(f, cx, cy, cw, ch, C.surface, 16);
  border(f, cx, cy, cw, ch, C.border, 16, 2);

  // Check circle
  rect(f, cx+cw/2-36, cy+28, 72, 72, C.medBg, 36);
  border(f, cx+cw/2-36, cy+28, 72, 72, C.medBorder, 36, 2);
  await text(f, cx+cw/2-12, cy+42, '✓', 32, C.medium, true);

  await text(f, cx+60, cy+114, 'Patient Admitted', 24, C.text, true);
  await text(f, cx+44, cy+150, 'Sarah Mitchell — Cardiology, Room 4B', 13, C.text2);
  await text(f, cx+36, cy+170, 'Care team notified. Cardiology consult requested.', 12, C.text3);

  rect(f, cx+cw/2-110, cy+200, 220, 26, C.surface2, 6);
  border(f, cx+cw/2-110, cy+200, 220, 26, C.border, 6);
  await text(f, cx+cw/2-98, cy+207, 'ADM-2024-8821 · 14:32 EST', 10, C.text3, true);

  rect(f, cx+20, cy+244, (cw-50)/2, 36, C.surface, 6);
  border(f, cx+20, cy+244, (cw-50)/2, 36, C.border, 6);
  await text(f, cx+68, cy+255, 'New Patient', 12, C.text2);

  rect(f, cx+(cw-50)/2+30, cy+244, (cw-50)/2, 36, C.blue, 6);
  await text(f, cx+(cw-50)/2+52, cy+255, 'Back to Queue', 12, C.white, true);

  figma.currentPage.appendChild(f);
  return f;
}

// ══════════════════════════════════════════════════════════
// RUN ALL SCREENS
// ══════════════════════════════════════════════════════════
async function main() {
  figma.currentPage.name = 'SignalMD';

  figma.notify('Building SignalMD screens...', { timeout: 3000 });

  await buildIntake();
  await buildQueue();
  await buildDoctorView();
  await buildAdmission();

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  figma.notify('✓ SignalMD — 4 screens built successfully!', { timeout: 4000 });
  figma.closePlugin();
}

main().catch(err => {
  figma.notify('Error: ' + err.message, { timeout: 5000 });
  figma.closePlugin();
});
