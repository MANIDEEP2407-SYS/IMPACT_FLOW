from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
for section in doc.sections:
    section.top_margin    = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin   = Inches(1.1)
    section.right_margin  = Inches(1.1)

# ── Helpers ───────────────────────────────────────────────────────────────────
def set_col_widths(table, widths):
    for row in table.rows:
        for i, cell in enumerate(row.cells):
            cell.width = widths[i]

def style_heading(para, size, color="1F3864", bold=True):
    run = para.runs[0] if para.runs else para.add_run(para.text)
    run.bold = bold
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)

def add_heading(doc, text, level=1):
    p = doc.add_paragraph(text, style=f'Heading {level}')
    return p

def add_body(doc, text):
    p = doc.add_paragraph(text)
    p.style.font.size = Pt(11)
    return p

def add_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = table.rows[0]
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        cell.text = h
        run = cell.paragraphs[0].runs[0]
        run.bold = True
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(255, 255, 255)
        # Dark blue header fill
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'), 'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'), '1F3864')
        tcPr.append(shd)
    for row_data in rows:
        row = table.add_row()
        for i, val in enumerate(row_data):
            cell = row.cells[i]
            cell.text = str(val)
            cell.paragraphs[0].runs[0].font.size = Pt(10)
    if col_widths:
        set_col_widths(table, col_widths)
    doc.add_paragraph()
    return table

def page_break(doc):
    doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# COVER PAGE
# ══════════════════════════════════════════════════════════════════════════════
doc.add_paragraph()
doc.add_paragraph()
doc.add_paragraph()

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("ImpactFlow")
run.bold = True
run.font.size = Pt(36)
run.font.color.rgb = RGBColor(0x1F, 0x38, 0x64)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run2 = subtitle.add_run("Phase 1 — Technical Documentation")
run2.font.size = Pt(18)
run2.font.color.rgb = RGBColor(0x2E, 0x74, 0xB5)

doc.add_paragraph()
line = doc.add_paragraph()
line.alignment = WD_ALIGN_PARAGRAPH.CENTER
line.add_run("─" * 55).font.color.rgb = RGBColor(0x2E, 0x74, 0xB5)

doc.add_paragraph()
desc = doc.add_paragraph()
desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = desc.add_run("Full-stack MERN project-based learning management system\nfor colleges — built in 21 days")
r.font.size = Pt(12)
r.font.color.rgb = RGBColor(0x40, 0x40, 0x40)

doc.add_paragraph()
doc.add_paragraph()
team = doc.add_paragraph()
team.alignment = WD_ALIGN_PARAGRAPH.CENTER
team.add_run("IIC Tech Yodhas  ·  Manideep, Rishit Kumar, Samyuktha").font.size = Pt(11)

repo = doc.add_paragraph()
repo.alignment = WD_ALIGN_PARAGRAPH.CENTER
r3 = repo.add_run("https://github.com/MANIDEEP2407-SYS/IMPACT_FLOW")
r3.font.size = Pt(10)
r3.font.color.rgb = RGBColor(0x2E, 0x74, 0xB5)

page_break(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 1. PROJECT OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "1. Project Overview")
add_body(doc,
    "ImpactFlow is a full-stack MERN (MongoDB, Express, React, Node.js) project-based "
    "learning management system designed for colleges. Its purpose is to replace the "
    "manual — and often inaccurate — tracking of individual student contributions within "
    "group projects.")
add_body(doc,
    "Faculty create courses and projects, define rubrics and milestones, and approve student "
    "teams. Students form teams, log daily work with file proof, and team leads submit "
    "milestones. Faculty see a real-time dashboard with per-student contribution scores "
    "and AI transparency flags on every submission.")

# ══════════════════════════════════════════════════════════════════════════════
# 2. PROBLEM STATEMENT
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "2. Problem Statement")
add_body(doc,
    "In most colleges, group project grades are assigned to the entire team — even when "
    "one student did 90% of the work and others contributed nothing. Faculty have no "
    "reliable way to measure individual effort, and students have no accountability mechanism.")
