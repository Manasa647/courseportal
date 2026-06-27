import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Course & Program Portal Database...');

  // Clean data in reverse order of dependencies
  await prisma.followUp.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.feePayment.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.campus.deleteMany({});
  await prisma.placementDrive.deleteMany({});

  // Seed Campuses
  const campusRjy = await prisma.campus.create({
    data: {
      name: 'Rajahmundry Campus',
      location: 'Rajahmundry',
      established: '1995',
      facilities: 'A/C Labs, High-speed Wi-Fi, Digital Library, Seminar Halls, Sports Complex, Hostels',
      studentsCount: 2450,
      address: 'Main Road, Danavaipeta, Rajahmundry, AP'
    }
  });

  const campusPed = await prisma.campus.create({
    data: {
      name: 'Peddapuram Campus',
      location: 'Peddapuram',
      established: '2002',
      facilities: 'Engineering Workshops, Chemistry Labs, Library, Placement Cell, Girls Hostel',
      studentsCount: 1320,
      address: 'ADB Road, Peddapuram, AP'
    }
  });

  const campusKak = await prisma.campus.create({
    data: {
      name: 'Kakinada Campus',
      location: 'Kakinada',
      established: '1999',
      facilities: 'Research Center, Computer Center, Cafeteria, Boys & Girls Hostels, Auditorium',
      studentsCount: 1890,
      address: 'Sarpavaram Junction, Kakinada, AP'
    }
  });

  const campusKov = await prisma.campus.create({
    data: {
      name: 'Kovvur Campus',
      location: 'Kovvur',
      established: '2005',
      facilities: 'Spacious Classrooms, Library, Computer Lab, Playground, Bus Facility',
      studentsCount: 840,
      address: 'Station Road, Kovvur, AP'
    }
  });

  const campusMap: Record<string, any> = {
    'Rajahmundry': campusRjy,
    'Peddapuram': campusPed,
    'Kakinada': campusKak,
    'Kovvur': campusKov
  };

  const programsData = [
    {
      id: 101,
      name: 'B.Tech CSE',
      type: 'UG',
      department: 'Engineering',
      category: 'Engineering',
      duration: '4 Years',
      annualFee: 93000,
      devFee: 8000,
      totalSeats: 180,
      icon: '💻',
      minPercentage: 60.0,
      entranceExam: 'EAPCET / JEE',
      eligibilityText: '10+2 / Intermediate with Maths & Physics',
      subjects: 'Programming in Python,Data Structures & Algorithms,Database Management Systems,Computer Networks,Operating Systems,Web Development',
      campus: 'Rajahmundry'
    },
    {
      id: 102,
      name: 'B.Tech ECE',
      type: 'UG',
      department: 'Engineering',
      category: 'Engineering',
      duration: '4 Years',
      annualFee: 88000,
      devFee: 8000,
      totalSeats: 120,
      icon: '📡',
      minPercentage: 60.0,
      entranceExam: 'EAPCET / JEE',
      eligibilityText: '10+2 / Intermediate with Maths & Physics',
      subjects: 'Network Theory,Electronic Devices & Circuits,Signals & Systems,Microprocessors & Microcontrollers,Analog Communications,VLSI Design',
      campus: 'Kakinada'
    },
    {
      id: 103,
      name: 'B.Tech EEE',
      type: 'UG',
      department: 'Engineering',
      category: 'Engineering',
      duration: '4 Years',
      annualFee: 83000,
      devFee: 8000,
      totalSeats: 60,
      icon: '⚡',
      minPercentage: 60.0,
      entranceExam: 'EAPCET / JEE',
      eligibilityText: '10+2 / Intermediate with Maths & Physics',
      subjects: 'Power Systems,Electrical Machines,Control Systems,Power Electronics,Renewable Energy',
      campus: 'Rajahmundry'
    },
    {
      id: 104,
      name: 'B.Tech Mechanical',
      type: 'UG',
      department: 'Engineering',
      category: 'Engineering',
      duration: '4 Years',
      annualFee: 83000,
      devFee: 8000,
      totalSeats: 60,
      icon: '⚙️',
      minPercentage: 60.0,
      entranceExam: 'EAPCET / JEE',
      eligibilityText: '10+2 / Intermediate with Maths & Physics',
      subjects: 'Engineering Mechanics,Thermodynamics,Fluid Mechanics & Hydraulic Machinery,Kinematics of Machinery,Manufacturing Technology,CAD/CAM',
      campus: 'Peddapuram'
    },
    {
      id: 105,
      name: 'B.Tech Civil',
      type: 'UG',
      department: 'Engineering',
      category: 'Engineering',
      duration: '4 Years',
      annualFee: 83000,
      devFee: 8000,
      totalSeats: 60,
      icon: '🏗️',
      minPercentage: 60.0,
      entranceExam: 'EAPCET / JEE',
      eligibilityText: '10+2 / Intermediate with Maths & Physics',
      subjects: 'Strength of Materials,Surveying,Fluid Mechanics,Structural Analysis,Concrete Technology,Geotechnical Engineering',
      campus: 'Kovvur'
    },
    {
      id: 106,
      name: 'MBA',
      type: 'PG',
      department: 'Management',
      category: 'Management',
      duration: '2 Years',
      annualFee: 71000,
      devFee: 6000,
      totalSeats: 120,
      icon: '💼',
      minPercentage: 50.0,
      entranceExam: 'ICET',
      eligibilityText: "Bachelor's Degree in any discipline",
      subjects: 'Management Theory & Practice,Accounting for Managers,Financial Management,Marketing Management,Strategic Management,Entrepreneurship Development',
      campus: 'Rajahmundry'
    },
    {
      id: 107,
      name: 'MCA',
      type: 'PG',
      department: 'Management',
      category: 'Management',
      duration: '2 Years',
      annualFee: 64000,
      devFee: 6000,
      totalSeats: 60,
      icon: '🖥️',
      minPercentage: 50.0,
      entranceExam: 'ICET',
      eligibilityText: 'B.Sc/B.Com/B.A. with Math at 10+2 or degree level',
      subjects: 'Mathematical Foundations,Java & Web Technologies,Data Structures & Algorithms,Cloud Computing,Artificial Intelligence,Cyber Security',
      campus: 'Peddapuram'
    },
    {
      id: 108,
      name: 'M.Tech CS',
      type: 'PG',
      department: 'Engineering',
      category: 'Engineering',
      duration: '2 Years',
      annualFee: 125000,
      devFee: 10000,
      totalSeats: 18,
      icon: '🔬',
      minPercentage: 50.0,
      entranceExam: 'GATE / PGECET',
      eligibilityText: 'B.Tech in CSE/IT or MCA/M.Sc equivalent',
      subjects: 'Advanced Algorithms,Machine Learning Algorithms,Big Data Engineering,Cloud Security & Privacy,Distributed Systems',
      campus: 'Rajahmundry'
    },
    {
      id: 109,
      name: 'B.Sc CS',
      type: 'UG',
      department: 'Sciences',
      category: 'Sciences',
      duration: '3 Years',
      annualFee: 42000,
      devFee: 4000,
      totalSeats: 60,
      icon: '🌐',
      minPercentage: 50.0,
      entranceExam: 'Merit-Based',
      eligibilityText: '10+2 / Intermediate with MPC stream',
      subjects: 'Programming in C,Data Structures,Database Management Systems,Software Engineering,Java Programming,Python Programming',
      campus: 'Rajahmundry'
    },
    {
      id: 110,
      name: 'B.Com General',
      type: 'UG',
      department: 'Commerce',
      category: 'Commerce',
      duration: '3 Years',
      annualFee: 32000,
      devFee: 3000,
      totalSeats: 100,
      icon: '📊',
      minPercentage: 45.0,
      entranceExam: 'Merit-Based',
      eligibilityText: '10+2 / Intermediate in any stream',
      subjects: 'Financial Accounting,Business Organization & Management,Business Economics,Corporate Accounting,Business Law,Auditing',
      campus: 'Kovvur'
    },
    {
      id: 111,
      name: 'B.Com CA',
      type: 'UG',
      department: 'Commerce',
      category: 'Commerce',
      duration: '3 Years',
      annualFee: 35000,
      devFee: 3000,
      totalSeats: 80,
      icon: '🖱️',
      minPercentage: 45.0,
      entranceExam: 'Merit-Based',
      eligibilityText: '10+2 / Intermediate in any stream',
      subjects: 'Financial Accounting,Information Technology,Database Management Systems,Web Technologies,E-Commerce,Corporate Accounting',
      campus: 'Rajahmundry'
    },
    {
      id: 112,
      name: 'B.A. English',
      type: 'UG',
      department: 'Arts',
      category: 'Arts',
      duration: '3 Years',
      annualFee: 32000,
      devFee: 3000,
      totalSeats: 60,
      icon: '📚',
      minPercentage: 45.0,
      entranceExam: 'Merit-Based',
      eligibilityText: '10+2 / Intermediate in any stream',
      subjects: 'English Literature,Linguistics,Creative Writing,Phonetics,History of English Language',
      campus: 'Peddapuram'
    },
    {
      id: 113,
      name: 'B.Pharmacy',
      type: 'UG',
      department: 'Sciences',
      category: 'Sciences',
      duration: '4 Years',
      annualFee: 97000,
      devFee: 9000,
      totalSeats: 100,
      icon: '💊',
      minPercentage: 50.0,
      entranceExam: 'EAPCET',
      eligibilityText: '10+2 / Intermediate with MPC / BiPC stream',
      subjects: 'Pharmaceutics,Pharmacology,Medicinal Chemistry,Biochemistry,Human Anatomy & Physiology',
      campus: 'Kakinada'
    },
    {
      id: 114,
      name: 'B.Sc Maths',
      type: 'UG',
      department: 'Sciences',
      category: 'Sciences',
      duration: '3 Years',
      annualFee: 32000,
      devFee: 4000,
      totalSeats: 50,
      icon: '📐',
      minPercentage: 50.0,
      entranceExam: 'Merit-Based',
      eligibilityText: '10+2 / Intermediate with MPC stream',
      subjects: 'Differential Equations,Solid Geometry,Real Analysis,Abstract Algebra,Linear Algebra,Numerical Analysis',
      campus: 'Kovvur'
    },
    {
      id: 115,
      name: 'B.Sc Physics',
      type: 'UG',
      department: 'Sciences',
      category: 'Sciences',
      duration: '3 Years',
      annualFee: 32000,
      devFee: 4000,
      totalSeats: 50,
      icon: '⚛️',
      minPercentage: 50.0,
      entranceExam: 'Merit-Based',
      eligibilityText: '10+2 / Intermediate with MPC stream',
      subjects: 'Mechanics & Wave Motion,Thermodynamics & Radiation,Optics,Electromagnetism,Modern Physics,Analog & Digital Electronics',
      campus: 'Peddapuram'
    },
    {
      id: 116,
      name: 'M.Sc Data Science',
      type: 'PG',
      department: 'Sciences',
      category: 'Sciences',
      duration: '2 Years',
      annualFee: 66000,
      devFee: 6000,
      totalSeats: 40,
      icon: '📈',
      minPercentage: 50.0,
      entranceExam: 'Merit-Based',
      eligibilityText: 'B.Sc/B.C.A. with Math or Statistics major',
      subjects: 'Mathematical Foundations,Probability & Statistics,R Programming,Data Visualization,Machine Learning Foundations,Big Data Analytics',
      campus: 'Kakinada'
    },
    {
      id: 117,
      name: 'BBA',
      type: 'UG',
      department: 'Management',
      category: 'Management',
      duration: '3 Years',
      annualFee: 52000,
      devFee: 4000,
      totalSeats: 60,
      icon: '📈',
      minPercentage: 45.0,
      entranceExam: 'Merit-Based',
      eligibilityText: '10+2 / Intermediate in any stream',
      subjects: 'Principles of Management,Business Environment,Marketing Management,Human Resource Management,Financial Management,Organizational Behavior',
      campus: 'Kakinada'
    },
    {
      id: 118,
      name: 'Diploma Computer Engineering',
      type: 'UG',
      department: 'Engineering',
      category: 'Engineering',
      duration: '3 Years',
      annualFee: 35000,
      devFee: 3000,
      totalSeats: 60,
      icon: '🔌',
      minPercentage: 35.0,
      entranceExam: 'POLYCET',
      eligibilityText: '10th Class / SSC Pass Certificate',
      subjects: 'Computer Hardware,Basic Programming,OS Foundations,Networking,Computer Workshop',
      campus: 'Kovvur'
    }
  ];

  for (const prog of programsData) {
    const campus = campusMap[prog.campus];
    await prisma.program.create({
      data: {
        id: prog.id,
        name: prog.name,
        department: prog.department,
        type: prog.type,
        category: prog.category,
        duration: prog.duration,
        annualFee: prog.annualFee,
        devFee: prog.devFee,
        totalSeats: prog.totalSeats,
        icon: prog.icon,
        minPercentage: prog.minPercentage,
        entranceExam: prog.entranceExam,
        eligibilityText: prog.eligibilityText,
        subjects: prog.subjects,
        campusIds: String(campus.id),
        description: `${prog.name} program at ${campus.name}`,
        campuses: {
          connect: [{ id: campus.id }]
        }
      }
    });

    // Also seed a default course under this program so the existing endpoints and tests don't throw 404s
    await prisma.course.create({
      data: {
        name: `${prog.name} Introductory Course`,
        programId: prog.id,
        credits: 4,
        semester: 1,
        code: `CS-${prog.id}`,
        title: `${prog.name} Introduction`,
        description: `Introductory course for ${prog.name}`
      }
    });
  }

  // Seed default Placement Drives for placement page and tests
  await prisma.placementDrive.createMany({
    data: [
      {
        title: 'TechCorp Software Engineering Drive',
        eligiblePrograms: 'B.Tech CSE,M.Tech CS,B.Sc CS',
        company: 'TechCorp Solutions',
        location: 'Rajahmundry Office',
      },
      {
        title: 'Global Finance Analyst Recruitment',
        eligiblePrograms: 'MBA,BBA,B.Com General,B.Com CA',
        company: 'Global Finance Group',
        location: 'Kakinada Office',
      }
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
