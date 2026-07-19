// Enhanced calculator logic with formatting, precision control, theme toggle, and better UX
const display = document.querySelector('.display');
const prevDisplay = document.querySelector('.previous');
const keys = document.querySelector('.pad');
const themeToggle = document.getElementById('themeToggle');

let current = '0';
let previous = null;
let operator = null;
let resetNext = false;
let lastResult = null;

const MAX_LENGTH = 18;
const PRECISION = 12; // max decimal places

function updateDisplay(){
  // Clamp length for UI
  if (String(current).length > MAX_LENGTH) {
    display.value = Number(current).toExponential(6);
  } else {
    display.value = current;
  }
  prevDisplay.textContent = previous && operator ? `${previous} ${operator}` : '';
}

function sanitizeNumberStr(s){
  // remove leading zeros except when '0.'
  if (/^0[0-9]+/.test(s) && !s.startsWith('0.')) {
    return s.replace(/^0+/, '') || '0';
  }
  return s;
}

function inputDigit(d){
  if (resetNext) {
    current = d;
    resetNext = false;
  } else {
    if (current === '0') current = d;
    else if (current.length < MAX_LENGTH) current += d;
  }
  current = sanitizeNumberStr(current);
}

function inputDot(){
  if (resetNext) { current = '0.'; resetNext = false; return; }
  if (!current.includes('.')) current += '.';
}

function clearAll(){
  current = '0'; previous = null; operator = null; resetNext = false; lastResult = null;
}

function backspace(){
  if (resetNext) return;
  if (current.length > 1) current = current.slice(0, -1);
  else current = '0';
}

function toggleSign(){
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
}

function handleOperator(nextOp){
  if (operator && !resetNext) {
    compute();
  }
  previous = current;
  operator = nextOp;
  resetNext = true;
}

function roundSafe(n){
  // Round to PRECISION decimals, avoid floating imprecision
  if (typeof n !== 'number' || !isFinite(n)) return n;
  const factor = Math.pow(10, PRECISION);
  return Math.round(n * factor) / factor;
}

function compute(){
  if (!operator || previous == null) return;
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;

  if (operator === '+') result = a + b;
  else if (operator === '-') result = a - b;
  else if (operator === '*') result = a * b;
  else if (operator === '/') {
    if (b === 0) {
      result = 'Error';
    } else {
      result = a / b;
    }
  }

  if (typeof result === 'number') result = roundSafe(result);
  current = String(result);
  lastResult = current;
  operator = null;
  previous = null;
  resetNext = true;
}

// Event delegation on pad
keys.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;

  if (t.dataset.digit) {
    inputDigit(t.dataset.digit);
    updateDisplay();
    return;
  }

  const action = t.dataset.action;
  if (!action) return;

  if (action === '.') { inputDot(); updateDisplay(); return; }
  if (action === 'clear') { clearAll(); updateDisplay(); return; }
  if (action === 'back') { backspace(); updateDisplay(); return; }
  if (action === 'plusminus') { toggleSign(); updateDisplay(); return; }
  if (action === '=') { compute(); updateDisplay(); return; }

  if (['+','-','*','/'].includes(action)) { handleOperator(action); updateDisplay(); }
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (e.repeat) return; // ignore held-down repeats
  if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); updateDisplay(); return; }
  if (e.key === '.') { inputDot(); updateDisplay(); return; }
  if (e.key === 'Enter' || e.key === '=') { compute(); updateDisplay(); return; }
  if (e.key === 'Backspace') { backspace(); updateDisplay(); return; }
  if (e.key === 'Escape' || e.key.toLowerCase() === 'c') { clearAll(); updateDisplay(); return; }
  if (['+','-','*','/'].includes(e.key)) { handleOperator(e.key); updateDisplay(); return; }
});

// Theme toggle (persisted)
function applyTheme(theme){
  if (theme === 'light') document.body.classList.add('light');
  else document.body.classList.remove('light');
  themeToggle.textContent = theme === 'light' ? '🌞' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const currentTheme = localStorage.getItem('calc-theme') || 'dark';
  const next = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('calc-theme', next);
  applyTheme(next);
});

// Init
(function init(){
  const saved = localStorage.getItem('calc-theme') || 'dark';
  applyTheme(saved);
  updateDisplay();
})();
