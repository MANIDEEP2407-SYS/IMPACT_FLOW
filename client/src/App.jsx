import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import useAuthStore from './store/authStore.js';

import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

import FacultyDashboard from './pages/faculty/FacultyDashboard.jsx';
import CreateCourse from './pages/faculty/CreateCourse.jsx';
import CourseDetail from './pages/faculty/CourseDetail.jsx';
import CreateProject from './pages/faculty/CreateProject.jsx';
import ProjectDetail from './pages/faculty/ProjectDetail.jsx';
import TeamTaskLog from './pages/faculty/TeamTaskLog.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import JoinCourse from './pages/student/JoinCourse.jsx';
import StudentCourseDetail from './pages/student/StudentCourseDetail.jsx';
import StudentProjectDetail from './pages/student/StudentProjectDetail.jsx';
import LogTask from './pages/student/LogTask.jsx';
import MyTasks from './pages/student/MyTasks.jsx';
import SubmitMilestone from './pages/student/SubmitMilestone.jsx';

function RootRedirect() {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe);
  useEffect(() => { fetchMe(); }, []);

  return (
    <BrowserRouter>
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

        {/* Student routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/courses" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/join" element={<ProtectedRoute roles={['student']}><JoinCourse /></ProtectedRoute>} />
        <Route path="/student/courses/:id" element={<ProtectedRoute roles={['student']}><StudentCourseDetail /></ProtectedRoute>} />
        <Route path="/student/projects/:id" element={<ProtectedRoute roles={['student']}><StudentProjectDetail /></ProtectedRoute>} />
        <Route path="/student/tasks" element={<ProtectedRoute roles={['student']}><MyTasks /></ProtectedRoute>} />
        <Route path="/student/tasks/new" element={<ProtectedRoute roles={['student']}><LogTask /></ProtectedRoute>} />
        <Route path="/student/milestones/:milestoneId/submit" element={<ProtectedRoute roles={['student']}><SubmitMilestone /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
