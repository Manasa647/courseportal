# Course & Program Information Portal

### Sri Gowthami Educational Institutions

A full-stack admissions portal and operations dashboard designed to manage course enquiries, student profiles, academic programs, fee structures, and admissions. Features automated lead prioritization, workflow status tracking, and AI-powered personalized candidate recommendations.

---

## 👥 Project Team & Roles

| Name | Role | Core Responsibility |
| --- | --- | --- |
| **Priya Sharma** | Admissions Lead | User requirement validation, workflow analysis, and lead scoring rules |
| **Rajesh Kumar** | Frontend Developer | Single-page public portal, interactive FAQ accordion, and search filters |
| **Amit Patel** | Backend Architect | Node.js Express server, API design, and Prisma database migrations |
| **Sneha Reddy** | DevOps Engineer | Render & Netlify deployment automation, SQLite/PostgreSQL syncing |

---

## 🛠️ Technology Stack

| Component | Technology | Details |
| --- | --- | --- |
| **Frontend** | React, Vite, TypeScript | Single-page application using custom vanilla CSS modules |
| **Backend** | Node.js, Express, TypeScript | REST APIs with custom validator middlewares |
| **Database** | Prisma ORM, SQLite / PostgreSQL | Relational database schema with 13 models |
| **AI Integration** | Gemini API (`@google/generative-ai`) | Warm personalized counselor recommendation prompts |
| **Testing** | Jest, Supertest | Unit & Integration testing (71+ automated cases) |

---

## 🌐 Live URLs

- **Backend API URL**: `https://sgei-portal-backend.onrender.com`
- **Frontend Live URL**: `https://sgei-portal.netlify.app`
- **GitHub Repository**: `https://github.com/sri-gowthami/course-portal`

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Database & Backend Configuration
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
   Specify your local database path (e.g. `DATABASE_URL="file:./dev.db"`) and optionally your `GEMINI_API_KEY`.
4. Apply Prisma migrations and synchronize the SQLite schema:
   ```bash
   npx prisma db push --force-reset
   ```
5. Seed the database with the 4 campuses and 18 program catalogs:
   ```bash
   npx ts-node prisma/seed.ts
   ```
6. Spin up the Nodemon development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Navigate to the `frontend/` directory in a new terminal window:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser to view the course portal.

---

## 🧪 Running Integration Tests
To run the automated API and service test suites:
```bash
cd backend
$env:PORT=5007; npm test
```