add_body(doc, "ImpactFlow solves this with three mechanisms:")
for point in [
    "Daily Task Logs — students log what they did, for how many hours, with file proof uploaded to Cloudinary.",
    "Contribution Score — a formula combining task count, total hours, and files uploaded, calculated per student and shown to faculty in colour-coded badges (green / amber / red).",
    "AI Transparency Flag — a rule-based scorer analyses milestone submission notes and flags potentially AI-generated text for faculty review.",
]:
    p = doc.add_paragraph(point, style='List Bullet')
    p.runs[0].font.size = Pt(11)

# ══════════════════════════════════════════════════════════════════════════════
# 3. TECH STACK
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "3. Tech Stack")
add_table(doc,
    ["Layer", "Technology", "Reason"],
    [
        ["Frontend",   "React 19 + Vite + Tailwind CSS", "Vite is 10x faster than Create React App"],
        ["State",      "Zustand",                        "No re-render issues like Context API"],
        ["HTTP",       "Axios",                          "withCredentials: true for http-only cookie auth"],
        ["Backend",    "Node.js + Express (ESM)",        "Fast, industry-standard MERN backend"],
        ["Database",   "MongoDB Atlas + Mongoose",       "Flexible schema, free Atlas M0 cluster"],
        ["Auth",       "JWT + bcryptjs + http-only cookies", "Prevents XSS token theft"],
        ["Files",      "Cloudinary + multer-storage-cloudinary", "Survives redeployment; no disk storage"],
        ["Validation", "Zod",                            "Type-safe server-side validation on every route"],
        ["Security",   "Helmet + CORS + express-rate-limit", "Non-negotiable production basics"],
        ["Scheduler",  "node-cron",                      "Daily 8 AM milestone due reminders"],
        ["Deploy",     "Vercel (frontend) + Railway (backend)", "Both free tier, zero config"],
    ],
    [Inches(1.1), Inches(2.6), Inches(2.9)]
)

# ══════════════════════════════════════════════════════════════════════════════
# 4. SYSTEM ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "4. System Architecture")
add_body(doc,
    "ImpactFlow is a monorepo with two top-level directories: /client (Vite + React) "
    "and /server (Express + ESM). Both are independent Node.js packages with their own "
    "package.json.")
for point in [
    "Frontend proxies all /api/* requests to http://localhost:5000 via Vite's built-in proxy — no CORS issues in development.",
    "Authentication uses JWT stored in http-only, SameSite=Lax cookies. The token is never accessible to JavaScript, preventing XSS attacks.",
    "File uploads go directly from the browser multipart form → Express → Cloudinary. Nothing is stored on the server disk.",
    "Contribution scores are recalculated and cached in the Team document every time a student creates a TaskLog — keeping the dashboard fast.",
    "Notifications are stored in MongoDB and polled by the frontend every 60 seconds. No WebSockets required in Phase 1.",
    "A node-cron job runs daily at 8 AM to find milestones due within 48 hours and notify all active team members.",
]:
    p = doc.add_paragraph(point, style='List Bullet')
    p.runs[0].font.size = Pt(11)

page_break(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 5. DATABASE MODELS
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "5. Database Models (Mongoose Schemas)")
add_body(doc, "Eight Mongoose models define the data layer:")

