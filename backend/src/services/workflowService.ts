interface WorkflowInput {
  name: string;
  email: string;
  backgroundNotes?: string;
  programId?: number;
}

export class WorkflowService {
  /**
   * Determine lead priority based on background notes contents and urgency triggers.
   */
  static calculatePriority(input: WorkflowInput): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (!input.backgroundNotes) {
      return 'MEDIUM';
    }

    const notesLower = input.backgroundNotes.toLowerCase();
    const urgentKeywords = ['urgent', 'asap', 'now', 'immediately', 'fall 2026', 'start date', 'scholarship', 'immediately'];
    
    const hasUrgentKeyword = urgentKeywords.some(keyword => notesLower.includes(keyword));
    const isLongNote = input.backgroundNotes.length > 150;

    if (hasUrgentKeyword || isLongNote) {
      return 'HIGH';
    }

    const lowKeywords = ['just browsing', 'general query', 'future intake', 'not sure'];
    const hasLowKeyword = lowKeywords.some(keyword => notesLower.includes(keyword));

    if (hasLowKeyword) {
      return 'LOW';
    }

    return 'MEDIUM';
  }

  /**
   * Generate default list of follow-up tasks for an enquiry.
   */
  static generateFollowUps(enquiryId: number) {
    const now = new Date();
    
    return [
      {
        enquiryId,
        taskName: 'Send Welcome Email & Brochure',
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day out
        status: 'pending',
        notes: 'Send program curriculum details and campus guides.',
      },
      {
        enquiryId,
        taskName: 'Admissions Office Outreach Call',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days out
        status: 'pending',
        notes: 'Call student to verify background details, schedules, and answer questions.',
      },
      {
        enquiryId,
        taskName: 'Document Checklist Verification',
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days out
        status: 'pending',
        notes: 'Ensure all qualification details and eligibility certificates are requested.',
      }
    ];
  }

  /**
   * Determine the next valid status based on current status.
   */
  static determineNextStatus(currentStatus: string): string {
    if (currentStatus === 'new' || currentStatus === 'pending') {
      return 'contacted';
    }
    if (currentStatus === 'contacted') {
      return 'applied';
    }
    if (currentStatus === 'applied') {
      return 'admitted';
    }
    if (currentStatus === 'admitted') {
      return 'closed';
    }
    throw new Error('Invalid status transition');
  }

  /**
   * Calculate student dropout risk based on attendance, average marks, and overdue fee payment days.
   */
  static calculateDropoutRisk(input: { attendancePercentage: number; averageMarks: number; feeOverdueDays: number }): { riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; reasons: string[] } {
    const reasons: string[] = [];
    let hasHighFlag = false;
    let hasMediumFlag = false;

    if (input.attendancePercentage < 60) {
      hasHighFlag = true;
      reasons.push("Attendance below 60%");
    }

    if (input.averageMarks < 40) {
      hasHighFlag = true;
      reasons.push("Average marks below 40%");
    }

    if (input.feeOverdueDays > 30) {
      hasMediumFlag = true;
      reasons.push("Fee overdue more than 30 days");
    }

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (hasHighFlag) {
      riskLevel = 'HIGH';
    } else if (hasMediumFlag) {
      riskLevel = 'MEDIUM';
    }

    return { riskLevel, reasons };
  }

  /**
   * Match placement drives by checking if the student's program is listed in the drive's eligible programs.
   */
  static matchPlacementDrives(studentProgram: string, drives: { id: number; title: string; eligiblePrograms: string[] }[]): { id: number; title: string; eligiblePrograms: string[] }[] {
    const cleanProgram = studentProgram.trim().toLowerCase();
    return drives.filter(d => 
      d.eligiblePrograms.map(p => p.trim().toLowerCase()).includes(cleanProgram)
    );
  }

  /**
   * Assign lead priority based on high school percentage and target program/source.
   */
  static assignPriority(enquiry: { twelfthPercentage?: number; programName?: string; source?: string }): "high" | "medium" | "low" {
    const score = enquiry.twelfthPercentage;
    const prog = (enquiry.programName || '').toLowerCase();
    
    if ((score !== undefined && score > 85) || prog.includes('m.tech') || prog.includes('mba')) {
      return 'high';
    }
    if (score !== undefined && score >= 70 && score <= 85) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Returns a WhatsApp-style message string appropriate for the current status.
   */
  static generateFollowUpMessage(enquiry: { fullName: string; programName: string; status: string }): string {
    const name = enquiry.fullName;
    const program = enquiry.programName;
    const status = enquiry.status.toLowerCase();
    
    if (status === 'new' || status === 'pending') {
      return `Hi ${name}, thank you for your interest in ${program} at Sri Gowthami. We have received your enquiry.`;
    }
    if (status === 'contacted') {
      return `Hi ${name}, thank you for your interest in ${program} at Sri Gowthami. Our counsellor will call you shortly. For immediate help call 0883-2222222.`;
    }
    if (status === 'applied') {
      return `Hi ${name}, your application for ${program} at Sri Gowthami is under review. We will update you soon.`;
    }
    if (status === 'admitted') {
      return `Hi ${name}, congratulations! You have been admitted to ${program} at Sri Gowthami Educational Institutions.`;
    }
    if (status === 'closed') {
      return `Hi ${name}, your enquiry file for ${program} at Sri Gowthami has been closed. Thank you!`;
    }
    return `Hi ${name}, thank you for contacting Sri Gowthami.`;
  }
}

