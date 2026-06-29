import React from 'react';
import { 
  BookOpen, 
  Layers, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  Mail, 
  HelpCircle, 
  MapPin, 
  Search, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Info 
} from 'lucide-react';

interface PublicPortalProps {
  MOCK_PROGRAMS: any[];
  activeSubpage: 'home' | 'courses' | 'eligibility' | 'fees' | 'admission' | 'enquiry' | 'faq';
  setActiveSubpage: (page: any) => void;
  selectedProgramDetail: any | null;
  setSelectedProgramDetail: (prog: any | null) => void;
  courseSearchQuery: string;
  setCourseSearchQuery: (query: string) => void;
  statsCount: { programs: number; campuses: number; seats: number; placement: number };
  campuses: any[];
  programs: any[];
  selectedCampusFilter: string;
  setSelectedCampusFilter: (filter: string) => void;
  enquiryForm: { 
    name: string; 
    email: string; 
    phone: string; 
    programId: string; 
    campusId: string; 
    backgroundNotes: string;
    sscPercent?: string;
    hscPercent?: string;
    heardFrom?: string;
    message?: string;
  };
  setEnquiryForm: (form: any) => void;
  formLoading: boolean;
  formSuccess: string | null;
  setFormSuccess: (val: string | null) => void;
  formErrors: string[];
  handleEnquirySubmit: (e: React.FormEvent, overrideForm?: any) => Promise<void>;
  onEnquirySubmitted?: () => void;
  recInterests: string;
  setRecInterests: (val: string) => void;
  recBackground: string;
  setRecBackground: (val: string) => void;
  recommendations: any[] | null;
  recLoading: boolean;
  handleRecommendSubmit: (e: React.FormEvent) => Promise<void>;
  faqQuestion: string;
  setFaqQuestion: (val: string) => void;
  faqProgramId: string;
  setFaqProgramId: (val: string) => void;
  faqAnswer: string | null;
  faqLoading: boolean;
  handleFaqSubmit: (e: React.FormEvent) => Promise<void>;
  handleApplyEnquireFromModal: (mockProg: any) => void;
  setCurrentView: (view: 'portal' | 'dashboard' | 'detail') => void;
  API_BASE_URL: string;
  setFaqAnswer: (ans: string | null) => void;
  setFaqLoading: (loading: boolean) => void;
}