models = [
    ("User", [
        ("name", "String", "Full name"),
        ("email", "String (unique)", "Login identifier"),
        ("password", "String (bcrypt)", "Hashed with 12 salt rounds"),
        ("role", "Enum: student / faculty / admin", "Controls access"),
        ("college", "String", "Institution name"),
        ("department", "String", "e.g. CSE, ECE"),
        ("semester", "Number (1–8)", "Students only"),
        ("rollNo", "String", "Students only"),
    ]),
    ("Course", [
        ("name, code", "String", "Course identity"),
        ("semester, section, department", "String / Number", "Classification"),
        ("faculty", "Ref: User", "Course owner"),
        ("joinCode", "String (6-char, unique)", "Auto-generated for students to join"),
        ("students", "Array of Ref: User", "Enrolled students"),
    ]),
    ("Project", [
        ("title, description", "String", "Project identity"),
        ("course", "Ref: Course", "Parent course"),
        ("type", "Enum: group / capstone", "Project type"),
        ("teamSize", "{ min, max }", "Allowed team size range"),
        ("rubric", "Array of { criteria, weight }", "Weights must sum to 100"),
        ("totalMarks", "Number", "Maximum marks"),
        ("status", "Enum: active / completed", "Project state"),
    ]),
    ("Milestone", [
        ("project", "Ref: Project", "Parent project"),
        ("title, description", "String", "Milestone details"),
        ("dueDate", "Date", "Submission deadline"),
        ("order", "Number", "Sequence: 1, 2, 3…"),
        ("isActive", "Boolean", "Cron-job filter"),
    ]),
    ("Team", [
        ("name", "String", "Team display name"),
        ("project, course", "Ref: Project / Course", "Association"),
        ("teamLead", "Ref: User", "Only lead can submit milestones"),
        ("members", "Array of { user, joinedAt }", "Team roster"),
        ("status", "Enum: pending / active / rejected", "Faculty must approve"),
        ("contributionScores", "Array of { user, score }", "Cached — updated on each TaskLog"),
    ]),
    ("TaskLog", [
        ("user, team, milestone", "Refs", "Associations"),
        ("title, description", "String", "What was done"),
        ("proofFiles", "Array of { url, publicId, filename }", "Cloudinary uploads"),
        ("hoursSpent", "Number", "Time tracked"),
        ("date", "Date", "When the work was done"),
    ]),
    ("MilestoneSubmission", [
        ("team, milestone", "Refs", "Associations"),
        ("submittedBy", "Ref: User", "Must be team lead"),
        ("files", "Array of { url, publicId, uploadedBy }", "Submission files"),
        ("notes", "String", "Summary text — AI flag applied here"),
        ("aiFlagScore", "Number (0–100)", "Transparency score"),
        ("aiFlagDetails", "String", "Human-readable flag summary"),
        ("submittedAt", "Date", "Submission timestamp"),
    ]),
    ("Notification", [
        ("user", "Ref: User", "Recipient"),
        ("type", "String", "milestone_due / join_request / submission / team_approved"),
        ("message", "String", "Notification text"),
        ("read", "Boolean", "Read state"),
    ]),
]

for model_name, fields in models:
    add_heading(doc, model_name, level=2)
    add_table(doc,
        ["Field", "Type", "Notes"],
        fields,
        [Inches(1.8), Inches(2.4), Inches(2.4)]
    )

page_break(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 6. API REFERENCE
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "6. Complete API Reference")

