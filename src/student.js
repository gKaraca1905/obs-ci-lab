function calculateAverage(grades) {
  if (!Array.isArray(grades) || grades.length === 0) {
    return 0;
  }
  const sum = grades.reduce((total, grade) => total + grade, 0);
  return sum / grades.length;
}

function getLetterGrade(average) {
  if (average >= 90) return 'A';
  if (average >= 80) return 'B';
  if (average >= 70) return 'C';
  if (average >= 60) return 'D';
  return 'F';
}

module.exports = { calculateAverage, getLetterGrade };
