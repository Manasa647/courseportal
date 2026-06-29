/// <reference types="vite/client" />
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
export interface Campus {
  id: number;
  name: string;
  location: string;
  address: string;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
}

export interface Program {
  id: number;
  name: string;
  description: string;
  department: string;
  courses: Course[];
}

export interface Enquiry {
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

export interface FollowUp {
  id: number;
  enquiryId: number;
  taskName: string;
  dueDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface StatusHistory {
  id: number;
  enquiryId: number;
  status: string;
  notes: string | null;
  changedAt: string;
}

export interface EnquiryDetail extends Enquiry {
  followUps: FollowUp[];
  statusHistories?: StatusHistory[];
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
  ? "http://localhost:5000/api"
  : window.location.origin + "/api";

export default function App() {
  // Controller routing states
  const [currentView, setCurrentView] = useState<'portal' | 'dashboard' | 'detail'>('portal');
  const [activeSubpage, setActiveSubpage] = useState<'home' | 'courses' | 'eligibility' | 'fees' | 'admission' | 'enquiry' | 'faq'>('home');
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<any | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Live catalogs & stats from API
  const [livePrograms, setLivePrograms] = useState<any[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  console.log('Programs loading status:', programsLoading);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('all');
  const [statsCount, setStatsCount] = useState({
    programs: 0,
    campuses: 0,
    seats: 0,
    placement: 0
  });

  // Global full-page loading & error state
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Enquiry & dashboard states
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);
  
  // Forms & UI states
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    programId: '',
    campusId: '',
    backgroundNotes: '',
    sscPercent: '',
    hscPercent: '',
    heardFrom: '',
    message: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // FAQ State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState<string | null>(null);
  const [faqLoading, setFaqLoading] = useState(false);

  // Course recommendations state
  const [recInterests, setRecInterests] = useState('');
  const [recBackground, setRecBackground] = useState('');
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  // Filters for Operations Dashboard
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);

  // Detail View sub-processes loading states
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Student specific details
  const [teacherNotes, setTeacherNotes] = useState('');
  const [progressReport, setProgressReport] = useState<string | null>(null);
  const [progressReportLoading, setProgressReportLoading] = useState(false);
  const [dropoutRisk, setDropoutRisk] = useState<{ riskLevel: string; reasons: string[] } | null>(null);
  const [dropoutRiskLoading, setDropoutRiskLoading] = useState(false);
  const [placementDrives, setPlacementDrives] = useState<any[]>([]);
  const [placementLoading, setPlacementLoading] = useState(false);

  // --- API FETCH FUNCTIONS ---

  const fetchMetadata = async () => {
    setMetadataError(null);
    try {
      const campRes = await fetch(`${API_BASE_URL}/campuses`);
      const campJson = await campRes.json();
      if (!campJson.success) throw new Error(campJson.message || 'Failed to fetch campuses.');

      const progRes = await fetch(`${API_BASE_URL}/programs`);
      const progJson = await progRes.json();
      if (!progJson.success) throw new Error(progJson.message || 'Failed to fetch programs.');

      const statsRes = await fetch(`${API_BASE_URL}/programs/stats`);
      const statsJson = await statsRes.json();
      if (!statsJson.success) throw new Error(statsJson.message || 'Failed to fetch statistics.');

      setCampuses(campJson.data);
      setLivePrograms(progJson.data);
      setStatsCount({
        programs: statsJson.data.totalPrograms,
        campuses: statsJson.data.totalCampuses,
        seats: statsJson.data.totalSeats,
        placement: statsJson.data.placementRate
      });
    } catch (err: any) {
      console.error('Error fetching metadata dropdown catalogs:', err);
      setMetadataError(err.message || 'Failed to establish stable server connection.');
    }
  };

