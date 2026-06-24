// ─── Utilidades ───────────────────────────────────────────────
function fmt(n) {
  if (isNaN(n) || !isFinite(n)) return 'Error';
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.00001 && n !== 0)) return n.toExponential(4);
  return parseFloat(n.toFixed(8)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}
function get(id) { return document.getElementById(id); }
function val(id) { return parseFloat(get(id)?.value); }
function set(id, html) { const el = get(id); if (el) el.innerHTML = html; }
function setTxt(id, txt) { const el = get(id); if (el) el.textContent = txt; }

// ─── Calculadora básica ───────────────────────────────────────
let cs = { v: '0', expr: '', op: null, newN: true };

function calcNum(d) {
  if (cs.newN) { cs.v = d; cs.newN = false; }
  else cs.v = cs.v === '0' ? d : cs.v + d;
  setTxt('calc-val', cs.v);
}
function calcDot() {
  if (!cs.v.includes('.')) { cs.v += '.'; cs.newN = false; }
  setTxt('calc-val', cs.v);
}
function calcAc() { cs = { v: '0', expr: '', op: null, newN: true }; setTxt('calc-val', '0'); setTxt('calc-expr', ''); }
function calcOp(o) {
  if (o === '+/-') { cs.v = String(-(parseFloat(cs.v)||0)); setTxt('calc-val', cs.v); return; }
  if (o === '%') { cs.v = String(parseFloat(cs.v)/100); setTxt('calc-val', cs.v); return; }
  calcEq();
  cs.op = o; cs.expr = cs.v + ' ' + o; cs.newN = true;
  setTxt('calc-expr', cs.expr);
}
function calcEq() {
  if (!cs.op) return;
  const a = parseFloat(cs.expr), b = parseFloat(cs.v);
  const ops = { '+': a+b, '−': a-b, '×': a*b, '÷': b!==0?a/b:'Error' };
  const r = ops[cs.op];
  cs = { v: typeof r==='number'?String(parseFloat(r.toFixed(10))):String(r), expr:'', op:null, newN:true };
  setTxt('calc-val', cs.v);
  setTxt('calc-expr', '');
}

// ─── IMC ──────────────────────────────────────────────────────
function calcIMC() {
  const peso = val('imc-peso'), altura = val('imc-altura');
  const res = get('imc-res'), marker = get('imc-marker');
  if (!peso || !altura || !res) return;
  const h = altura / 100, imc = peso / (h * h);
  const cats = [
    { max:18.5, label:'Bajo peso', color:'#3B82F6' },
    { max:25,   label:'Peso normal ✓', color:'#22C55E' },
    { max:30,   label:'Sobrepeso', color:'#EAB308' },
    { max:35,   label:'Obesidad I', color:'#EF4444' },
    { max:Infinity, label:'Obesidad II-III', color:'#7C3AED' }
  ];
  const cat = cats.find(c => imc < c.max);
  res.innerHTML = `<span style="color:${cat.color}">${imc.toFixed(1)} — ${cat.label}</span>`;
  if (marker) marker.style.left = Math.min(Math.max((imc-10)/40*100,0),100)+'%';
}

// ─── Calorías ─────────────────────────────────────────────────
function calcCal() {
  const p = val('cal-peso'), a = val('cal-altura'), e = val('cal-edad');
  const sexo = get('cal-sexo')?.value, act = parseFloat(get('cal-act')?.value);
  if (!p||!a||!e) return;
  const tmb = sexo==='h' ? 88.362+13.397*p+4.799*a-5.677*e : 447.593+9.247*p+3.098*a-4.33*e;
  const total = Math.round(tmb*act);
  set('cal-res', `${total.toLocaleString()} kcal/día<small>TMB base: ${Math.round(tmb).toLocaleString()} kcal</small>`);
}

// ─── Agua ─────────────────────────────────────────────────────
function calcAgua() {
  const p = val('agua-peso'), ej = val('agua-ej') || 0;
  if (!p) return;
  const base = p * 0.035, extra = ej / 60 * 0.5;
  set('agua-res', `${fmt(base+extra)} L/día<small>Base: ${fmt(base)} L + ejercicio: ${fmt(extra)} L</small>`);
}

// ─── Frecuencia cardíaca ───────────────────────────────────────
function calcFC() {
  const edad = val('fc-edad'), repo = val('fc-repo') || 60;
  if (!edad) return;
  const max = 220 - edad;
  const z1 = Math.round(repo + (max-repo)*0.5), z2 = Math.round(repo + (max-repo)*0.85);
  set('fc-res', `FC máxima: ${max} lpm<small>Zona aeróbica: ${z1}–${z2} lpm</small>`);
}

// ─── Conversores genéricos ────────────────────────────────────
const LONG  = { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, ft:0.3048, in:0.0254 };
const PESO  = { kg:1, g:0.001, mg:0.000001, t:1000, lb:0.453592, oz:0.0283495 };
const VOL   = { L:1, mL:0.001, cL:0.01, m3:1000, gal:3.78541, floz:0.0295735 };
const VEL   = { kmh:1/3.6, ms:1, mph:0.44704, kn:0.514444 };
const DATA  = { B:1, KB:1024, MB:1024**2, GB:1024**3, TB:1024**4 };

