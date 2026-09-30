/**
 * CalcPro - Automated Unit Tests
 * Runs tests on load and reports results in console and optional UI status
 */

const CalcProTests = (function () {
  'use strict';

  function runTests() {
    if (typeof CalculatorEngine === 'undefined') {
      console.error('CalculatorEngine not loaded! Skipping tests.');
      return;
    }

    const testCases = [
      { name: 'Basic Addition', expr: '2 + 3', expected: 5 },
      { name: 'Operator Precedence (Multiplication before Addition)', expr: '2 + 3 * 4', expected: 14 },
      { name: 'Operator Precedence with Division & Subtraction', expr: '10 - 6 / 2', expected: 7 },
      { name: 'Parentheses Precedence', expr: '(2 + 3) * 4', expected: 20 },
      { name: 'Nested Parentheses', expr: '((1 + 2) * 3) + 4', expected: 13 },
      { name: 'Floating Point Precision (0.1 + 0.2)', expr: '0.1 + 0.2', expected: 0.3 },
      { name: 'Division by Zero Safety', expr: '10 / 0', expectError: true },
      { name: 'Percentage Calculation', expr: '50%', expected: 0.5 },
      { name: 'Percentage Addition (100 + 10%)', expr: '100 + 10%', expected: 110 },
      { name: 'Exponentiation (2 ^ 3)', expr: '2 ^ 3', expected: 8 },
      { name: 'Factorial (5!)', expr: '5!', expected: 120 },
      { name: 'Sine (90 deg)', expr: 'sin(90)', expected: 1, options: { angleMode: 'DEG' } },
      { name: 'Cosine (0 deg)', expr: 'cos(0)', expected: 1, options: { angleMode: 'DEG' } },
      { name: 'Square Root (sqrt(16))', expr: 'sqrt(16)', expected: 4 },
      { name: 'Logarithm (log(100))', expr: 'log(100)', expected: 2 },
      { name: 'Natural Log (ln(e))', expr: 'ln(e)', expected: 1 },
      { name: 'Implicit Multiplication 5(2+3)', expr: '5(2+3)', expected: 25 },
      { name: 'Unary Minus (-5 + 3)', expr: '-5 + 3', expected: -2 },
      { name: 'Unit Converter (1 km to m)', testFn: () => ConverterEngine.convert('length', 1, 'km', 'm') === 1000 }
    ];

    let passed = 0;
    let failed = 0;
    const results = [];

    console.group('🧪 CalcPro Automated Unit Test Suite');

    testCases.forEach((tc, idx) => {
      let isSuccess = false;
      let errorMsg = '';

      if (tc.testFn) {
        isSuccess = tc.testFn();
      } else {
        const res = CalculatorEngine.evaluate(tc.expr, tc.options);
        if (tc.expectError) {
          isSuccess = !res.success;
        } else {
          isSuccess = res.success && Math.abs(res.result - tc.expected) < 1e-7;
          if (!isSuccess) {
            errorMsg = `Expected: ${tc.expected}, Got: ${res.result} (Error: ${res.error || 'none'})`;
          }
        }
      }

      if (isSuccess) {
        passed++;
        console.log(`%c[PASS %d/%d] ${tc.name}`, 'color: #10B981; font-weight: bold;', idx + 1, testCases.length);
      } else {
        failed++;
        console.error(`[FAIL %d/%d] ${tc.name} -> ${errorMsg}`, idx + 1, testCases.length);
      }

      results.push({ name: tc.name, passed: isSuccess, error: errorMsg });
    });

    console.log(`%cSummary: ${passed} Passed, ${failed} Failed`, `color: ${failed === 0 ? '#10B981' : '#EF4444'}; font-size: 14px; font-weight: bold;`);
    console.groupEnd();

    return { total: testCases.length, passed, failed, results };
  }

  return { runTests };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalcProTests;
}
