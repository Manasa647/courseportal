import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

// 1. Campus Schema
export interface ICampus extends MongooseDocument {
  name: string;
  location: string;
  studentsCount: number;
  established: string;
  facilities: string;
  address: string;
  createdAt: Date;
}
const CampusSchema = new Schema<ICampus>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  studentsCount: { type: Number, default: 0 },
  established: { type: String, default: "2005" },
  facilities: { type: String, default: "" },
  address: { type: String, default: "" }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 2. Program Schema
export interface IProgram extends MongooseDocument {
  name: string;
  department: string;
  type: string;
  category: string;
  duration: string;
  annualFee: number;
  devFee: number;
  totalSeats: number;
  icon: string;
  minPercentage: number;
  entranceExam: string;
  eligibilityText: string;
  subjects: string;
  campusIds: string;
  description?: string;
  createdAt: Date;
}
const ProgramSchema = new Schema<IProgram>({
  name: { type: String, required: true },
  department: { type: String, required: true },
  type: { type: String, default: "UG" },
  category: { type: String, default: "General" },
  duration: { type: String, default: "3 Years" },
  annualFee: { type: Number, default: 0 },
  devFee: { type: Number, default: 0 },
  totalSeats: { type: Number, default: 60 },
  icon: { type: String, default: "🎓" },
  minPercentage: { type: Number, default: 45 },
  entranceExam: { type: String, default: "None" },
  eligibilityText: { type: String, default: "12th Pass" },
  subjects: { type: String, default: "" },
  campusIds: { type: String, default: "" },
  description: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 3. Course Schema
export interface ICourse extends MongooseDocument {
  name: string;
  programId: mongoose.Types.ObjectId;
  credits: number;
  semester: number;
  code: string;
  title: string;
  description?: string;
  createdAt: Date;
}
const CourseSchema = new Schema<ICourse>({
  name: { type: String, default: "" },
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  credits: { type: Number, required: true },
  semester: { type: Number, default: 1 },
  code: { type: String, required: true, unique: true },
  title: { type: String, default: "" },
  description: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 4. Student Schema
export interface IStudent extends MongooseDocument {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  enrollmentDate: Date;
  campusId?: mongoose.Types.ObjectId;
  createdAt: Date;
}
const StudentSchema = new Schema<IStudent>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dateOfBirth: { type: Date, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  campusId: { type: Schema.Types.ObjectId, ref: 'Campus' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 5. Parent Schema
export interface IParent extends MongooseDocument {
  studentId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email?: string;
  createdAt: Date;
}
const ParentSchema = new Schema<IParent>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 6. Enquiry Schema
export interface IEnquiry extends MongooseDocument {
  fullName: string;
  name: string;
  phone?: string;
  email: string;
  programId?: mongoose.Types.ObjectId;
  programName?: string;
  campusPreference?: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  source: string;
  message?: string;
  status: string;
  priority: string;
  aiRecommendation?: string;
  createdAt: Date;
  updatedAt: Date;
  dateReceived: Date;
  campusId?: mongoose.Types.ObjectId;
}
const EnquirySchema = new Schema<IEnquiry>({
  fullName: { type: String, default: "" },
  name: { type: String, default: "" },
  phone: { type: String },
  email: { type: String, required: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program' },
  programName: { type: String },
  campusPreference: { type: String },
  tenthPercentage: { type: Number },
  twelfthPercentage: { type: Number },
  source: { type: String, default: "Website" },
  message: { type: String },
  status: { type: String, default: "new" },
  priority: { type: String, default: "medium" },
  aiRecommendation: { type: String },
  dateReceived: { type: Date, default: Date.now },
  campusId: { type: Schema.Types.ObjectId, ref: 'Campus' }
}, { timestamps: true });

// 7. Application Schema
export interface IApplication extends MongooseDocument {
  enquiryId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  submissionDate: Date;
  status: string;
}
const ApplicationSchema = new Schema<IApplication>({
  enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry', unique: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', unique: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program' },
  submissionDate: { type: Date, default: Date.now },
  status: { type: String, default: "submitted" }
}, { timestamps: false });

// 8. Document Schema
export interface IDocument extends MongooseDocument {
  entityType: string;
  entityId: string; // Stored as string ObjectId
  fileName: string;
  fileUrl: string;
  documentType: string;
  uploadDate: Date;
}
const DocumentSchema = new Schema<IDocument>({
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  documentType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: false });

// 9. FeePayment Schema
export interface IFeePayment extends MongooseDocument {
  studentId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  status: string;
}
const FeePaymentSchema = new Schema<IFeePayment>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: "completed" }
}, { timestamps: false });

// 10. Receipt Schema
export interface IReceipt extends MongooseDocument {
  paymentId: mongoose.Types.ObjectId;
  receiptNumber: string;
  issueDate: Date;
  pdfUrl?: string;
}
const ReceiptSchema = new Schema<IReceipt>({
  paymentId: { type: Schema.Types.ObjectId, ref: 'FeePayment', required: true, unique: true },
  receiptNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  pdfUrl: { type: String }
}, { timestamps: false });

// 11. AttendanceRecord Schema
export interface IAttendanceRecord extends MongooseDocument {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  date: Date;
  status: string;
}
const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, required: true }
}, { timestamps: false });
AttendanceRecordSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

// 12. Mark Schema
export interface IMark extends MongooseDocument {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  assessmentName: string;
  score: number;
  maxScore: number;
  weight: number;
  createdAt: Date;
}
const MarkSchema = new Schema<IMark>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  assessmentName: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  weight: { type: Number, required: true }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 13. Result Schema
export interface IResult extends MongooseDocument {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  grade: string;
  gpa: number;
  status: string;
  remarks?: string;
  createdAt: Date;
}
const ResultSchema = new Schema<IResult>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  grade: { type: String, required: true },
  gpa: { type: Number, required: true },
  status: { type: String, required: true },
  remarks: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });
ResultSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// 14. FollowUp Schema
export interface IFollowUp extends MongooseDocument {
  enquiryId: mongoose.Types.ObjectId;
  note: string;
  type: string;
  createdAt: Date;
  taskName: string;
  dueDate: Date;
  status: string;
  notes?: string;
}
const FollowUpSchema = new Schema<IFollowUp>({
  enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  note: { type: String, default: "" },
  type: { type: String, default: "task" },
  taskName: { type: String, default: "Scheduled Follow-up" },
  dueDate: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
  notes: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 15. StatusHistory Schema
export interface IStatusHistory extends MongooseDocument {
  enquiryId: mongoose.Types.ObjectId;
  fromStatus: string;
  toStatus: string;
  note?: string;
  changedAt: Date;
}
const StatusHistorySchema = new Schema<IStatusHistory>({
  enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  note: { type: String }
}, { timestamps: { createdAt: 'changedAt', updatedAt: false } });

// 16. PlacementDrive Schema
export interface IPlacementDrive extends MongooseDocument {
  title: string;
  eligiblePrograms: string;
  driveDate: Date;
  company: string;
  location: string;
}
const PlacementDriveSchema = new Schema<IPlacementDrive>({
  title: { type: String, required: true },
  eligiblePrograms: { type: String, required: true },
  driveDate: { type: Date, default: Date.now },
  company: { type: String, required: true },
  location: { type: String, required: true }
}, { timestamps: false });

// 17. Circular Schema
export interface ICircular extends MongooseDocument {
  title: string;
  content: string;
  targetAudience: string;
  datePosted: Date;
}
const CircularSchema = new Schema<ICircular>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetAudience: { type: String, required: true },
  datePosted: { type: Date, default: Date.now }
}, { timestamps: false });

