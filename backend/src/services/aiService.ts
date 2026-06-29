import { GoogleGenerativeAI } from '@google/generative-ai';
import { Program } from '../models/models';

interface AIInput {
  name: string;
  email: string;
  backgroundNotes?: string;
  programName?: string;
  campusName?: string;
}

export class AIService {
  /**
   * Helper that handles calling Gemini with a fallback if API key is missing or call fails.
   */
  private static async callGeminiOrFallback(prompt: string, fallbackFn: () => string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        console.error('Gemini API call failed, falling back to rule-based generation:', err);
      }
    }
    return fallbackFn();
  }

  /**
   * Generates a warm admissions counselor recommendation.
   */
  static async generateRecommendation(enquiry: {
    fullName: string;
    programName?: string;
    tenthPercentage?: number;
    twelfthPercentage?: number;
    message?: string;
  }): Promise<string> {
    const name = enquiry.fullName || '';
    const program = enquiry.programName || 'General Program';
    const ssc = enquiry.tenthPercentage !== undefined ? enquiry.tenthPercentage : 'N/A';
    const hsc = enquiry.twelfthPercentage !== undefined ? enquiry.twelfthPercentage : 'N/A';
    const message = enquiry.message || 'No additional message.';

    const prompt = `You are an admissions counsellor at Sri Gowthami Educational Institutions in Andhra Pradesh. A student named ${name} has enquired about ${program}. Their 10th percentage is ${ssc} and 12th percentage is ${hsc}. Their message: ${message}. Write a warm, encouraging 3-sentence personalised recommendation telling them why this program suits them, what career paths it leads to, and one scholarship they should check. Keep it under 100 words.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch (err) {
        console.error('Gemini API call failed, falling back to rule-based generation:', err);
      }
    }

    // Fallback: rule-based
    const progLower = program.toLowerCase();
    let recommendation = `Dear ${name}, thank you for your interest in ${program} at Sri Gowthami Educational Institutions. `;
    if (progLower.includes('tech') || progLower.includes('engineering')) {
      recommendation += `This program is an excellent fit for your analytical goals and leads to IT/core engineering careers with our outstanding 94% placement rate. We recommend checking our Sri Gowthami Merit Scholarship for tuition waivers.`;
    } else if (progLower.includes('mba')) {
      recommendation += `This program is ideal for developing your leadership skills and prepares you for corporate management or entrepreneurship. You should apply for our leadership-based scholarships to help finance your degree.`;
    } else if (progLower.includes('b.sc')) {
      recommendation += `This science curriculum will build a strong foundation for your future research, analytical, or teaching career paths. Be sure to check our academic performance scholarship for eligible MPC/BiPC streams.`;
    } else {
      recommendation += `Our comprehensive academic curriculum will prepare you with the critical skills required to succeed in your chosen career path. We encourage you to explore our campus-wise scholarship programs.`;
    }
    recommendation += ` Our admissions counsellor will reach out for a personalized 24-hour callback to guide you through the next steps.`;
    return recommendation;
  }

  /**
   * Recommends academic programs based on student interests and prior academic background.
   */
  static async recommendCourses(interests: string, priorBackground?: string): Promise<{ programName: string, matchReason: string, matchScore: number }[]> {
    const programs = await Program.find().lean();

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
          Analyze the prospective student's academic background and interests:
          Interests: ${interests}
          Prior Academic Background: ${priorBackground || 'None specified'}

          Here are our available programs:
          ${programs.map(p => `Name: ${p.name}, Description: ${p.description}, Department: ${p.department}`).join('\n')}

          Rank the programs in order of best fit and return a strict JSON array of objects, containing:
          - programName (string)
          - matchReason (string, explain why it matches their interests/background, professional and concise)
          - matchScore (number, from 0 to 100 representing confidence or fit score)

          Do not include any additional commentary or text. Return only the JSON array.
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        if (text.startsWith('```')) {
          text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        const recommendations = JSON.parse(text);
        if (Array.isArray(recommendations)) {
          return recommendations.map((r: any) => ({
            programName: String(r.programName),
            matchReason: String(r.matchReason),
            matchScore: Number(r.matchScore)
          }));
        }
      } catch (err) {
        console.error('Gemini recommendCourses failed, falling back to keyword scoring:', err);
      }
    }

    // Fallback: score each program by counting how many words from interests appear in the program name + department string (case-insensitive)
    const searchTerms = interests.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const scoredPrograms = programs.map(p => {
      let score = 0;
      const progText = `${p.name} ${p.department}`.toLowerCase();

      for (const term of searchTerms) {
        if (progText.includes(term)) {
          score += 1;
        }
      }

      return {
        programName: p.name,
        matchReason: "Matched based on your stated interests",
        matchScore: score
      };
    });

    scoredPrograms.sort((a, b) => b.matchScore - a.matchScore);
    return scoredPrograms.slice(0, 3);
  }

  /**
   * Answers prospective student admissions questions.
   */
  static async answerFAQ(question: string, programName?: string): Promise<string> {
    const programStr = programName ? ` Program context if relevant: ${programName}.` : '';
    const prompt = `You are an admissions FAQ assistant for Sri Gowthami Educational Institutions. Answer this question clearly and helpfully in 2-3 sentences: ${question}.${programStr}`;

    return this.callGeminiOrFallback(prompt, () => {
      const qLower = question.toLowerCase();
      if (qLower.includes('fee')) {
        return 'Sri Gowthami Educational Institutions tuition fees range from $5,800 to $6,800 per semester depending on the program.';
      }
      if (qLower.includes('eligibility')) {
        return 'Applicants must have a high school diploma or equivalent with minimum qualifying marks.';
      }
      if (qLower.includes('hostel')) {
        return 'Hostel accommodation is available for both boys and girls with clean rooms and dining facilities.';
      }
      if (qLower.includes('scholarship')) {
        return 'Merit-based scholarships are available for students with outstanding academic records.';
      }
      return 'Please contact our admissions office at admissions@sgei.ac.in';
    });
  }

  /**
   * Generates a parent-facing progress report.
   */
  /**
   * Generates a parent-facing progress report.
   */
  static async generateProgressReport(input: {
    studentName: string;
    attendancePercentage: number;
    marksBySubject: { subject: string; score: number; maxScore: number }[];
    teacherNotes?: string;
  }): Promise<string> {
    const subjectsStr = input.marksBySubject
      .map(m => `${m.subject}: ${m.score}/${m.maxScore}`)
      .join(', ');

    const prompt = `Write a parent-facing academic progress report for student ${input.studentName} in plain encouraging language. Attendance: ${input.attendancePercentage.toFixed(1)}%. Subject-wise performance: ${subjectsStr}. Teacher notes: ${input.teacherNotes || 'None'}. Keep it under 250 words, use simple paragraph format, no bullet points.`;

    return this.callGeminiOrFallback(prompt, () => this.generateFallbackProgressReport(input));
  }

  private static generateFallbackProgressReport(input: {
    studentName: string;
    attendancePercentage: number;
    marksBySubject: { subject: string; score: number; maxScore: number }[];
    teacherNotes?: string;
  }): string {
    let totalScore = 0;
    let totalMaxScore = 0;
    for (const m of input.marksBySubject) {
      totalScore += m.score;
      totalMaxScore += m.maxScore;
    }
    const overallAverage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 100.0;
    const roundedAverage = Number(overallAverage.toFixed(1));

    let performanceCategory = 'Needs Improvement';
    if (roundedAverage > 80) {
      performanceCategory = 'Excellent';
    } else if (roundedAverage >= 60) {
      performanceCategory = 'Good';
    }

    const attendanceComment = input.attendancePercentage >= 75
      ? `Regarding class participation, ${input.studentName} has maintained an attendance record of ${input.attendancePercentage.toFixed(1)}%, indicating consistent engagement with the coursework.`
      : `We note that ${input.studentName}'s attendance is currently at ${input.attendancePercentage.toFixed(1)}%, which is below our target threshold. More regular class attendance is encouraged.`;

    const subjectPercentages = input.marksBySubject.length > 0
      ? `In terms of subject-specific performance, the student achieved ${input.marksBySubject.map(m => `${m.subject} (${((m.score / m.maxScore) * 100).toFixed(1)}% - ${m.score}/${m.maxScore})`).join(', ')}.`
      : `No academic course marks are currently recorded for this student.`;

    const overallComment = `Overall, the student's academic standing is categorized as ${performanceCategory} with a cumulative average of ${roundedAverage}%.`;

    const nextSteps = `We recommend reviewing the feedback from course instructors and continuing to engage with tutorial sessions to support future academic progress.`;

    return `${attendanceComment}\n\n${subjectPercentages}\n\n${overallComment}\n\n${nextSteps}`;
  }

  /**
   * Generates a week-by-week study plan.
   */
  static async generateStudyPlan(input: {
    programName: string;
    weakSubjects: string[];
    availableHoursPerWeek: number;
  }): Promise<string> {
    const subjects = input.weakSubjects.join(', ');
    const prompt = `Create a 4-week study plan for a ${input.programName} student who is weak in ${subjects} and has ${input.availableHoursPerWeek} hours per week. Distribute hours across subjects with specific daily topics. Format as a week-by-week markdown table.`;

    return this.callGeminiOrFallback(prompt, () => this.generateFallbackStudyPlan(input));
  }

  private static generateFallbackStudyPlan(input: {
    programName: string;
    weakSubjects: string[];
    availableHoursPerWeek: number;
  }): string {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const numSubjects = input.weakSubjects.length;
    const hoursPerSubject = numSubjects > 0 ? (input.availableHoursPerWeek / numSubjects).toFixed(1) : '0';

    let markdown = `| Week | Subject | Hours | Focus Topic |\n|---|---|---|---|\n`;

    for (const week of weeks) {
      if (numSubjects === 0) {
        markdown += `| ${week} | General | ${input.availableHoursPerWeek} | General review of program courses |\n`;
      } else {
        for (const sub of input.weakSubjects) {
          markdown += `| ${week} | ${sub} | ${hoursPerSubject} | Core concepts of ${sub} |\n`;
        }
      }
    }

    return markdown;
  }

  /**
   * Generates a practice test of MCQs.
   */
  static async generatePracticeTest(input: {
    subject: string;
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }): Promise<{ question: string; options: string[]; correctAnswerIndex: number }[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Generate ${input.numQuestions} multiple choice questions for ${input.subject} at ${input.difficulty} level. Return only a JSON array where each object has question (string), options (array of 4 strings), correctAnswerIndex (number 0-3). No extra text.`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        if (text.startsWith('```')) {
          text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        const questions = JSON.parse(text);
        if (Array.isArray(questions)) {
          return questions.slice(0, input.numQuestions).map((q: any) => ({
            question: String(q.question),
            options: Array.isArray(q.options) ? q.options.map(String) : [],
            correctAnswerIndex: Number(q.correctAnswerIndex)
          }));
        }
      } catch (err) {
        console.error('Gemini generatePracticeTest failed, falling back to local questions:', err);
      }
    }

    return this.fallbackPracticeTest(input.subject, input.numQuestions);
  }

  private static fallbackPracticeTest(subject: string, numQuestions: number): { question: string; options: string[]; correctAnswerIndex: number }[] {
    const placeholder = {
      question: `Placeholder question about ${subject} (Dummy Content)`,
      options: [
        "Dummy Option A",
        "Dummy Option B",
        "Dummy Option C",
        "Dummy Option D"
      ],
      correctAnswerIndex: 0
    };
    return Array(numQuestions).fill(null).map(() => ({ ...placeholder }));
  }

  /**
   * Recommends career paths.
   */
  static async careerGuidance(input: { programName: string; interests?: string }): Promise<string> {
    const interestsStr = input.interests ? ` and interests like "${input.interests}"` : '';
    const prompt = `
      You are an Experienced Career Counselor at Sri Gowthami Educational Institutions.
      A student is graduating from the program: ${input.programName}${interestsStr}.

      Suggest 3 distinct, high-growth career paths relevant to their program and interests.
      For each path, provide exactly one sentence detailing which specific skills they should prioritize building.
      Format utilizing clean markdown. Keep it professional, encouraging, and under 200 words.
    `;

    return this.callGeminiOrFallback(prompt, () => this.generateFallbackCareerGuidance(input));
  }

  private static generateFallbackCareerGuidance(input: { programName: string; interests?: string }): string {
    const prog = input.programName.trim();
    
    const csCareers = `### Career Guidance: Computer Science (Local Engine)

**1. Software Developer**
- *Skills to build*: Prioritize mastering core programming languages (like Python or Java), data structures, and software engineering practices.

**2. Full-Stack Developer**
- *Skills to build*: Learn front-end frameworks (like React) alongside back-end server technologies and database query languages.

**3. DevOps Engineer**
- *Skills to build*: Build competencies in cloud architecture (AWS/GCP), containerization (Docker), and automated deployment pipelines.`;

    const busCareers = `### Career Guidance: Business Administration (Local Engine)

**1. Operations Manager**
- *Skills to build*: Develop strong leadership qualities, process optimization frameworks, and project management methodologies.

**2. Financial Analyst**
- *Skills to build*: Prioritize quantitative analysis, corporate accounting standards, and financial modeling tools.

**3. Marketing Specialist**
- *Skills to build*: Master digital marketing methodologies, consumer behavior data analysis, and brand communication strategies.`;

    const dsCareers = `### Career Guidance: Data Science & AI (Local Engine)

**1. Data Scientist**
- *Skills to build*: Build strong foundations in statistics, data cleaning methodologies, and SQL querying.

**2. Machine Learning Engineer**
- *Skills to build*: Learn to build and deploy predictive modeling algorithms, deep learning architectures, and neural networks.

**3. BI Analyst**
- *Skills to build*: Focus on data visualization tools (like Tableau or PowerBI) and statistical reporting techniques.`;

    const defaultCareers = `### Career Guidance: Program Specialist (Local Engine)

**1. Junior Program Coordinator**
- *Skills to build*: Develop high-level project management skills and professional communication techniques.

**2. Subject Matter Expert**
- *Skills to build*: Deepen your domain knowledge in the core subjects of the ${prog} curriculum.

**3. Operations Associate**
- *Skills to build*: Learn to optimize daily operational workflows and manage relational data reporting.`;

    if (prog.includes('Computer Science')) {
      return csCareers;
    } else if (prog.includes('Business Administration')) {
      return busCareers;
    } else if (prog.includes('Data Science')) {
      return dsCareers;
    }

    return defaultCareers;
  }

  /**
   * Explains academic doubts.
   */
  static async explainDoubt(input: {
    question: string;
    subject?: string;
    language: 'english' | 'telugu';
  }): Promise<string> {
    const subjectStr = input.subject ? ` in the subject ${input.subject}` : '';

    const prompt = `
      You are an Academic Tutor at Sri Gowthami Educational Institutions.
      Explain this academic doubt simply and clearly, suitable for a student:
      Question: "${input.question}"${subjectStr}

      Respond strictly in the requested language: ${input.language}.
      Keep the explanation concise and under 150 words.
    `;

    return this.callGeminiOrFallback(prompt, () => this.generateFallbackDoubtExplanation(input));
  }

  private static generateFallbackDoubtExplanation(input: {
    question: string;
    subject?: string;
    language: 'english' | 'telugu';
  }): string {
    const qLower = input.question.toLowerCase();
    let explanation = '';

    if (qLower.includes('gravity') || qLower.includes('physics')) {
      explanation = `Gravity is a fundamental force of attraction that pulls objects with mass toward each other. On Earth, gravity is what keeps us on the ground and causes objects to fall when dropped.`;
    } else if (qLower.includes('variable') || qLower.includes('code') || qLower.includes('programming')) {
      explanation = `A variable in computer programming is a named storage location in memory that holds a value, which can be referenced and modified during program execution.`;
    } else if (qLower.includes('profit') || qLower.includes('business')) {
      explanation = `Profit is the financial gain obtained when the total revenue generated from a business activity exceeds the total expenses incurred in sustaining that activity.`;
    } else {
      explanation = `Thank you for asking. Based on your doubt "${input.question}", our local counseling engine recommends reviewing the introductory textbooks for this subject or discussing it during your upcoming counselor outreach call.`;
    }

    if (input.language === 'telugu') {
      return `${explanation}\n\n*(Note: Telugu translation requires the Gemini AI service to be configured in your environment variables. Serving English fallback)*`;
    }

    return explanation;
  }
}
