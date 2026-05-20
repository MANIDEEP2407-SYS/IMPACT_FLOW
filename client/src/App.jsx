import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import useAuthStore from './store/authStore.js';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import ParticleField from './components/ParticleField.jsx';
import useNavigationHistory from './hooks/useNavigationHistory.js';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';

import FacultyDashboard from './pages/faculty/FacultyDashboard.jsx';
import CreateCourse from './pages/faculty/CreateCourse.jsx';
import CourseDetail from './pages/faculty/CourseDetail.jsx';
import CreateProject from './pages/faculty/CreateProject.jsx';
import ProjectDetail from './pages/faculty/ProjectDetail.jsx';
import TeamTaskLog from './pages/faculty/TeamTaskLog.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentProfile from './pages/student/StudentProfile.jsx';
import JoinCourse from './pages/student/JoinCourse.jsx';
import StudentCourseDetail from './pages/student/StudentCourseDetail.jsx';
import StudentProjectDetail from './pages/student/StudentProjectDetail.jsx';
import StudentProjectOverview from './pages/student/StudentProjectOverview.jsx';
import ProjectTeams from './pages/student/ProjectTeams.jsx';
import LogTask from './pages/student/LogTask.jsx';
import MyTasks from './pages/student/MyTasks.jsx';
import SubmitMilestone from './pages/student/SubmitMilestone.jsx';
import TeamWorkspace from './pages/shared/TeamWorkspace.jsx';
import GitHubLink from './pages/student/GitHubLink.jsx';
import ProjectREADMEEditor from './pages/student/ProjectREADMEEditor.jsx';
import SimilarityReport from './pages/faculty/SimilarityReport.jsx';

function RootRedirect() {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/faculty/dashboard" replace />;
}

function AppRoutes() {
  useNavigationHistory();

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Faculty routes */}
      <Route path="/faculty/dashboard" element={<ProtectedRoute roles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/courses" element={<ProtectedRoute roles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/courses/new" element={<ProtectedRoute roles={['faculty']}><CreateCourse /></ProtectedRoute>} />
      <Route path="/faculty/courses/:id" element={<ProtectedRoute roles={['faculty']}><CourseDetail /></ProtectedRoute>} />
      <Route path="/faculty/courses/:courseId/projects/new" element={<ProtectedRoute roles={['faculty']}><CreateProject /></ProtectedRoute>} />
      <Route path="/faculty/projects/:id" element={<ProtectedRoute roles={['faculty']}><ProjectDetail /></ProtectedRoute>} />
      <Route path="/faculty/teams/:teamId/tasks" element={<ProtectedRoute roles={['faculty']}><TeamTaskLog /></ProtectedRoute>} />
      <Route path="/faculty/courses/:courseId/similarity" element={<ProtectedRoute roles={['faculty']}><SimilarityReport /></ProtectedRoute>} />

      {/* Student routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/join" element={<ProtectedRoute roles={['student']}><JoinCourse /></ProtectedRoute>} />
      <Route path="/student/courses/:id" element={<ProtectedRoute roles={['student']}><StudentCourseDetail /></ProtectedRoute>} />
      <Route path="/student/projects/:id" element={<ProtectedRoute roles={['student']}><StudentProjectDetail /></ProtectedRoute>} />
      <Route path="/student/projects/:id/overview" element={<ProtectedRoute roles={['student']}><StudentProjectOverview /></ProtectedRoute>} />
      <Route path="/projects/:projectId/teams" element={<ProtectedRoute roles={['student']}><ProjectTeams /></ProtectedRoute>} />
      <Route path="/student/tasks" element={<ProtectedRoute roles={['student']}><MyTasks /></ProtectedRoute>} />
      <Route path="/student/tasks/new" element={<ProtectedRoute roles={['student']}><LogTask /></ProtectedRoute>} />
      <Route path="/student/milestones/:milestoneId/submit" element={<ProtectedRoute roles={['student']}><SubmitMilestone /></ProtectedRoute>} />
      <Route path="/student/projects/:projectId/github" element={<ProtectedRoute roles={['student']}><GitHubLink /></ProtectedRoute>} />
      <Route path="/student/projects/:projectId/readme" element={<ProtectedRoute roles={['student']}><ProjectREADMEEditor /></ProtectedRoute>} />

      {/* Shared workspace */}
      <Route path="/team/:teamId/workspace" element={<ProtectedRoute roles={['student','faculty']}><TeamWorkspace /></ProtectedRoute>} />

      {/* Admin route */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe);
  useEffect(() => { fetchMe(); }, []);

  return (
    <BrowserRouter>
      <CursorGlow />
      <ParticleField count={40} />
      <AppRoutes />
    </BrowserRouter>
  );
}
