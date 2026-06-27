import React, { useState, useEffect } from 'react';
import PublicPortal from './components/PublicPortal';
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Layers, 
  MapPin, 
  AlertCircle, 
  Briefcase, 
  FileText, 
  ShieldAlert,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

// Interfaces
interface Campus {
  id: number;
  name: string;
  location: string;
  address: string;
}

interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
}

interface Program {
  id: number;
  name: string;
  description: string;
  department: string;
  courses: Course[];
}

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  programId: number | null;
  campusId: number | null;
  source: string;
  status: string;
  priority: string;
  aiRecommendation: string | null;
  dateReceived: string;
  program?: { id: number; name: string; department: string };
  campus?: { id: number; name: string; location: string };
}

interface FollowUp {
  id: number;
  enquiryId: number;
  taskName: string;
  dueDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface EnquiryDetail extends Enquiry {
  followUps: FollowUp[];
  application?: { id: number; studentId: number; status: string } | null;
}
const MOCK_PROGRAMS = [
  {
    id: 101,
    name: 'B.Tech CSE',
    tag: 'UG',
    department: 'Engineering',
    duration: '4 Years',
    campus: 'Rajahmundry',
    seats: 180,
    fee: '₹93,000 / Year',
    emoji: '💻',
    subjects: ['Programming in Python', 'Data Structures & Algorithms', 'Database Management Systems', 'Computer Networks', 'Operating Systems', 'Web Development'],
    eligibilityText: '10+2 / Intermediate with Maths & Physics',
    minPercentage: 'Min 60% in Maths + Physics',
    entranceExam: 'Qualifying EAPCET / JEE rank',
    tuitionFee: 85000,
    devFee: 8000,
    totalFee: 93000
  },
  {
    id: 102,
    name: 'B.Tech ECE',
    tag: 'UG',
    department: 'Engineering',
    duration: '4 Years',
    campus: 'Kakinada',
    seats: 120,
    fee: '₹88,000 / Year',
    emoji: '📡',
    subjects: ['Network Theory', 'Electronic Devices & Circuits', 'Signals & Systems', 'Microprocessors & Microcontrollers', 'Analog Communications', 'VLSI Design'],
    eligibilityText: '10+2 / Intermediate with Maths & Physics',
    minPercentage: 'Min 60% in Maths + Physics',
    entranceExam: 'Qualifying EAPCET / JEE rank',
    tuitionFee: 80000,
    devFee: 8000,
    totalFee: 88000
  },
  {
    id: 103,
    name: 'B.Tech EEE',
    tag: 'UG',
    department: 'Engineering',
    duration: '4 Years',
    campus: 'Rajahmundry',
    seats: 60,
    fee: '₹83,000 / Year',
    emoji: '⚡',
    subjects: ['Power Systems', 'Electrical Machines', 'Control Systems', 'Power Electronics', 'Renewable Energy'],
    eligibilityText: '10+2 / Intermediate with Maths & Physics',
    minPercentage: 'Min 60% in Maths + Physics',
    entranceExam: 'Qualifying EAPCET / JEE rank',
    tuitionFee: 75000,
    devFee: 8000,
    totalFee: 83000
  },
  {
    id: 104,
    name: 'B.Tech Mechanical',
    tag: 'UG',
    department: 'Engineering',
    duration: '4 Years',
    campus: 'Peddapuram',
    seats: 60,
    fee: '₹83,000 / Year',
    emoji: '⚙️',
    subjects: ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics & Hydraulic Machinery', 'Kinematics of Machinery', 'Manufacturing Technology', 'CAD/CAM'],
    eligibilityText: '10+2 / Intermediate with Maths & Physics',
    minPercentage: 'Min 60% in Maths + Physics',
    entranceExam: 'Qualifying EAPCET / JEE rank',
    tuitionFee: 75000,
    devFee: 8000,
    totalFee: 83000
  },
  {
    id: 105,
    name: 'B.Tech Civil',
    tag: 'UG',
    department: 'Engineering',
    duration: '4 Years',
    campus: 'Kovvur',
    seats: 60,
    fee: '₹83,000 / Year',
    emoji: '🏗️',
    subjects: ['Strength of Materials', 'Surveying', 'Fluid Mechanics', 'Structural Analysis', 'Concrete Technology', 'Geotechnical Engineering'],
    eligibilityText: '10+2 / Intermediate with Maths & Physics',
    minPercentage: 'Min 60% in Maths + Physics',
    entranceExam: 'Qualifying EAPCET / JEE rank',
    tuitionFee: 75000,
    devFee: 8000,
    totalFee: 83000
  },
  {
    id: 106,
    name: 'MBA',
    tag: 'PG',
    department: 'Management',
    duration: '2 Years',
    campus: 'Rajahmundry',
    seats: 120,
    fee: '₹71,000 / Year',
    emoji: '💼',
    subjects: ['Management Theory & Practice', 'Accounting for Managers', 'Financial Management', 'Marketing Management', 'Strategic Management', 'Entrepreneurship Development'],
    eligibilityText: "Bachelor's Degree in any discipline",
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Qualifying State ICET score',
    tuitionFee: 65000,
    devFee: 6000,
    totalFee: 71000
  },
  {
    id: 107,
    name: 'MCA',
    tag: 'PG',
    department: 'Management',
    duration: '2 Years',
    campus: 'Peddapuram',
    seats: 60,
    fee: '₹64,000 / Year',
    emoji: '🖥️',
    subjects: ['Mathematical Foundations', 'Java & Web Technologies', 'Data Structures & Algorithms', 'Cloud Computing', 'Artificial Intelligence', 'Cyber Security'],
    eligibilityText: 'B.Sc/B.Com/B.A. with Math at 10+2 or degree',
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Qualifying State ICET score',
    tuitionFee: 58000,
    devFee: 6000,
    totalFee: 64000
  },
  {
    id: 108,
    name: 'M.Tech CS',
    tag: 'PG',
    department: 'Engineering',
    duration: '2 Years',
    campus: 'Rajahmundry',
    seats: 18,
    fee: '₹1,25,000 / Year',
    emoji: '🔬',
    subjects: ['Advanced Algorithms', 'Machine Learning Algorithms', 'Big Data Engineering', 'Cloud Security & Privacy', 'Distributed Systems'],
    eligibilityText: 'B.Tech in CSE/IT or MCA/M.Sc equivalent',
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Qualifying GATE / PGECET rank',
    tuitionFee: 115000,
    devFee: 10000,
    totalFee: 125000
  },
  {
    id: 109,
    name: 'B.Sc CS',
    tag: 'UG',
    department: 'Sciences',
    duration: '3 Years',
    campus: 'Rajahmundry',
    seats: 60,
    fee: '₹42,000 / Year',
    emoji: '🌐',
    subjects: ['Programming in C', 'Data Structures', 'Database Management Systems', 'Software Engineering', 'Java Programming', 'Python Programming'],
    eligibilityText: '10+2 / Intermediate with MPC stream',
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 38000,
    devFee: 4000,
    totalFee: 42000
  },
  {
    id: 110,
    name: 'B.Com General',
    tag: 'UG',
    department: 'Commerce',
    duration: '3 Years',
    campus: 'Kovvur',
    seats: 100,
    fee: '₹32,000 / Year',
    emoji: '📊',
    subjects: ['Financial Accounting', 'Business Organization & Management', 'Business Economics', 'Corporate Accounting', 'Business Law', 'Auditing'],
    eligibilityText: '10+2 / Intermediate in any stream',
    minPercentage: 'Min 45% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 29000,
    devFee: 3000,
    totalFee: 32000
  },
  {
    id: 111,
    name: 'B.Com CA',
    tag: 'UG',
    department: 'Commerce',
    duration: '3 Years',
    campus: 'Rajahmundry',
    seats: 80,
    fee: '₹35,000 / Year',
    emoji: '🖱️',
    subjects: ['Financial Accounting', 'Information Technology', 'Database Management Systems', 'Web Technologies', 'E-Commerce', 'Corporate Accounting'],
    eligibilityText: '10+2 / Intermediate in any stream',
    minPercentage: 'Min 45% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 32000,
    devFee: 3000,
    totalFee: 35000
  },
  {
    id: 112,
    name: 'B.A. English',
    tag: 'UG',
    department: 'Arts',
    duration: '3 Years',
    campus: 'Peddapuram',
    seats: 60,
    fee: '₹32,000 / Year',
    emoji: '📚',
    subjects: ['English Literature', 'Linguistics', 'Creative Writing', 'Phonetics', 'History of English Language'],
    eligibilityText: '10+2 / Intermediate in any stream',
    minPercentage: 'Min 45% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 29000,
    devFee: 3000,
    totalFee: 32000
  },
  {
    id: 113,
    name: 'B.Pharmacy',
    tag: 'UG',
    department: 'Sciences',
    duration: '4 Years',
    campus: 'Kakinada',
    seats: 100,
    fee: '₹97,000 / Year',
    emoji: '💊',
    subjects: ['Pharmaceutics', 'Pharmacology', 'Medicinal Chemistry', 'Biochemistry', 'Human Anatomy & Physiology'],
    eligibilityText: '10+2 / Intermediate with MPC / BiPC stream',
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Qualifying EAPCET rank',
    tuitionFee: 88000,
    devFee: 9000,
    totalFee: 97000
  },
  {
    id: 114,
    name: 'B.Sc Maths',
    tag: 'UG',
    department: 'Sciences',
    duration: '3 Years',
    campus: 'Kovvur',
    seats: 50,
    fee: '₹32,000 / Year',
    emoji: '📐',
    subjects: ['Differential Equations', 'Solid Geometry', 'Real Analysis', 'Abstract Algebra', 'Linear Algebra', 'Numerical Analysis'],
    eligibilityText: '10+2 / Intermediate with MPC stream',
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 28000,
    devFee: 4000,
    totalFee: 32000
  },
  {
    id: 115,
    name: 'B.Sc Physics',
    tag: 'UG',
    department: 'Sciences',
    duration: '3 Years',
    campus: 'Peddapuram',
    seats: 50,
    fee: '₹32,000 / Year',
    emoji: '⚛️',
    subjects: ['Mechanics & Wave Motion', 'Thermodynamics & Radiation', 'Optics', 'Electromagnetism', 'Modern Physics', 'Analog & Digital Electronics'],
    eligibilityText: '10+2 / Intermediate with MPC stream',
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 28000,
    devFee: 4000,
    totalFee: 32000
  },
  {
    id: 116,
    name: 'M.Sc Data Science',
    tag: 'PG',
    department: 'Sciences',
    duration: '2 Years',
    campus: 'Kakinada',
    seats: 40,
    fee: '₹66,000 / Year',
    emoji: '📈',
    subjects: ['Mathematical Foundations', 'Probability & Statistics', 'R Programming', 'Data Visualization', 'Machine Learning Foundations', 'Big Data Analytics'],
    eligibilityText: 'B.Sc/B.C.A. with Math or Statistics major',
    minPercentage: 'Min 50% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 60000,
    devFee: 6000,
    totalFee: 66000
  },
  {
    id: 117,
    name: 'BBA',
    tag: 'UG',
    department: 'Management',
    duration: '3 Years',
    campus: 'Kakinada',
    seats: 60,
    fee: '₹52,000 / Year',
    emoji: '📈',
    subjects: ['Principles of Management', 'Business Environment', 'Marketing Management', 'Human Resource Management', 'Financial Management', 'Organizational Behavior'],
    eligibilityText: '10+2 / Intermediate in any stream',
    minPercentage: 'Min 45% aggregate score',
    entranceExam: 'Merit-Based Admissions',
    tuitionFee: 48000,
    devFee: 4000,
    totalFee: 52000
  },
  {
    id: 118,
    name: 'Diploma Computer Engineering',
    tag: 'UG',
    department: 'Engineering',
    duration: '3 Years',
    campus: 'Kovvur',
    seats: 60,
    fee: '₹35,000 / Year',
    emoji: '🔌',
    subjects: ['Computer Hardware', 'Basic Programming', 'OS Foundations', 'Networking', 'Computer Workshop'],
    eligibilityText: '10th Class / SSC Pass Certificate',
    minPercentage: 'Min 35% aggregate score',
    entranceExam: 'Qualifying State POLYCET score',
    tuitionFee: 32000,
    devFee: 3000,
    totalFee: 35000
  }
];

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : "https://sgei-portal-backend.onrender.com";

export default function App() {
  // View routing state: 'portal' | 'dashboard' | 'detail'
  const [currentView, setCurrentView] = useState<'portal' | 'dashboard' | 'detail'>('portal');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);

