<div align="center">
  <h1>🌍 StudyGlobe — Study Abroad Preparation System</h1>
  <p>A comprehensive, full-stack web platform empowering students to explore universities, academic programs, scholarships, and intake dates across the globe.</p>
  <br />
  <strong><a href="https://YOUR-PROJECT-NAME.netlify.app">🚀 View Live Demo</a></strong>
</div>

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

### Step 4: Deploy to Vercel

1. Push the repository to GitHub and import it in [Vercel](https://vercel.com/new).
2. Set the project **Framework Preset** to **Services** (required for `experimentalServices`).
3. Leave the root directory as the repo root — `vercel.json` configures both services.
4. Add **Environment variables** (all services share them):
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_KEY` — your Supabase service role key
   - `FRONTEND_URL` — your Vercel URL (e.g. `https://your-app.vercel.app`)
5. Deploy. The frontend is served at `/` and the Express API at `/_/backend` (e.g. `/_/backend/auth/login`).

**Verify after deploy:** `https://your-app.vercel.app/_/backend/health` → `{"status":"OK"}`

**Local Vercel preview** (frontend + backend together):

```bash
npm install -g vercel
vercel dev -L
```

### Step 5: Deploy to Netlify

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. In [Netlify](https://app.netlify.com/), click **Add new site → Import an existing project** and connect the repo.
3. Leave **Base directory** empty — `netlify.toml` at the repo root configures the build.
4. Under **Site configuration → Environment variables** (required — without these the API returns 502):
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_KEY` — your Supabase **service role** key (not the anon key)
   - `FRONTEND_URL` — your Netlify site URL (e.g. `https://your-site.netlify.app`)
   - `OLLAMA_HOST`, `OLLAMA_API_KEY`, `OLLAMA_MODEL` — optional, for AI chat/SOP review only
5. Deploy. The React app is served from `frontend/build` and `/api/*` routes to the Express serverless function.
6. After deploy, verify the API: open `https://your-site.netlify.app/api/health` — you should see `{"status":"OK"}`.

**Local Netlify preview** (frontend + API together):

```bash
npm install -g netlify-cli
netlify dev
```

Opens at `http://localhost:8888` with API at `/api`.

---

<div align="center">
  <p><i>Developed with ❤️ for our Capstone Project.</i></p>
</div>