function convGeneric(vId, fId, tId, rId, table) {
  const v = val(vId), f = get(fId)?.value, t = get(tId)?.value;
  if (isNaN(v)) { setTxt(rId, 'Introduce un valor'); return; }
  set(rId, `${fmt(v * table[f] / table[t])} ${t}`);
}

function convLong()  { convGeneric('long-val','long-from','long-to','long-res',LONG); }
function convPeso()  { convGeneric('peso-val','peso-from','peso-to','peso-res',PESO); }
function convVol()   { convGeneric('vol-val','vol-from','vol-to','vol-res',VOL); }
function convVel()   { convGeneric('vel-val','vel-from','vel-to','vel-res',VEL); }
function convData()  { convGeneric('data-val','data-from','data-to','data-res',DATA); }

// ─── Temperatura ──────────────────────────────────────────────
function convTemp() {
  const v = val('temp-val'), f = get('temp-from')?.value;
  if (isNaN(v)) return;
  const toC = f==='C'?v : f==='F'?(v-32)*5/9 : v-273.15;
  const lines = [];
  if (f!=='C') lines.push(`${fmt(toC)} °C`);
  if (f!=='F') lines.push(`${fmt(toC*9/5+32)} °F`);
  if (f!=='K') lines.push(`${fmt(toC+273.15)} K`);
  setTxt('temp-res', lines.join('   ·   '));
}

// ─── Propina ──────────────────────────────────────────────────
function calcPropina() {
  const total = val('prop-total'), pct = parseFloat(get('prop-pct')?.value||10), personas = parseInt(get('prop-personas')?.value)||1;
  if (isNaN(total)) return;
  const propina = total*pct/100, totalFinal = total+propina;
  const perPer = personas>1 ? `<small>Por persona: ${fmt(totalFinal/personas)} €</small>` : '';
  set('prop-res', `Propina: <b>${fmt(propina)} €</b>  ·  Total: <b>${fmt(totalFinal)} €</b>${perPer}`);
}

// ─── Porcentaje ───────────────────────────────────────────────
function calcPct() {
  const v = val('pct-val'), p = val('pct-pct');
  if (isNaN(v)||isNaN(p)) return;
  set('pct-res', `${fmt(v*p/100)}<small>${p}% de ${v}</small>`);
}
function calcPct2() {
  const x = val('pct2-x'), y = val('pct2-y');
  if (isNaN(x)||isNaN(y)||y===0) return;
  set('pct2-res', `${fmt(x/y*100)}%<small>${x} es el ${fmt(x/y*100)}% de ${y}</small>`);
}

// ─── Divisas ──────────────────────────────────────────────────
const FX = { EUR:1, USD:1.08, GBP:0.86, JPY:163, CHF:0.97, MXN:18.5, ARS:980 };
function convMoneda() {
  const v = val('mon-val'), f = get('mon-from')?.value, t = get('mon-to')?.value;
  if (isNaN(v)) return;
  const res = v/FX[f]*FX[t];
  set('mon-res', `${fmt(res)} ${t}<small>1 ${f} ≈ ${fmt(FX[t]/FX[f])} ${t} (aprox.)</small>`);
}

// ─── Interés compuesto ────────────────────────────────────────
function calcIC() {
  const c=val('ic-capital'), tasa=val('ic-tasa'), anos=val('ic-anos'), aport=val('ic-aport')||0;
  if (!c||!tasa||!anos) return;
  const r=tasa/100/12, n=anos*12;
  const futuro = c*Math.pow(1+r,n) + aport*(Math.pow(1+r,n)-1)/r;
  const inv = c + aport*n;
  set('ic-res', `${fmt(futuro)} €<small>Invertido: ${fmt(inv)} € · Ganancia: ${fmt(futuro-inv)} €</small>`);
}

// ─── Hipoteca ─────────────────────────────────────────────────
function calcHipo() {
  const m=val('hip-monto'), t=val('hip-tasa'), a=val('hip-anos');
  if (!m||!t||!a) return;
  const r=t/100/12, n=a*12;
  const cuota = m*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  const totalPag = cuota*n;
  set('hip-res', `${fmt(cuota)} €/mes<small>Total pagado: ${fmt(totalPag)} € · Intereses: ${fmt(totalPag-m)} €</small>`);
}

// ─── IVA ──────────────────────────────────────────────────────
function calcIVA() {
  const v=val('iva-val'), pct=parseFloat(get('iva-pct')?.value), tipo=get('iva-tipo')?.value;
  if (isNaN(v)) return;
  if (tipo==='sin') {
    const iva=v*pct/100;
    set('iva-res', `Total con IVA: ${fmt(v+iva)} €<small>IVA (${pct}%): ${fmt(iva)} €</small>`);
  } else {
    const base=v/(1+pct/100);
    set('iva-res', `Base imponible: ${fmt(base)} €<small>IVA (${pct}%): ${fmt(v-base)} €</small>`);
  }
}