  // Subpage states
  const [activeSubpage, setActiveSubpage] = useState<'home' | 'courses' | 'eligibility' | 'fees' | 'admission' | 'enquiry' | 'faq'>('home');
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<any | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Stats count-up state
  const [statsCount, setStatsCount] = useState({
    programs: 0,
    campuses: 0,
    seats: 0,
    placement: 0
  });

  // Metadata catalogs
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  // Public Portal State
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    programId: '',
    campusId: '',
    backgroundNotes: ''
  });
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('all');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Dashboard Operations State
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [dashLoading, setDashLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    programId: '',
    startDate: '',
    endDate: ''
  });

  // Detail View State
  const [detailEnquiry, setDetailEnquiry] = useState<EnquiryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // --- NEW AI & WORKFLOW STATE WIDGETS ---
  // FAQ Widget State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqProgramId, setFaqProgramId] = useState('');
  const [faqAnswer, setFaqAnswer] = useState<string | null>(null);
  const [faqLoading, setFaqLoading] = useState(false);

  // Recommend Program State
  const [recInterests, setRecInterests] = useState('');
  const [recBackground, setRecBackground] = useState('');
  const [recommendations, setRecommendations] = useState<{ programName: string; matchReason: string; matchScore: number }[] | null>(null);
  const [recLoading, setRecLoading] = useState(false);



  // Student Dashboard Specifics (Risk, report, placements)
  const [teacherNotes, setTeacherNotes] = useState('');
  const [progressReport, setProgressReport] = useState<string | null>(null);
  const [progressReportLoading, setProgressReportLoading] = useState(false);
  const [dropoutRisk, setDropoutRisk] = useState<{ riskLevel: string; reasons: string[] } | null>(null);
  const [dropoutRiskLoading, setDropoutRiskLoading] = useState(false);
  const [placementDrives, setPlacementDrives] = useState<{ id: number; title: string; eligiblePrograms: string[]; company?: string; location?: string }[]>([]);
  const [placementLoading, setPlacementLoading] = useState(false);

  // --- NEW HANDLERS ---
  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim()) return;
    setFaqLoading(true);
    setFaqAnswer(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: faqQuestion, programId: faqProgramId || undefined })
      });
      const json = await res.json();
      if (json.success) {
        setFaqAnswer(json.data.answer);
      } else {
        setFaqAnswer('Error: ' + (json.message || 'Could not fetch answer.'));
      }
    } catch (err) {
      setFaqAnswer('Network error occurred. Please try again.');
    } finally {
      setFaqLoading(false);
    }
  };

  const handleRecommendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recInterests.trim()) return;
    setRecLoading(true);
    setRecommendations(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/recommend-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: recInterests, priorBackground: recBackground || undefined })
      });
      const json = await res.json();
      if (json.success) {
        setRecommendations(json.data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setRecLoading(false);
    }
  };


  const fetchDropoutRisk = async (studentId: number) => {
    setDropoutRiskLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/dropout-risk`);
      const json = await res.json();
      if (json.success) {
        setDropoutRisk(json.data.risk);
      }
    } catch (err) {
      console.error('Error fetching dropout risk:', err);
    } finally {
      setDropoutRiskLoading(false);
    }
  };

  const fetchPlacementDrives = async (studentId: number) => {
    setPlacementLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/placements/list?studentId=${studentId}`);
      const json = await res.json();
      if (json.success) {
        setPlacementDrives(json.data);
      }
    } catch (err) {
      console.error('Error fetching placement drives:', err);
    } finally {
      setPlacementLoading(false);
    }
  };

  const handleGenerateProgressReport = async (studentId: number) => {
    setProgressReportLoading(true);
    setProgressReport(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/progress-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, teacherNotes: teacherNotes || undefined })
      });
      const json = await res.json();
      if (json.success) {
        setProgressReport(json.data.report);
      }
    } catch (err) {
      console.error('Error generating progress report:', err);
    } finally {
      setProgressReportLoading(false);
    }
  };

  // Fetch student-specific support details when a student is admitted
  useEffect(() => {
    const studentId = detailEnquiry?.application?.studentId;
    if (studentId) {
      fetchDropoutRisk(studentId);
      fetchPlacementDrives(studentId);
    } else {
      setDropoutRisk(null);
      setPlacementDrives([]);
    }
  }, [detailEnquiry?.application?.studentId]);

  // Global Initial fetch
  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const campRes = await fetch(`${API_BASE_URL}/campuses`);
      const campJson = await campRes.json();
      if (campJson.success) setCampuses(campJson.data);
    } catch (err) {
      console.error('Error fetching metadata dropdown catalogs:', err);
    }
  };

  const fetchPrograms = async (campusId?: string) => {
    try {
      const url = campusId && campusId !== 'all' 
        ? `${API_BASE_URL}/programs?campusId=${campusId}` 
        : `${API_BASE_URL}/programs`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setPrograms(json.data);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  useEffect(() => {
    fetchPrograms(selectedCampusFilter);
    setRecommendations(null);
  }, [selectedCampusFilter]);

  // Fetch Dashboard data
  const fetchDashboardList = async () => {
    setDashLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.programId) queryParams.append('programId', filters.programId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const res = await fetch(`${API_BASE_URL}/enquiries/list?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data);
      }
    } catch (err) {
      console.error('Error loading dashboard list:', err);
    } finally {
      setDashLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchDashboardList();
    }
  }, [currentView, filters]);

  // Fetch Enquiry Detail data
  const fetchEnquiryDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/detail?id=${id}`);
      const json = await res.json();
      if (json.success) {
        setDetailEnquiry(json.data);
      } else {
        setDetailError(json.message || 'Record not found.');
      }
    } catch (err) {
      setDetailError('Failed to fetch details due to network connection error.');
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'detail' && selectedEnquiryId) {
      fetchEnquiryDetail(selectedEnquiryId);
    }
  }, [currentView, selectedEnquiryId]);

  // Stats count-up animation trigger
  useEffect(() => {
    if (activeSubpage === 'home') {
      let start = 0;
      const duration = 1000; // 1s
      const steps = 25;
      const stepTime = duration / steps;
      
      const timer = setInterval(() => {
        start += 1;
        setStatsCount({
          programs: Math.min(Math.floor((18 / steps) * start), 18),
          campuses: Math.min(Math.floor((4 / steps) * start), 4),
          seats: Math.min(Math.floor((1240 / steps) * start), 1240),
          placement: Math.min(Math.floor((94 / steps) * start), 94)
        });
        if (start >= steps) {
          clearInterval(timer);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [activeSubpage]);

  // Handler to bridge mock catalog selection to DB enquiry fields
  const handleApplyEnquireFromModal = (mockProg: any) => {
    let dbProgId = '';
    const progNameLower = mockProg.name.toLowerCase();
    
    if (progNameLower.includes('computer') || progNameLower.includes('mca') || progNameLower.includes('bca') || progNameLower.includes('software')) {
      const dbProg = programs.find(p => p.name.includes('Computer Science'));
      if (dbProg) dbProgId = String(dbProg.id);
    } else if (progNameLower.includes('business') || progNameLower.includes('bba') || progNameLower.includes('mba') || progNameLower.includes('admin')) {
      const dbProg = programs.find(p => p.name.includes('Business Administration'));
      if (dbProg) dbProgId = String(dbProg.id);
    } else if (progNameLower.includes('data science') || progNameLower.includes('ai') || progNameLower.includes('analytics')) {
      const dbProg = programs.find(p => p.name.includes('Data Science'));
      if (dbProg) dbProgId = String(dbProg.id);
    }
    
    if (!dbProgId && programs.length > 0) {
      dbProgId = String(programs[0].id);
    }

    let dbCampusId = '';
    const campusLower = mockProg.campus.toLowerCase();
    
    if (campusLower === 'rajahmundry' || campusLower === 'kovvur') {
      const dbCamp = campuses.find(c => c.name.includes('Main') || c.location.toLowerCase().includes('boston'));
      if (dbCamp) dbCampusId = String(dbCamp.id);
    } else if (campusLower === 'kakinada' || campusLower === 'peddapuram') {
      const dbCamp = campuses.find(c => c.name.includes('City') || c.location.toLowerCase().includes('new york'));
      if (dbCamp) dbCampusId = String(dbCamp.id);
    }
    
    if (!dbCampusId && campuses.length > 0) {
      dbCampusId = String(campuses[0].id);
    }

    setEnquiryForm({
      ...enquiryForm,
      programId: dbProgId,
      campusId: dbCampusId,
      backgroundNotes: `Interested in ${mockProg.name} at ${mockProg.campus} campus. Duration: ${mockProg.duration}.`
    });

    setSelectedProgramDetail(null);
    setActiveSubpage('enquiry');
  };

  // Form submit handler
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess(null);
    setFormErrors([]);

    // Client-side validations
    const errors: string[] = [];
    if (!enquiryForm.name.trim()) errors.push('Please enter your full name.');
    if (!enquiryForm.email.trim() || !/^\S+@\S+\.\S+$/.test(enquiryForm.email)) {
      errors.push('Please enter a valid email address.');
    }
    if (enquiryForm.phone && enquiryForm.phone.trim().length < 5) {
      errors.push('Phone number must be at least 5 characters long.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryForm)
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        setFormSuccess(`Thank you, ${enquiryForm.name}! Your enquiry has been registered. Admissions officers have scheduled 3 follow-ups and generated your program recommendation.`);
        setEnquiryForm({
          name: '',
          email: '',
          phone: '',
          programId: '',
          campusId: '',
          backgroundNotes: ''
        });
      } else {
        setFormErrors(json.errors || [json.message || 'Failed to submit enquiry.']);
      }
    } catch (err) {
      setFormErrors(['Failed to submit enquiry due to a network connection error. Please try again.']);
    } finally {
      setFormLoading(false);
    }
  };

  // Follow-up status toggler
  const toggleFollowUpStatus = async (followUpId: number, currentStatus: string) => {
    if (!detailEnquiry) return;
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    // Optimistic UI update
    const updatedFollowUps = detailEnquiry.followUps.map(f => 
      f.id === followUpId ? { ...f, status: newStatus } : f
    );
    setDetailEnquiry({ ...detailEnquiry, followUps: updatedFollowUps });

    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/followup/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // Revert on error
        fetchEnquiryDetail(detailEnquiry.id);
      }
    } catch (err) {
      console.error('Failed to patch follow-up status:', err);
      // Revert
      fetchEnquiryDetail(detailEnquiry.id);
    }
  };

const stats = {
    total: enquiries.length,
    pending: enquiries.filter(e => e.status === 'pending').length,
    highPriority: enquiries.filter(e => e.priority === 'HIGH').length,
    converted: enquiries.filter(e => e.status === 'admitted' || e.status === 'applied').length
  };

  return (
    <div className="app-container" style={currentView === 'portal' ? { backgroundColor: '#f5f6fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' } : undefined}>
      {currentView === 'portal' ? (
        <PublicPortal
          MOCK_PROGRAMS={MOCK_PROGRAMS}
          activeSubpage={activeSubpage}
          setActiveSubpage={setActiveSubpage}
          selectedProgramDetail={selectedProgramDetail}
          setSelectedProgramDetail={setSelectedProgramDetail}
          courseSearchQuery={courseSearchQuery}
          setCourseSearchQuery={setCourseSearchQuery}
          statsCount={statsCount}
          campuses={campuses}
          programs={programs}
          selectedCampusFilter={selectedCampusFilter}
          setSelectedCampusFilter={setSelectedCampusFilter}
          enquiryForm={enquiryForm}
          setEnquiryForm={setEnquiryForm}
          formLoading={formLoading}
          formSuccess={formSuccess}
          formErrors={formErrors}
          handleEnquirySubmit={handleEnquirySubmit}
          recInterests={recInterests}
          setRecInterests={setRecInterests}
          recBackground={recBackground}
          setRecBackground={setRecBackground}
          recommendations={recommendations}
          recLoading={recLoading}
          handleRecommendSubmit={handleRecommendSubmit}
          faqQuestion={faqQuestion}
          setFaqQuestion={setFaqQuestion}
          faqProgramId={faqProgramId}
          setFaqProgramId={setFaqProgramId}
          faqAnswer={faqAnswer}
          faqLoading={faqLoading}
          handleFaqSubmit={handleFaqSubmit}
          handleApplyEnquireFromModal={handleApplyEnquireFromModal}
          setCurrentView={setCurrentView}
          API_BASE_URL={API_BASE_URL}
          setFaqAnswer={setFaqAnswer}
          setFaqLoading={setFaqLoading}
        />
      ) : (
        <>
          {/* Top Navbar */}
          <header className="navbar">
            <div className="logo-section">
              <BookOpen className="logo-icon" />
              <h1 className="logo-text">EduPortal Staff Dashboard</h1>
            </div>
            <nav className="nav-links">
              <button 
                className="nav-btn"
                onClick={() => { setCurrentView('portal'); setActiveSubpage('home'); setFormSuccess(null); setFormErrors([]); }}
                id="nav-link-portal"
              >
                Public Portal
              </button>
              <button 
                className="nav-btn active"
                onClick={() => setCurrentView('dashboard')}
                id="nav-link-dashboard"
              >
                Staff Dashboard
              </button>
            </nav>
          </header>

          {/* Main Body */}
          <main className="content-wrapper">
            
            {/* VIEW 2: OPERATIONS DASHBOARD (INTERNAL STAFF) */}
            {currentView === 'dashboard' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.75rem' }}>Operations & Academic Support</h2>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Manage educational records, lead statuses, staff assignments, and follow-up activities.</p>
                  </div>
                  <button className="btn-secondary" onClick={() => fetchDashboardList()} id="refresh-dashboard-btn">
                    Refresh Records
                  </button>
                </div>

                {/* Stats Overview */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper"><Layers /></div>
                    <div className="stat-info">
                      <h5>Total Enquiries</h5>
                      <p>{stats.total}</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '3px solid hsl(var(--warning))' }}>
                    <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--warning))', backgroundColor: 'var(--warning-glow)' }}><Clock /></div>
                    <div className="stat-info">
                      <h5>Pending Review</h5>
                      <p>{stats.pending}</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '3px solid hsl(var(--priority-high))' }}>
                    <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--priority-high))', backgroundColor: 'var(--priority-high-bg)' }}><AlertTriangle /></div>
                    <div className="stat-info">
                      <h5>High Priority</h5>
                      <p>{stats.highPriority}</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '3px solid hsl(var(--success))' }}>
                    <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--success))', backgroundColor: 'var(--success-glow)' }}><CheckCircle /></div>
                    <div className="stat-info">
                      <h5>Converted Leads</h5>
                      <p>{stats.converted}</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Filters */}
                <div className="filter-bar">
                  <div className="filter-group">
                    <label htmlFor="filter-status">Status:</label>
                    <select 
                      id="filter-status"
                      value={filters.status}
                      onChange={e => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="applied">Applied</option>
                      <option value="admitted">Admitted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-program">Target Program:</label>
                    <select 
                      id="filter-program"
                      value={filters.programId}
                      onChange={e => setFilters({ ...filters, programId: e.target.value })}
                    >
                      <option value="">All Programs</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-start-date">From Date:</label>
                    <input 
                      type="date" 
                      id="filter-start-date"
                      value={filters.startDate}
                      onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-end-date">To Date:</label>
                    <input 
                      type="date" 
                      id="filter-end-date"
                      value={filters.endDate}
                      onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Table Records */}
                {dashLoading ? (
                  <div className="card">
                    <div className="skeleton-line" style={{ width: '100%' }}></div>
                    <div className="skeleton-line" style={{ width: '90%' }}></div>
                    <div className="skeleton-line" style={{ width: '95%' }}></div>
                    <div className="skeleton-line" style={{ width: '80%' }}></div>
                  </div>
                ) : enquiries.length === 0 ? (
                  <div className="card">
                    <div className="empty-state">
                      <Search className="empty-icon" />
                      <h4>No Matching Records</h4>
                      <p>Try resetting the search filters or submit a new enquiry profile from the Admissions Hub.</p>
                    </div>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Candidate Info</th>
                          <th>Date Received</th>
                          <th>Priority</th>
                          <th>Target Program</th>
                          <th>Preferred Campus</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiries.map(enquiry => (
                          <tr key={enquiry.id}>
                            <td>
                              <div style={{ fontWeight: '700' }}>{enquiry.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{enquiry.email}</div>
                              {enquiry.phone && <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{enquiry.phone}</div>}
                            </td>
                            <td>{new Date(enquiry.dateReceived).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge badge-priority-${enquiry.priority.toLowerCase()}`}>
                                {enquiry.priority}
                              </span>
                            </td>
                            <td>{enquiry.program?.name || 'General Inquiry'}</td>
                            <td>{enquiry.campus?.name || 'Any Campus'}</td>
                            <td>
                              <span className={`badge badge-status-${enquiry.status.toLowerCase()}`}>
                                {enquiry.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="row-action-btn"
                                onClick={() => {
                                  setSelectedEnquiryId(enquiry.id);
                                  setCurrentView('detail');
                                }}
                                id={`view-detail-btn-${enquiry.id}`}
                              >
                                Manage Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: DETAILED RECORD PANEL */}
            {currentView === 'detail' && (
              <div>
                <div className="detail-header">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setCurrentView('dashboard')}
                    id="back-to-dashboard-btn"
                  >
                    <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back to Dashboard
                  </button>
                  
                  {detailEnquiry && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className={`badge badge-priority-${detailEnquiry.priority.toLowerCase()}`}>
                        Priority: {detailEnquiry.priority}
                      </span>
                      <span className={`badge badge-status-${detailEnquiry.status.toLowerCase()}`}>
                        Status: {detailEnquiry.status}
                      </span>
                    </div>
                  )}
                </div>

                {detailLoading ? (
                  <div className="card">
                    <div className="skeleton-line" style={{ width: '40%' }}></div>
                    <div className="skeleton-line" style={{ width: '70%' }}></div>
                    <div className="skeleton-line" style={{ width: '60%' }}></div>
                    <div className="skeleton-line" style={{ width: '50%' }}></div>
                  </div>
                ) : detailError || !detailEnquiry ? (
                  <div className="card">
                    <div className="empty-state alert-error">
                      <AlertCircle className="empty-icon" />
                      <h4>Failed to load record details</h4>
                      <p>{detailError || 'The record details could not be found or have been deleted.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="detail-grid">
                    
                    {/* Left Column: AI Recommendation fit & background */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Basic Info */}
                      <div className="card">
                        <h3 className="section-title"><Users style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(var(--primary))' }} /> Profile Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Candidate Name</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{detailEnquiry.name}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Email Address</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Mail style={{ width: '0.9rem', height: '0.9rem', color: 'hsl(var(--text-muted))' }} /> {detailEnquiry.email}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Contact Number</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Phone style={{ width: '0.9rem', height: '0.9rem', color: 'hsl(var(--text-muted))' }} /> {detailEnquiry.phone || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Record Intake Date</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Calendar style={{ width: '0.9rem', height: '0.9rem', color: 'hsl(var(--text-muted))' }} /> {new Date(detailEnquiry.dateReceived).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Registered Program</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <BookOpen style={{ width: '0.9rem', height: '0.9rem', color: 'hsl(var(--text-muted))' }} /> {detailEnquiry.program?.name || 'General Inquiry'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Target Campus</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MapPin style={{ width: '0.9rem', height: '0.9rem', color: 'hsl(var(--text-muted))' }} /> {detailEnquiry.campus?.name || 'Unassigned'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Recommendation Details */}
                      <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <h3 className="section-title" style={{ color: 'hsl(var(--primary-hover))' }}>
                          <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(var(--primary))' }} /> AI Counseling Evaluation & Recommendations
                        </h3>
                        <div className="markdown-container">
                          {detailEnquiry.aiRecommendation ? (
                            <div dangerouslySetInnerHTML={{ 
                              __html: detailEnquiry.aiRecommendation
                                .replace(/### (.*)/g, '<h3>$1</h3>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/- (.*)/g, '<li>$1</li>')
                                .replace(/```text([\s\S]*?)```/g, '<pre>$1</pre>')
                                .replace(/\n/g, '<br />')
                            }} />
                          ) : (
                            <p style={{ color: 'hsl(var(--text-secondary))', fontStyle: 'italic' }}>
                              No evaluation is available. Background notes were not supplied during checkout.
                            </p>
                          )}
                        </div>
                      </div>

                      {detailEnquiry.application?.studentId && (
                        <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <h3 className="section-title" style={{ color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText style={{ width: '1.25rem', height: '1.25rem' }} /> Academic Progress Report (AI Generator)
                          </h3>
                          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Generate a parent-facing progress report summarising attendance, course grades, and custom notes.
                          </p>
                          <div className="form-group">
                            <label htmlFor="teacher-notes">Teacher/Counselor Guidance Notes</label>
                            <textarea 
                              id="teacher-notes"
                              className="form-control"
                              placeholder="e.g. Robert shows great promise in Python programming but should practice writing algorithms."
                              value={teacherNotes}
                              onChange={e => setTeacherNotes(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <button 
                            className="btn-primary"
                            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-hover)))' }}
                            onClick={() => handleGenerateProgressReport(detailEnquiry.application!.studentId)}
                            disabled={progressReportLoading}
                            id="generate-report-btn"
                          >
                            {progressReportLoading ? 'Generating Report...' : 'Generate Progress Report'}
                          </button>

                          {progressReport && (
                            <div className="markdown-container" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px dashed hsl(var(--success))' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'hsl(var(--success))' }}>
                                Parent Report Draft:
                              </h4>
                              <div dangerouslySetInnerHTML={{ 
                                __html: progressReport
                                  .replace(/### (.*)/g, '<h3>$1</h3>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/- (.*)/g, '<li>$1</li>')
                                  .replace(/\n/g, '<br />')
                              }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Scheduled Reminders & follow-ups */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div className="card">
                        <h3 className="section-title">
                          <Clock style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(var(--primary))' }} /> Follow-up Action Items
                        </h3>
                        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                          Scheduled milestones generated by the workflow engine. Toggle completion status:
                        </p>

                        <div>
                          {detailEnquiry.followUps.length === 0 ? (
                            <div className="empty-state" style={{ padding: '2rem' }}>
                              <CheckCircle className="empty-icon" style={{ color: 'hsl(var(--success))' }} />
                              <p style={{ fontSize: '0.85rem' }}>All follow-up tasks completed!</p>
                            </div>
                          ) : (
                            detailEnquiry.followUps.map(task => (
                              <div key={task.id} className="checklist-item">
                                <input 
                                  type="checkbox" 
                                  className="checklist-checkbox"
                                  checked={task.status === 'completed'}
                                  onChange={() => toggleFollowUpStatus(task.id, task.status)}
                                />
                                <div className="checklist-details">
                                  <h5 className={task.status === 'completed' ? 'completed' : ''}>
                                    {task.taskName}
                                  </h5>
                                  {task.notes && <p>{task.notes}</p>}
                                  <span className={`due-badge ${
                                    task.status === 'completed' 
                                      ? 'badge-status-admitted' 
                                      : new Date(task.dueDate) < new Date() 
                                        ? 'badge-priority-high' 
                                        : 'badge-status-pending'
                                  }`}>
                                    {task.status === 'completed' ? 'Done' : `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {!detailEnquiry.application?.studentId ? (
                        <div className="card">
                          <h3 className="section-title"><Info style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(var(--primary))' }} /> Administrative Actions</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button 
                              className="btn-primary" 
                              style={{ background: 'linear-gradient(135deg, hsl(var(--success)), hsl(142, 60%, 35%))', boxShadow: 'none' }}
                              onClick={async () => {
                                try {
                                  const res1 = await fetch(`${API_BASE_URL}/applications/create`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ enquiryId: detailEnquiry.id })
                                  });
                                  const json1 = await res1.json();
                                  if (json1.success) {
                                    const appId = json1.data.id;
                                    await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'admitted' })
                                    });
                                  }
                                  // Refresh detail
                                  fetchEnquiryDetail(detailEnquiry.id);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              id="btn-simulate-admission"
                            >
                              Simulate Student Admission
                            </button>
                            
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>
                              Simulating admissions registers a core student profile inside the `students` table.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Dropout Risk Card */}
                          <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--text-primary))' }}>
                              <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(var(--priority-high))' }} /> Academic Risk Assessment
                            </h3>
                            {dropoutRiskLoading ? (
                              <div className="skeleton-line" style={{ width: '80%' }}></div>
                            ) : dropoutRisk ? (
                              <div>
                                <div style={{ 
                                  display: 'inline-block', 
                                  padding: '0.25rem 0.75rem', 
                                  borderRadius: 'var(--radius-sm)', 
                                  fontWeight: '700', 
                                  fontSize: '0.85rem',
                                  marginBottom: '0.75rem',
                                  backgroundColor: dropoutRisk.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : dropoutRisk.riskLevel === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: dropoutRisk.riskLevel === 'HIGH' ? 'hsl(var(--priority-high))' : dropoutRisk.riskLevel === 'MEDIUM' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
                                  border: `1px solid ${dropoutRisk.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.3)' : dropoutRisk.riskLevel === 'MEDIUM' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                }}>
                                  Risk Level: {dropoutRisk.riskLevel}
                                </div>
                                {dropoutRisk.reasons.length > 0 ? (
                                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {dropoutRisk.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                  </ul>
                                ) : (
                                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Student is performing well. Attendance, grades, and payments are in safe thresholds.</p>
                                )}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Could not load risk metrics.</p>
                            )}
                          </div>

                          {/* Placement Drives Card */}
                          <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--text-primary))' }}>
                              <Briefcase style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(var(--success))' }} /> Matched Placement Drives
                            </h3>
                            {placementLoading ? (
                              <div className="skeleton-line" style={{ width: '80%' }}></div>
                            ) : placementDrives.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {placementDrives.map(drive => (
                                  <div key={drive.id} style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--success))', marginBottom: '0.15rem' }}>{drive.title}</h5>
                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.15rem' }}>Company: {drive.company || 'N/A'}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Location: {drive.location || 'N/A'}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>No matching placement drives found for the target program.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}
