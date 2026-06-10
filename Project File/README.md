<div align="center">
  <h1>🌍 StudyGlobe — Study Abroad Preparation System</h1>
  <p>A comprehensive, full-stack web platform empowering students to explore universities, academic programs, scholarships, and intake dates across the globe.</p>
  <br />
  <strong><a href="https://study-globe-pef9.vercel.app/">🚀 View Live Demo</a></strong>
</div>

---

## 🌐 Live Demo

| | |
| :--- | :--- |
| **Production (Vercel)** | [https://study-globe-pef9.vercel.app/](https://study-globe-pef9.vercel.app/) |
| **API health check** | [https://study-globe-pef9.vercel.app/_/backend/health](https://study-globe-pef9.vercel.app/_/backend/health) |

---

## 📖 About the Project

**StudyGlobe** is an intuitive study abroad preparation system designed to simplify the complex process of international university hunting. It centralizes critical information such as academic programs, language requirements, tuition fees, and scholarship eligibility into a single, user-friendly portal. By providing comprehensive filtering and a centralized dashboard, StudyGlobe minimizes the research overhead for prospective international students.

---

## 🚀 Technical Stack

The project utilizes a modern web development stack to assure performance, scalability, and security:

| Component | Technology Used |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **BaaS / Auth** | Supabase (Authentication & Row Level Security) |

---

## ✨ Key Features (13 Functional Requirements)

1. **Secure Registration & Authentication:** JWT-based sign-up/sign-in flows backed by Supabase Auth.
2. **Personalized User Dashboard:** Centralized snapshot of the platform's core offerings upon logging in.
3. **User Profile Management:** Extensive user profiles tracking study interests, budget, and target intakes.
4. **Interactive Country Catalog:** Browse verified study destination countries with ease.
5. **Country-wise University Filtering:** View and shortlist universities mapped to specific regions.
6. **Detailed University Profiles:** Dedicated overviews detailing university locations, types, and external links.
7. **Academic Program Exploration:** Deep dive into specific degrees alongside duration and estimated tuition.
8. **Intake Schedule Tracking:** Up-to-date tracking of university program start dates and intake cycles.
9. **Language Requirement Inspection:** Direct insights into IELTS/TOEFL requirements per institution.
10. **Scholarship Eligibility Assessment:** Comprehensive checks for available scholarships and minimum GPAs.
11. **Advanced Preference-Based Filtering:** Search programs and universities by degree level, field, or location.
12. **Admin Data Management:** Secure CRUD operation backend routing protected by Role-Based Access Control (RBAC).
13. **Responsive UI & Session Persistence:** Fully fluid front-end routing with token-based session memory across reloads.

---

## 👥 Meet The Team

This capstone project was conceptualized, designed, and developed by:

- **Kawshik Kumar Saha** — Database Design, API Architecture, Documentation, Testing & Validation
- **Md. Fazly Rabby** — Frontend Development & UI/UX Design
- **Md. Munjurul Islam** — Backend Development & Data Integration

---

## ⚙️ Installation & Setup Guide

Want to run this project locally? Follow these steps to get a development environment up and running.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16.x or higher)
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account for the integrated PostgreSQL backend.

### Step 1: Database Setup (Supabase)

1. Create a new project in your Supabase dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the entire contents of `backend/database/setup.sql` from this repository and run it to establish the schema and Row Level Security (RLS) policies.
4. Keep your **Project URL** and **`service_role` key** ready securely—you'll need them for the backend setup.

### Step 2: Backend Configuration & Start

```bash
# Clone the repository and navigate to the backend folder
cd StudyGlobe/backend

# Create your environment variables file
cp .env.example .env

# Open .env and add your Supabase credentials:
# SUPABASE_URL=your_project_url_here
# SUPABASE_SERVICE_KEY=your_service_role_key_here
# PORT=5000

# Install dependencies
npm install

# Start the backend development server
npm run dev
```

*The backend will now be running on `http://localhost:5000`.*

### Step 3: Frontend Configuration & Start

Open a new terminal window/tab:

```bash
# Navigate to the frontend folder
cd StudyGlobe/frontend

# Install dependencies
npm install

# Setup the API endpoint environment variable
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start the React development server
npm start
```

*The frontend application will now launch automatically on `http://localhost:3000`.*

---

<div align="center">
  <p><i>Developed with ❤️ for our Capstone Project.</i></p>
</div>
