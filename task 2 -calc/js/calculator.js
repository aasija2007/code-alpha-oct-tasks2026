/**
 * CalcPro - Smart Calculator Engine
 * Safe Expression Evaluator using Tokenization & Shunting-Yard Algorithm
 * Pure JavaScript logic - NO eval() or new Function()
 */

const CalculatorEngine = (function () {
  'use strict';

  // Constants
  const CONSTANTS = {
    'π': Math.PI,
    'pi': Math.PI,
    'e': Math.E
  };

  // Operator Precedence and Associativity
  const OPERATORS = {
    '+': { precedence: 1, associativity: 'L', unary: false },
    '-': { precedence: 1, associativity: 'L', unary: false },
    'u-': { precedence: 4, associativity: 'R', unary: true }, // Unary minus
    'u+': { precedence: 4, associativity: 'R', unary: true }, // Unary plus
    '*': { precedence: 2, associativity: 'L', unary: false },
    '×': { precedence: 2, associativity: 'L', unary: false },
    '/': { precedence: 2, associativity: 'L', unary: false },
    '÷': { precedence: 2, associativity: 'L', unary: false },
    '%': { precedence: 2, associativity: 'L', unary: false }, // Modulo or percent
    '^': { precedence: 3, associativity: 'R', unary: false },
    '!': { precedence: 4, associativity: 'L', unary: true, postfix: true } // Postfix factorial
  };

  // Supported Math Functions
  const FUNCTIONS = [
    'sin', 'cos', 'tan',
    'asin', 'acos', 'atan',
    'log', 'ln', 'sqrt', '√',
    'abs', 'sqr', 'recip'
  ];

  /**
   * Fix floating point precision artifacts (e.g. 0.1 + 0.2 = 0.3)
   */
  function fixPrecision(val) {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      return val;
    }
    // High precision rounding for floating point issues
    const precision = 12;
    const factor = Math.pow(10, precision);
    const rounded = Math.round((val + Number.EPSILON) * factor) / factor;
    
    // Check if it's practically an integer
    if (Math.abs(rounded - Math.round(rounded)) < 1e-11) {
      return Math.round(rounded);
    }
    return rounded;
  }

  /**
   * Calculate Factorial (n!)
   */
  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (!Number.isInteger(n)) {
      // Lanczos approximation for Gamma function (factorial of decimal)
      return gamma(n + 1);
    }
    if (n > 170) return Infinity; // Overflow boundary for JS numbers
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
    }
    return res;
  }

  /**
   * Gamma function approximation for non-integer factorials
   */
  function gamma(z) {
    const g = 7;
    const p = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }
    z -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) {
      x += p[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  /**
   * Format number for display with commas and scientific notation fallback
   */
  function formatNumber(num, options = {}) {
    if (typeof num !== 'number' || isNaN(num)) return 'Error';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    const maxDecimals = options.maxDecimals !== undefined ? options.maxDecimals : 8;
    const absVal = Math.abs(num);

    // Exponential notation for extreme sizes
    if ((absVal >= 1e12 || (absVal < 1e-6 && absVal > 0)) && !options.plain) {
      return num.toExponential(6).replace('e+', 'e');
    }

    const fixed = fixPrecision(num);
    const str = fixed.toString();
    const parts = str.split('.');

    // Format integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts[1]) {
      // Limit decimal places
      parts[1] = parts[1].substring(0, maxDecimals);
      return parts.join('.');
    }
    return parts[0];
  }

  /**
   * Tokenize input math expression string
   */
  function tokenize(expression) {
    const tokens = [];
    let i = 0;
    const str = expression.replace(/\s+/g, ''); // Remove whitespace

    while (i < str.length) {
      const char = str[i];

      // Number matching (including decimals)
      if (/\d|\./.test(char)) {
        let numStr = '';
        while (i < str.length && (/\d|\./.test(str[i]))) {
          numStr += str[i];
          i++;
        }
        // Validate single decimal point per number
        if ((numStr.match(/\./g) || []).length > 1) {
          throw new Error(`Invalid number format: "${numStr}"`);
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        continue;
      }

      // Constants
      if (char === 'π' || (char === 'e' && !/[a-zA-Z]/.test(str[i+1] || ''))) {
        tokens.push({ type: 'NUMBER', value: CONSTANTS[char] });
        i++;
        continue;
      }

      // Check for multi-character functions (sin, cos, tan, log, ln, sqrt, etc.)
      let matchedFunc = false;
      for (const fn of FUNCTIONS) {
        if (str.substr(i, fn.length).toLowerCase() === fn) {
          tokens.push({ type: 'FUNCTION', value: fn.toLowerCase() });
          i += fn.length;
          matchedFunc = true;
          break;
        }
      }
      if (matchedFunc) continue;

      // Operators and Parentheses
      if ('+-*×/÷%^!()'.includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      // Unknown character
      throw new Error(`Invalid character in expression: "${char}"`);
    }

    // Process unary operators and implicit multiplication
    return processTokens(tokens);
  }

  /**
   * Differentiate unary vs binary operators & insert implicit multiplication
   * e.g., 5(2+3) -> 5 * (2+3), 2π -> 2 * π, -5 -> u- 5
   */
  function processTokens(rawTokens) {
    const processed = [];

    for (let i = 0; i < rawTokens.length; i++) {
      const current = rawTokens[i];
      const prev = processed[processed.length - 1];

      // Detect implicit multiplication:
      // NUMBER '(' -> NUMBER '*' '('
      // NUMBER FUNCTION -> NUMBER '*' FUNCTION
      // ')' '(' -> ')' '*' '('
      // ')' NUMBER -> ')' '*' NUMBER
      // ')' FUNCTION -> ')' '*' FUNCTION
      // '!' NUMBER/FUNCTION/'(' -> '!' '*' ...
      if (prev) {
        const isPrevVal = prev.type === 'NUMBER' || (prev.type === 'OPERATOR' && (prev.value === ')' || prev.value === '!'));
        const isCurrVal = current.type === 'NUMBER' || current.type === 'FUNCTION' || (current.type === 'OPERATOR' && current.value === '(');

        if (isPrevVal && isCurrVal) {
          processed.push({ type: 'OPERATOR', value: '*' });
        }
      }

      // Detect Unary Plus / Minus
      if (current.type === 'OPERATOR' && (current.value === '+' || current.value === '-')) {
        const isUnary = !prev || 
                        (prev.type === 'OPERATOR' && prev.value !== ')' && prev.value !== '!') ||
                        prev.type === 'FUNCTION';

        if (isUnary) {
          current.value = current.value === '-' ? 'u-' : 'u+';
        }
      }

      processed.push(current);
    }

    return processed;
  }

  /**
   * Shunting-Yard Algorithm: Converts Token list to Reverse Polish Notation (RPN)
   */
  function shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'FUNCTION') {
        operatorStack.push(token);
      } else if (token.type === 'OPERATOR') {
        const op1 = token.value;

        if (op1 === '(') {
          operatorStack.push(token);
        } else if (op1 === ')') {
          let foundMatchingParen = false;
          while (operatorStack.length > 0) {
            const top = operatorStack[operatorStack.length - 1];
            if (top.type === 'OPERATOR' && top.value === '(') {
              foundMatchingParen = true;
              operatorStack.pop(); // Pop '('
              break;
            }
            outputQueue.push(operatorStack.pop());
          }
          if (!foundMatchingParen) {
            throw new Error('Mismatched parentheses: extra closing bracket ")"');
          }
          // If top of stack is a function, pop it to output queue
          if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
            outputQueue.push(operatorStack.pop());
          }
        } else {
          // Standard Operator handling
          const op1Data = OPERATORS[op1];
          if (!op1Data) {
            throw new Error(`Unknown operator: "${op1}"`);
          }

          while (operatorStack.length > 0) {
            const top = operatorStack[operatorStack.length - 1];
            if (top.type === 'OPERATOR' && top.value === '(') break;

            if (top.type === 'FUNCTION') {
              outputQueue.push(operatorStack.pop());
              continue;
            }

            const op2Data = OPERATORS[top.value];
            if (op2Data) {
              const lowerPrecedence = op1Data.associativity === 'L' 
                ? op1Data.precedence <= op2Data.precedence 
                : op1Data.precedence < op2Data.precedence;

              if (lowerPrecedence) {
                outputQueue.push(operatorStack.pop());
                continue;
              }
            }
            break;
          }
          operatorStack.push(token);
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop();
      if (top.type === 'OPERATOR' && (top.value === '(' || top.value === ')')) {
        throw new Error('Mismatched parentheses: unclosed bracket "("');
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  /**
   * Evaluate RPN (Reverse Polish Notation) Stack
   */
  function evaluateRPN(rpnQueue, options = {}) {
    const stack = [];
    const isDeg = options.angleMode !== 'RAD'; // Default to DEG

    const toRad = (angle) => isDeg ? (angle * Math.PI) / 180 : angle;
    const fromRad = (rad) => isDeg ? (rad * 180) / Math.PI : rad;

    for (const token of rpnQueue) {
      if (token.type === 'NUMBER') {
        stack.push(token.value);
      } else if (token.type === 'OPERATOR') {
        const op = token.value;
        const opData = OPERATORS[op];

        if (opData && opData.unary) {
          if (stack.length < 1) throw new Error(`Missing operand for operator "${op}"`);
          const val = stack.pop();

          if (op === 'u-') stack.push(-val);
          else if (op === 'u+') stack.push(+val);
          else if (op === '!') {
            if (val < 0) throw new Error('Factorial undefined for negative numbers');
            stack.push(factorial(val));
          }
        } else {
          // Binary Operator
          if (stack.length < 2) throw new Error(`Missing operand for operator "${op}"`);
          const b = stack.pop();
          const a = stack.pop();

          switch (op) {
            case '+': stack.push(a + b); break;
            case '-': stack.push(a - b); break;
            case '*':
            case '×': stack.push(a * b); break;
            case '/':
            case '÷':
              if (Math.abs(b) < 1e-15) {
                throw new Error('Cannot divide by zero');
              }
              stack.push(a / b);
              break;
            case '%':
              // If simple percentage operation, e.g., 50 % = 0.5 or modulo a % b
              // Standard modulo in math
              stack.push(a % b);
              break;
            case '^':
              stack.push(Math.pow(a, b));
              break;
            default:
              throw new Error(`Unsupported operator: "${op}"`);
          }
        }
      } else if (token.type === 'FUNCTION') {
        if (stack.length < 1) throw new Error(`Missing argument for function "${token.value}"`);
        const arg = stack.pop();
        const fn = token.value;

        switch (fn) {
          case 'sin': stack.push(fixPrecision(Math.sin(toRad(arg)))); break;
          case 'cos': stack.push(fixPrecision(Math.cos(toRad(arg)))); break;
          case 'tan': {
            // Check for tan(90 deg) undefined
            const rad = toRad(arg);
            if (isDeg && Math.abs((arg % 180) - 90) < 1e-10) {
              throw new Error('Tangent undefined at 90°');
            }
            stack.push(fixPrecision(Math.tan(rad)));
            break;
          }
          case 'asin': {
            if (arg < -1 || arg > 1) throw new Error('asin argument out of range [-1, 1]');
            stack.push(fixPrecision(fromRad(Math.asin(arg))));
            break;
          }
          case 'acos': {
            if (arg < -1 || arg > 1) throw new Error('acos argument out of range [-1, 1]');
            stack.push(fixPrecision(fromRad(Math.acos(arg))));
            break;
          }
          case 'atan': stack.push(fixPrecision(fromRad(Math.atan(arg)))); break;
          case 'log':
            if (arg <= 0) throw new Error('Logarithm undefined for non-positive values');
            stack.push(Math.log10(arg));
            break;
          case 'ln':
            if (arg <= 0) throw new Error('Natural log undefined for non-positive values');
            stack.push(Math.log(arg));
            break;
          case 'sqrt':
          case '√':
            if (arg < 0) throw new Error('Square root of negative number');
            stack.push(Math.sqrt(arg));
            break;
          case 'abs': stack.push(Math.abs(arg)); break;
          case 'sqr': stack.push(Math.pow(arg, 2)); break;
          case 'recip':
            if (Math.abs(arg) < 1e-15) throw new Error('Cannot divide by zero');
            stack.push(1 / arg);
            break;
          default:
            throw new Error(`Unknown function "${fn}"`);
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression structure');
    }

    return fixPrecision(stack[0]);
  }

  /**
   * Pre-process expression string for percentage syntax and UI normalized symbols
   * E.g. "100 + 10%" -> "100 + (100 * 0.1)" or "50%" -> "50 * 0.01"
   */
  function normalizeExpression(expr) {
    let normalized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/√\s*/g, 'sqrt')
      .replace(/π/g, 'π');

    // Handle trailing percentage syntax, e.g., 50% -> (50 * 0.01)
    // Or 100 + 20% -> 100 + (100 * 0.20)
    // Replace expression patterns like: (Number)(%) when preceded by + / - / * / /
    normalized = normalized.replace(/(\d+(?:\.\d+)?)\s*%/g, (match, num, offset, fullStr) => {
      // Look back to see if there's an additive operator before this
      const before = fullStr.substring(0, offset).trim();
      const lastOpMatch = before.match(/[\+\-]\s*$/);

      if (lastOpMatch && before.length > lastOpMatch[0].length) {
        // There is a left-side base expression, e.g., "100 + 20%"
        const leftExpr = before.substring(0, before.length - lastOpMatch[0].length).trim();
        if (leftExpr && !isNaN(parseFloat(leftExpr))) {
          return `(${leftExpr} * ${parseFloat(num) / 100})`;
        }
      }
      return `(${num} * 0.01)`;
    });

    return normalized;
  }

  /**
   * Main Evaluate Public API
   * @param {string} expression - The math expression string
   * @param {Object} options - Options { angleMode: 'DEG'|'RAD' }
   * @returns {Object} { success: boolean, result: number, formatted: string, error?: string }
   */
  function evaluate(expression, options = {}) {
    if (!expression || typeof expression !== 'string' || expression.trim() === '') {
      return { success: true, result: 0, formatted: '0' };
    }

    try {
      const normalized = normalizeExpression(expression);
      const tokens = tokenize(normalized);
      const rpn = shuntingYard(tokens);
      const val = evaluateRPN(rpn, options);

      if (isNaN(val)) {
        return { success: false, error: 'Invalid Math Result' };
      }

      return {
        success: true,
        result: val,
        formatted: formatNumber(val, options)
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Invalid Expression'
      };
    }
  }

  /**
   * Parentheses Inspector Helper
   * Returns details on open vs closed brackets in an expression
   */
  function inspectParentheses(expr) {
    let openCount = 0;
    let closedCount = 0;
    for (const char of expr) {
      if (char === '(') openCount++;
      if (char === ')') closedCount++;
    }
    return {
      open: openCount,
      closed: closedCount,
      diff: openCount - closedCount,
      isBalanced: openCount === closedCount
    };
  }

  // Public Interface
  return {
    evaluate,
    formatNumber,
    fixPrecision,
    factorial,
    inspectParentheses
  };
})();

// Export for module or global use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculatorEngine;
}