api_groups = [
    ("Auth", [
        ("POST", "/api/auth/register",        "Public",   "Register student or faculty, sets JWT cookie"),
        ("POST", "/api/auth/login",           "Public",   "Login, sets http-only JWT cookie"),
        ("POST", "/api/auth/logout",          "Public",   "Clears the JWT cookie"),
        ("GET",  "/api/auth/me",              "Auth",     "Returns currently logged-in user"),
    ]),
    ("Courses", [
        ("POST", "/api/courses",              "Faculty",  "Create course — auto-generates 6-char join code"),
        ("GET",  "/api/courses/my",           "Faculty",  "List faculty's own courses"),
        ("GET",  "/api/courses/enrolled",     "Student",  "List student's enrolled courses"),
        ("POST", "/api/courses/:id/join",     "Student",  "Join course via join code"),
    ]),
    ("Projects", [
        ("POST", "/api/courses/:id/projects", "Faculty",  "Create project with rubric and team size"),
        ("GET",  "/api/courses/:id/projects", "All",      "List all projects in a course"),
        ("GET",  "/api/projects/:id",         "All",      "Get single project detail"),
    ]),
    ("Milestones", [
        ("POST", "/api/projects/:id/milestones","Faculty","Add a milestone to a project"),
        ("GET",  "/api/projects/:id/milestones","All",    "List all milestones for a project"),
        ("PUT",  "/api/milestones/:id",        "Faculty", "Edit milestone title, date, or description"),
    ]),
    ("Teams", [
        ("POST", "/api/projects/:id/teams",    "Student", "Create team — creator becomes team lead"),
        ("POST", "/api/teams/:id/join-request","Student", "Request to join an existing team"),
        ("PUT",  "/api/teams/:id/approve",     "Faculty", "Approve team (status → active)"),
        ("PUT",  "/api/teams/:id/reject",      "Faculty", "Reject team (status → rejected)"),
        ("PUT",  "/api/teams/:id/remove-member","Lead",   "Remove member before team is approved"),
        ("GET",  "/api/projects/:id/teams",    "All",     "List all teams in a project"),
    ]),
    ("Task Logs", [
        ("POST", "/api/tasks",                 "Student", "Log a task with up to 3 file uploads"),
        ("GET",  "/api/tasks/my",              "Student", "Get own task logs (filter by milestoneId)"),
        ("GET",  "/api/tasks/team/:teamId",    "Lead + Faculty","All task logs for a team"),
    ]),
    ("Submissions", [
        ("POST", "/api/milestones/:id/submit", "Lead",    "Submit milestone with files + notes"),
        ("GET",  "/api/milestones/:id/submission","All",  "Get submission for a milestone"),
        ("GET",  "/api/projects/:id/submissions","Faculty","All submissions across all milestones"),
    ]),
    ("Dashboard", [
        ("GET",  "/api/projects/:id/dashboard","Faculty", "Teams, per-member stats, milestone status, scores"),
    ]),
    ("Notifications", [
        ("GET",  "/api/notifications/my",      "Auth",    "Get all notifications (newest first)"),
        ("PUT",  "/api/notifications/:id/read","Auth",    "Mark one notification as read"),
        ("PUT",  "/api/notifications/read-all","Auth",    "Mark all notifications as read"),
    ]),
]

for group_name, endpoints in api_groups:
    add_heading(doc, group_name, level=2)
    add_table(doc,
        ["Method", "Endpoint", "Access", "Description"],
        endpoints,
        [Inches(0.7), Inches(2.8), Inches(0.9), Inches(2.2)]
    )

page_break(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 7. KEY FEATURES
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "7. Key Features in Detail")

add_heading(doc, "7.1 Faculty Flow", level=2)
steps = [
    "Register with role = Faculty",
    "Create a course — system auto-generates a unique 6-character join code",
    "Share the join code with students",
    "Create a project inside the course — fill in title, description, team size (min/max), rubric (criteria + weights, must sum to 100%), total marks, and at least 2 milestones with due dates",
    "Students create teams and request approval",
    "Faculty approves or rejects teams from the Project Detail dashboard",
    "Monitor the dashboard: per-student task timelines, hours, files, contribution score, and AI flag on each submission",
]
for i, s in enumerate(steps, 1):
    p = doc.add_paragraph(f"Step {i}: {s}", style='List Number')
    p.runs[0].font.size = Pt(11)
doc.add_paragraph()

add_heading(doc, "7.2 Student Flow", level=2)
steps2 = [
    "Register with role = Student",
    "Enter the 6-character join code to enrol in a course",
    "Browse projects in the course",
    "Create a new team (become team lead) or request to join an existing team",
    "Wait for faculty approval — team status changes from Pending to Active",
    "Log daily tasks: title, description, hours spent, milestone, date, and up to 3 proof files",
    "Track progress on the milestone stepper (submitted / pending / overdue)",
    "Team lead submits the milestone with notes and files before the due date",
]
for i, s in enumerate(steps2, 1):
    p = doc.add_paragraph(f"Step {i}: {s}", style='List Number')
    p.runs[0].font.size = Pt(11)
doc.add_paragraph()

