# Test Case Tracker - Course & Program Information Portal

This document tracks validation and integration test cases mapped to the core business use cases as specified in the Day 4 and Day 7 deliverables.

---

## 📋 Test Case Log

| Test ID | Feature Area | Description | Input / Test Data | Expected Output | Status |
| --- | --- | --- | --- | --- | --- |
| **TC-001** | Enquiry Form | Empty fields submission | Click "Submit" on empty form | Form validation fails, displays red input borders and error notices | **PASS** |
| **TC-002** | Enquiry Form | Invalid email format | Email: `notanemail` | Field highlights in red, blocks submission, shows "email is required and must be valid." | **PASS** |
| **TC-003** | Enquiry Form | Short phone number validation | Phone: `123` | Blocks submission, displays regex error alert | **PASS** |
| **TC-004** | Enquiry Form | Valid candidate registration | Full Name: `Jane Doe`, Phone: `9876543210`, Program: `B.Tech CSE` | Form replaces with `🎉` success screen, displays personalized 3-sentence AI counseling recommendation | **PASS** |
| **TC-005** | FAQ Accordion | real-time search | Type `fee` in search bar | Accordion list filters dynamically to show only the 2 FAQ items matching "fee" | **PASS** |
| **TC-006** | FAQ Accordion | Toggle logic | Click accordion question | Answer panel expands smoothly with max-height transition. Clicking another question closes the active one | **PASS** |
| **TC-007** | Courses Page | Sidebar campus filters | Select "Kakinada" campus filter pill | Course catalog table updates using AND logic to display only the programs available at Kakinada | **PASS** |
| **TC-008** | Courses Page | View details syllabus | Click "View Details" on B.Tech CSE | Syllabus modal displays list of core courses, tuition/dev fees, and CTA to apply | **PASS** |
| **TC-009** | Staff Dashboard | Status filtering | Select status "Contacted" | Dashboard list displays only enquiries currently at the contacted stage | **PASS** |
| **TC-010** | Staff Dashboard | Status progression | Click "Progress Status" on pending lead | System updates database status to "contacted" and appends a `StatusHistory` record | **PASS** |
| **TC-011** | Staff Dashboard | Simulating admissions | Click "Simulate Student Admission" | Student profile is successfully registered in database under `students` table | **PASS** |
| **TC-012** | AI Router | AI FAQ Route | POST `/api/ai/faq` with question containing "hostel" | Returns 200 with answer containing "hostel accommodation is well-maintained" | **PASS** |
| **TC-013** | AI Router | AI Course Recommendation | POST `/api/ai/recommend-courses` with interests | Returns scoring list containing target engineering and management match courses | **PASS** |
| **TC-014** | AI Router | AI Progress Report | POST `/api/ai/progress-report` with custom notes | Compiles dynamic marks and attendance, generating a structured parent report draft | **PASS** |
| **TC-015** | Analytics | Aggregate calculations | GET `/api/analytics` | Returns 200 with counts matching actual records grouped by priority and status | **PASS** |
