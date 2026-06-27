-- Course & Program Information Portal - Database Schema Design (PostgreSQL)

-- 1. Campuses
CREATE TABLE campuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Programs
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courses
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Students
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    campus_id INT REFERENCES campuses(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Parents
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Enquiries
CREATE TABLE enquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    campus_id INT REFERENCES campuses(id) ON DELETE SET NULL,
    source VARCHAR(100) DEFAULT 'Website',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'applied', 'admitted', 'closed')),
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    ai_recommendation TEXT,
    date_received TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Applications
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    enquiry_id INT UNIQUE REFERENCES enquiries(id) ON DELETE SET NULL,
    student_id INT UNIQUE REFERENCES students(id) ON DELETE SET NULL,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    submission_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'))
);

-- 8. Documents
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('student', 'application', 'enquiry')),
    entity_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Fee Payments
CREATE TABLE fee_payments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- 10. Receipts
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    payment_id INT UNIQUE NOT NULL REFERENCES fee_payments(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT
);

-- 11. Attendance Records
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    UNIQUE (student_id, course_id, date)
);

-- 12. Marks
CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assessment_name VARCHAR(150) NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0),
    max_score NUMERIC(5,2) NOT NULL CHECK (max_score > 0),
    weight NUMERIC(3,2) NOT NULL CHECK (weight > 0 AND weight <= 1.00),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_score_limit CHECK (score <= max_score)
);

-- 13. Results
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    grade VARCHAR(5) NOT NULL,
    gpa NUMERIC(3,2) NOT NULL CHECK (gpa >= 0.00 AND gpa <= 4.00),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pass', 'fail', 'incomplete')),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, course_id)
);

-- 14. Status Histories
CREATE TABLE status_histories (
    id SERIAL PRIMARY KEY,
    enquiry_id INT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

-- 15. Campus Programs Join Table
CREATE TABLE campus_programs (
    campus_id INT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    program_id INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    PRIMARY KEY (campus_id, program_id)
);

-- 16. Placement Drives
CREATE TABLE placement_drives (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    eligible_programs TEXT NOT NULL,
    drive_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL
);