add_heading(doc, "7.3 Contribution Score", level=2)
add_body(doc, "Calculated per student, per project. Recalculated and cached every time a new TaskLog is created:")
add_table(doc,
    ["Component", "Formula", "Max Points"],
    [
        ["Task Score",  "min( (taskCount / teamAvgTasks) × 40 , 40 )", "40"],
        ["Hours Score", "min( (totalHours / 20) × 30 , 30 )",          "30  (20 hours = full marks)"],
        ["File Score",  "min( filesUploaded × 3 , 30 )",               "30  (each file = 3 pts)"],
        ["Total",       "taskScore + hoursScore + fileScore",           "100"],
    ],
    [Inches(1.4), Inches(3.5), Inches(1.7)]
)
add_body(doc, "Colour coding:  Green = score ≥ 70   |   Amber = 40 – 69   |   Red = below 40")

add_heading(doc, "7.4 AI Transparency Score", level=2)
add_body(doc, "Rule-based scorer (no ML) applied to milestone submission notes. Shown to faculty only — not used for grading:")
add_table(doc,
    ["Signal Detected", "Points Added"],
    [
        ["Average sentence length > 25 words",                         "+30"],
        ["Formal connectors: furthermore, moreover, consequently, hence", "+25"],
        ["AI phrases: in conclusion, in summary, it is important to note", "+25"],
        ["Lexical diversity ratio < 0.4  (repetitive vocabulary)",     "+20"],
        ["Maximum possible score",                                      "100"],
    ],
    [Inches(4.2), Inches(2.4)]
)

add_heading(doc, "7.5 In-App Notifications", level=2)
add_body(doc, "Bell icon in the navbar shows an unread count badge. The frontend polls /api/notifications/my every 60 seconds. Notifications are triggered by:")
for event in [
    "Student creates a team — faculty and team lead are notified",
    "Faculty approves or rejects a team — all team members notified",
    "Team lead submits a milestone — all team members notified",
    "Milestone due in 48 hours — node-cron runs daily at 8 AM and notifies all active team members",
]:
    p = doc.add_paragraph(event, style='List Bullet')
    p.runs[0].font.size = Pt(11)

add_heading(doc, "7.6 File Uploads", level=2)
add_table(doc,
    ["Property", "Value"],
    [
        ["Storage",         "Cloudinary (not server disk)"],
        ["Task log folder", "impactflow/tasks/"],
        ["Submission folder","impactflow/submissions/"],
        ["Allowed types",   "pdf, png, jpg, jpeg, zip, js, py, java, cpp, txt"],
        ["Max file size",   "10 MB per file"],
        ["Max files",       "3 per task log  |  Unlimited per submission"],
        ["Stored as",       "{ url, publicId, filename } in MongoDB"],
    ],
    [Inches(2.0), Inches(4.6)]
)

page_break(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 8. FRONTEND PAGES
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "8. Frontend Pages")
add_table(doc,
    ["Page", "Route", "Role", "Purpose"],
    [
        ["Login",                "/login",                                "Public",  "Email + password sign in"],
        ["Register",             "/register",                             "Public",  "Create student or faculty account"],
        ["Faculty Dashboard",    "/faculty/dashboard",                    "Faculty", "List all courses with join codes"],
        ["Create Course",        "/faculty/courses/new",                  "Faculty", "Course creation form"],
        ["Course Detail",        "/faculty/courses/:id",                  "Faculty", "Course info, join code copy button, project list"],
        ["Create Project",       "/faculty/courses/:id/projects/new",     "Faculty", "Rubric builder + milestone builder"],
        ["Project Detail",       "/faculty/projects/:id",                 "Faculty", "Full dashboard: teams, scores, milestones, AI flags"],
        ["Team Task Log",        "/faculty/teams/:id/tasks",              "Faculty", "All tasks from all team members, grouped by milestone"],
        ["Student Dashboard",    "/student/dashboard",                    "Student", "List enrolled courses"],
        ["Join Course",          "/student/join",                         "Student", "Enter 6-char join code"],
        ["Course Detail",        "/student/courses/:id",                  "Student", "List projects in enrolled course"],
        ["Project Detail",       "/student/projects/:id",                 "Student", "Create/join team + milestone progress stepper"],
        ["My Tasks",             "/student/tasks",                        "Student", "Own task logs grouped by milestone with total hours"],
        ["Log Task",             "/student/tasks/new",                    "Student", "Task log form with file upload"],
        ["Submit Milestone",     "/student/milestones/:id/submit",        "Lead",    "Milestone submission form with file upload"],
    ],
    [Inches(1.5), Inches(2.4), Inches(0.8), Inches(2.0)]
)

