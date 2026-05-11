# ImpactFlow

A full-stack project-based learning management system for colleges. Faculty create courses and projects, students form teams, log daily tasks with file uploads, and submit milestones. Faculty get a real-time dashboard with per-student contribution scores and AI transparency flags on submissions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Phase 2 Roadmap](#phase-2-roadmap)

---

## Features

### Faculty
- Create courses with auto-generated 6-character join codes
- Build projects with a rubric (weights must sum to 100%) and milestones
- Approve or reject student teams
- Dashboard showing every team's task timeline, hours logged, files uploaded, and contribution score per student
- AI Transparency Score on each milestone submission (flags potentially AI-generated text)

### Students
- Join courses via join code
- Create or join teams (manual only — no random assignment)
- Log daily tasks with file proof (PDF, images, code files, ZIP — up to 3 files, 10 MB each)
- Visual milestone progress stepper
- Team lead submits milestones with notes and file uploads

### System
- JWT authentication in http-only cookies (XSS-safe)
- In-app notification bell with unread badge (polls every 60 seconds)
- Daily 8 AM cron job that notifies teams when a milestone is due within 48 hours
- Contribution score calculated from task count, hours logged, and files uploaded — recalculated on every new task log
- Role-based access control (student / faculty / admin)

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS | Vite is 10× faster than CRA |
| State | Zustand | No re-render hell like Context API |
| HTTP | Axios | `withCredentials: true` for cookie auth |
| Backend | Node.js + Express (ESM) | Fast, MERN standard |
| Database | MongoDB + Mongoose | Flexible schema, Atlas free tier |
| Auth | JWT + bcryptjs + http-only cookies | Prevents XSS token theft |
| Files | Cloudinary + multer-storage-cloudinary | Survives redeploy unlike local Multer |
| Validation | Zod | Server-side input safety on every route |
| Security | Helmet + CORS + express-rate-limit | Non-negotiable basics |
| Scheduler | node-cron | Daily milestone reminders |
| Deploy | Vercel (frontend) + Railway (backend) | Both free tier |

---

## Project Structure

```
impactflow/
├── client/                        # React frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                # All routes
│       ├── main.jsx
│       ├── index.css              # Tailwind + component classes
│       ├── utils/
│       │   └── api.js             # Axios instance (withCredentials: true)
│       ├── store/
│       │   ├── authStore.js       # Zustand — user state
│       │   └── notificationStore.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── FacultySidebar.jsx
│       │   ├── StudentSidebar.jsx
│       │   ├── NotificationBell.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── ContributionBadge.jsx  # green/amber/red score badge
│       │   ├── AIFlagBadge.jsx
│       │   ├── Spinner.jsx
│       │   └── EmptyState.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── NotFound.jsx
│           ├── faculty/
│           │   ├── FacultyDashboard.jsx
│           │   ├── CreateCourse.jsx
│           │   ├── CourseDetail.jsx   # Shows join code with copy button
│           │   ├── CreateProject.jsx  # Rubric builder + milestone builder
│           │   ├── ProjectDetail.jsx  # Full team dashboard
│           │   └── TeamTaskLog.jsx
│           └── student/
│               ├── StudentDashboard.jsx
│               ├── JoinCourse.jsx
│               ├── StudentCourseDetail.jsx
│               ├── StudentProjectDetail.jsx  # Team create/join + milestone stepper
│               ├── LogTask.jsx               # File upload form
│               ├── MyTasks.jsx               # Grouped by milestone
│               └── SubmitMilestone.jsx
│
└── server/                        # Express backend
    ├── server.js                  # Entry point
    ├── config/
    │   ├── db.js                  # MongoDB Atlas connection
    │   └── cloudinary.js          # Cloudinary config + multer upload middleware
    ├── middleware/
    │   ├── auth.js                # authMiddleware + roleGuard()
    │   ├── validateId.js          # ObjectId param validator
    │   └── errorHandler.js
    ├── models/
    │   ├── User.js
    │   ├── Course.js
    │   ├── Project.js
    │   ├── Milestone.js
    │   ├── Team.js                # Stores cached contributionScores[]
    │   ├── TaskLog.js
    │   ├── MilestoneSubmission.js
    │   └── Notification.js
    ├── controllers/               # One file per resource, Zod validation inside
    │   ├── auth.controller.js
    │   ├── course.controller.js
    │   ├── project.controller.js
    │   ├── milestone.controller.js
    │   ├── team.controller.js
    │   ├── task.controller.js
    │   ├── submission.controller.js
    │   ├── dashboard.controller.js
    │   └── notification.controller.js
    ├── routes/                    # Express routers
    │   ├── auth.routes.js
    │   ├── course.routes.js
    │   ├── project.routes.js
    │   ├── milestone.routes.js
    │   ├── team.routes.js
    │   ├── task.routes.js
    │   ├── submission.routes.js
    │   ├── dashboard.routes.js
    │   └── notification.routes.js
    └── utils/
        ├── token.js               # JWT sign + set http-only cookie
        ├── joinCode.js            # Unique 6-char course code generator
        ├── aiFlag.js              # Rule-based AI transparency scorer
        ├── contribution.js        # Contribution score formula
        ├── notify.js              # createNotification / notifyMany helpers
        └── cronJobs.js            # node-cron daily 8 AM milestone reminders
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (free M0 cluster)
- A [Cloudinary](https://cloudinary.com/users/register_free) account (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/MANIDEEP2407-SYS/IMPACT_FLOW.git
cd IMPACT_FLOW
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

---

## Environment Variables

Create `server/.env` (copy from `.env.example`):

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/impactflow?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

**MongoDB Atlas:**
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Add a database user with read/write permissions
3. Allow access from `0.0.0.0/0` (all IPs) under Network Access
4. Click Connect → Drivers → copy the connection string

**Cloudinary:**
1. Sign up at [cloudinary.com](https://cloudinary.com/users/register_free)
2. Find your Cloud Name, API Key, and API Secret on the dashboard home page

---

## Running Locally

```bash
# Terminal 1 — backend (from /server)
npm run dev
# Server starts at http://localhost:5000

# Terminal 2 — frontend (from /client)
npm run dev
# App opens at http://localhost:5173
```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register student or faculty |
| POST | `/api/auth/login` | Public | Login, sets http-only cookie |
| POST | `/api/auth/logout` | Public | Clears cookie |
| GET | `/api/auth/me` | Auth | Returns current user |

### Courses
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/courses` | Faculty | Create course, auto-generates join code |
| GET | `/api/courses/my` | Faculty | Get faculty's own courses |
| GET | `/api/courses/enrolled` | Student | Get student's enrolled courses |
| POST | `/api/courses/:id/join` | Student | Join course via join code |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/courses/:courseId/projects` | Faculty | Create project with rubric |
| GET | `/api/courses/:courseId/projects` | All | List projects in a course |
| GET | `/api/projects/:id` | All | Get project detail |

### Milestones
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/projects/:projectId/milestones` | Faculty | Add milestone |
| GET | `/api/projects/:projectId/milestones` | All | List milestones |
| PUT | `/api/milestones/:id` | Faculty | Edit milestone |

### Teams
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/projects/:projectId/teams` | Student | Create team (becomes team lead) |
| POST | `/api/teams/:teamId/join-request` | Student | Request to join a team |
| PUT | `/api/teams/:teamId/approve` | Faculty | Approve team |
| PUT | `/api/teams/:teamId/reject` | Faculty | Reject team |
| PUT | `/api/teams/:teamId/remove-member` | Team Lead | Remove member (before approval) |
| GET | `/api/projects/:projectId/teams` | All | List all teams in a project |

### Task Logs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/tasks` | Student | Log a task (up to 3 file uploads) |
| GET | `/api/tasks/my` | Student | Get own task logs |
| GET | `/api/tasks/team/:teamId` | Team Lead + Faculty | Get all team task logs |

### Milestone Submissions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/milestones/:milestoneId/submit` | Team Lead | Submit milestone with files |
| GET | `/api/milestones/:milestoneId/submission` | All in project | Get submission |
| GET | `/api/projects/:projectId/submissions` | Faculty | Get all submissions for project |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects/:projectId/dashboard` | Faculty | Full team + member stats + milestone status |

### Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notifications/my` | Auth | Get unread notifications |
| PUT | `/api/notifications/:id/read` | Auth | Mark one as read |
| PUT | `/api/notifications/read-all` | Auth | Mark all as read |

---

## How It Works

### Contribution Score
Each student gets a score (0–100) recalculated every time they log a task:

```
taskScore  = min((taskCount / teamAvgTasks) × 40, 40)
hoursScore = min((totalHours / 20) × 30, 30)     // 20 hours = full marks
fileScore  = min(filesUploaded × 3, 30)           // each file = 3 pts, max 30
```

Colour coding: **green** ≥ 70 · **amber** 40–69 · **red** < 40

### AI Transparency Score
A rule-based (no ML) scorer runs on submission notes and returns 0–100:

| Signal | Points |
|---|---|
| Avg sentence length > 25 words | +30 |
| Formal connectors (furthermore, moreover, hence…) | +25 |
| AI phrases (in conclusion, it is important to note…) | +25 |
| Lexical diversity ratio < 0.4 | +20 |

Shown to **faculty only** as a flag — not used for grading.

### Authentication
- Password hashed with bcryptjs (12 salt rounds) before storage
- JWT signed and stored in an `httpOnly; SameSite=Lax` cookie — never accessible to JavaScript
- `authMiddleware` verifies the cookie on every protected request
- `roleGuard('faculty')` / `roleGuard('student')` for route-level access control

### File Uploads
- All files go directly to Cloudinary via `multer-storage-cloudinary`
- Stored as `{ url, publicId, filename }` in MongoDB — no files on the server
- Cloudinary folders: `impactflow/tasks/` and `impactflow/submissions/`
- Allowed formats: pdf, png, jpg, jpeg, zip, js, py, java, cpp, txt
- Max size: 10 MB per file

---

## Deployment

### Backend → Railway

1. Push to GitHub
2. Create new project on [railway.app](https://railway.app) → Deploy from GitHub repo → select `/server`
3. Set all environment variables in Railway dashboard (same as `.env`)
4. Set `CLIENT_URL` to your Vercel frontend URL
5. Add a free [UptimeRobot](https://uptimerobot.com) monitor pinging the Railway URL every 5 minutes to prevent cold starts

### Frontend → Vercel

1. Create new project on [vercel.com](https://vercel.com) → Import GitHub repo → set Root Directory to `client`
2. Add environment variable: `VITE_API_URL=https://your-app.railway.app/api`
3. Build command: `npm run build` · Output directory: `dist`

---

## Phase 2 Roadmap

| Feature | Notes |
|---|---|
| Peer review | Students rate teammates after each milestone |
| Email notifications | Nodemailer for milestone reminders |
| File version history | Track changes to submitted files |
| Plagiarism detection | Cosine similarity via async Python service |
| GitHub integration | Link commits to task logs |
| Admin panel | College-wide analytics and user management |

---

## Authors

Built by **IIC Tech Yodhas** team — Manideep, Rishit Kumar, Samyuktha.
