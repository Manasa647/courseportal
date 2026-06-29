import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Campus, Program, Course, PlacementDrive, Enquiry, Student, Parent, Application, Document as StudentDoc, FeePayment, Receipt, AttendanceRecord, Mark, Result, FollowUp, StatusHistory } from './models/models';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://kolamgarimanasa97_db_user:r0w8sG0zYRDha8q6@courseportal.xyhy7sp.mongodb.net/courseportal?retryWrites=true&w=majority&appName=courseportal';

// Define static ObjectIds for campuses
const campusIds = [
  '64a8b792e3cf14a1a0f90001', // Campus 1
  '64a8b792e3cf14a1a0f90002', // Campus 2
  '64a8b792e3cf14a1a0f90003', // Campus 3
  '64a8b792e3cf14a1a0f90004'  // Campus 4
];

const campusesData = [
  {
    _id: campusIds[0],
    name: 'Rajahmundry Campus',
    location: 'Rajahmundry',
    established: '1995',
    studentsCount: 2450,
    facilities: 'A/C Labs,High-speed Wi-Fi,Digital Library,Seminar Halls,Sports Complex,Hostels',
    address: 'Main Road, Danavaipeta, Rajahmundry, AP'
  },
  {
    _id: campusIds[1],
    name: 'Peddapuram Campus',
    location: 'Peddapuram',
    established: '2002',
    studentsCount: 1320,
    facilities: 'Engineering Workshops,Chemistry Labs,Library,Placement Cell,Girls Hostel',
    address: 'ADB Road, Peddapuram, AP'
  },
  {
    _id: campusIds[2],
    name: 'Kakinada Campus',
    location: 'Kakinada',
    established: '1999',
    studentsCount: 1890,
    facilities: 'Research Center,Computer Center,Cafeteria,Boys & Girls Hostels,Auditorium',
    address: 'Sarpavaram Junction, Kakinada, AP'
  },
  {
    _id: campusIds[3],
    name: 'Kovvur Campus',
    location: 'Kovvur',
    established: '2010',
    studentsCount: 780,
    facilities: 'Smart Classrooms,Computer Lab,Library,Cafeteria',
    address: 'NH-16, Kovvur, West Godavari, AP'
  }
];

// Define static ObjectIds for 18 programs
const programIds = [
  '64a8b792e3cf14a1a0f90101', '64a8b792e3cf14a1a0f90102', '64a8b792e3cf14a1a0f90103',
  '64a8b792e3cf14a1a0f90104', '64a8b792e3cf14a1a0f90105', '64a8b792e3cf14a1a0f90106',
  '64a8b792e3cf14a1a0f90107', '64a8b792e3cf14a1a0f90108', '64a8b792e3cf14a1a0f90109',
  '64a8b792e3cf14a1a0f90110', '64a8b792e3cf14a1a0f90111', '64a8b792e3cf14a1a0f90112',
  '64a8b792e3cf14a1a0f90113', '64a8b792e3cf14a1a0f90114', '64a8b792e3cf14a1a0f90115',
  '64a8b792e3cf14a1a0f90116', '64a8b792e3cf14a1a0f90117', '64a8b792e3cf14a1a0f90118'
];

