/**
 * seed.js — full reset demo dataset for ImpactFlow.
 * Run: node seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Project from './models/Project.js';
import Team from './models/Team.js';
import Milestone from './models/Milestone.js';
import MilestoneSubmission from './models/MilestoneSubmission.js';
import ReadmeVersion from './models/ReadmeVersion.js';
import CodeFile from './models/CodeFile.js';
import TaskLog from './models/TaskLog.js';
import Discussion from './models/Discussion.js';
import TeamInvite from './models/TeamInvite.js';
import Notification from './models/Notification.js';
import { calcContributionScore } from './utils/contribution.js';
import { getAIFlagDetails, getAIFlagScore } from './utils/aiFlag.js';

const DEMO_PASSWORD = 'demo1234';
const DEMO_DOMAIN = '@demo.com';
const COURSE_CODE = 'IFD401';
const COURSE_JOIN_CODE = 'IFD401A';

const facultySeed = {
  name: 'Dr. Priya Sharma',
  email: 'faculty@demo.com',
  password: DEMO_PASSWORD,
  role: 'faculty',
  college: 'ImpactFlow University',
  department: 'Computer Science',
  bio: 'Faculty account for the main ImpactFlow demo workspace.',
  skills: ['Mentoring', 'Assessment', 'Architecture Review'],
  domains: ['Software Engineering', 'Academic Product Design'],
  techStack: ['Node.js', 'MongoDB', 'React'],
  timezone: 'Asia/Kolkata',
};

const adminSeed = {
  name: 'Noor Khan',
  email: 'admin@demo.com',
  password: DEMO_PASSWORD,
  role: 'admin',
  college: 'ImpactFlow University',
  department: 'Administration',
  bio: 'Platform admin account for the demo panel.',
  skills: ['Moderation', 'Reporting', 'Operations'],
  domains: ['Platform Administration'],
  techStack: ['MongoDB', 'Express', 'React'],
  timezone: 'Asia/Kolkata',
};

const studentSeeds = [
  ['Aarav Mehta', '24CSE001', 5],
  ['Anika Sharma', '24CSE002', 6],
  ['Dev Patel', '24CSE003', 5],
  ['Isha Nair', '24CSE004', 4],
  ['Kabir Rao', '24CSE005', 6],
  ['Meera Iyer', '24CSE006', 5],
  ['Nikhil Verma', '24CSE007', 7],
  ['Pooja Singh', '24CSE008', 4],
  ['Rahul Das', '24CSE009', 6],
  ['Sanya Kapoor', '24CSE010', 5],
  ['Tanya Gupta', '24CSE011', 4],
  ['Vikram Bose', '24CSE012', 7],
  ['Zoya Khan', '24CSE013', 5],
  ['Aditya Rao', '24CSE014', 6],
  ['Bhavna Menon', '24CSE015', 4],
  ['Chirag Jain', '24CSE016', 5],
  ['Diya Kulkarni', '24CSE017', 6],
  ['Eshan Ali', '24CSE018', 5],
  ['Fatima Noor', '24CSE019', 4],
  ['Gautam Roy', '24CSE020', 7],
];

const skillSets = [
  ['React', 'Node.js', 'MongoDB'],
  ['Tailwind', 'Accessibility', 'UX'],
  ['API Testing', 'Postman', 'Automation'],
  ['Database Design', 'Mongoose', 'Schemas'],
  ['Git', 'Code Review', 'Documentation'],
];

const domainSets = [
  ['Web Apps', 'Project Collaboration'],
  ['Full-Stack', 'Productivity Tools'],
  ['Backend APIs', 'Data Visualization'],
];

const techStackSets = [
  ['React', 'Express', 'MongoDB'],
  ['Vite', 'Tailwind CSS', 'Node.js'],
  ['JWT', 'Multer', 'Cloudinary'],
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function readmeContent(teamName, projectTitle, focus, stackLine, revision) {
  return [
    `# ImpactFlow Demo - ${teamName}`,
    '',
    `Project: ${projectTitle}`,
    `Focus: ${focus}`,
    '',
    '## Goals',
    '- Ship a polished academic collaboration workflow',
    '- Keep task logs, README history, and submissions visible',
    '- Expose contribution data for review',
    '',
    '## Stack',
    stackLine,
    '',
    '## Demo Notes',
    revision,
  ].join('\n');
}

function codeFileDoc(teamName, fileName, versionNumber) {
  const teamSlug = slugify(teamName);
  return {
    originalName: fileName,
    cloudinaryUrl: `https://res.cloudinary.com/demo/raw/upload/v1/impactflow-demo/${teamSlug}/${fileName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()}`,
    publicId: `impactflow-demo/${teamSlug}/${fileName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()}`,
    mimeType: 'text/plain',
    sizeBytes: 1500 + versionNumber * 200,
    versionNumber,
  };
}

async function upsertUser(payload) {
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return User.create(payload);
}

function buildStudentPayload([name, rollNo, semester], index) {
  return {
    name,
    email: `student${String(index + 1).padStart(2, '0')}${DEMO_DOMAIN}`,
    password: DEMO_PASSWORD,
    role: 'student',
    college: 'ImpactFlow University',
    department: 'Computer Science',
    semester,
    rollNo,
    bio: `${name} is part of the seeded demo workspace and contributes to project delivery.`,
    skills: skillSets[index % skillSets.length],
    domains: domainSets[index % domainSets.length],
    techStack: techStackSets[index % techStackSets.length],
    github: `https://github.com/impactflow-demo/${slugify(name)}`,
    linkedin: `https://linkedin.com/in/${slugify(name)}`,
    timezone: 'Asia/Kolkata',
  };
}

await mongoose.connect(process.env.MONGO_URI);
console.log('✔  DB connected:', mongoose.connection.host);

await Promise.all([
  User.deleteMany({}),
  Course.deleteMany({}),
  Project.deleteMany({}),
  Team.deleteMany({}),
  Milestone.deleteMany({}),
  MilestoneSubmission.deleteMany({}),
  ReadmeVersion.deleteMany({}),
  CodeFile.deleteMany({}),
  TaskLog.deleteMany({}),
  Discussion.deleteMany({}),
  TeamInvite.deleteMany({}),
  Notification.deleteMany({}),
]);

const faculty = await upsertUser(facultySeed);
const admin = await upsertUser(adminSeed);
const students = [];
for (let index = 0; index < studentSeeds.length; index += 1) {
  students.push(await upsertUser(buildStudentPayload(studentSeeds[index], index)));
}

const course = await Course.create({
  name: 'ImpactFlow Demo - Software Engineering Studio',
  code: COURSE_CODE,
  semester: 6,
  section: 'A',
  department: 'Computer Science',
  faculty: faculty._id,
  joinCode: COURSE_JOIN_CODE,
  students: students.map(student => student._id),
});

const project = await Project.create({
  title: 'ImpactFlow Demo - Sprint Atlas',
  description: 'Single course project for testing team workspaces, README history, tasks, submissions, and admin views.',
  course: course._id,
  type: 'group',
  teamSize: { min: 4, max: 4 },
  tags: ['teamwork', 'dashboard', 'readme', 'submission'],
  rubric: [
    { criteria: 'Feature completeness', weight: 30 },
    { criteria: 'Code quality', weight: 25 },
    { criteria: 'Documentation', weight: 20 },
    { criteria: 'Contribution balance', weight: 25 },
  ],
  totalMarks: 100,
  status: 'active',
});

const milestones = await Milestone.create([
  {
    project: project._id,
    title: 'ImpactFlow Demo - Discovery',
    description: 'Define scope and initial architecture.',
    dueDate: daysFromNow(7),
    order: 1,
    isActive: true,
  },
  {
    project: project._id,
    title: 'ImpactFlow Demo - Build',
    description: 'Implement the main workflow.',
    dueDate: daysFromNow(14),
    order: 2,
    isActive: true,
  },
  {
    project: project._id,
    title: 'ImpactFlow Demo - Delivery',
    description: 'Finalize docs and workspace handoff.',
    dueDate: daysFromNow(21),
    order: 3,
    isActive: true,
  },
]);

const teamPlan = [
  { name: 'ImpactFlow Demo - Team Aurora', lead: 0, members: [0, 1, 2, 3], theme: 'platform foundations and onboarding', stack: 'React + Express + MongoDB + telemetry' },
  { name: 'ImpactFlow Demo - Team Borealis', lead: 4, members: [4, 5, 6, 7], theme: 'course operations and milestones', stack: 'Vite + Tailwind + Node.js + approvals' },
  { name: 'ImpactFlow Demo - Team Cascade', lead: 8, members: [8, 9, 10, 11], theme: 'team workspace and README flow', stack: 'React + APIs + docs + analytics' },
  { name: 'ImpactFlow Demo - Team Delta', lead: 12, members: [12, 13, 14, 15], theme: 'task logging and contribution balance', stack: 'Express + dashboards + scoring' },
  { name: 'ImpactFlow Demo - Team Echo', lead: 16, members: [16, 17, 18, 19], theme: 'admin visibility and reporting', stack: 'Admin views + notifications + audits' },
];

for (let teamIndex = 0; teamIndex < teamPlan.length; teamIndex += 1) {
  const group = teamPlan[teamIndex];
  const teamMembers = group.members.map(studentIndex => ({ user: students[studentIndex]._id }));
  const team = await Team.create({
    name: group.name,
    project: project._id,
    course: course._id,
    section: course.section,
    teamLead: students[group.lead]._id,
    members: teamMembers,
    status: 'active',
    isAutoGenerated: true,
    generatedAt: new Date(),
    generatedBy: faculty._id,
  });

  const teamSlug = slugify(group.name);
  const lead = students[group.lead];
  const coMember = students[group.members.find(member => member !== group.lead) || group.lead];
  const taskDates = [daysFromNow(-10 + teamIndex), daysFromNow(-7 + teamIndex), daysFromNow(-4 + teamIndex), daysFromNow(-2 + teamIndex)];

  const readmeV1 = await ReadmeVersion.create({
    team: team._id,
    project: project._id,
    content: readmeContent(group.name, project.title, group.theme, group.stack, 'Initial seeded README for workspace testing.'),
    editedBy: lead._id,
    versionNumber: 1,
    summary: `ImpactFlow Demo bootstrap for ${group.name}`,
  });

  await ReadmeVersion.create({
    team: team._id,
    project: project._id,
    content: readmeContent(group.name, project.title, `${group.theme} and delivery notes`, group.stack, 'Second seeded README version for history and similarity checks.'),
    editedBy: coMember._id,
    versionNumber: 2,
    summary: `ImpactFlow Demo update for ${group.name}`,
  });

  await CodeFile.create([
    codeFileDoc(group.name, 'src/App.jsx', 1),
    codeFileDoc(group.name, 'src/App.jsx', 2),
    codeFileDoc(group.name, 'src/components/TeamCard.jsx', 1),
    codeFileDoc(group.name, 'README.md', 1),
  ].map(file => ({
    ...file,
    team: team._id,
    project: project._id,
    uploadedBy: lead._id,
  })));

  const taskEntries = [
    { user: lead, title: 'architecture and setup', hoursSpent: 6, proofFiles: 2 },
    { user: lead, title: 'implementation spike', hoursSpent: 5, proofFiles: 1 },
    { user: students[group.members[1]], title: 'feature branch', hoursSpent: 4, proofFiles: 1 },
    { user: students[group.members[2]], title: 'review and polish', hoursSpent: 3, proofFiles: 1 },
  ];

  const createdTasks = [];
  for (let taskIndex = 0; taskIndex < taskEntries.length; taskIndex += 1) {
    const task = taskEntries[taskIndex];
    const proofFiles = Array.from({ length: task.proofFiles }, (_, proofIndex) => ({
      url: `https://res.cloudinary.com/demo/raw/upload/v1/impactflow-demo/${teamSlug}/task-${taskIndex + 1}-${proofIndex + 1}.txt`,
      publicId: `impactflow-demo/${teamSlug}/task-${taskIndex + 1}-${proofIndex + 1}`,
      filename: `${teamSlug}-task-${taskIndex + 1}-${proofIndex + 1}.txt`,
    }));

    createdTasks.push(await TaskLog.create({
      user: task.user._id,
      team: team._id,
      milestone: milestones[0]._id,
      title: `ImpactFlow Demo - ${group.name} ${task.title}`,
      description: `Seeded task entry for ${group.name}.`,
      proofFiles,
      hoursSpent: task.hoursSpent,
      date: taskDates[taskIndex],
    }));
  }

  const taskCounts = new Map();
  const hourTotals = new Map();
  const fileTotals = new Map();
  for (const task of createdTasks) {
    const uid = String(task.user);
    taskCounts.set(uid, (taskCounts.get(uid) || 0) + 1);
    hourTotals.set(uid, (hourTotals.get(uid) || 0) + task.hoursSpent);
    fileTotals.set(uid, (fileTotals.get(uid) || 0) + (task.proofFiles?.length || 0));
  }

  const avgTasks = teamMembers.length ? Array.from(taskCounts.values()).reduce((sum, count) => sum + count, 0) / teamMembers.length : 0;
  team.contributionScores = teamMembers.map(member => {
    const uid = String(member.user);
    return {
      user: member.user,
      score: calcContributionScore(taskCounts.get(uid) || 0, hourTotals.get(uid) || 0, fileTotals.get(uid) || 0, avgTasks),
    };
  });
  await team.save();

  const submissionNotes = `ImpactFlow Demo submission for ${group.name}. The team reviewed the UI, API, and contribution flow with a concise delivery package.`;
  const aiScore = getAIFlagScore(submissionNotes);
  await MilestoneSubmission.create({
    team: team._id,
    milestone: milestones[0]._id,
    submittedBy: lead._id,
    files: [
      {
        url: `https://res.cloudinary.com/demo/raw/upload/v1/impactflow-demo/${teamSlug}/submission.zip`,
        publicId: `impactflow-demo/${teamSlug}/submission`,
        uploadedBy: lead._id,
      },
    ],
    notes: submissionNotes,
    aiFlagScore: aiScore,
    aiFlagDetails: getAIFlagDetails(aiScore),
    submittedAt: daysFromNow(-1 + teamIndex),
  });

  await Discussion.create([
    {
      team: team._id,
      author: lead._id,
      title: `ImpactFlow Demo - ${group.name} kickoff`,
      content: `Kickoff thread for ${group.name}. The team is aligning on ${group.theme}.`,
      pinned: teamIndex === 0,
      replies: [
        { author: coMember._id, content: 'Shared the first pass of the implementation notes.' },
        { author: students[group.members[2]]._id, content: 'Ready to validate the workspace and submission screens.' },
      ],
    },
    {
      team: team._id,
      author: coMember._id,
      title: `ImpactFlow Demo - ${group.name} review`,
      content: `Review thread for ${group.name} to exercise discussion, replies, and pinning.`,
      pinned: false,
      replies: [
        { author: lead._id, content: 'Looks good. I added the README updates and task log entries.' },
      ],
    },
  ]);

  await Notification.create([
    { user: lead._id, type: 'team_update', message: `ImpactFlow Demo: ${group.name} is ready for dashboard testing.` },
    { user: coMember._id, type: 'readme_update', message: `ImpactFlow Demo: ${group.name} README was updated.` },
  ]);
}

await Notification.create({
  user: admin._id,
  type: 'admin_update',
  message: 'ImpactFlow Demo: the reset dataset is ready for admin-panel testing.',
});

console.log('\nImpactFlow reset demo data ready:');
console.log(`  Admin   → ${adminSeed.email} / ${DEMO_PASSWORD}`);
console.log(`  Faculty → ${facultySeed.email} / ${DEMO_PASSWORD}`);
console.log(`  Course  → ${course.name} (${course.code})`);
console.log(`  Join code → ${course.joinCode}`);
console.log('  Students → student01@demo.com through student20@demo.com / demo1234');
console.log('  Teams    → 5 teams of 4 students each');

await mongoose.disconnect();
