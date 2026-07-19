const display = document.querySelector('.display');
const keys = document.querySelector('.keys');

let current = '0';
let previous = null;
let operator = null;
let resetNext = false;

function updateDisplay(){
  display.value = current;
}

function inputDigit(d){
  if (resetNext) {
    current = d;
    resetNext = false;
  } else {
    current = current === '0' ? d : current + d;
  }
}

function inputDot(){
  if (resetNext) {
    current = '0.';
    resetNext = false;
    return;
  }
  if (!current.includes('.')) current += '.';
}

function clearAll(){
  current = '0';
  previous = null;
  operator = null;
  resetNext = false;
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
  current = String(result);
  operator = null;
  previous = null;
  resetNext = true;
}

keys.addEventListener('click', (e) => {
  const t = e.target;
  if (!t.matches('button')) return;

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

  // operators: + - * /
  if (['+','-','*','/'].includes(action)) {
    handleOperator(action);
    updateDisplay();
  }
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); updateDisplay(); return; }
  if (e.key === '.') { inputDot(); updateDisplay(); return; }
  if (e.key === 'Enter' || e.key === '=') { compute(); updateDisplay(); return; }
  if (e.key === 'Backspace') { backspace(); updateDisplay(); return; }
  if (e.key === 'Escape' || e.key.toLowerCase() === 'c') { clearAll(); updateDisplay(); return; }
  if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') { handleOperator(e.key); updateDisplay(); return; }
});

// initialize
updateDisplay();