  const fetchProgramsByCampus = async (campusFilter: string) => {
    setProgramsLoading(true);
    try {
      const url = campusFilter === 'all'
        ? `${API_BASE_URL}/programs`
        : `${API_BASE_URL}/programs?campusId=${campusFilter}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setLivePrograms(json.data);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setProgramsLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    setDashboardLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/enquiries`);
      if (statusFilter && statusFilter !== 'all' && statusFilter !== '') url.searchParams.set('status', statusFilter);
      if (priorityFilter && priorityFilter !== 'all' && priorityFilter !== '') url.searchParams.set('priority', priorityFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data);
      }
    } catch (err) {
      console.error('Error loading enquiries list:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchEnquiryDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/${id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedEnquiry(json.data);
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

  // --- SUBMISSIONS & ACTION ITEM HANDLERS ---

  const handleEnquirySubmit = async (e: React.FormEvent, overrideForm?: any) => {
    e.preventDefault();
    const formToUse = overrideForm || enquiryForm;

    setFormLoading(true);
    setFormSuccess(null);
    setFormErrors([]);
    try {
      let progId = formToUse.programId || null;
      
      let campId = null;
      if (formToUse.campusId) {
        const matched = campuses.find((c: any) => 
          (c.name && c.name.toLowerCase().includes(formToUse.campusId.toLowerCase())) ||
          (c.id && c.id === formToUse.campusId) ||
          (c._id && c._id === formToUse.campusId)
        );
        campId = matched ? (matched.id || matched._id) : formToUse.campusId;
      }

      const payload = {
        fullName: formToUse.name,
        name: formToUse.name,
        phone: formToUse.phone,
        email: formToUse.email,
        programId: progId,
        campusId: campId,
        campusPreference: formToUse.campusId || null,
        tenthPercentage: null,
        twelfthPercentage: null,
        message: formToUse.backgroundNotes || '',
        backgroundNotes: formToUse.backgroundNotes || '',
        source: 'Website'
      };

      console.log('Submitting to:', `${API_BASE_URL}/enquiries/create`);
      console.log('Request body:', JSON.stringify(payload));

      const res = await fetch(`${API_BASE_URL}/enquiries/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      console.log('Response status:', res.status);
      console.log('Response body:', JSON.stringify(json));

      if (res.status === 201 && json.success) {
        setFormSuccess(json.data.aiRecommendation || 'Enquiry submitted successfully!');
        setEnquiryForm({
          name: '',
          email: '',
          phone: '',
          programId: '',
          campusId: '',
          backgroundNotes: '',
          sscPercent: '',
          hscPercent: '',
          heardFrom: '',
          message: ''
        });
        // Auto-refresh enquiries dashboard
        fetchEnquiries();
      } else if (res.status === 400) {
        const errMsgs = Array.isArray(json.errors)
          ? json.errors.map((err: any) => `${err.field}: ${err.message}`)
          : [json.message || 'Validation failed.'];
        setFormErrors(errMsgs);
      } else {
        setFormErrors([json.message || 'An error occurred.']);
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Network connection error. Please try again.']);
    } finally {
      setFormLoading(false);
    }
  };

  const handleProgressStatus = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/${id}/process`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        fetchEnquiries();
      }
    } catch (err) {
      console.error('Error processing status transition:', err);
    }
  };

  const handleApplyEnquireFromModal = (mockProg: any) => {
    const matched = livePrograms.find(p => p.name.toLowerCase() === mockProg.name.toLowerCase());
    
    // Find campus ID corresponding to the mock program campus string
    const mockCampusLower = mockProg.campus.toLowerCase();
    const matchedCampus = campuses.find(c => c.name.toLowerCase().includes(mockCampusLower));

    setEnquiryForm({
      name: '',
      email: '',
      phone: '',
      programId: matched ? String(matched.id + 100) : '',
      campusId: matchedCampus ? String(matchedCampus.id) : '',
      backgroundNotes: `Interested in ${mockProg.name} at ${mockProg.campus} campus.`,
      sscPercent: '',
      hscPercent: '',
      heardFrom: '',
      message: ''
    });
    setSelectedProgramDetail(null);
    setActiveSubpage('enquiry');
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim()) return;
    setFaqLoading(true);
    setFaqAnswer(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: faqQuestion })
      });
      const json = await res.json();
      if (json.success) {
        setFaqAnswer(json.data.answer);
      } else {
        setFaqAnswer(json.message || 'Failed to fetch answer.');
      }
    } catch (err: any) {
      setFaqAnswer(err.message || 'Network error occurred.');
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
        body: JSON.stringify({ interests: recInterests, priorBackground: recBackground })
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

  const toggleFollowUpStatus = async (followUpId: number, currentStatus: string) => {
    if (!selectedEnquiry) return;
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    // Optimistic UI update
    const updatedFollowUps = selectedEnquiry.followUps.map((f: any) => 
      f.id === followUpId ? { ...f, status: newStatus } : f
    );
    setSelectedEnquiry({ ...selectedEnquiry, followUps: updatedFollowUps });

    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/followup/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        fetchEnquiryDetail(selectedEnquiry.id);
      }
    } catch (err) {
      console.error('Failed to patch follow-up status:', err);
      fetchEnquiryDetail(selectedEnquiry.id);
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

  // --- USE EFFECTS ---

  // Metadata fetch on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Filter programs based on sidebar campus filter
  useEffect(() => {
    fetchProgramsByCampus(selectedCampusFilter);
  }, [selectedCampusFilter]);

  // Statistics animation
  useEffect(() => {
    if (activeSubpage === 'home') {
      const fetchAndAnimateStats = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/programs/stats`);
          const json = await res.json();

          const targetPrograms = (json.success && json.data.totalPrograms) ? json.data.totalPrograms : 18;
          const targetCampuses = (json.success && json.data.totalCampuses) ? json.data.totalCampuses : 4;
          const targetSeats = (json.success && json.data.totalSeats) ? json.data.totalSeats : 1240;
          const targetPlacement = (json.success && json.data.placementRate) ? json.data.placementRate : 94;

          let start = 0;
          const steps = 30;
          const stepTime = 1500 / steps;

          const timer = setInterval(() => {
            start += 1;
            setStatsCount({
              programs: Math.min(Math.floor((targetPrograms / steps) * start), targetPrograms),
              campuses: Math.min(Math.floor((targetCampuses / steps) * start), targetCampuses),
              seats: Math.min(Math.floor((targetSeats / steps) * start), targetSeats),
              placement: Math.min(Math.floor((targetPlacement / steps) * start), targetPlacement)
            });
            if (start >= steps) {
              clearInterval(timer);
              setStatsCount({
                programs: targetPrograms,
                campuses: targetCampuses,
                seats: targetSeats,
                placement: targetPlacement
              });
            }
          }, stepTime);

          return () => clearInterval(timer);
        } catch (err) {
          console.error('Stats fetch error:', err);
          setStatsCount({ programs: 18, campuses: 4, seats: 1240, placement: 94 });
        }
      };
      fetchAndAnimateStats();
    }
  }, [activeSubpage]);

  // Load dashboard list
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchEnquiries();
    }
  }, [currentView, statusFilter, priorityFilter]);

  // Load enquiry detail
  useEffect(() => {
    if (currentView === 'detail' && selectedEnquiryId) {
      fetchEnquiryDetail(selectedEnquiryId);
    }
  }, [currentView, selectedEnquiryId]);

  // Fetch student parameters if enquiry is converted to student
  useEffect(() => {
    const studentId = selectedEnquiry?.application?.studentId;
    if (studentId) {
      fetchDropoutRisk(studentId);
      fetchPlacementDrives(studentId);
    } else {
      setDropoutRisk(null);
      setPlacementDrives([]);
    }
  }, [selectedEnquiry?.application?.studentId]);

  // Statistics counters
  const dashboardStats = {
    total: enquiries.length,
    pending: enquiries.filter(e => e.status === 'pending').length,
    highPriority: enquiries.filter(e => e.priority === 'high' || e.priority === 'HIGH').length,
    converted: enquiries.filter(e => e.status === 'admitted' || e.status === 'applied').length
  };

  // --- RENDERS ---

  if (metadataError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f7fafc', padding: '2rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <AlertCircle style={{ width: '4rem', height: '4rem', color: '#e53e3e', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', marginBottom: '0.5rem' }}>Server Connection Failed</h2>
        <p style={{ color: '#4a5568', marginBottom: '1.5rem', maxWidth: '500px' }}>{metadataError}</p>
        <button 
          onClick={() => fetchMetadata()} 
          style={{ backgroundColor: '#2d5be3', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

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
          programs={livePrograms}
          selectedCampusFilter={selectedCampusFilter}
          setSelectedCampusFilter={setSelectedCampusFilter}
          enquiryForm={enquiryForm}
          setEnquiryForm={setEnquiryForm}
          formLoading={formLoading}
          formSuccess={formSuccess}
          setFormSuccess={setFormSuccess}
          formErrors={formErrors}
          handleEnquirySubmit={handleEnquirySubmit}
          onEnquirySubmitted={fetchEnquiries}
          recInterests={recInterests}
          setRecInterests={setRecInterests}
          recBackground={recBackground}
          setRecBackground={setRecBackground}
          recommendations={recommendations}
          recLoading={recLoading}
          handleRecommendSubmit={handleRecommendSubmit}
          faqQuestion={faqQuestion}
          setFaqQuestion={setFaqQuestion}
          faqProgramId={""}
          setFaqProgramId={() => {}}
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
          {/* Dashboard/Detail Navbar */}
          <header className="navbar" style={{ backgroundColor: '#1e2a5e', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', color: '#fff', borderBottom: '2px solid #e15b22', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => { setCurrentView('portal'); setActiveSubpage('home'); }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e15b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                SG
              </div>
              <div>
                <h1 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, lineHeight: 1.2, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Sri Gowthami Educational Institutions</h1>
                <span style={{ fontSize: '0.7rem', color: '#ffd5c2', fontWeight: '500', display: 'block' }}>Operations Staff Dashboard</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <nav style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => { setCurrentView('portal'); setActiveSubpage('home'); setFormSuccess(null); setFormErrors([]); }}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 0.6rem', borderBottom: '2px solid transparent', transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif' }}
                >
                  Public Portal
                </button>
                <button
                  onClick={() => { setCurrentView('dashboard'); }}
                  style={{ background: 'transparent', border: 'none', color: '#ff9f68', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 0.6rem', borderBottom: '2px solid #ff9f68', transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif' }}
                >
                  Staff Dashboard
                </button>
              </nav>
            </div>
          </header>

          <main className="content-wrapper" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            {/* VIEW 2: OPERATIONS DASHBOARD (INTERNAL STAFF) */}
            {currentView === 'dashboard' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e2a5e', margin: 0 }}>Operations & Academic Support</h2>
                    <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Manage educational records, lead statuses, staff assignments, and follow-up activities.</p>
                  </div>
                  <button className="btn-secondary" onClick={fetchEnquiries} id="refresh-dashboard-btn" style={{ backgroundColor: '#fff', color: '#2d5be3', border: '1px solid #2d5be3', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>
                    Refresh Records
                  </button>
                </div>

                {/* Stats Overview */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="stat-card" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="stat-icon-wrapper" style={{ color: '#2d5be3', backgroundColor: '#ebf8ff', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}><Layers /></div>
                    <div className="stat-info">
                      <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' }}>Total Enquiries</h5>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: '#1e2a5e' }}>{dashboardStats.total}</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #d69e2e', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="stat-icon-wrapper" style={{ color: '#d69e2e', backgroundColor: '#fefcbf', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}><Clock /></div>
                    <div className="stat-info">
                      <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' }}>Pending Review</h5>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: '#1e2a5e' }}>{dashboardStats.pending}</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #e53e3e', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="stat-icon-wrapper" style={{ color: '#e53e3e', backgroundColor: '#fed7d7', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}><AlertTriangle /></div>
                    <div className="stat-info">
                      <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' }}>High Priority</h5>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: '#1e2a5e' }}>{dashboardStats.highPriority}</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #38a169', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="stat-icon-wrapper" style={{ color: '#38a169', backgroundColor: '#c6f6d5', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}><CheckCircle /></div>
                    <div className="stat-info">
                      <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' }}>Converted Leads</h5>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: '#1e2a5e' }}>{dashboardStats.converted}</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Filters */}
                <div className="filter-bar" style={{ display: 'flex', gap: '1rem', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="filter-status" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4a5568' }}>Status:</label>
                    <select 
                      id="filter-status"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '0.85rem' }}
                    >
                      <option value="">All Statuses</option>
                      <option value="new">New</option>
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="applied">Applied</option>
                      <option value="admitted">Admitted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="filter-priority" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4a5568' }}>Priority:</label>
                    <select 
                      id="filter-priority"
                      value={priorityFilter}
                      onChange={e => setPriorityFilter(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '0.85rem' }}
                    >
                      <option value="">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Table Records */}
                {dashboardLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ height: '20px', width: '100%', background: '#edf2f7', borderRadius: '4px' }}></div>
                    <div style={{ height: '20px', width: '90%', background: '#edf2f7', borderRadius: '4px' }}></div>
                    <div style={{ height: '20px', width: '95%', background: '#edf2f7', borderRadius: '4px' }}></div>
                  </div>
                ) : enquiries.length === 0 ? (
                  <div style={{ background: '#fff', padding: '3rem', borderRadius: '8px', border: '1px dashed #cbd5e0', textAlign: 'center' }}>
                    <Search style={{ width: '3rem', height: '3rem', color: '#a0aec0', marginBottom: '0.5rem' }} />
                    <h4 style={{ margin: 0, color: '#4a5568' }}>No Matching Records</h4>
                    <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.25rem 0 0 0' }}>Try resetting the search filters or submit a new enquiry profile from the Admissions Hub.</p>
                  </div>
                ) : (
                  <div className="table-container" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                    <table className="portal-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#4a5568', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#1a202c', fontWeight: '700', backgroundColor: '#f7fafc' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Candidate Info</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Date Received</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Priority</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Target Program</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Preferred Campus</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiries.map(enquiry => (
                          <tr 
                            key={enquiry.id} 
                            onClick={() => {
                              setSelectedEnquiryId(enquiry.id);
                              setCurrentView('detail');
                            }}
                            className="courses-table-row" 
                            style={{ borderBottom: '1px solid #edf2f7', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                          >
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontWeight: '700', color: '#1e2a5e' }}>{enquiry.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#718096' }}>{enquiry.email}</div>
                              {enquiry.phone && <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{enquiry.phone}</div>}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '800', 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px', 
                                textTransform: 'uppercase',
                                backgroundColor: enquiry.priority.toLowerCase() === 'high' ? '#fed7d7' : enquiry.priority.toLowerCase() === 'medium' ? '#feebc8' : '#edf2f7', 
                                color: enquiry.priority.toLowerCase() === 'high' ? '#9b2c2c' : enquiry.priority.toLowerCase() === 'medium' ? '#9c4221' : '#4a5568'
                              }}>
                                {enquiry.priority}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>{enquiry.program?.name || 'General Inquiry'}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{enquiry.campus?.name || 'Any Campus'}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: '700', 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px',
                                backgroundColor: enquiry.status.toLowerCase() === 'admitted' ? '#c6f6d5' : enquiry.status.toLowerCase() === 'pending' ? '#feebc8' : '#ebf8ff',
                                color: enquiry.status.toLowerCase() === 'admitted' ? '#22543d' : enquiry.status.toLowerCase() === 'pending' ? '#744210' : '#2b6cb0'
                              }}>
                                {enquiry.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  onClick={() => {
                                    setSelectedEnquiryId(enquiry.id);
                                    setCurrentView('detail');
                                  }}
                                  style={{ backgroundColor: '#2d5be3', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Details
                                </button>
                                {enquiry.status !== 'closed' && (
                                  <button 
                                    onClick={() => handleProgressStatus(enquiry.id)}
                                    style={{ backgroundColor: '#2f855a', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}
                                  >
                                    Progress Status
                                  </button>
                                )}
                              </div>
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
                <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setCurrentView('dashboard')}
                    id="back-to-dashboard-btn"
                    style={{ backgroundColor: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back to Dashboard
                  </button>
                  
                  {selectedEnquiry && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>
                        Priority: {selectedEnquiry.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>
                        Status: {selectedEnquiry.status}
                      </span>
                    </div>
                  )}
                </div>

                {detailLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ height: '20px', width: '30%', background: '#edf2f7', borderRadius: '4px' }}></div>
                    <div style={{ height: '20px', width: '60%', background: '#edf2f7', borderRadius: '4px' }}></div>
                  </div>
                ) : detailError || !selectedEnquiry ? (
                  <div style={{ background: '#fff', padding: '3rem', borderRadius: '8px', border: '1px dashed #cbd5e0', textAlign: 'center' }}>
                    <AlertCircle style={{ width: '3rem', height: '3rem', color: '#e53e3e', marginBottom: '0.5rem' }} />
                    <h4 style={{ margin: 0, color: '#e53e3e' }}>Failed to load record details</h4>
                    <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.25rem 0 0 0' }}>{detailError || 'The record details could not be found.'}</p>
                  </div>
                ) : (
                  <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                    
                    {/* Left Column: AI Recommendation fit & background */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Basic Info */}
                      <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#1e2a5e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users style={{ width: '1.25rem', height: '1.25rem', color: '#2d5be3' }} /> Profile Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: '600' }}>Candidate Name</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e2a5e' }}>{selectedEnquiry.name}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: '600' }}>Email Address</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e2a5e' }}>
                              <Mail style={{ width: '0.9rem', height: '0.9rem', color: '#718096' }} /> {selectedEnquiry.email}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: '600' }}>Contact Number</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e2a5e' }}>
                              <Phone style={{ width: '0.9rem', height: '0.9rem', color: '#718096' }} /> {selectedEnquiry.phone || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: '600' }}>Record Intake Date</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e2a5e' }}>
                              <Calendar style={{ width: '0.9rem', height: '0.9rem', color: '#718096' }} /> {new Date(selectedEnquiry.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: '600' }}>Registered Program</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e2a5e' }}>
                              <BookOpen style={{ width: '0.9rem', height: '0.9rem', color: '#718096' }} /> {selectedEnquiry.program?.name || 'General Inquiry'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: '600' }}>Target Campus</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e2a5e' }}>
                              <MapPin style={{ width: '0.9rem', height: '0.9rem', color: '#718096' }} /> {selectedEnquiry.campus?.name || 'Unassigned'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Recommendation Details */}
                      <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} /> AI Counseling Evaluation & Recommendations
                        </h3>
                        <div className="markdown-container" style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: '1.6' }}>
                          {selectedEnquiry.aiRecommendation ? (
                            <div dangerouslySetInnerHTML={{ 
                              __html: selectedEnquiry.aiRecommendation
                                .replace(/### (.*)/g, '<h3>$1</h3>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/- (.*)/g, '<li>$1</li>')
                                .replace(/\n/g, '<br />')
                            }} />
                          ) : (
                            <p style={{ color: '#718096', fontStyle: 'italic' }}>
                              No evaluation is available. Background notes were not supplied during submission.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* AI Report Generation if Admitted */}
                      {selectedEnquiry.application?.studentId && (
                        <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText style={{ width: '1.25rem', height: '1.25rem' }} /> Academic Progress Report (AI Generator)
                          </h3>
                          <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '1rem', marginTop: 0 }}>
                            Generate a parent-facing progress report summarising attendance, course grades, and custom notes.
                          </p>
                          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                            <label htmlFor="teacher-notes" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4a5568' }}>Teacher/Counselor Guidance Notes</label>
                            <textarea 
                              id="teacher-notes"
                              className="form-control"
                              placeholder="e.g. Robert shows great promise in Python programming but should practice writing algorithms."
                              value={teacherNotes}
                              onChange={e => setTeacherNotes(e.target.value)}
                              rows={3}
                              style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                            />
                          </div>
                          <button 
                            className="btn-primary"
                            onClick={() => handleGenerateProgressReport(selectedEnquiry.application!.studentId)}
                            disabled={progressReportLoading}
                            style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                          >
                            {progressReportLoading ? 'Generating Report...' : 'Generate Progress Report'}
                          </button>

                          {progressReport && (
                            <div className="markdown-container" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', border: '1px dashed #10b981', fontSize: '0.85rem', lineHeight: '1.6' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: '#059669', marginTop: 0 }}>
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

                    {/* Right Column: Scheduled Reminders, follow-ups & timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      
                      {/* Follow-up Checklist */}
                      <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#1e2a5e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#2d5be3' }} /> Follow-up Action Items
                        </h3>
                        <p style={{ color: '#718096', fontSize: '0.8rem', marginBottom: '1.5rem', marginTop: 0 }}>
                          Scheduled milestones generated by the workflow engine. Toggle completion status:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {selectedEnquiry.followUps.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center' }}>
                              <CheckCircle style={{ width: '2rem', height: '2rem', color: '#10b981', marginBottom: '0.5rem' }} />
                              <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>All follow-up tasks completed!</p>
                            </div>
                          ) : (
                            selectedEnquiry.followUps.map((task: any) => (
                              <div key={task.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <input 
                                  type="checkbox" 
                                  checked={task.status === 'completed'}
                                  onChange={() => toggleFollowUpStatus(task.id, task.status)}
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }}
                                />
                                <div>
                                  <h5 style={{ margin: 0, fontSize: '0.9rem', color: '#1e2a5e', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                    {task.taskName}
                                  </h5>
                                  {task.notes && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#718096' }}>{task.notes}</p>}
                                  <span style={{ 
                                    display: 'inline-block', 
                                    marginTop: '0.35rem', 
                                    fontSize: '0.65rem', 
                                    fontWeight: '700', 
                                    padding: '0.1rem 0.4rem', 
                                    borderRadius: '4px',
                                    backgroundColor: task.status === 'completed' ? '#c6f6d5' : '#fed7d7',
                                    color: task.status === 'completed' ? '#22543d' : '#9b2c2c'
                                  }}>
                                    {task.status === 'completed' ? 'Done' : `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Status History Timeline */}
                      <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#1e2a5e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#2d5be3' }} /> Status History Timeline
                        </h3>
                        {selectedEnquiry.statusHistories && selectedEnquiry.statusHistories.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            {selectedEnquiry.statusHistories.map((history: any, hidx: number) => (
                              <div key={history.id || hidx} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2d5be3', zIndex: 2 }} />
                                  {hidx < selectedEnquiry.statusHistories!.length - 1 && (
                                    <div style={{ width: '2px', flexGrow: 1, backgroundColor: '#e2e8f0', margin: '4px 0' }} />
                                  )}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                                  <div>Status changed to <strong style={{ textTransform: 'uppercase', color: '#2d5be3' }}>{history.status}</strong></div>
                                  {history.notes && <div style={{ fontStyle: 'italic', color: '#718096', margin: '0.15rem 0' }}>Note: {history.notes}</div>}
                                  <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>{new Date(history.changedAt).toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.8rem', color: '#718096', fontStyle: 'italic', margin: 0 }}>No status transitions recorded yet.</p>
                        )}
                      </div>

                      {/* Simulation Actions */}
                      {!selectedEnquiry.application?.studentId ? (
                        <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#1e2a5e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info style={{ width: '1.25rem', height: '1.25rem', color: '#2d5be3' }} /> Administrative Actions</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button 
                              className="btn-primary" 
                              onClick={async () => {
                                try {
                                  const res1 = await fetch(`${API_BASE_URL}/applications/create`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ enquiryId: selectedEnquiry.id })
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
                                  fetchEnquiryDetail(selectedEnquiry.id);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              id="btn-simulate-admission"
                              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              Simulate Student Admission
                            </button>
                            <div style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center' }}>
                              Simulating admission registers a student profile in the database and updates status to admitted.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Dropout Risk Card */}
                          <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', color: '#e53e3e' }} /> Academic Risk Assessment
                            </h3>
                            {dropoutRiskLoading ? (
                              <div style={{ height: '20px', width: '80%', background: '#edf2f7', borderRadius: '4px' }}></div>
                            ) : dropoutRisk ? (
                              <div>
                                <div style={{ 
                                  display: 'inline-block', 
                                  padding: '0.25rem 0.75rem', 
                                  borderRadius: '4px', 
                                  fontWeight: '700', 
                                  fontSize: '0.85rem',
                                  marginBottom: '0.75rem',
                                  backgroundColor: dropoutRisk.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : dropoutRisk.riskLevel === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: dropoutRisk.riskLevel === 'HIGH' ? '#e53e3e' : dropoutRisk.riskLevel === 'MEDIUM' ? '#d69e2e' : '#38a169',
                                  border: `1px solid ${dropoutRisk.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.3)' : dropoutRisk.riskLevel === 'MEDIUM' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                }}>
                                  Risk Level: {dropoutRisk.riskLevel}
                                </div>
                                {dropoutRisk.reasons.length > 0 ? (
                                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#718096', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                                    {dropoutRisk.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                  </ul>
                                ) : (
                                  <p style={{ fontSize: '0.8rem', color: '#718096', margin: 0 }}>Student is performing well. Attendance, grades, and payments are in safe thresholds.</p>
                                )}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: '#cbd5e0', margin: 0 }}>Could not load risk metrics.</p>
                            )}
                          </div>

                          {/* Placement Drives Card */}
                          <div className="card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h3 className="section-title" style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#38a169', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Briefcase style={{ width: '1.25rem', height: '1.25rem', color: '#38a169' }} /> Matched Placement Drives
                            </h3>
                            {placementLoading ? (
                              <div style={{ height: '20px', width: '80%', background: '#edf2f7', borderRadius: '4px' }}></div>
                            ) : placementDrives.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {placementDrives.map(drive => (
                                  <div key={drive.id} style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#22543d', margin: '0 0 0.15rem 0' }}>{drive.title}</h5>
                                    <p style={{ fontSize: '0.75rem', color: '#4a5568', margin: '0 0 0.15rem 0' }}>Company: {drive.company || 'N/A'}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#718096', margin: 0 }}>Location: {drive.location || 'N/A'}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: '#718096', margin: 0 }}>No matching placement drives found for the target program.</p>
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