export default function PublicPortal(props: PublicPortalProps) {
  const {
    MOCK_PROGRAMS,
    activeSubpage,
    setActiveSubpage,
    selectedProgramDetail,
    setSelectedProgramDetail,
    courseSearchQuery,
    setCourseSearchQuery,
    statsCount,
    campuses,
    selectedCampusFilter,
    setSelectedCampusFilter,
    handleApplyEnquireFromModal,
    setCurrentView
  } = props;

  const [activeTypeFilter, setActiveTypeFilter] = React.useState<'all' | 'ug' | 'pg' | 'engineering' | 'management' | 'sciences'>('all');

  const [localErrors, setLocalErrors] = React.useState<Record<string, string>>({});
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [localLoading, setLocalLoading] = React.useState(false);
  const [enquiryFormFields, setEnquiryFormFields] = React.useState({
    name: '',
    phone: '',
    email: '',
    programId: '',
    campusId: '',
    sscPercent: '',
    hscPercent: '',
    heardFrom: '',
    message: ''
  });

  React.useEffect(() => {
    setEnquiryFormFields(prev => ({
      ...prev,
      programId: props.enquiryForm.programId || '',
      campusId: props.enquiryForm.campusId || '',
      name: props.enquiryForm.name || prev.name,
      email: props.enquiryForm.email || prev.email,
      phone: props.enquiryForm.phone || prev.phone
    }));
  }, [props.enquiryForm]);

  const [faqSearchQuery, setFaqSearchQuery] = React.useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = React.useState('All');
  const [activeFaqIndex, setActiveFaqIndex] = React.useState<number | null>(null);

  // 1. HOME VIEW
  const renderHomeView = () => {
    const filteredFeatured = MOCK_PROGRAMS.filter(p => {
      if (selectedCampusFilter === 'all') {
        return [101, 107, 110, 113].includes(p.id);
      }
      return p.campus.toLowerCase() === selectedCampusFilter;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Blue Gradient Hero Banner */}
        <div style={{ background: 'linear-gradient(135deg, #2d5be3, #1e3a8a)', borderRadius: 'var(--radius-md)', padding: '2.5rem', color: '#fff', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(45, 91, 227, 0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#e15b22', color: '#fff', fontSize: '0.75rem', fontWeight: '800', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
            2026-27 ADMISSIONS NOW OPEN
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '0.75rem', color: '#fff', maxWidth: '700px', letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
            Discover Your Perfect Academic Program
          </h2>
          <p style={{ fontSize: '1rem', color: '#ffd5c2', lineHeight: '1.5', marginBottom: '1.75rem', maxWidth: '650px', fontWeight: '400' }}>
            Sri Gowthami Educational Institutions is committed to nurturing excellence in higher education. Explore our diverse campus options, modern computing modules, and industry-oriented specializations designed to accelerate your career.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setActiveSubpage('courses')}
              style={{ backgroundColor: '#fff', color: '#1e2a5e', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
            >
              Browse Courses
            </button>
            <button 
              onClick={() => setActiveSubpage('enquiry')}
              style={{ backgroundColor: '#e15b22', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(225,91,34,0.3)', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
            >
              Enquire Now
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Programs Offered', val: statsCount.programs, suffix: '', desc: 'Diverse course options' },
            { label: 'Active Campuses', val: statsCount.campuses, suffix: '', desc: 'Across the region' },
            { label: 'Seats Available', val: statsCount.seats, suffix: '', desc: 'Awaiting enrollment' },
            { label: 'Placement Rate', val: statsCount.placement, suffix: '%', desc: 'Sustained career success' }
          ].map((stat, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>{stat.label}</span>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: '#1e2a5e', lineHeight: '1.2', marginBottom: '0.25rem' }}>
                {stat.val}{stat.suffix}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{stat.desc}</span>
            </div>
          ))}
        </div>

        {/* Featured Programs Section Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>Featured Programs</h3>
          <button 
            onClick={() => setActiveSubpage('courses')}
            style={{ background: 'none', border: 'none', color: '#2d5be3', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}
          >
            View All &rarr;
          </button>
        </div>

        {/* Program Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredFeatured.map((prog) => (
            <div 
              key={prog.id} 
              onClick={() => setSelectedProgramDetail(prog)}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}
              className="featured-prog-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: prog.tag === 'UG' ? '#ebf8ff' : '#faf5ff', color: prog.tag === 'UG' ? '#2b6cb0' : '#6b46c1', textTransform: 'uppercase' }}>
                  {prog.tag}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin style={{ width: '12px', height: '12px' }} /> {prog.campus}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e2a5e', margin: 0, lineHeight: '1.3' }}>{prog.name}</h4>
              <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '500' }}>{prog.department}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f7fafc', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#4a5568' }}>
                <span>Duration: <strong>{prog.duration}</strong></span>
                <span>Seats: <strong>{prog.seats}</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f7fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#718096' }}>Tuition Fee</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2f855a' }}>{prog.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 2. COURSES VIEW
  const renderCoursesView = () => {
    const filteredAllCourses = MOCK_PROGRAMS.filter(p => {
      const matchesCampus = selectedCampusFilter === 'all' || p.campus.toLowerCase() === selectedCampusFilter;
      const matchesSearch = p.name.toLowerCase().includes(courseSearchQuery.toLowerCase()) || p.department.toLowerCase().includes(courseSearchQuery.toLowerCase());
      
      let matchesType = true;
      if (activeTypeFilter === 'ug') {
        matchesType = p.tag === 'UG';
      } else if (activeTypeFilter === 'pg') {
        matchesType = p.tag === 'PG';
      } else if (activeTypeFilter === 'engineering') {
        matchesType = p.department === 'Engineering';
      } else if (activeTypeFilter === 'management') {
        matchesType = p.department === 'Management';
      } else if (activeTypeFilter === 'sciences') {
        matchesType = p.department === 'Sciences';
      }
      
      return matchesCampus && matchesSearch && matchesType;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setActiveSubpage('home')}>Home</span>
          <span style={{ color: '#a0aec0' }}>&rsaquo;</span>
          <span style={{ fontWeight: '600', color: '#2d5be3' }}>Courses</span>
        </div>

        {/* Heading Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>All Programs & Courses</h2>
            <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0 0 0', fontFamily: 'Inter, sans-serif' }}>18 programs across Engineering, Sciences, Management, Commerce, and Arts</p>
          </div>
          
          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#a0aec0' }} />
            <input 
              type="text" 
              placeholder="Search by program name..."
              className="form-control"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', borderRadius: '6px', backgroundColor: '#fff', border: '1px solid #cbd5e0' }}
              value={courseSearchQuery}
              onChange={e => setCourseSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Chips Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          {[
            { label: 'All (18)', value: 'all' },
            { label: 'UG Programs', value: 'ug' },
            { label: 'PG Programs', value: 'pg' },
            { label: 'Engineering', value: 'engineering' },
            { label: 'Management', value: 'management' },
            { label: 'Sciences', value: 'sciences' }
          ].map((chip) => {
            const isActive = activeTypeFilter === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => setActiveTypeFilter(chip.value as any)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isActive ? '#2d5be3' : '#cbd5e0',
                  backgroundColor: isActive ? '#2d5be3' : '#fff',
                  color: isActive ? '#fff' : '#4a5568',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Full-width white card containing the table */}
        <div className="card" style={{ background: '#fff', padding: '1.25rem', overflowX: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {filteredAllCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <Info style={{ width: '2rem', height: '2rem', color: '#a0aec0', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', color: '#4a5568', margin: 0 }}>No matching courses found</h4>
              <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0.25rem 0 0 0' }}>Try adjusting your search query, type filter, or campus sidebar filter.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#4a5568', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#1a202c', fontWeight: '700' }}>
                  <th style={{ padding: '0.75rem 0.5rem', width: '50px' }}>#</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Program Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Annual Fee</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Seats</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Campuses</th>
                  <th style={{ padding: '0.75rem 0.5rem', width: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllCourses.map((prog, index) => (
                  <tr 
                    key={prog.id} 
                    className="courses-table-row" 
                    style={{ borderBottom: '1px solid #edf2f7', transition: 'background-color 0.15s ease' }}
                  >
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#1e2a5e' }}>
                      <span style={{ marginRight: '0.4rem', fontSize: '1rem' }}>{prog.emoji || '🎓'}</span>
                      {prog.name}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: prog.tag === 'UG' ? '#ebf8ff' : '#faf5ff', color: prog.tag === 'UG' ? '#2b6cb0' : '#6b46c1', textTransform: 'uppercase' }}>
                        {prog.tag}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{prog.duration}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#2f855a' }}>{prog.fee}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>{prog.seats}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#4a5568' }}>
                        <MapPin style={{ width: '12px', height: '12px', color: '#718096' }} /> {prog.campus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <button 
                        onClick={() => setSelectedProgramDetail(prog)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #2d5be3',
                          color: '#2d5be3',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'Inter, sans-serif'
                        }}
                        className="courses-action-btn"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // 3. ELIGIBILITY VIEW
  const renderEligibilityView = () => {
    const filteredCourses = MOCK_PROGRAMS.filter(p => {
      return selectedCampusFilter === 'all' || p.campus.toLowerCase() === selectedCampusFilter;
    });

    const getDeptColors = (dept: string) => {
      switch (dept.toLowerCase()) {
        case 'engineering':
          return { bg: '#e3f2fd', color: '#1e88e5' };
        case 'management':
          return { bg: '#f3e5f5', color: '#8e24aa' };
        case 'sciences':
          return { bg: '#e8f5e9', color: '#43a047' };
        case 'commerce':
          return { bg: '#fff8e1', color: '#f57c00' };
        case 'arts':
          return { bg: '#fce4ec', color: '#d81b60' };
        default:
          return { bg: '#f7fafc', color: '#4a5568' };
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setActiveSubpage('home')}>Home</span>
          <span style={{ color: '#a0aec0' }}>&rsaquo;</span>
          <span style={{ fontWeight: '600', color: '#2d5be3' }}>Eligibility</span>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>Eligibility Criteria</h2>
          <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0 0 0', fontFamily: 'Inter, sans-serif' }}>Check minimum qualifications required for each program</p>
        </div>

        {/* 2-Column Grid */}
        {filteredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', border: '1px dashed #cbd5e0', borderRadius: '8px' }}>
            <Info style={{ width: '2.5rem', height: '2.5rem', color: '#a0aec0', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1rem', color: '#4a5568', margin: 0 }}>No programs found</h4>
            <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0.25rem 0 0 0' }}>Try resetting the campus sidebar filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filteredCourses.map(p => {
              const colors = getDeptColors(p.department);
              return (
                <div key={p.id} className="eligibility-card" style={{ border: '1px solid #e2e8f0' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '50%', 
                      backgroundColor: colors.bg, 
                      color: colors.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      {p.emoji || '🎓'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e2a5e', margin: 0, lineHeight: '1.3' }}>{p.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '500', marginTop: '0.15rem' }}>
                        {p.department} &bull; {p.tag}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: '#edf2f7' }}></div>

                  {/* Section label */}
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#a0aec0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      ELIGIBILITY CRITERIA
                    </div>
                    
                    {/* Checklist rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        p.eligibilityText || '10+2 / Intermediate or Board Equivalent',
                        p.minPercentage || 'Min 50% aggregate marks required',
                        p.entranceExam || 'Merit-Based / Qualifying Entrance Rank'
                      ].map((text, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#4a5568' }}>
                          <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2f855a', flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ lineHeight: '1.4' }}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                      {p.tag} Program
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                      {p.seats} Seats
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#ffedd5', color: '#c2410c' }}>
                      {p.campus} Campus
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 4. FEES VIEW
  const renderFeesView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setActiveSubpage('home')}>Home</span>
          <span style={{ color: '#a0aec0' }}>&rsaquo;</span>
          <span style={{ fontWeight: '600', color: '#2d5be3' }}>Fee Details</span>
        </div>

        {/* Heading Section */}
        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>Fee Structure 2026-27</h2>
          <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0 0 0', fontFamily: 'Inter, sans-serif' }}>Complete transparency in academic and residential costs with merit-based scholarship incentives</p>
        </div>

        {/* 3 Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
          <div className="card" style={{ background: '#fff', padding: '1.25rem', borderLeft: '4px solid #2d5be3', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Lowest Annual Fee</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e2a5e' }}>₹32,000</span>
            <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>for BA & B.Com General</span>
          </div>
          <div className="card" style={{ background: '#fff', padding: '1.25rem', borderLeft: '4px solid #8e24aa', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Highest Annual Fee</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e2a5e' }}>₹1,25,000</span>
            <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>for M.Tech CS</span>
          </div>
          <div className="card" style={{ background: '#fff', padding: '1.25rem', borderLeft: '4px solid #2f855a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Scholarships Available</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2f855a' }}>Up to 50%</span>
            <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>waiver based on merit scores</span>
          </div>
        </div>

        {/* Program-wise Fee Table */}
        <div className="card" style={{ background: '#fff', padding: '1.5rem', overflowX: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#1e2a5e', fontWeight: '700', marginBottom: '1rem', marginTop: 0 }}>Program-wise Fee Breakdown</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#4a5568', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#1a202c', fontWeight: '700' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Program</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Type</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Duration</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Tuition Fee</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Dev Fee</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Total/Year</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Hostel (Optional)</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PROGRAMS.map(prog => {
                const tuitionVal = prog.tuitionFee || 0;
                const devVal = prog.devFee || 0;
                const totalVal = prog.totalFee || tuitionVal + devVal;
                
                return (
                  <tr key={prog.id} className="courses-table-row" style={{ borderBottom: '1px solid #edf2f7', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: '#1e2a5e' }}>
                      <span style={{ marginRight: '0.4rem' }}>{prog.emoji || '🎓'}</span>
                      {prog.name}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: prog.tag === 'UG' ? '#ebf8ff' : '#faf5ff', color: prog.tag === 'UG' ? '#2b6cb0' : '#6b46c1' }}>
                        {prog.tag}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{prog.duration}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>₹{tuitionVal.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>₹{devVal.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#2d5be3', fontWeight: '700' }}>₹{totalVal.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontStyle: 'italic', color: '#718096' }}>
                      ₹45,000 - ₹65,000
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Yellow Note Box at Bottom */}
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Important Notes
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#b45309', display: 'flex', flexDirection: 'column', gap: '0.35rem', lineHeight: '1.4' }}>
            <li>
              <strong>Fee Reimbursement:</strong> Under-privileged students from SC/ST/BC categories are eligible for full fee reimbursement support under government welfare policies (subject to submission of income and community certificates).
            </li>
            <li>
              <strong>Merit Scholarships:</strong> Merit waivers up to 50% are deducted directly from the semester tuition fee component for students maintaining GPA standards above 8.5.
            </li>
            <li>
              <strong>Instalment Schedule:</strong> Annual program fees are payable in 2 instalments (at the start of each semester). Late fees apply after the deadline.
            </li>
            <li>
              <strong>Seat Allocation:</strong> A non-refundable registration and admission processing fee of ₹5,000 is required at the time of confirming admission.
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // 5. ADMISSION VIEW
  const renderAdmissionView = () => {
    const steps = [
      {
        emoji: '📝',
        title: 'Step 1 - Submit Enquiry',
        duration: 'Day 1',
        description: 'Fill out the online Enquiry Profile Form with your campus preferences and academic interests. Our AI system instantly evaluates your background, registers the record, sends an automated confirmation email, and triggers advisor assignments.',
        chips: ['Confirmation email', 'AI recommendation', 'Callback within 24hrs']
      },
      {
        emoji: '📞',
        title: 'Step 2 - Counsellor Interaction',
        duration: 'Within 24 hrs',
        description: 'A dedicated admissions counselor contacts you via phone or email to understand your academic goals, explain fee models/scholarship criteria, and coordinate video-counseling sessions.',
        chips: ['Schedule via portal', 'Video call option']
      },
      {
        emoji: '📤',
        title: 'Step 3 - Document Submission',
        duration: 'Day 3-5',
        description: 'Upload your verified marks memos and credentials to the student portal documents hub for verification by our registrar board.',
        chips: ['10th Marksheet', '12th Marksheet', 'Aadhar Card', 'Passport Photo x4', 'Transfer Certificate', 'Caste Certificate']
      },
      {
        emoji: '⚖️',
        title: 'Step 4 - Merit Evaluation',
        duration: 'Day 5-7',
        description: 'The admissions committee evaluates your academic percentile, Board results, and EAPCET/ICET rank to calculate scholarship brackets. An official provisional Offer Letter is issued by email.',
        chips: ['EAMCET/ICET rank', 'Academic percentile', 'Offer letter by email']
      },
      {
        emoji: '💳',
        title: 'Step 5 - Fee Payment',
        duration: 'Day 7-10',
        description: 'Confirm your seat by paying the non-refundable seat allocation and program admission fees online via secure net banking, UPI, or demand draft. An automated digital receipt is generated instantly.',
        chips: ['UPI/Net Banking', 'Demand Draft', 'Digital receipt']
      },
      {
        emoji: '🎉',
        title: 'Step 6 - Enrollment & Orientation',
        duration: 'Day 10-14',
        description: 'Obtain your physical Student ID card, course timetable details, and credential logins to the LMS (Learning Management System) and Library catalog.',
        chips: ['Student ID card', 'Timetable', 'LMS access', 'Library card']
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setActiveSubpage('home')}>Home</span>
          <span style={{ color: '#a0aec0' }}>&rsaquo;</span>
          <span style={{ fontWeight: '600', color: '#2d5be3' }}>Admission Process</span>
        </div>

        {/* Heading Section */}
        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>Admission Process 2026-27</h2>
          <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0 0 0', fontFamily: 'Inter, sans-serif' }}>Follow our structured 6-step pathway to secure your academic seat and finalize enrollment</p>
        </div>

        {/* Animated Vertical Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
          {steps.map((step, idx) => (
            <div key={idx} className="timeline-item animate-fade-slide" style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              {/* Numbered Circle on the left */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2d5be3, #1e3a8a)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                flexShrink: 0,
                zIndex: 2,
                boxShadow: '0 4px 6px rgba(45, 91, 227, 0.2)'
              }}>
                {idx + 1}
              </div>
              
              {/* Connecting Line (for all but the last item) */}
              {idx < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '17px',
                  top: '36px',
                  bottom: '-24px',
                  width: '2px',
                  background: 'linear-gradient(to bottom, #2d5be3, #e2e8f0)',
                  zIndex: 1
                }}></div>
              )}

              {/* White Card on the right */}
              <div className="card" style={{ background: '#fff', padding: '1.25rem', flexGrow: 1, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: idx < steps.length - 1 ? '0' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ marginRight: '0.4rem' }}>{step.emoji}</span>
                    {step.title}
                  </h4>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {step.duration}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#4a5568', margin: 0, lineHeight: '1.5' }}>
                  {step.description}
                </p>
                
                {/* Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {step.chips.map((chip, cidx) => (
                    <span key={cidx} style={{ fontSize: '0.65rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#f7fafc', border: '1px solid #edf2f7', color: '#4a5568' }}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Light Blue Box: Important Dates */}
        <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
            📅 Important Dates 2026-27
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '600', textTransform: 'uppercase' }}>Application Start</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0369a1' }}>1 June 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '600', textTransform: 'uppercase' }}>Application Deadline</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0369a1' }}>31 July 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '600', textTransform: 'uppercase' }}>First Merit List</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0369a1' }}>10 August 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '600', textTransform: 'uppercase' }}>Commencement of Classes</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0369a1' }}>1 September 2026</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: '#0369a1' }}>
            <span>Admission Helpline: <strong>0883-2222222</strong></span>
            <span>Email Queries: <strong>admissions@srigowthami.edu.in</strong></span>
          </div>
        </div>
      </div>
    );
  };

  // 6. ENQUIRY VIEW
  const renderEnquiryView = () => {
    const handleLocalFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const errors: Record<string, string> = {};

      if (!(enquiryFormFields.name || '').trim()) {
        errors.name = 'Full Name is required';
      }

      const cleanedPhone = (enquiryFormFields.phone || '').replace(/\D/g, '');
      if (!(enquiryFormFields.phone || '').trim()) {
        errors.phone = 'Phone Number is required';
      } else if (cleanedPhone.length !== 10) {
        errors.phone = 'Phone Number must be exactly 10 digits';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!(enquiryFormFields.email || '').trim()) {
        errors.email = 'Email Address is required';
      } else if (!emailRegex.test(enquiryFormFields.email || '')) {
        errors.email = 'Please enter a valid email address';
      }

      if (!enquiryFormFields.programId) {
        errors.programId = 'Program of Interest is required';
      }

      if (Object.keys(errors).length > 0) {
        setLocalErrors(errors);
        return;
      }

      setLocalErrors({});
      setLocalLoading(true);

      try {
        const matchedCampus = campuses.find((c: any) =>
          c.name.toLowerCase().includes(enquiryFormFields.campusId.toLowerCase())
        );
        const campusIdNum = matchedCampus ? matchedCampus.id : null;

        const matchedProgram = (props.programs || []).find((p: any) =>
          p.name === enquiryFormFields.programId ||
          String(p.id) === enquiryFormFields.programId
        );
        const programIdNum = matchedProgram ? matchedProgram.id : null;

        const requestBody = {
          fullName: enquiryFormFields.name.trim(),
          name: enquiryFormFields.name.trim(),
          phone: enquiryFormFields.phone.trim(),
          email: enquiryFormFields.email.trim(),
          programId: programIdNum,
          campusId: campusIdNum,
          campusPreference: enquiryFormFields.campusId || null,
          tenthPercentage: enquiryFormFields.sscPercent ? Number(enquiryFormFields.sscPercent) : null,
          twelfthPercentage: enquiryFormFields.hscPercent ? Number(enquiryFormFields.hscPercent) : null,
          message: `10th: ${enquiryFormFields.sscPercent || 'N/A'}, 12th: ${enquiryFormFields.hscPercent || 'N/A'}, Heard via: ${enquiryFormFields.heardFrom || 'N/A'}. ${enquiryFormFields.message || ''}`.trim(),
          source: enquiryFormFields.heardFrom || 'Website'
        };

        console.log('ENQUIRY SUBMIT — URL:', `${props.API_BASE_URL}/enquiries/create`);
        console.log('ENQUIRY SUBMIT — Body:', JSON.stringify(requestBody));

        const res = await fetch(`${props.API_BASE_URL}/enquiries/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const json = await res.json();
        console.log('ENQUIRY RESPONSE —', res.status, JSON.stringify(json));

        if (res.status === 201 && json.success) {
          setShowCelebration(true);
          props.setFormSuccess(`Thank you, ${enquiryFormFields.name}! Your enquiry has been registered successfully. Our counsellor will contact you within 24 hours.`);
          setEnquiryFormFields({
            name: '', email: '', phone: '', programId: '',
            campusId: '', sscPercent: '', hscPercent: '',
            heardFrom: '', message: ''
          });
          if (props.onEnquirySubmitted) props.onEnquirySubmitted();
        } else if (res.status === 400) {
          const msgs = json.errors
            ? (Array.isArray(json.errors)
                ? json.errors.map((e: any) => e.message || String(e))
                : [json.message])
            : [json.message || 'Validation failed'];
          setLocalErrors({ general: msgs.join('. ') });
        } else {
          setLocalErrors({ general: json.message || 'Something went wrong. Please try again or call 0883-2222222.' });
        }
      } catch (err) {
        console.error('Enquiry network error:', err);
        setLocalErrors({ general: 'Network error. Check your connection and try again.' });
      } finally {
        setLocalLoading(false);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setActiveSubpage('home')}>Home</span>
          <span style={{ color: '#a0aec0' }}>&rsaquo;</span>
          <span style={{ fontWeight: '600', color: '#2d5be3' }}>Enquiry Form</span>
        </div>

        {/* Heading Section */}
        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>Submit Your Enquiry</h2>
          <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0 0 0', fontFamily: 'Inter, sans-serif' }}>Get custom program counseling recommendations based on your scores and academic focus</p>
        </div>

        {/* Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Form Card */}
          <div className="card" style={{ background: '#fff', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            {showCelebration ? (
              <div style={{ textAlign: 'center', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>Enquiry Submitted Successfully!</h3>
                <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
                  Thank you for your interest in Sri Gowthami Educational Institutions. Our academic counseling system and AI evaluator have successfully registered your interest.
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', margin: '0.5rem 0' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.3rem 0.65rem', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                    ✓ AI recommendation sent
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.3rem 0.65rem', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                    ✓ Follow-up scheduled
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.3rem 0.65rem', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                    ✓ Confirmation emailed
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setEnquiryFormFields({
                      name: '',
                      email: '',
                      phone: '',
                      programId: '',
                      campusId: '',
                      sscPercent: '',
                      hscPercent: '',
                      heardFrom: '',
                      message: ''
                    });
                    props.setFormSuccess(null);
                    setShowCelebration(false);
                  }}
                  className="btn-primary"
                  style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#2d5be3', border: 'none', color: '#fff', borderRadius: '4px', fontWeight: '600' }}
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e2a5e', margin: '0 0 0.25rem 0', fontFamily: 'Inter, sans-serif' }}>Admission Enquiry Form</h3>
                <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0 0 1.25rem 0' }}>Fields marked with a red asterisk (<span style={{ color: '#e53e3e' }}>*</span>) are mandatory.</p>
                
                {localErrors.general && (
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    {localErrors.general}
                  </div>
                )}

                <form onSubmit={handleLocalFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Row 1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="local-fullname">Full Name<span style={{ color: '#e53e3e' }}>*</span></label>
                      <input 
                        type="text" 
                        id="local-fullname"
                        className="form-control" 
                        placeholder="Enter full name"
                        style={{ borderColor: localErrors.name ? '#e53e3e' : '#cbd5e0' }}
                        value={enquiryFormFields.name}
                        onChange={e => setEnquiryFormFields({ ...enquiryFormFields, name: e.target.value })}
                      />
                      {localErrors.name && <span style={{ color: '#e53e3e', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>{localErrors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="local-phone">Phone Number<span style={{ color: '#e53e3e' }}>*</span></label>
                      <input 
                        type="tel" 
                        id="local-phone"
                        className="form-control" 
                        placeholder="+91 98765 43210"
                        style={{ borderColor: localErrors.phone ? '#e53e3e' : '#cbd5e0' }}
                        value={enquiryFormFields.phone}
                        onChange={e => setEnquiryFormFields({ ...enquiryFormFields, phone: e.target.value })}
                      />
                      {localErrors.phone && <span style={{ color: '#e53e3e', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>{localErrors.phone}</span>}
                    </div>
                  </div>

                  {/* Email (Full Width) */}
                  <div className="form-group">
                    <label htmlFor="local-email">Email Address<span style={{ color: '#e53e3e' }}>*</span></label>
                    <input 
                      type="email" 
                      id="local-email"
                      className="form-control" 
                      placeholder="e.g. name@example.com"
                      style={{ borderColor: localErrors.email ? '#e53e3e' : '#cbd5e0' }}
                      value={enquiryFormFields.email}
                      onChange={e => setEnquiryFormFields({ ...enquiryFormFields, email: e.target.value })}
                    />
                    {localErrors.email && <span style={{ color: '#e53e3e', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>{localErrors.email}</span>}
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="local-program">Program of Interest<span style={{ color: '#e53e3e' }}>*</span></label>
                      <select 
                        id="local-program"
                        className="form-control"
                        style={{ borderColor: localErrors.programId ? '#e53e3e' : '#cbd5e0' }}
                        value={enquiryFormFields.programId}
                        onChange={e => setEnquiryFormFields({ ...enquiryFormFields, programId: e.target.value })}
                      >
                        <option value="">Select a Program</option>
                        {MOCK_PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {localErrors.programId && <span style={{ color: '#e53e3e', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>{localErrors.programId}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="local-campus">Preferred Campus</label>
                      <select 
                        id="local-campus"
                        className="form-control"
                        value={enquiryFormFields.campusId}
                        onChange={e => setEnquiryFormFields({ ...enquiryFormFields, campusId: e.target.value })}
                      >
                        <option value="Any">Any Campus</option>
                        <option value="Rajahmundry">Rajahmundry</option>
                        <option value="Peddapuram">Peddapuram</option>
                        <option value="Kakinada">Kakinada</option>
                        <option value="Kovvur">Kovvur</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="local-ssc">10th/SSC Percentage</label>
                      <input 
                        type="number" 
                        id="local-ssc"
                        className="form-control" 
                        placeholder="e.g. 85"
                        min="0"
                        max="100"
                        step="0.01"
                        value={enquiryFormFields.sscPercent}
                        onChange={e => setEnquiryFormFields({ ...enquiryFormFields, sscPercent: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="local-hsc">12th/Inter/Diploma %</label>
                      <input 
                        type="number" 
                        id="local-hsc"
                        className="form-control" 
                        placeholder="e.g. 92"
                        min="0"
                        max="100"
                        step="0.01"
                        value={enquiryFormFields.hscPercent}
                        onChange={e => setEnquiryFormFields({ ...enquiryFormFields, hscPercent: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* How did you hear about us */}
                  <div className="form-group">
                    <label htmlFor="local-source">How did you hear about us?</label>
                    <select 
                      id="local-source"
                      className="form-control"
                      value={enquiryFormFields.heardFrom}
                      onChange={e => setEnquiryFormFields({ ...enquiryFormFields, heardFrom: e.target.value })}
                    >
                      <option value="">Choose options</option>
                      <option value="Google Search">Google Search</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Friend/Family">Friend/Family</option>
                      <option value="Education Fair">Education Fair</option>
                      <option value="Newspaper/TV">Newspaper/TV</option>
                      <option value="College Counsellor">College Counsellor</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label htmlFor="local-message">Message/Additional Questions</label>
                    <textarea 
                      id="local-message"
                      className="form-control" 
                      rows={3}
                      placeholder="Type your questions or specify comments..."
                      value={enquiryFormFields.message}
                      onChange={e => setEnquiryFormFields({ ...enquiryFormFields, message: e.target.value })}
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={localLoading}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #2d5be3, #1e3a8a)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.8rem',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {localLoading ? (
                      <>
                        <Clock className="animate-spin" style={{ width: '16px', height: '16px' }} /> Evaluating Profile Fit...
                      </>
                    ) : 'Submit Enquiry & Get AI Recommendation →'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Info Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Why Enquire With Us */}
            <div className="card" style={{ background: '#fff', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e2a5e', margin: '0 0 1rem 0', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                Why Enquire With Us?
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { emoji: '🧠', title: 'AI Profile Matching', desc: 'Receive instant match recommendations based on your Board scores and interests.' },
                  { emoji: '📞', title: '24-hour Callback', desc: 'Dedicated career advisors will call you within a day to map out study plans.' },
                  { emoji: '📋', title: 'Document Checklist', desc: 'Instant access to step-by-step documentation rules and counseling codes.' },
                  { emoji: 'Priority Processing', title: 'Priority Processing', desc: 'Online enquirers receive early seat evaluation list priority access.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>
                      {idx === 3 ? '⚡' : item.emoji}
                    </span>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e2a5e', margin: '0 0 0.15rem 0', fontFamily: 'Inter, sans-serif' }}>{item.title}</h5>
                      <p style={{ fontSize: '0.75rem', color: '#718096', margin: 0, lineHeight: '1.3' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="card" style={{ background: '#fff', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e2a5e', margin: '0 0 1rem 0', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                Direct Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: '#4a5568' }}>
                <div>
                  <span style={{ display: 'block', color: '#718096', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Phone Helpline</span>
                  <strong style={{ color: '#1e2a5e' }}>0883-2222222</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#718096', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Email Support</span>
                  <strong style={{ color: '#1e2a5e' }}>admissions@sgei.ac.in</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#718096', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Office Hours</span>
                  <strong>Monday - Saturday, 9:00 AM - 5:00 PM</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#718096', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Location Address</span>
                  <strong>Main Campus, Rajahmundry, Andhra Pradesh, India</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  // 7. FAQ VIEW
  const renderFaqView = () => {
    const faqsData = [
      {
        category: 'Admissions',
        question: 'What is the application deadline?',
        answer: 'The application window for the academic year 2026-27 is open from 1 June to 31 July 2026. Late submissions are subject to seat availability.'
      },
      {
        category: 'Admissions',
        question: 'Is there lateral entry for B.Tech?',
        answer: 'Yes, lateral entry into the 2nd year of B.Tech is available for diploma holders via AP ECET counseling. Candidates must have secured a minimum of 60% aggregate score.'
      },
      {
        category: 'Admissions',
        question: 'Can I apply for multiple programs?',
        answer: 'Yes, you can apply for up to 3 programs using the same registered student profile. Program preferences can be prioritized in the application panel.'
      },
      {
        category: 'Admissions',
        question: 'Is there an entrance test?',
        answer: 'No separate institutional test is conducted. We accept scores from state-level entrance exams such as EAPCET, ICET, PGECET, POLYCET, or national exams like GATE.'
      },
      {
        category: 'Fees & Scholarships',
        question: 'Are scholarships available?',
        answer: 'Yes, we offer merit-based tuition waivers up to 50% for high Board scores. Full fee reimbursement under government welfare schemes is applicable for eligible SC/ST/BC categories. Over ₹1.8 crore was disbursed in 2024-25.'
      },
      {
        category: 'Fees & Scholarships',
        question: 'What is the fee payment schedule?',
        answer: 'Academic program fees are payable in two equal instalments at the beginning of each semester. Hostel and dining fees are payable annually.'
      },
      {
        category: 'Fees & Scholarships',
        question: 'Is the admission fee refundable?',
        answer: 'The seat allocation and registration processing fee of ₹5,000 is non-refundable. Other tuition fees are refundable minus a ₹2,000 cancellation fee if withdrawn before the official class commencement.'
      },
      {
        category: 'Programs',
        question: 'Which B.Tech specialisations are offered?',
        answer: 'We offer core specializations in Computer Science (CSE), Electronics & Communication (ECE), Electrical & Electronics (EEE), Mechanical Engineering, and Civil Engineering. AICTE approval is pending for data science tracks.'
      },
      {
        category: 'Programs',
        question: 'Is M.Tech available through distance learning?',
        answer: 'No, M.Tech is strictly full-time. However, MCA and M.Sc Data Science feature hybrid options with up to 70% online lectures and weekend labs.'
      },
      {
        category: 'Programs',
        question: 'What is the medium of instruction?',
        answer: 'The primary medium of instruction is English. Supplementary Telugu tutorial sessions are conducted for first-year students to ease transition.'
      },
      {
        category: 'Campus Life',
        question: 'Is campus hostel accommodation available?',
        answer: 'Yes, separate modern hostels for boys and girls are available at Rajahmundry and Peddapuram campuses, costing ₹45,000 to ₹65,000 per year.'
      },
      {
        category: 'Campus Life',
        question: 'What sports and extracurriculars are offered?',
        answer: 'We offer facilities for Cricket, Football, Volleyball, Kabaddi, Badminton, Chess, and Athletics. Active NCC and NSS wings operate on campus.'
      },
      {
        category: 'Placements',
        question: 'What are the placement rates and average packages?',
        answer: 'Sri Gowthami secured a 94% placement rate in 2024-25 with an average package of ₹5.6 LPA, a highest package of ₹28 LPA, and visits from 150+ companies.'
      },
      {
        category: 'Placements',
        question: 'Is there a dedicated placement cell?',
        answer: 'Yes, the Training and Placement Cell (TPC) provides mandatory aptitude training and placement opportunities registering students from their 2nd year onwards.'
      }
    ];

    const filteredFaqs = faqsData.filter(faq => {
      const matchesCategory = selectedFaqCategory === 'All' || faq.category === selectedFaqCategory;
      const matchesQuery = faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
                           faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setActiveSubpage('home')}>Home</span>
          <span style={{ color: '#a0aec0' }}>&rsaquo;</span>
          <span style={{ fontWeight: '600', color: '#2d5be3' }}>FAQ</span>
        </div>

        {/* Heading Section */}
        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e2a5e', margin: 0, fontFamily: 'Inter, sans-serif' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0 0 0', fontFamily: 'Inter, sans-serif' }}>Find answers to common questions about admissions, fees, programs, and life at Sri Gowthami</p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <input 
            type="text"
            placeholder="Search FAQs..."
            value={faqSearchQuery}
            onChange={e => {
              setFaqSearchQuery(e.target.value);
              setActiveFaqIndex(null);
            }}
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e0',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box'
            }}
          />
          <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#a0aec0' }} />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {['All', 'Admissions', 'Fees & Scholarships', 'Programs', 'Campus Life', 'Placements'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedFaqCategory(cat);
                setActiveFaqIndex(null);
              }}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedFaqCategory === cat ? '#2d5be3' : '#e2e8f0',
                backgroundColor: selectedFaqCategory === cat ? '#ebf8ff' : '#fff',
                color: selectedFaqCategory === cat ? '#2d5be3' : '#4a5568',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredFaqs.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="card" 
                style={{ 
                  background: '#fff', 
                  padding: '1.1rem 1.25rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  transition: 'border-color 0.2s',
                  borderColor: isOpen ? '#2d5be3' : '#e2e8f0'
                }}
              >
                <div 
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e2a5e', margin: 0, paddingRight: '1rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#2d5be3' }}>?</span> {faq.question}
                  </h4>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2d5be3', userSelect: 'none' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                
                <div style={{
                  maxHeight: isOpen ? '250px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.25s ease-out, opacity 0.2s ease-out',
                  opacity: isOpen ? 1 : 0
                }}>
                  <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: '0.5rem 0 0 0', lineHeight: '1.5', borderTop: '1px solid #edf2f7', paddingTop: '0.5rem' }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
          {filteredFaqs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#718096', fontSize: '0.85rem', background: '#fff' }}>
              No FAQ results match your search and filter criteria.
            </div>
          )}
        </div>
      </div>
    );
  };

  // 8. PROGRAM DETAIL MODAL
  const renderProgramDetailModal = () => {
    if (!selectedProgramDetail) return null;
    const prog = selectedProgramDetail;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: prog.tag === 'UG' ? '#ebf8ff' : '#faf5ff', color: prog.tag === 'UG' ? '#2b6cb0' : '#6b46c1', textTransform: 'uppercase' }}>
                {prog.tag}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e2a5e', marginTop: '0.5rem', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>{prog.name}</h3>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500' }}>{prog.department}</span>
            </div>
            <button 
              onClick={() => setSelectedProgramDetail(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', fontWeight: '300', color: '#a0aec0', cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: '#4a5568', borderTop: '1px solid #edf2f7', borderBottom: '1px solid #edf2f7', padding: '0.75rem 0' }}>
            <div>Campus: <strong>{prog.campus}</strong></div>
            <div>Duration: <strong>{prog.duration}</strong></div>
            <div>Seats Available: <strong>{prog.seats}</strong></div>
            <div>Tuition Fee: <strong style={{ color: '#2f855a' }}>{prog.fee}</strong></div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e2a5e', marginBottom: '0.5rem' }}>Core Subjects / Syllabus Focus:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {prog.subjects.map((sub: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4a5568' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2d5be3' }}></div>
                  {sub}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              onClick={() => handleApplyEnquireFromModal(prog)}
              style={{ flex: 1, backgroundColor: '#2d5be3', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
            >
              Apply / Enquire
            </button>
            <button 
              onClick={() => setSelectedProgramDetail(null)}
              style={{ backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="navbar" style={{ backgroundColor: '#1e2a5e', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', color: '#fff', borderBottom: '2px solid #e15b22', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e15b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            SG
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, lineHeight: 1.2, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Sri Gowthami Educational Institutions</h1>
            <span style={{ fontSize: '0.7rem', color: '#ffd5c2', fontWeight: '500', display: 'block' }}>Course & Program Information Portal</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <nav style={{ display: 'flex', gap: '0.75rem' }}>
            {['Home', 'Courses', 'Eligibility', 'Fees', 'Admission', 'Enquiry', 'FAQ'].map((page) => {
              const value = page.toLowerCase() as any;
              return (
                <button
                  key={page}
                  onClick={() => { setActiveSubpage(value); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: activeSubpage === value ? '#ff9f68' : '#fff',
                    fontWeight: activeSubpage === value ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.6rem',
                    borderBottom: activeSubpage === value ? '2px solid #ff9f68' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {page}
                </button>
              );
            })}
          </nav>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
          <button 
            onClick={() => setCurrentView('dashboard')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Staff Login
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Left Sidebar */}
        <aside className="sidebar" style={{ width: '220px', backgroundColor: '#fff', borderRight: '1px solid #e1e4e8', position: 'sticky', top: '70px', height: 'calc(100vh - 70px)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', overflowY: 'auto', flexShrink: 0, boxSizing: 'border-box' }}>
          {/* 1. NAVIGATION */}
          <div>
            <h3 style={{ fontSize: '0.7rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>Navigation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                { label: 'Home', value: 'home', icon: BookOpen },
                { label: 'Courses', value: 'courses', icon: Layers },
                { label: 'Eligibility', value: 'eligibility', icon: CheckCircle },
                { label: 'Fees', value: 'fees', icon: DollarSign },
                { label: 'Admission', value: 'admission', icon: Calendar },
                { label: 'Enquiry', value: 'enquiry', icon: Mail },
                { label: 'FAQ', value: 'faq', icon: HelpCircle }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeSubpage === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => { setActiveSubpage(item.value as any); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? '#f0f4ff' : 'transparent',
                      color: isActive ? '#2d5be3' : '#4a5568',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    <Icon style={{ width: '15px', height: '15px', color: isActive ? '#2d5be3' : '#718096' }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. FILTER BY CAMPUS */}
          <div>
            <h3 style={{ fontSize: '0.7rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>Filter by Campus</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {['All', 'Rajahmundry', 'Peddapuram', 'Kakinada', 'Kovvur'].map((campus) => {
                const value = campus.toLowerCase();
                const isActive = selectedCampusFilter === value;
                return (
                  <button
                    key={campus}
                    onClick={() => {
                      setSelectedCampusFilter(value);
                      if (activeSubpage !== 'home' && activeSubpage !== 'courses') {
                        setActiveSubpage('home');
                      }
                    }}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isActive ? '#2d5be3' : '#cbd5e0',
                      backgroundColor: isActive ? '#2d5be3' : 'transparent',
                      color: isActive ? '#fff' : '#4a5568',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {campus}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. QUICK STATS */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#4a5568', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Programs Offered:</span>
                <span style={{ fontWeight: '700', color: '#1a202c' }}>18</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Campuses:</span>
                <span style={{ fontWeight: '700', color: '#1a202c' }}>4</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Status:</span>
                <span style={{ fontWeight: '700', color: '#2f855a', backgroundColor: '#c6f6d5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem' }}>Admissions Open</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                <span>Helpline:</span>
              </div>
              <div style={{ fontWeight: '700', color: '#2d5be3', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone style={{ width: '11px', height: '11px' }} /> 0883-2222222
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem', minWidth: 0, boxSizing: 'border-box' }}>
          {/* 1. HOME SECTION */}
          <div style={{ display: activeSubpage === 'home' ? 'block' : 'none' }}>
            {renderHomeView()}
          </div>

          {/* 2. COURSES SECTION */}
          <div style={{ display: activeSubpage === 'courses' ? 'block' : 'none' }}>
            {renderCoursesView()}
          </div>

          {/* 3. ELIGIBILITY SECTION */}
          <div style={{ display: activeSubpage === 'eligibility' ? 'block' : 'none' }}>
            {renderEligibilityView()}
          </div>

          {/* 4. FEES SECTION */}
          <div style={{ display: activeSubpage === 'fees' ? 'block' : 'none' }}>
            {renderFeesView()}
          </div>

          {/* 5. ADMISSION SECTION */}
          <div style={{ display: activeSubpage === 'admission' ? 'block' : 'none' }}>
            {renderAdmissionView()}
          </div>

          {/* 6. ENQUIRY SECTION */}
          <div style={{ display: activeSubpage === 'enquiry' ? 'block' : 'none' }}>
            {renderEnquiryView()}
          </div>

          {/* 7. FAQ SECTION */}
          <div style={{ display: activeSubpage === 'faq' ? 'block' : 'none' }}>
            {renderFaqView()}
          </div>
        </main>
      </div>

      {/* Program Detail Modal */}
      {selectedProgramDetail && renderProgramDetailModal()}
    </>
  );
}
