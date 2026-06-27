interface MarkInput {
  score: number;
  maxScore: number;
  weight: number;
}

export function calculateFinalGrade(marks: MarkInput[]): {
  percentage: number;
  grade: string;
  gpa: number;
  status: 'pass' | 'fail';
} {
  if (marks.length === 0) {
    return { percentage: 0, grade: 'F', gpa: 0.0, status: 'fail' };
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const m of marks) {
    if (m.maxScore > 0 && m.weight > 0) {
      const pct = m.score / m.maxScore;
      totalWeightedScore += pct * m.weight;
      totalWeight += m.weight;
    }
  }

  const finalPct = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const pct100 = Math.round(finalPct * 100 * 100) / 100;

  let grade = 'F';
  let gpa = 0.0;
  let status: 'pass' | 'fail' = 'fail';

  if (pct100 >= 90) {
    grade = 'A+';
    gpa = 10.0;
    status = 'pass';
  } else if (pct100 >= 80) {
    grade = 'A';
    gpa = 9.0;
    status = 'pass';
  } else if (pct100 >= 70) {
    grade = 'B';
    gpa = 8.0;
    status = 'pass';
  } else if (pct100 >= 60) {
    grade = 'C';
    gpa = 7.0;
    status = 'pass';
  } else if (pct100 >= 50) {
    grade = 'D';
    gpa = 6.0;
    status = 'pass';
  } else {
    grade = 'F';
    gpa = 0.0;
    status = 'fail';
  }

  return {
    percentage: pct100,
    grade,
    gpa,
    status,
  };
}
