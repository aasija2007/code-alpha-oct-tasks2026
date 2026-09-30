/**
 * CalcPro - UI & Interactive Renderer Module
 * Handles DOM rendering, state management, keyboard listeners, Web Audio synth & event handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- STATE ---
  let expression = '';
  let lastResult = null;
  let undoStack = [''];
  let redoStack = [];
  let isEvaluated = false;
  let audioCtx = null;

  // DOM Elements
  const elExpression = document.getElementById('expressionLine');
  const elResult = document.getElementById('mainResultLine');
  const elMemoryBadge = document.getElementById('memoryBadge');
  const elBracketBadge = document.getElementById('bracketBadge');
  const elDegRadBtn = document.getElementById('degRadToggle');
  const elHistoryList = document.getElementById('historyList');
  const elCalcCard = document.getElementById('calcCard');
  const elToast = document.getElementById('toast');
  const elModalSettings = document.getElementById('modalSettings');
  const elModalHelp = document.getElementById('modalHelp');
  
  // Tabs
  const tabCalc = document.getElementById('tabCalc');
  const tabConverter = document.getElementById('tabConverter');
  const viewCalc = document.getElementById('viewCalculator');
  const viewConverter = document.getElementById('viewConverter');

  // Load Settings
  let settings = StorageManager.getSettings();
  applySettings(settings);

  // Initialize Memory & History Display
  updateMemoryBadge();
  renderHistory();
  updateDisplay();

  // --- AUDIO SYNTHESIZER FOR CLICK SOUND ---
  function playClickSound() {
    if (!settings.soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.035);
    } catch (e) {
      // AudioContext not allowed or failed
    }
  }

  // --- HAPTICS ---
  function triggerHaptic() {
    if (!settings.hapticEnabled) return;
    if (navigator.vibrate) {
      navigator.vibrate(12);
    }
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message) {
    if (!elToast) return;
    elToast.querySelector('.toast-msg').textContent = message;
    elToast.classList.add('show');
    setTimeout(() => {
      elToast.classList.remove('show');
    }, 2200);
  }

  // --- STATE HISTORY (UNDO / REDO) ---
  function saveState() {
    if (undoStack[undoStack.length - 1] !== expression) {
      undoStack.push(expression);
      if (undoStack.length > 30) undoStack.shift();
      redoStack = [];
    }
  }

  function undo() {
    if (undoStack.length > 1) {
      redoStack.push(undoStack.pop());
      expression = undoStack[undoStack.length - 1];
      isEvaluated = false;
      updateDisplay();
    }
  }

  function redo() {
    if (redoStack.length > 0) {
      const state = redoStack.pop();
      undoStack.push(state);
      expression = state;
      isEvaluated = false;
      updateDisplay();
    }
  }

  // --- DISPLAY & EVALUATION ---
  function updateDisplay() {
    // Check Parentheses balance
    const parenInfo = CalculatorEngine.inspectParentheses(expression);
    if (parenInfo.diff > 0) {
      elBracketBadge.style.display = 'inline-block';
      elBracketBadge.textContent = `${parenInfo.diff} ( unclosed`;
    } else {
      elBracketBadge.style.display = 'none';
    }

    elExpression.textContent = expression || ' ';

    // Real-time Preview Calculation
    if (!expression) {
      elResult.textContent = '0';
      elResult.classList.remove('error');
      autoScaleResultFont();
      return;
    }

    const evalRes = CalculatorEngine.evaluate(expression, { angleMode: settings.angleMode });

    if (isEvaluated) {
      if (evalRes.success) {
        elResult.textContent = evalRes.formatted;
        elResult.classList.remove('error');
      } else {
        elResult.textContent = evalRes.error;
        elResult.classList.add('error');
      }
    } else {
      // Live Preview Mode
      if (evalRes.success) {
        elResult.textContent = evalRes.formatted;
        elResult.classList.remove('error');
      } else {
        // Keep previous valid preview or empty
        if (!elResult.classList.contains('error')) {
          // Keep current preview unless explicit error
        }
      }
    }

    autoScaleResultFont();
  }

  function autoScaleResultFont() {
    const len = elResult.textContent.length;
    if (len > 15) {
      elResult.style.fontSize = '1.3rem';
    } else if (len > 10) {
      elResult.style.fontSize = '1.75rem';
    } else {
      elResult.style.fontSize = '2.25rem';
    }
  }

  // --- INPUT HANDLING RULES ---
  function handleInput(val) {
    playClickSound();
    triggerHaptic();

    // If typing after evaluation:
    if (isEvaluated) {
      if ('+×÷^%'.includes(val) || val === '*') {
        // Continue expression with last result
        expression = lastResult !== null ? String(lastResult) : '0';
      } else if (/\d|\.|sin|cos|tan|log|ln|√|\(/.test(val)) {
        // Start fresh
        expression = '';
      }
      isEvaluated = false;
    }

    // Input validations & sanitization
    const lastChar = expression.slice(-1);

    // Prevent multiple decimals in single number token
    if (val === '.') {
      const tokens = expression.split(/[\+\-×÷\*\/%\^\(\)]/);
      const currentNumber = tokens[tokens.length - 1];
      if (currentNumber.includes('.')) return;
      if (!currentNumber) val = '0.';
    }

    // Handle Operators replacement
    const isOp = (char) => ['+', '-', '×', '÷', '*', '/', '^', '%'].includes(char);
    if (isOp(val)) {
      // Map standard keyboard symbols
      if (val === '*') val = '×';
      if (val === '/') val = '÷';

      if (isOp(lastChar)) {
        // Allow unary minus after operator, e.g. 5 × -
        if (val === '-' && lastChar !== '-') {
          expression += val;
          saveState();
          updateDisplay();
          return;
        }
        // Replace previous operator
        expression = expression.slice(0, -1) + val;
        saveState();
        updateDisplay();
        return;
      }
    }

    expression += val;
    saveState();
    updateDisplay();
  }

  function handleEvaluate() {
    if (!expression) return;
    playClickSound();
    triggerHaptic();

    // Automatically auto-close open brackets if any
    const parenInfo = CalculatorEngine.inspectParentheses(expression);
    if (parenInfo.diff > 0) {
      expression += ')'.repeat(parenInfo.diff);
    }

    const res = CalculatorEngine.evaluate(expression, { angleMode: settings.angleMode });
    isEvaluated = true;

    if (res.success) {
      lastResult = res.result;
      elResult.textContent = res.formatted;
      elResult.classList.remove('error');
      // Save to History
      StorageManager.addHistory(expression, res.result, res.formatted);
      renderHistory();
    } else {
      lastResult = null;
      elResult.textContent = res.error;
      elResult.classList.add('error');
    }
    updateDisplay();
  }

  function handleClearAll() {
    playClickSound();
    expression = '';
    lastResult = null;
    isEvaluated = false;
    saveState();
    updateDisplay();
  }

  function handleBackspace() {
    playClickSound();
    if (!expression) return;
    if (isEvaluated) {
      handleClearAll();
      return;
    }
    
    // Check if deleting a multi-char function name like "sin(", "cos(", "sqrt("
    const funcMatch = expression.match(/(sin|cos|tan|asin|acos|atan|log|ln|sqrt)\($/);
    if (funcMatch) {
      expression = expression.substring(0, expression.length - funcMatch[0].length);
    } else {
      expression = expression.slice(0, -1);
    }
    saveState();
    updateDisplay();
  }

  function handleClearEntry() {
    playClickSound();
    // Clear last number or token segment
    const match = expression.match(/(\d+(\.\d+)?|[a-zA-Z]+\(?|[\+\-×÷\^%])$/);
    if (match) {
      expression = expression.substring(0, expression.length - match[0].length);
    } else {
      expression = '';
    }
    saveState();
    updateDisplay();
  }

  // --- MEMORY FUNCTIONS ---
  function updateMemoryBadge() {
    const memVal = StorageManager.getMemory();
    if (memVal !== 0) {
      elMemoryBadge.style.display = 'inline-block';
      elMemoryBadge.textContent = `M (${CalculatorEngine.formatNumber(memVal)})`;
    } else {
      elMemoryBadge.style.display = 'none';
    }
  }

  function handleMemory(action) {
    playClickSound();
    triggerHaptic();

    const currentEval = CalculatorEngine.evaluate(expression, { angleMode: settings.angleMode });
    const currentVal = currentEval.success ? currentEval.result : 0;

    switch (action) {
      case 'MC':
        StorageManager.clearMemory();
        showToast('Memory Cleared');
        break;
      case 'MR':
        const memVal = StorageManager.getMemory();
        handleInput(String(memVal));
        showToast(`Memory Recalled: ${memVal}`);
        break;
      case 'M+':
        StorageManager.addToMemory(currentVal);
        showToast(`Added to Memory (+${currentVal})`);
        break;
      case 'M-':
        StorageManager.subtractFromMemory(currentVal);
        showToast(`Subtracted from Memory (-${currentVal})`);
        break;
      case 'MS':
        StorageManager.setMemory(currentVal);
        showToast(`Memory Stored: ${currentVal}`);
        break;
    }
    updateMemoryBadge();
  }

  // --- HISTORY PANEL RENDER ---
  function renderHistory() {
    if (!elHistoryList) return;
    const history = StorageManager.getHistory();
    elHistoryList.innerHTML = '';

    if (history.length === 0) {
      elHistoryList.innerHTML = '<div class="history-empty">No calculations yet</div>';
      return;
    }

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-item-expr">${item.expression} =</div>
        <div class="history-item-res">${item.formatted}</div>
        <div class="history-item-time">${item.timestamp}</div>
      `;
      div.addEventListener('click', () => {
        expression = item.expression;
        isEvaluated = false;
        updateDisplay();
        playClickSound();
        showToast('Expression restored from history');
      });
      elHistoryList.appendChild(div);
    });
  }

  // --- RIPPLE ANIMATION ON BUTTON CLICK ---
  function createRipple(e) {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = btn.getElementsByClassName('ripple')[0];
    if (ripple) ripple.remove();

    btn.appendChild(circle);
  }

  // --- EVENT DELEGATION FOR KEYPAD BUTTONS ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.calc-btn');
    if (!btn) return;

    createRipple(e);

    const val = btn.dataset.val;
    const action = btn.dataset.action;

    if (val !== undefined) {
      handleInput(val);
    } else if (action) {
      switch (action) {
        case 'equals': handleEvaluate(); break;
        case 'clear-all': handleClearAll(); break;
        case 'backspace': handleBackspace(); break;
        case 'clear-entry': handleClearEntry(); break;
        case 'toggle-sign':
          if (expression) {
            if (expression.startsWith('-')) expression = expression.slice(1);
            else expression = '-' + expression;
            updateDisplay();
          }
          break;
        case 'sci-toggle':
          elCalcCard.classList.toggle('expanded');
          break;
        case 'deg-rad':
          settings.angleMode = settings.angleMode === 'DEG' ? 'RAD' : 'DEG';
          StorageManager.saveSettings(settings);
          elDegRadBtn.textContent = settings.angleMode;
          updateDisplay();
          break;
        case 'mc': handleMemory('MC'); break;
        case 'mr': handleMemory('MR'); break;
        case 'm-plus': handleMemory('M+'); break;
        case 'm-minus': handleMemory('M-'); break;
        case 'sqr': handleInput('^2'); break;
        case 'recip': handleInput('recip('); break;
      }
    }
  });

  // --- KEYBOARD SUPPORT ---
  window.addEventListener('keydown', (e) => {
    // Ignore if typing in input fields
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    const key = e.key;

    // Undo / Redo
    if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
      return;
    }

    // Help modal
    if (key === '?') {
      e.preventDefault();
      openModal(elModalHelp);
      return;
    }

    // Key mapping to UI buttons for press animation
    let targetBtn = null;

    if (/\d/.test(key)) {
      handleInput(key);
      targetBtn = document.querySelector(`[data-val="${key}"]`);
    } else if (key === '.') {
      handleInput('.');
      targetBtn = document.querySelector('[data-val="."]');
    } else if (key === '+') {
      handleInput('+');
      targetBtn = document.querySelector('[data-val="+"]');
    } else if (key === '-') {
      handleInput('-');
      targetBtn = document.querySelector('[data-val="-"]');
    } else if (key === '*') {
      handleInput('×');
      targetBtn = document.querySelector('[data-val="×"]');
    } else if (key === '/') {
      e.preventDefault();
      handleInput('÷');
      targetBtn = document.querySelector('[data-val="÷"]');
    } else if (key === '%') {
      handleInput('%');
      targetBtn = document.querySelector('[data-val="%"]');
    } else if (key === '(' || key === ')') {
      handleInput(key);
      targetBtn = document.querySelector(`[data-val="${key}"]`);
    } else if (key === '^') {
      handleInput('^');
      targetBtn = document.querySelector('[data-val="^"]');
    } else if (key === '!') {
      handleInput('!');
      targetBtn = document.querySelector('[data-val="!"]');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleEvaluate();
      targetBtn = document.querySelector('[data-action="equals"]');
    } else if (key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      targetBtn = document.querySelector('[data-action="backspace"]');
    } else if (key === 'Escape') {
      e.preventDefault();
      handleClearAll();
      targetBtn = document.querySelector('[data-action="clear-all"]');
    }

    if (targetBtn) {
      targetBtn.classList.add('btn-pressed');
      setTimeout(() => targetBtn.classList.remove('btn-pressed'), 150);
    }
  });

  // --- PASTE EVENT SUPPORT ---
  window.addEventListener('paste', (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (pastedText) {
      e.preventDefault();
      // Sanitize pasted expression
      const sanitized = pastedText
        .replace(/[*]/g, '×')
        .replace(/[/]/g, '÷')
        .replace(/[-]/g, '-')
        .replace(/[^0-9\.\+\-×÷\^%\(\)\!a-zA-Z]/g, '');

      if (sanitized) {
        expression += sanitized;
        saveState();
        updateDisplay();
        showToast('Pasted expression');
      }
    }
  });

  // --- COPY TO CLIPBOARD ---
  document.getElementById('displayContainer').addEventListener('click', () => {
    const textToCopy = elResult.textContent;
    if (textToCopy && textToCopy !== 'Error' && textToCopy !== '0') {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied "${textToCopy}" to clipboard`);
      }).catch(() => {
        showToast('Failed to copy');
      });
    }
  });

  // --- TAB SWITCHER (Calculator vs Converter) ---
  tabCalc.addEventListener('click', () => {
    tabCalc.classList.add('active');
    tabConverter.classList.remove('active');
    viewCalc.style.display = 'flex';
    viewConverter.classList.remove('active');
  });

  tabConverter.addEventListener('click', () => {
    tabConverter.classList.add('active');
    tabCalc.classList.remove('active');
    viewCalc.style.display = 'none';
    viewConverter.classList.add('active');
    initConverterUI();
  });

  // --- CONVERTER TAB LOGIC ---
  function initConverterUI() {
    const catSelect = document.getElementById('converterCategory');
    const fromSelect = document.getElementById('converterFromUnit');
    const toSelect = document.getElementById('converterToUnit');
    const inputFrom = document.getElementById('converterInputFrom');
    const inputTo = document.getElementById('converterInputTo');
    const swapBtn = document.getElementById('converterSwap');

    if (catSelect.children.length === 0) {
      // Populate categories
      const categories = ConverterEngine.getCategories();
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        catSelect.appendChild(opt);
      });

      function updateUnits() {
        const cat = catSelect.value;
        const units = ConverterEngine.getUnits(cat);
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        units.forEach(u => {
          fromSelect.add(new Option(u.name, u.key));
          toSelect.add(new Option(u.name, u.key));
        });

        if (units.length > 1) {
          toSelect.selectedIndex = 1;
        }
        doConversion();
      }

      function doConversion() {
        const val = parseFloat(inputFrom.value) || 0;
        const result = ConverterEngine.convert(catSelect.value, val, fromSelect.value, toSelect.value);
        inputTo.value = result;
      }

      catSelect.addEventListener('change', updateUnits);
      fromSelect.addEventListener('change', doConversion);
      toSelect.addEventListener('change', doConversion);
      inputFrom.addEventListener('input', doConversion);

      swapBtn.addEventListener('click', () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        doConversion();
      });

      updateUnits();
    }
  }

  // --- SETTINGS & THEMES ---
  function applySettings(newSettings) {
    settings = newSettings;
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-accent', settings.accent);
    if (elDegRadBtn) elDegRadBtn.textContent = settings.angleMode;

    const themeToggle = document.getElementById('themeToggleBtn');
    if (themeToggle) {
      themeToggle.textContent = settings.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // Modal open/close helpers
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }
  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  document.getElementById('btnOpenSettings')?.addEventListener('click', () => openModal(elModalSettings));
  document.getElementById('btnOpenHelp')?.addEventListener('click', () => openModal(elModalHelp));
  document.getElementById('btnClearHistory')?.addEventListener('click', () => {
    StorageManager.clearHistory();
    renderHistory();
    showToast('History cleared');
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      closeModal(e.target.closest('.modal-overlay'));
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Settings Toggles
  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    StorageManager.saveSettings(settings);
    applySettings(settings);
  });

  document.getElementById('toggleSound')?.addEventListener('change', (e) => {
    settings.soundEnabled = e.target.checked;
    StorageManager.saveSettings(settings);
  });

  document.getElementById('toggleHaptic')?.addEventListener('change', (e) => {
    settings.hapticEnabled = e.target.checked;
    StorageManager.saveSettings(settings);
  });

  // Accent picker
  document.querySelectorAll('.accent-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      settings.accent = dot.dataset.accent;
      StorageManager.saveSettings(settings);
      applySettings(settings);
    });
  });
});
