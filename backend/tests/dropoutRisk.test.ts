import { WorkflowService } from '../src/services/workflowService';

describe('WorkflowService.calculateDropoutRisk Unit Tests', () => {
  describe('Rule Boundaries', () => {
    // 1. Attendance boundaries: below 60% is HIGH
    it('exactly 60% attendance (LOW)', () => {
      const result = WorkflowService.calculateDropoutRisk({
        attendancePercentage: 60,
        averageMarks: 50,
        feeOverdueDays: 0,
      });
      expect(result.riskLevel).toBe('LOW');
      expect(result.reasons).not.toContain('Attendance below 60%');
    });

    it('59% attendance (HIGH)', () => {
      const result = WorkflowService.calculateDropoutRisk({
        attendancePercentage: 59,
        averageMarks: 50,
        feeOverdueDays: 0,
      });
      expect(result.riskLevel).toBe('HIGH');
      expect(result.reasons).toContain('Attendance below 60%');
    });

    // 2. Academic marks boundaries: below 40 is HIGH
    it('exactly 40 marks (LOW)', () => {
      const result = WorkflowService.calculateDropoutRisk({
        attendancePercentage: 80,
        averageMarks: 40,
        feeOverdueDays: 0,
      });
      expect(result.riskLevel).toBe('LOW');
      expect(result.reasons).not.toContain('Average marks below 40%');
    });

    it('39 marks (HIGH)', () => {
      const result = WorkflowService.calculateDropoutRisk({
        attendancePercentage: 80,
        averageMarks: 39,
        feeOverdueDays: 0,
      });
      expect(result.riskLevel).toBe('HIGH');
      expect(result.reasons).toContain('Average marks below 40%');
    });

    // 3. Fee overdue days boundaries: above 30 days is MEDIUM
    it('30 days overdue (LOW)', () => {
      const result = WorkflowService.calculateDropoutRisk({
        attendancePercentage: 80,
        averageMarks: 50,
        feeOverdueDays: 30,
      });
      expect(result.riskLevel).toBe('LOW');
      expect(result.reasons).not.toContain('Fee overdue more than 30 days');
    });

    it('31 days overdue (MEDIUM)', () => {
      const result = WorkflowService.calculateDropoutRisk({
        attendancePercentage: 80,
        averageMarks: 50,
        feeOverdueDays: 31,
      });
      expect(result.riskLevel).toBe('MEDIUM');
      expect(result.reasons).toContain('Fee overdue more than 30 days');
    });
  });

  describe('Priority combinations', () => {
    it('should prioritize HIGH risk over MEDIUM risk', () => {
      const result = WorkflowService.calculateDropoutRisk({
        attendancePercentage: 50,
        averageMarks: 70,
        feeOverdueDays: 45,
      });
      expect(result.riskLevel).toBe('HIGH');
      expect(result.reasons).toContain('Attendance below 60%');
      expect(result.reasons).toContain('Fee overdue more than 30 days');
    });
  });
});