# ══════════════════════════════════════════════════════════════════════════════
# 9. SECURITY
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "9. Security Measures")
add_table(doc,
    ["Measure", "Implementation", "Protects Against"],
    [
        ["http-only cookies",    "JWT never exposed to JavaScript",              "XSS token theft"],
        ["bcrypt (12 rounds)",   "Password hashed before storage",              "Credential leaks"],
        ["Helmet",               "Sets 11 secure HTTP response headers",        "Clickjacking, MIME sniffing, etc."],
        ["CORS",                 "Restricted to CLIENT_URL in production",      "Cross-origin requests"],
        ["Rate limiting",        "200 req / 15 min in production per IP",       "Brute-force and DDoS"],
        ["Zod validation",       "Every request body validated on server",      "Malformed input, injection"],
        ["ObjectId middleware",  "validateId on all :id route params",          "Invalid DB query crashes"],
        ["roleGuard()",          "Middleware factory on every sensitive route", "Privilege escalation"],
    ],
    [Inches(1.6), Inches(2.3), Inches(2.7)]
)

page_break(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 10. PHASE 1 CUTS
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "10. What Was Built vs What Was Cut")
add_body(doc, "The following features were deliberately excluded from Phase 1 to keep the MVP shippable:")
add_table(doc,
    ["Feature Cut", "Reason"],
    [
        ["Random team assignment",      "Creates resentment. Faculty handles manual assignment."],
        ["Collaborative README editor", "Conflict handling is a separate product. Plain textarea only."],
        ["File version history",        "Store latest only. Version history is Phase 2."],
        ["Email notifications",         "In-app only in Phase 1. Nodemailer in Phase 2."],
        ["Plagiarism / cosine similarity","Requires async Python service. Phase 2."],
        ["Peer review",                 "Phase 2. Placeholder shown in Faculty dashboard UI."],
        ["GitHub integration",          "Phase 3. Never required for MVP."],
        ["AI chatbot",                  "Removed permanently — out of scope."],
    ],
    [Inches(2.2), Inches(4.4)]
)

# ══════════════════════════════════════════════════════════════════════════════
# 11. SETUP & RUN
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "11. Setup & Run Instructions")

add_heading(doc, "11.1 Prerequisites", level=2)
for p in ["Node.js 18+", "MongoDB Atlas account (free M0 cluster)", "Cloudinary account (free tier)", "Git"]:
    para = doc.add_paragraph(p, style='List Bullet')
    para.runs[0].font.size = Pt(11)

add_heading(doc, "11.2 Clone & Install", level=2)
for step in [
    'git clone https://github.com/MANIDEEP2407-SYS/IMPACT_FLOW.git',
    'cd IMPACT_FLOW',
    'cd server && npm install',
    'cd ../client && npm install',
]:
    p = doc.add_paragraph(step)
    p.runs[0].font.name = 'Courier New'
    p.runs[0].font.size = Pt(10)

add_heading(doc, "11.3 Environment Variables  (server/.env)", level=2)
env_vars = [
    ("MONGO_URI",               "mongodb+srv://<user>:<password>@cluster.mongodb.net/impactflow"),
    ("JWT_SECRET",              "Any long random string (min 32 chars)"),
    ("JWT_EXPIRES_IN",          "7d"),
    ("CLOUDINARY_CLOUD_NAME",   "From Cloudinary dashboard"),
    ("CLOUDINARY_API_KEY",      "From Cloudinary dashboard"),
    ("CLOUDINARY_API_SECRET",   "From Cloudinary dashboard — click View API Keys"),
    ("CLIENT_URL",              "http://localhost:5173 (dev) or Vercel URL (prod)"),
    ("PORT",                    "5000"),
]
add_table(doc, ["Variable", "Value"], env_vars, [Inches(2.2), Inches(4.4)])