// 18. HostelRoom Schema
export interface IHostelRoom extends MongooseDocument {
  roomNumber: string;
  buildingName: string;
  capacity: number;
  occupiedCount: number;
  annualRent: number;
  createdAt: Date;
}
const HostelRoomSchema = new Schema<IHostelRoom>({
  roomNumber: { type: String, required: true },
  buildingName: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupiedCount: { type: Number, default: 0 },
  annualRent: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 19. MessUsage Schema
export interface IMessUsage extends MongooseDocument {
  studentId: string;
  date: Date;
  mealType: string;
  present: boolean;
}
const MessUsageSchema = new Schema<IMessUsage>({
  studentId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  mealType: { type: String, required: true },
  present: { type: Boolean, default: true }
}, { timestamps: false });

// 20. LibraryBook Schema
export interface ILibraryBook extends MongooseDocument {
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
}
const LibraryBookSchema = new Schema<ILibraryBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, default: "" },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 21. TransportRoute Schema
export interface ITransportRoute extends MongooseDocument {
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone?: string;
  capacity: number;
  createdAt: Date;
}
const TransportRouteSchema = new Schema<ITransportRoute>({
  routeName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String },
  capacity: { type: Number, default: 40 }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 22. FacultyPeriod Schema
export interface IFacultyPeriod extends MongooseDocument {
  facultyName: string;
  subjectName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  createdAt: Date;
}
const FacultyPeriodSchema = new Schema<IFacultyPeriod>({
  facultyName: { type: String, required: true },
  subjectName: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  roomNumber: { type: String, required: true }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 23. Event Schema
export interface IEvent extends MongooseDocument {
  name: string;
  description?: string;
  date: Date;
  location: string;
  createdAt: Date;
}
const EventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  location: { type: String, required: true }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 24. Internship Schema
export interface IInternship extends MongooseDocument {
  companyName: string;
  role: string;
  stipend: number;
  duration: string;
  eligibility: string;
  createdAt: Date;
}
const InternshipSchema = new Schema<IInternship>({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  stipend: { type: Number, default: 0 },
  duration: { type: String, default: "3 Months" },
  eligibility: { type: String, default: "All Streams" }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 25. AlumniRecord Schema
export interface IAlumniRecord extends MongooseDocument {
  fullName: string;
  graduationYear: number;
  currentCompany?: string;
  currentRole?: string;
  email?: string;
  createdAt: Date;
}
const AlumniRecordSchema = new Schema<IAlumniRecord>({
  fullName: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  currentCompany: { type: String },
  currentRole: { type: String },
  email: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 26. Grievance Schema
export interface IGrievance extends MongooseDocument {
  studentId: string;
  category: string;
  description: string;
  status: string;
  dateSubmitted: Date;
}
const GrievanceSchema = new Schema<IGrievance>({
  studentId: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "open" },
  dateSubmitted: { type: Date, default: Date.now }
}, { timestamps: false });

// 27. LabAsset Schema
export interface ILabAsset extends MongooseDocument {
  assetName: string;
  labName: string;
  serialNumber: string;
  status: string;
  createdAt: Date;
}
const LabAssetSchema = new Schema<ILabAsset>({
  assetName: { type: String, required: true },
  labName: { type: String, required: true },
  serialNumber: { type: String, required: true },
  status: { type: String, default: "working" }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 28. CounsellingNote Schema
export interface ICounsellingNote extends MongooseDocument {
  studentId: string;
  counsellorName: string;
  notes: string;
  dateCreated: Date;
}
const CounsellingNoteSchema = new Schema<ICounsellingNote>({
  studentId: { type: String, required: true },
  counsellorName: { type: String, required: true },
  notes: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now }
}, { timestamps: false });

// 29. StudyPlan Schema
export interface IStudyPlan extends MongooseDocument {
  programName: string;
  weekNo: number;
  subject: string;
  focusTopic: string;
  studyHours: number;
  createdAt: Date;
}
const StudyPlanSchema = new Schema<IStudyPlan>({
  programName: { type: String, required: true },
  weekNo: { type: Number, required: true },
  subject: { type: String, required: true },
  focusTopic: { type: String, required: true },
  studyHours: { type: Number, required: true }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 30. PracticeTest Schema
export interface IPracticeTest extends MongooseDocument {
  subject: string;
  difficulty: string;
  question: string;
  options: string;
  correctAnswerIndex: number;
  createdAt: Date;
}
const PracticeTestSchema = new Schema<IPracticeTest>({
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: String, default: "" },
  correctAnswerIndex: { type: Number, required: true }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// 31. ProgressReport Schema
export interface IProgressReport extends MongooseDocument {
  studentId: string;
  attendancePercentage: number;
  overallAverage: number;
  performanceCategory: string;
  reportText: string;
  dateGenerated: Date;
}
const ProgressReportSchema = new Schema<IProgressReport>({
  studentId: { type: String, required: true },
  attendancePercentage: { type: Number, required: true },
  overallAverage: { type: Number, required: true },
  performanceCategory: { type: String, required: true },
  reportText: { type: String, required: true },
  dateGenerated: { type: Date, default: Date.now }
}, { timestamps: false });

// 32. AcademicDoubtHistory Schema
export interface IAcademicDoubtHistory extends MongooseDocument {
  question: string;
  subject: string;
  language: string;
  answer: string;
  dateAsked: Date;
}
const AcademicDoubtHistorySchema = new Schema<IAcademicDoubtHistory>({
  question: { type: String, required: true },
  subject: { type: String, required: true },
  language: { type: String, required: true },
  answer: { type: String, required: true },
  dateAsked: { type: Date, default: Date.now }
}, { timestamps: false });

// Compile Models
export const Campus = mongoose.models.Campus || mongoose.model<ICampus>('Campus', CampusSchema);
export const Program = mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema);
export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
export const Parent = mongoose.models.Parent || mongoose.model<IParent>('Parent', ParentSchema);
export const Enquiry = mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
export const Document = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
export const FeePayment = mongoose.models.FeePayment || mongoose.model<IFeePayment>('FeePayment', FeePaymentSchema);
export const Receipt = mongoose.models.Receipt || mongoose.model<IReceipt>('Receipt', ReceiptSchema);
export const AttendanceRecord = mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
export const Mark = mongoose.models.Mark || mongoose.model<IMark>('Mark', MarkSchema);
export const Result = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
export const FollowUp = mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
export const StatusHistory = mongoose.models.StatusHistory || mongoose.model<IStatusHistory>('StatusHistory', StatusHistorySchema);
export const PlacementDrive = mongoose.models.PlacementDrive || mongoose.model<IPlacementDrive>('PlacementDrive', PlacementDriveSchema);
export const Circular = mongoose.models.Circular || mongoose.model<ICircular>('Circular', CircularSchema);
export const HostelRoom = mongoose.models.HostelRoom || mongoose.model<IHostelRoom>('HostelRoom', HostelRoomSchema);
export const MessUsage = mongoose.models.MessUsage || mongoose.model<IMessUsage>('MessUsage', MessUsageSchema);
export const LibraryBook = mongoose.models.LibraryBook || mongoose.model<ILibraryBook>('LibraryBook', LibraryBookSchema);
export const TransportRoute = mongoose.models.TransportRoute || mongoose.model<ITransportRoute>('TransportRoute', TransportRouteSchema);
export const FacultyPeriod = mongoose.models.FacultyPeriod || mongoose.model<IFacultyPeriod>('FacultyPeriod', FacultyPeriodSchema);
export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export const Internship = mongoose.models.Internship || mongoose.model<IInternship>('Internship', InternshipSchema);
export const AlumniRecord = mongoose.models.AlumniRecord || mongoose.model<IAlumniRecord>('AlumniRecord', AlumniRecordSchema);
export const Grievance = mongoose.models.Grievance || mongoose.model<IGrievance>('Grievance', GrievanceSchema);
export const LabAsset = mongoose.models.LabAsset || mongoose.model<ILabAsset>('LabAsset', LabAssetSchema);
export const CounsellingNote = mongoose.models.CounsellingNote || mongoose.model<ICounsellingNote>('CounsellingNote', CounsellingNoteSchema);
export const StudyPlan = mongoose.models.StudyPlan || mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);
export const PracticeTest = mongoose.models.PracticeTest || mongoose.model<IPracticeTest>('PracticeTest', PracticeTestSchema);
export const ProgressReport = mongoose.models.ProgressReport || mongoose.model<IProgressReport>('ProgressReport', ProgressReportSchema);
export const AcademicDoubtHistory = mongoose.models.AcademicDoubtHistory || mongoose.model<IAcademicDoubtHistory>('AcademicDoubtHistory', AcademicDoubtHistorySchema);
