/**
 * Calculate the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function calculateSum(a, b) {
  return a + b;
}

/**
 * Calculate the product of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product of a and b
 */
function calculateProduct(a, b) {
  return a * b;
}

/**
 * Calculate factorial of a number
 * @param {number} n - Number to calculate factorial
 * @returns {number} Factorial of n
 */
function calculateFactorial(n) {
  if (n < 0) return -1;
  if (n === 0 || n === 1) return 1;
  return n * calculateFactorial(n - 1);
}

module.exports = {
  calculateSum,
  calculateProduct,
  calculateFactorial
};