add_heading(doc, "11.4 Run Locally", level=2)
add_body(doc, "Open two terminals:")
for cmd in ["Terminal 1 (backend):   cd server && npm run dev   →  http://localhost:5000",
            "Terminal 2 (frontend):  cd client && npm run dev   →  http://localhost:5173"]:
    p = doc.add_paragraph(cmd)
    p.runs[0].font.name = 'Courier New'
    p.runs[0].font.size = Pt(10)

page_break(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 12. DEPLOYMENT
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "12. Deployment Guide")
add_table(doc,
    ["Service", "Platform", "Steps"],
    [
        ["Backend",   "Railway",   "1. New project → Deploy from GitHub → select /server\n2. Set all env vars in Railway dashboard\n3. Start command: npm start\n4. Set CLIENT_URL to your Vercel URL"],
        ["Frontend",  "Vercel",    "1. New project → Import GitHub repo\n2. Root directory: client\n3. Add env var: VITE_API_URL = Railway URL + /api\n4. Build: npm run build  |  Output: dist"],
        ["Uptime",    "UptimeRobot","Add free monitor pinging Railway URL every 5 min to prevent cold starts"],
    ],
    [Inches(0.9), Inches(1.1), Inches(4.6)]
)

# ══════════════════════════════════════════════════════════════════════════════
# 13. PHASE 2 ROADMAP
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "13. Phase 2 Roadmap")
add_table(doc,
    ["Feature", "Description"],
    [
        ["Peer Review",              "Students rate teammates after each milestone submission"],
        ["Email Notifications",      "Nodemailer for milestone reminders and team approvals"],
        ["File Version History",     "Track and compare versions of submitted files"],
        ["Plagiarism Detection",     "Cosine similarity scoring via async Python microservice"],
        ["GitHub Integration",       "Link commits directly to task logs — auto-populate hours"],
        ["Admin Panel",              "College-wide analytics, user management, bulk course creation"],
    ],
    [Inches(2.0), Inches(4.6)]
)

# ══════════════════════════════════════════════════════════════════════════════
# 14. BUGS FIXED DURING DEVELOPMENT
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, "14. Bugs Fixed During Development")
bugs = [
    (
        "Infinite Page Refresh",
        "Axios interceptor redirected to /login on every 401 response — including the initial fetchMe call on app load. This caused a reload loop that never stopped.",
        "Skip the redirect when the request URL is /auth/me, or when the browser is already on /login or /register.",
    ),
    (
        "Registration Crash (Semester Field)",
        "Faculty registration was sending semester: '' (empty string) in the request body. Zod schema expected a number, so validation failed with 'Expected number, received string'.",
        "Delete the semester and rollNo keys from the payload before sending if they are empty strings.",
    ),
    (
        "Rate Limiter Blocking Development",
        "express-rate-limit was set to 200 requests per 15 minutes. During server startup testing and hot reloads, this limit was hit, blocking all subsequent requests including registration.",
        "Raise the limit to 10,000 requests in non-production environments.",
    ),
    (
        "Cloudinary v2 / v1 Conflict",
        "multer-storage-cloudinary@4.0.0 requires cloudinary@^1.x as a peer dependency. The project was initially configured with cloudinary@^2.x, causing an npm install failure.",
        "Pin cloudinary to ^1.41.3 and use cloudinary.v2.config() for configuration.",
    ),
]
for title, cause, fix in bugs:
    add_heading(doc, title, level=2)
    add_table(doc,
        ["", ""],
        [["Cause", cause], ["Fix", fix]],
        [Inches(0.7), Inches(5.9)]
    )

# ══════════════════════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════════════════════
out = r"C:\Users\Public\Documents\projects\impactflow\ImpactFlow_ProjectDoc.docx"
doc.save(out)
print(f"Saved: {out}")
