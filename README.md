<div align="center">

<img src="https://img.shields.io/badge/ImpactFlow-v2.0-4f46e5?style=for-the-badge&labelColor=1e1b4b" alt="ImpactFlow"/>
<img src="https://img.shields.io/badge/Stack-MERN-0d9488?style=for-the-badge&labelColor=134e4a" alt="MERN"/>
<img src="https://img.shields.io/badge/Status-Live-22c55e?style=for-the-badge&labelColor=14532d" alt="Live"/>
<img src="https://img.shields.io/badge/Team-ImpactFlow-818cf8?style=for-the-badge&labelColor=312e81" alt="Team"/>

<br/>
<br/>

# ImpactFlow

### **Stop Guessing. Start Measuring What Matters.**

A full-stack academic project management platform where faculty design courses, students ship real work, and every contribution is scored, verified, and visible.

[**Live Demo**](#) · [**API Docs**](#api-reference) · [**Report Bug**](https://github.com/MANIDEEP2407-SYS/IMPACT_FLOW/issues) · [**Request Feature**](https://github.com/MANIDEEP2407-SYS/IMPACT_FLOW/issues)

</div>

---

## What is ImpactFlow?

ImpactFlow replaces spreadsheets and guesswork with a structured, data-driven workflow for academic group projects.

- **Faculty** create courses, build projects with rubrics, approve teams, and get a live dashboard with per-student contribution scores.
- **Students** join courses, form teams, log daily tasks with file proof, and submit milestones — all in one place.
- **Everyone** gets real-time notifications, an AI transparency layer on submissions, and a shared team workspace.

> *"From code to contribution — every task tells a story."*  
> — **Team ImpactFlow**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Team](#team)

---

## Features

### For Faculty
| Feature | Detail |
|---|---|
| Course Management | Create courses with auto-generated 6-character join codes |
| Project Builder | Define rubric weights (must sum to 100%) + milestone timeline |
| Team Oversight | Approve / reject teams, view per-student contribution scores |
| Live Dashboard | Task count, hours logged, files uploaded, AI flag per student |
| AI Transparency | Rule-based scorer flags potentially AI-generated submissions |
| Similarity Report | Jaccard similarity check across all team READMEs in a project |
| Random Teams | Auto-divide enrolled students into balanced teams |

### For Students
| Feature | Detail |
|---|---|
| Course Enrollment | Join courses via 6-char code shared by faculty |
| Team Formation | Create a team or request to join an existing one |
| Task Logging | Log daily work with title, hours, date + up to 3 proof files |
| Milestone Tracker | Visual stepper showing submitted / pending / overdue milestones |
| Team Workspace | Shared space with README editor, code file versioning, task logs |
| Section Restriction | Students only see teams from their own course section |

### System-Wide
| Feature | Detail |
|---|---|
| Auth | HTTPOnly JWT cookies — XSS-proof by design |
| Notifications | In-app bell with unread badge, polls every 60 seconds |
| Cron Jobs | Daily 8 AM reminder for milestones due within 48 hours |
| Contribution Score | Formula-based 0–100 score, recalculated on every task log |
| File Storage | All uploads go to Cloudinary — no files stored on server |
| README Versioning | Full version history with commit messages per team |
| Code File Versioning | Per-filename version tracking with download links |

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React 19 + Vite | 10× faster dev server than CRA |
| **Styling** | Tailwind CSS + Inter font | Utility-first, professional light theme |
| **State** | Zustand | No re-render hell, minimal boilerplate |
| **HTTP** | Axios | `withCredentials: true` for cookie auth |
| **Backend** | Node.js + Express (ESM) | Fast, standard MERN backend |
| **Database** | MongoDB Atlas + Mongoose | Flexible schema, free M0 cluster |
| **Auth** | JWT + bcryptjs + HTTPOnly cookies | Prevents XSS token theft |
| **Files** | Cloudinary + multer | Survives redeploy, 10MB per file |
| **Validation** | Zod | Server-side safety on every route |
| **Security** | Helmet + CORS + rate-limit | Production hardening basics |
| **Scheduler** | node-cron | Daily milestone reminders |
| **Deploy** | Vercel (FE) + Railway (BE) | Both free tier |

---

## Project Structure

```
IMPACT_FLOW/
│
├── client/                          # React + Vite frontend
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                  # All routes + ProtectedRoute
│       ├── main.jsx
│       ├── index.css                # Design system: Indigo + Teal palette
│       │
│       ├── utils/
│       │   └── api.js               # Axios instance (withCredentials: true)
│       │
│       ├── store/
│       │   ├── authStore.js         # Zustand — user session
│       │   └── notificationStore.js # Zustand — notification bell
│       │
│       ├── components/
│       │   ├── Navbar.jsx           # Frosted glass top bar
│       │   ├── FacultySidebar.jsx   # Indigo active-state nav
│       │   ├── StudentSidebar.jsx   # Teal active-state nav
│       │   ├── NotificationBell.jsx # Dropdown with mark-all-read
│       │   ├── ProtectedRoute.jsx   # Role-based route guard
│       │   ├── ContributionBadge.jsx
│       │   ├── AIFlagBadge.jsx
│       │   ├── Spinner.jsx
│       │   └── EmptyState.jsx
│       │
│       └── pages/
│           ├── Login.jsx            # Split-panel with demo quick-access cards
│           ├── Register.jsx         # Role selector (Faculty / Student)
│           ├── NotFound.jsx
│           │
│           ├── shared/
│           │   └── TeamWorkspace.jsx  # Tabs: Overview | README | Code Files | Tasks
│           │
│           ├── faculty/
│           │   ├── FacultyDashboard.jsx
│           │   ├── CreateCourse.jsx
│           │   ├── CourseDetail.jsx    # Join code + copy button
│           │   ├── CreateProject.jsx   # Rubric builder + milestone builder
│           │   ├── ProjectDetail.jsx   # Team cards + similarity report
│           │   └── TeamTaskLog.jsx
│           │
│           └── student/
│               ├── StudentDashboard.jsx
│               ├── JoinCourse.jsx      # 6-char code with progress dots
│               ├── StudentCourseDetail.jsx
│               ├── StudentProjectDetail.jsx  # Team create/join + milestone stepper
│               ├── LogTask.jsx              # Drag-and-drop file upload
│               ├── MyTasks.jsx              # Grouped by milestone
│               └── SubmitMilestone.jsx
│
└── server/                          # Express backend (ESM)
    ├── server.js                    # Entry point — mounts all routers
    ├── seed.js                      # Creates demo faculty + student accounts
    │
    ├── config/
    │   ├── db.js                    # MongoDB Atlas connection
    │   └── cloudinary.js            # Cloudinary config + multer middleware
    │
    ├── middleware/
    │   ├── auth.js                  # authMiddleware + roleGuard()
    │   ├── validateId.js            # ObjectId param validator
    │   └── errorHandler.js
    │
    ├── models/
    │   ├── User.js
    │   ├── Course.js                # Includes section field
    │   ├── Project.js
    │   ├── Milestone.js
    │   ├── Team.js                  # contributionScores[] cached per member
    │   ├── TaskLog.js
    │   ├── MilestoneSubmission.js
    │   ├── Notification.js
    │   ├── ReadmeVersion.js         # Per-team README version history
    │   └── CodeFile.js              # Per-filename code file versions
    │
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── course.controller.js
    │   ├── project.controller.js
    │   ├── milestone.controller.js
    │   ├── team.controller.js       # + workspace, random teams, similarity
    │   ├── task.controller.js
    │   ├── submission.controller.js
    │   ├── dashboard.controller.js
    │   ├── notification.controller.js
    │   ├── readme.controller.js     # README versioning
    │   └── codefile.controller.js   # Code file versioning
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── course.routes.js
    │   ├── project.routes.js
    │   ├── milestone.routes.js
    │   ├── team.routes.js           # All workspace + new feature routes
    │   ├── task.routes.js
    │   ├── submission.routes.js
    │   ├── dashboard.routes.js
    │   └── notification.routes.js
    │
    └── utils/
        ├── token.js                 # JWT sign + set HTTPOnly cookie
        ├── joinCode.js              # Unique 6-char course code generator
        ├── aiFlag.js                # Rule-based AI transparency scorer
        ├── contribution.js          # Contribution score formula
        ├── notify.js                # createNotification / notifyMany helpers
        ├── cronJobs.js              # node-cron daily 8 AM reminders
        └── similarity.js            # Jaccard similarity — README plagiarism check
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **MongoDB Atlas** account — [register free M0 cluster](https://www.mongodb.com/cloud/atlas/register)
- **Cloudinary** account — [register free tier](https://cloudinary.com/users/register_free)

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

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/impactflow
JWT_SECRET=your_long_random_secret_at_least_64_chars
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5174
PORT=5000
```

**MongoDB Atlas setup:**
1. Create free M0 cluster → Add database user with read/write permissions
2. Under Network Access → allow `0.0.0.0/0`
3. Connect → Drivers → copy the connection string

**Cloudinary setup:**
1. Sign up → Dashboard home shows Cloud Name, API Key, API Secret

---

## Running Locally

Open **two terminals**:

```bash
# Terminal 1 — Backend (from /server)
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend (from /client)
npm run dev
# → http://localhost:5174
```

### Seed demo accounts

```bash
# From /server
node seed.js
```

This creates two demo accounts in your MongoDB:

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Faculty** — Dr. Priya Sharma | `faculty@demo.com` | `demo1234` |
| **Student** — Arjun Reddy | `student@demo.com` | `demo1234` |

> **Tip:** On the login page, click either demo card to auto-fill credentials, then hit **Sign in →**

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student or faculty |
| `POST` | `/api/auth/login` | Public | Login — sets HTTPOnly cookie |
| `POST` | `/api/auth/logout` | Public | Clears session cookie |
| `GET` | `/api/auth/me` | Auth | Returns current user |

### Courses
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/courses` | Faculty | Create course + auto join code |
| `GET` | `/api/courses/my` | Faculty | List own courses |
| `GET` | `/api/courses/enrolled` | Student | List enrolled courses |
| `POST` | `/api/courses/:id/join` | Student | Join via join code |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/courses/:courseId/projects` | Faculty | Create project + rubric |
| `GET` | `/api/courses/:courseId/projects` | All | List course projects |
| `GET` | `/api/projects/:id` | All | Project detail |

### Teams
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/teams` | Student | Create team (become team lead) |
| `POST` | `/api/teams/:teamId/join-request` | Student | Request to join team |
| `PUT` | `/api/teams/:teamId/approve` | Faculty | Approve team |
| `PUT` | `/api/teams/:teamId/reject` | Faculty | Reject team |
| `PUT` | `/api/teams/:teamId/remove-member` | Team Lead | Remove member (before approval) |
| `GET` | `/api/projects/:projectId/teams` | All | List all teams in project |
| `GET` | `/api/teams/:teamId/workspace` | Member + Faculty | Get team workspace data |
| `POST` | `/api/projects/:projectId/random-teams` | Faculty | Auto-generate random teams |
| `GET` | `/api/projects/:projectId/similarity` | Faculty | README similarity report |

### README Versioning
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/teams/:teamId/readme` | Member + Faculty | Latest README + version history |
| `POST` | `/api/teams/:teamId/readme` | Member | Save new version |

### Code Files
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/teams/:teamId/files` | Member + Faculty | List all files (grouped by name) |
| `POST` | `/api/teams/:teamId/files` | Member | Upload code files (max 10 × 10MB) |

### Task Logs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/tasks` | Student | Log task + up to 3 proof files |
| `GET` | `/api/tasks/my` | Student | Own task history |
| `GET` | `/api/tasks/team/:teamId` | Member + Faculty | All team task logs |

### Milestones & Submissions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/milestones` | Faculty | Add milestone |
| `GET` | `/api/projects/:projectId/milestones` | All | List milestones |
| `POST` | `/api/milestones/:milestoneId/submit` | Team Lead | Submit milestone |
| `GET` | `/api/milestones/:milestoneId/submission` | All | Get submission |

### Dashboard & Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/dashboard` | Faculty | Full team stats + milestone status |
| `GET` | `/api/notifications/my` | Auth | Get notifications |
| `PUT` | `/api/notifications/:id/read` | Auth | Mark one read |
| `PUT` | `/api/notifications/read-all` | Auth | Mark all read |

---

## How It Works

### Contribution Score
Each student gets a **0–100 score** recalculated every time a task is logged:

```
taskScore  = min((taskCount / teamAvgTasks) × 40, 40)   — effort relative to team
hoursScore = min((totalHours / 20) × 30, 30)             — 20 hours = full marks
fileScore  = min(filesUploaded × 3, 30)                  — each proof file = 3 pts
```

> Colour: **Green** ≥ 70 · **Amber** 40–69 · **Red** < 40

### AI Transparency Score
A rule-based (zero ML) scorer analyzes submission text and returns 0–100:

| Signal | Weight |
|---|---|
| Average sentence length > 25 words | +30 |
| Formal connectors (*furthermore, moreover, hence…*) | +25 |
| AI phrases (*in conclusion, it is important to note…*) | +25 |
| Lexical diversity ratio < 0.4 | +20 |

Visible to **faculty only** — not used for grading.

### README Similarity Check
Uses **Jaccard word-level similarity** across all team READMEs in the same project.  
Results flagged automatically when similarity > **50%**.

### Authentication Flow
```
User logs in → bcrypt verify → JWT signed → stored in httpOnly cookie
Every request → authMiddleware reads cookie → verifies JWT → attaches req.user
Route access → roleGuard('faculty') / roleGuard('student') enforced per route
```

### File Uploads
```
Client selects files → multer buffers in memory → streams to Cloudinary
MongoDB stores { url, publicId, filename } — no files on server disk
Folders: impactflow/tasks/ · impactflow/submissions/ · impactflow/teams/:id/code/
```

---

## Deployment

### Backend → Railway

```bash
# 1. Push to GitHub
# 2. Railway → New Project → Deploy from GitHub → select /server
# 3. Set all env vars in Railway dashboard
# 4. Set CLIENT_URL to your Vercel URL
```

Add a free [UptimeRobot](https://uptimerobot.com) monitor pinging Railway every 5 minutes to prevent cold starts.

### Frontend → Vercel

```bash
# 1. Vercel → New Project → Import GitHub repo → Root Directory: client
# 2. Add env var: VITE_API_URL=https://your-app.railway.app/api
# 3. Build: npm run build  |  Output: dist
```

---

## Roadmap

| Status | Feature | Notes |
|---|---|---|
| ✅ Done | Core auth, courses, projects, teams | JWT + roles |
| ✅ Done | Task logging with file uploads | Cloudinary |
| ✅ Done | Milestone tracker + submissions | AI flag on submit |
| ✅ Done | Contribution score | Auto-recalculated |
| ✅ Done | Team Workspace | README + Code versioning + Task logs |
| ✅ Done | README similarity check | Jaccard similarity |
| ✅ Done | Random team generation | Faculty one-click |
| ✅ Done | Section-wise team restriction | Course sections |
| 🔜 Phase 2 | Peer review | Rate teammates after each milestone |
| 🔜 Phase 2 | Email notifications | Nodemailer reminders |
| 🔜 Phase 2 | GitHub integration | Link commits to task logs |
| 🔜 Phase 2 | Admin panel | College-wide analytics |

---

## Team

Built with purpose by **Team ImpactFlow**

| Name | Role |
|---|---|
| Manideep | Full-Stack Lead |
| Rishit Kumar | Backend + API Design |
| Samyuktha | Frontend + UI/UX |

---

<div align="center">

Made with dedication · **Team ImpactFlow** · 2025

</div>