const programsData = [
  {
    _id: programIds[0],
    name: 'B.Tech – Computer Science & Engineering',
    department: 'Engineering',
    type: 'UG',
    category: 'Engineering',
    duration: '4 Years',
    annualFee: 85000,
    devFee: 8000,
    totalSeats: 180,
    icon: '💻',
    minPercentage: 60,
    entranceExam: 'EAPCET/JEE',
    eligibilityText: '10+2 with Maths & Physics minimum 60%',
    subjects: 'Data Structures,Algorithms,OS,DBMS,Networks,AI/ML,Web Development,Cloud Computing',
    campusIds: `${campusIds[0]},${campusIds[1]}`
  },
  {
    _id: programIds[1],
    name: 'B.Tech – Electronics & Communication',
    department: 'Engineering',
    type: 'UG',
    category: 'Engineering',
    duration: '4 Years',
    annualFee: 80000,
    devFee: 8000,
    totalSeats: 120,
    icon: '📡',
    minPercentage: 60,
    entranceExam: 'EAPCET',
    eligibilityText: '10+2 with Maths & Physics minimum 60%',
    subjects: 'Circuit Theory,Signal Processing,VLSI,Embedded Systems,Communication Systems',
    campusIds: `${campusIds[0]},${campusIds[2]}`
  },
  {
    _id: programIds[2],
    name: 'B.Tech – Electrical Engineering',
    department: 'Engineering',
    type: 'UG',
    category: 'Engineering',
    duration: '4 Years',
    annualFee: 78000,
    devFee: 8000,
    totalSeats: 120,
    icon: '⚡',
    minPercentage: 55,
    entranceExam: 'EAPCET',
    eligibilityText: '10+2 with Maths & Physics minimum 55%',
    subjects: 'Power Systems,Control Systems,Electrical Machines,Power Electronics',
    campusIds: `${campusIds[0]},${campusIds[2]}`
  },
  {
    _id: programIds[3],
    name: 'B.Tech – Mechanical Engineering',
    department: 'Engineering',
    type: 'UG',
    category: 'Engineering',
    duration: '4 Years',
    annualFee: 78000,
    devFee: 8000,
    totalSeats: 60,
    icon: '⚙️',
    minPercentage: 55,
    entranceExam: 'EAPCET',
    eligibilityText: '10+2 with Maths & Physics minimum 55%',
    subjects: 'Thermodynamics,Fluid Mechanics,Machine Design,CAD/CAM',
    campusIds: `${campusIds[0]},${campusIds[1]}`
  },
  {
    _id: programIds[4],
    name: 'B.Tech – Civil Engineering',
    department: 'Engineering',
    type: 'UG',
    category: 'Engineering',
    duration: '4 Years',
    annualFee: 76000,
    devFee: 8000,
    totalSeats: 60,
    icon: '🏗️',
    minPercentage: 55,
    entranceExam: 'EAPCET',
    eligibilityText: '10+2 with Maths & Physics minimum 55%',
    subjects: 'Structural Analysis,Surveying,Geotechnical Engineering,Transportation Engineering',
    campusIds: `${campusIds[1]},${campusIds[3]}`
  },
  {
    _id: programIds[5],
    name: 'MBA – Business Administration',
    department: 'Management',
    type: 'PG',
    category: 'Management',
    duration: '2 Years',
    annualFee: 65000,
    devFee: 6000,
    totalSeats: 80,
    icon: '📊',
    minPercentage: 50,
    entranceExam: 'ICET/MAT',
    eligibilityText: 'Any bachelor degree minimum 50%',
    subjects: 'Marketing,Finance,HR Management,Operations,Business Analytics,Entrepreneurship',
    campusIds: `${campusIds[0]},${campusIds[2]}`
  },
  {
    _id: programIds[6],
    name: 'MCA – Computer Applications',
    department: 'Technology',
    type: 'PG',
    category: 'Technology',
    duration: '2 Years',
    annualFee: 58000,
    devFee: 6000,
    totalSeats: 60,
    icon: '🖥️',
    minPercentage: 50,
    entranceExam: 'ICET',
    eligibilityText: 'BSc/BCA/BCom with Maths minimum 50%',
    subjects: 'Advanced Java,Python,Database Systems,Web Technologies,Mobile Development',
    campusIds: `${campusIds[0]},${campusIds[1]}`
  },
  {
    _id: programIds[7],
    name: 'M.Tech – Computer Science',
    department: 'Engineering',
    type: 'PG',
    category: 'Engineering',
    duration: '2 Years',
    annualFee: 95000,
    devFee: 10000,
    totalSeats: 30,
    icon: '🤖',
    minPercentage: 60,
    entranceExam: 'GATE preferred',
    eligibilityText: 'BTech in CS/IT/ECE minimum 60% GATE preferred',
    subjects: 'Machine Learning,Deep Learning,NLP,Computer Vision,Big Data Analytics',
    campusIds: `${campusIds[0]}`
  },
  {
    _id: programIds[8],
    name: 'B.Sc. – Computer Science',
    department: 'Sciences',
    type: 'UG',
    category: 'Sciences',
    duration: '3 Years',
    annualFee: 38000,
    devFee: 4000,
    totalSeats: 80,
    icon: '🔬',
    minPercentage: 50,
    entranceExam: 'Merit-based',
    eligibilityText: '10+2 with Maths minimum 50%',
    subjects: 'Programming in C,Data Structures,Database Management,Operating Systems,Python',
    campusIds: `${campusIds[0]},${campusIds[2]},${campusIds[3]}`
  },
  {
    _id: programIds[9],
    name: 'B.Com – General',
    department: 'Commerce',
    type: 'UG',
    category: 'Commerce',
    duration: '3 Years',
    annualFee: 32000,
    devFee: 3000,
    totalSeats: 120,
    icon: '📈',
    minPercentage: 45,
    entranceExam: 'Merit-based',
    eligibilityText: '10+2 any stream minimum 45%',
    subjects: 'Financial Accounting,Business Law,Income Tax,Cost Accounting,Auditing',
    campusIds: `${campusIds[0]},${campusIds[1]},${campusIds[2]},${campusIds[3]}`
  },
  {
    _id: programIds[10],
    name: 'B.Com – Computer Applications',
    department: 'Commerce',
    type: 'UG',
    category: 'Commerce',
    duration: '3 Years',
    annualFee: 36000,
    devFee: 3500,
    totalSeats: 80,
    icon: '💹',
    minPercentage: 45,
    entranceExam: 'Merit-based',
    eligibilityText: '10+2 any stream minimum 45%',
    subjects: 'Accounting,Tally ERP,MS Excel,E-Commerce,Database Management',
    campusIds: `${campusIds[0]},${campusIds[2]}`
  },
  {
    _id: programIds[11],
    name: 'B.A. – English',
    department: 'Arts',
    type: 'UG',
    category: 'Arts',
    duration: '3 Years',
    annualFee: 30000,
    devFee: 3000,
    totalSeats: 80,
    icon: '📖',
    minPercentage: 45,
    entranceExam: 'Merit-based',
    eligibilityText: '10+2 any stream minimum 45%',
    subjects: 'English Literature,Linguistics,Creative Writing,Communication Skills',
    campusIds: `${campusIds[0]},${campusIds[1]}`
  },
  {
    _id: programIds[12],
    name: 'B.Pharmacy',
    department: 'Sciences',
    type: 'UG',
    category: 'Sciences',
    duration: '4 Years',
    annualFee: 88000,
    devFee: 9000,
    totalSeats: 60,
    icon: '💊',
    minPercentage: 55,
    entranceExam: 'EAPCET BIPC',
    eligibilityText: '10+2 with Physics Chemistry Biology/Maths minimum 55%',
    subjects: 'Pharmacology,Pharmaceutical Chemistry,Pharmacognosy,Pharmaceutics',
    campusIds: `${campusIds[0]}`
  },
  {
    _id: programIds[13],
    name: 'B.Sc. – Mathematics',
    department: 'Sciences',
    type: 'UG',
    category: 'Sciences',
    duration: '3 Years',
    annualFee: 34000,
    devFee: 3500,
    totalSeats: 60,
    icon: '📐',
    minPercentage: 50,
    entranceExam: 'Merit-based',
    eligibilityText: '10+2 with Maths minimum 50%',
    subjects: 'Calculus,Linear Algebra,Number Theory,Statistics,Operations Research',
    campusIds: `${campusIds[0]},${campusIds[3]}`
  },
  {
    _id: programIds[14],
    name: 'B.Sc. – Physics',
    department: 'Sciences',
    type: 'UG',
    category: 'Sciences',
    duration: '3 Years',
    annualFee: 34000,
    devFee: 3500,
    totalSeats: 60,
    icon: '🔭',
    minPercentage: 50,
    entranceExam: 'Merit-based',
    eligibilityText: '10+2 with Physics and Maths minimum 50%',
    subjects: 'Classical Mechanics,Quantum Physics,Thermodynamics,Electromagnetism,Optics',
    campusIds: `${campusIds[0]}`
  },
  {
    _id: programIds[15],
    name: 'M.Sc. – Data Science',
    department: 'Sciences',
    type: 'PG',
    category: 'Sciences',
    duration: '2 Years',
    annualFee: 72000,
    devFee: 7000,
    totalSeats: 40,
    icon: '📉',
    minPercentage: 55,
    entranceExam: 'GATE/JAM',
    eligibilityText: 'BSc with Maths/Statistics/CS minimum 55%',
    subjects: 'Machine Learning,Statistical Modeling,Big Data,Python for Data Science,Deep Learning',
    campusIds: `${campusIds[0]}`
  },
  {
    _id: programIds[16],
    name: 'BBA – Business Administration',
    department: 'Management',
    type: 'UG',
    category: 'Management',
    duration: '3 Years',
    annualFee: 42000,
    devFee: 4500,
    totalSeats: 80,
    icon: '🏢',
    minPercentage: 45,
    entranceExam: 'Merit-based',
    eligibilityText: '10+2 any stream minimum 45%',
    subjects: 'Principles of Management,Marketing,Accounting,Business Law,Entrepreneurship',
    campusIds: `${campusIds[0]},${campusIds[2]}`
  },
  {
    _id: programIds[17],
    name: 'Diploma – Computer Engineering',
    department: 'Engineering',
    type: 'UG',
    category: 'Engineering',
    duration: '3 Years',
    annualFee: 28000,
    devFee: 3000,
    totalSeats: 60,
    icon: '🛠️',
    minPercentage: 35,
    entranceExam: 'Merit based 10th',
    eligibilityText: '10th pass minimum 35% no entrance exam',
    subjects: 'Programming in C,Digital Electronics,Computer Hardware,Networking,Web Design',
    campusIds: `${campusIds[1]},${campusIds[3]}`
  }
];

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Seeding MongoDB Database...');

  // Clean all collections
  await Promise.all([
    Campus.deleteMany({}),
    Program.deleteMany({}),
    Course.deleteMany({}),
    Student.deleteMany({}),
    Parent.deleteMany({}),
    Enquiry.deleteMany({}),
    Application.deleteMany({}),
    StudentDoc.deleteMany({}),
    FeePayment.deleteMany({}),
    Receipt.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Mark.deleteMany({}),
    Result.deleteMany({}),
    FollowUp.deleteMany({}),
    StatusHistory.deleteMany({}),
    PlacementDrive.deleteMany({})
  ]);

  // Insert Campuses
  await Campus.insertMany(campusesData);
  console.log('Seeded Campuses');

  // Insert Programs
  await Program.insertMany(programsData);
  console.log('Seeded Programs');

  // Seed default courses
  const coursesData = programsData.map((prog, idx) => ({
    name: `${prog.name} Introductory Course`,
    programId: new mongoose.Types.ObjectId(prog._id),
    credits: 4,
    semester: 1,
    code: `CS-${idx + 1}`,
    title: `${prog.name} Introduction`,
    description: `Introductory course for ${prog.name}`
  }));
  await Course.insertMany(coursesData);
  console.log('Seeded Courses');

  // Seed Placement Drives
  await PlacementDrive.insertMany([
    {
      title: 'TechCorp Software Engineering Drive',
      eligiblePrograms: 'B.Tech – Computer Science & Engineering,M.Tech – Computer Science,B.Sc. – Computer Science',
      company: 'TechCorp Solutions',
      location: 'Rajahmundry Office',
    },
    {
      title: 'Global Finance Analyst Recruitment',
      eligiblePrograms: 'MBA – Business Administration,BBA – Business Administration,B.Com – General,B.Com – Computer Applications',
      company: 'Global Finance Group',
      location: 'Kakinada Office',
    }
  ]);
  console.log('Seeded Placement Drives');

  console.log('Database Seeding Completed Successfully!');
}

if (require.main === module) {
  main()
    .then(() => mongoose.connection.close())
    .catch((err) => {
      console.error('Error during seeding:', err);
      process.exit(1);
    });
}

export { main };
