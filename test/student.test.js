const test = require('node:test');
const assert = require('node:assert');
const { calculateAverage, getLetterGrade } = require('../src/student.js');

test('calculates the average of grades', () => {
  assert.strictEqual(calculateAverage([80, 90, 100]), 90);
});

test('returns 0 when there are no grades', () => {
  assert.strictEqual(calculateAverage([]), 0);
});

test('gives letter grade A for 90', () => {
  assert.strictEqual(getLetterGrade(90), 'A');
});
