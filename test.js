const { calculateSum, calculateProduct, calculateFactorial } = require('./utils');

// Simple test framework
let passedTests = 0;
let failedTests = 0;

function test(description, callback) {
  try {
    callback();
    console.log(`✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    failedTests++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

// Test Suite
console.log('Running tests...\n');

test('calculateSum adds two positive numbers', () => {
  assertEquals(calculateSum(2, 3), 5, 'Sum of 2 and 3');
});

test('calculateSum adds negative numbers', () => {
  assertEquals(calculateSum(-2, -3), -5, 'Sum of -2 and -3');
});

test('calculateSum handles zero', () => {
  assertEquals(calculateSum(0, 5), 5, 'Sum of 0 and 5');
});

test('calculateProduct multiplies two positive numbers', () => {
  assertEquals(calculateProduct(4, 5), 20, 'Product of 4 and 5');
});

test('calculateProduct multiplies by zero', () => {
  assertEquals(calculateProduct(10, 0), 0, 'Product of 10 and 0');
});

test('calculateProduct multiplies negative numbers', () => {
  assertEquals(calculateProduct(-3, -4), 12, 'Product of -3 and -4');
});

test('calculateFactorial of 5', () => {
  assertEquals(calculateFactorial(5), 120, 'Factorial of 5');
});

test('calculateFactorial of 0', () => {
  assertEquals(calculateFactorial(0), 1, 'Factorial of 0');
});

// Summary
console.log('\n' + '='.repeat(40));
console.log(`Tests passed: ${passedTests}`);
console.log(`Tests failed: ${failedTests}`);
console.log('='.repeat(40));

// Exit with error code if tests failed
process.exit(failedTests > 0 ? 1 : 0);
