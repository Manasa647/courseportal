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

  // Seed 4 Campuses
  await prisma.campus.create({
    data: {
      id: 1,
      name: 'Rajahmundry Campus',
      location: 'Rajahmundry',
      established: '1995',
      studentsCount: 2450,
      facilities: 'A/C Labs,High-speed Wi-Fi,Digital Library,Seminar Halls,Sports Complex,Hostels',
      address: 'Main Road, Danavaipeta, Rajahmundry, AP'
    }
  });

  await prisma.campus.create({
    data: {
      id: 2,
      name: 'Peddapuram Campus',
      location: 'Peddapuram',
      established: '2002',
      studentsCount: 1320,
      facilities: 'Engineering Workshops,Chemistry Labs,Library,Placement Cell,Girls Hostel',
      address: 'ADB Road, Peddapuram, AP'
    }
  });

  await prisma.campus.create({
    data: {
      id: 3,
      name: 'Kakinada Campus',
      location: 'Kakinada',
      established: '1999',
      studentsCount: 1890,
      facilities: 'Research Center,Computer Center,Cafeteria,Boys & Girls Hostels,Auditorium',
      address: 'Sarpavaram Junction, Kakinada, AP'
    }
  });

  await prisma.campus.create({
    data: {
      id: 4,
      name: 'Kovvur Campus',
      location: 'Kovvur',
      established: '2010',
      studentsCount: 780,
      facilities: 'Smart Classrooms,Computer Lab,Library,Cafeteria',
      address: 'NH-16, Kovvur, West Godavari, AP'
    }
  });

  // Seed 18 Programs using createMany
  const programsData = [
    {
      id: 1,
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
      campusIds: '1,2'
    },
    {
      id: 2,
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
      campusIds: '1,3'
    },
    {
      id: 3,
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
      campusIds: '1,3'
    },
    {
      id: 4,
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
      campusIds: '1,2'
    },
    {
      id: 5,
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
      campusIds: '2,4'
    },
    {
      id: 6,
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
      campusIds: '1,3'
    },
    {
      id: 7,
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
      campusIds: '1,2'
    },
    {
      id: 8,
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
      campusIds: '1'
    },
    {
      id: 9,
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
      campusIds: '1,3,4'
    },
    {
      id: 10,
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
      campusIds: '1,2,3,4'
    },
    {
      id: 11,
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
      campusIds: '1,3'
    },
    {
      id: 12,
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
      campusIds: '1,2'
    },
    {
      id: 13,
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
      campusIds: '1'
    },
    {
      id: 14,
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
      campusIds: '1,4'
    },
    {
      id: 15,
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
      campusIds: '1'
    },
    {
      id: 16,
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
      campusIds: '1'
    },
    {
      id: 17,
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
      campusIds: '1,3'
    },
    {
      id: 18,
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
      campusIds: '2,4'
    }
  ];

  await prisma.program.createMany({
    data: programsData
  });

  // Connect implicit program-campus relations
  for (const prog of programsData) {
    const campusIdsArray = prog.campusIds.split(',').map(id => Number(id.trim()));
    await prisma.program.update({
      where: { id: prog.id },
      data: {
        campuses: {
          connect: campusIdsArray.map(id => ({ id }))
        }
      }
    });
  }

  // Seed default courses
  const coursesData = programsData.map(prog => ({
    name: `${prog.name} Introductory Course`,
    programId: prog.id,
    credits: 4,
    semester: 1,
    code: `CS-${prog.id}`,
    title: `${prog.name} Introduction`,
    description: `Introductory course for ${prog.name}`
  }));

  await prisma.course.createMany({
    data: coursesData
  });

  // Seed default Placement Drives
  await prisma.placementDrive.createMany({
    data: [
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
    ],
  });

  console.log('Seeded 18 programs successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
