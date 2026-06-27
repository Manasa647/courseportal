import { calculateFinalGrade } from '../src/utils/gradeCalculator';

describe('Course & Program Portal - Grade & GPA Calculator Unit Tests', () => {
  it('should return F and 0 GPA for empty marks lists', () => {
    const result = calculateFinalGrade([]);
    expect(result).toEqual({
      percentage: 0,
      grade: 'F',
      gpa: 0.0,
      status: 'fail',
    });
  });

  it('should compute A+ and 10.0 GPA for perfect scores', () => {
    const result = calculateFinalGrade([
      { score: 100, maxScore: 100, weight: 1.0 },
    ]);
    expect(result).toEqual({
      percentage: 100.0,
      grade: 'A+',
      gpa: 10.0,
      status: 'pass',
    });
  });

  it('should correctly calculate weighted average and projected A grade', () => {
    const result = calculateFinalGrade([
      { score: 80, maxScore: 100, weight: 0.3 }, // Midterm: 80% (weighted 24%)
      { score: 90, maxScore: 100, weight: 0.7 }, // Final Exam: 90% (weighted 63%)
    ]);
    expect(result).toEqual({
      percentage: 87.0, // 24% + 63% = 87%
      grade: 'A',
      gpa: 9.0,
      status: 'pass',
    });
  });

  it('should normalize scores when the total weight does not sum up to 1.0', () => {
    const result = calculateFinalGrade([
      { score: 70, maxScore: 100, weight: 0.4 }, // Student got 70% on Midterm (weighted 28%)
      // Final exam (weight 0.6) has not been taken yet.
    ]);
    expect(result).toEqual({
      percentage: 70.0, // 28% normalized over 0.4 = 70%
      grade: 'B',
      gpa: 8.0,
      status: 'pass',
    });
  });

  it('should compute D and 6.0 GPA for scores between 50% and 60%', () => {
    const result = calculateFinalGrade([
      { score: 55, maxScore: 100, weight: 1.0 },
    ]);
    expect(result).toEqual({
      percentage: 55.0,
      grade: 'D',
      gpa: 6.0,
      status: 'pass',
    });
  });

  it('should compute F and 0.0 GPA for scores under 50%', () => {
    const result = calculateFinalGrade([
      { score: 45, maxScore: 100, weight: 1.0 },
    ]);
    expect(result).toEqual({
      percentage: 45.0,
      grade: 'F',
      gpa: 0.0,
      status: 'fail',
    });
  });

  it('should handle decimal scores and round percentages to 2 decimal places', () => {
    const result = calculateFinalGrade([
      { score: 10.5, maxScore: 15, weight: 0.5 }, // 70%
      { score: 16.2, maxScore: 20, weight: 0.5 }, // 81%
    ]);
    expect(result).toEqual({
      percentage: 75.5, // (70 + 81) / 2 = 75.5%
      grade: 'B',
      gpa: 8.0,
      status: 'pass',
    });
  });
});
