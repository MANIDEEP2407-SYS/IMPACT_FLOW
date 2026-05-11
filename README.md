# ImpactFlow

Project-based learning management system. Faculty creates courses + projects, students form teams, log daily tasks, and submit milestones. Real-time contribution scores and AI transparency flags.

## Quick start

### 1. Clone and install

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` in the project root and fill in:

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=any-long-random-string
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Create `server/.env` pointing at the same file, or set vars directly in the Railway dashboard for production.

### 3. Run locally

```bash
# Terminal 1 — backend (from /server)
npm run dev

# Terminal 2 — frontend (from /client)
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api

## Deploy

- **Backend** → Railway. Set all env vars in dashboard. `npm start` is the start command.
- **Frontend** → Vercel. Set `VITE_API_URL=https://your-railway-app.railway.app/api`. Build command: `npm run build`, output: `dist`.
- Add a free UptimeRobot monitor pinging the Railway URL every 5 minutes to prevent cold starts.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS |
| State | Zustand |
| HTTP | Axios (withCredentials: true) |
| Backend | Node.js + Express (ESM) |
| Database | MongoDB + Mongoose |
| Auth | JWT in http-only cookies + bcryptjs |
| Files | Cloudinary via multer-storage-cloudinary |
| Validation | Zod |
| Security | Helmet + CORS + express-rate-limit |
| Cron | node-cron (milestone reminders at 8am daily) |

## Folder structure

```
impactflow/
├── client/              # Vite + React frontend
│   └── src/
│       ├── components/  # Navbar, Sidebar, NotificationBell, badges
│       ├── pages/       # faculty/ and student/ route pages
│       ├── store/       # Zustand: authStore, notificationStore
│       └── utils/       # api.js (Axios instance)
│
└── server/              # Express backend
    ├── config/          # db.js, cloudinary.js
    ├── controllers/     # One file per resource
    ├── middleware/       # auth, roleGuard, validateId, errorHandler
    ├── models/          # 8 Mongoose schemas
    ├── routes/          # Express routers
    └── utils/           # token, joinCode, aiFlag, notify, contribution, cronJobs
```
