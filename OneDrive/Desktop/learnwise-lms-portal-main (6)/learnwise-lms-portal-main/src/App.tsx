
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkAuth } from './services/authService';
import { useAuth } from './context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Import components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';

// AdminDashboard is imported from Dashboard for admin dashboard
import AdminDashboard from './pages/admin/Dashboard';
import InstructorDashboard from './pages/instructor/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

// Import course related pages
import MyCourses from './pages/student/MyCourses';
import Courses from './pages/student/Courses';
import CourseLearning from './pages/student/CourseLearning';
import Quizzes from './pages/student/Quizzes';
import QuizTaking from './pages/student/QuizTaking';
import QuizResults from './pages/student/QuizResults';
import Certificates from './pages/student/Certificates';
import Messages from './pages/student/Messages';
import Calendar from './pages/student/Calendar';
import Profile from './pages/student/Profile';

// Import instructor pages
import InstructorMessages from './pages/instructor/Messages';
import InstructorCalendar from './pages/instructor/Calendar';
import InstructorProfile from './pages/instructor/Profile';
import InstructorCourses from './pages/instructor/Courses';
import CreateCourse from './pages/instructor/CreateCourse';
import QuizManager from './pages/instructor/QuizManager';
import Students from './pages/instructor/Students';
import Submissions from './pages/instructor/Submissions';

// Import admin pages
import AdminCalendar from './pages/admin/Calendar';
import AdminProfile from './pages/admin/Profile';
import Approvals from './pages/admin/Approvals';
import AdminMessages from './pages/admin/Messages';
import AdminReports from './pages/admin/Reports';
import QuizAttemptRequests from './pages/admin/QuizAttemptRequests';
import QuizSubmissions from './pages/admin/QuizSubmissions';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';

function App() {
  const { authState, setAuthState } = useAuth();

  const { data: authData, isLoading } = useQuery({
    queryKey: ['authCheck'],
    queryFn: checkAuth,
    retry: false
  });

  useEffect(() => {
    if (authData?.success && authData?.user) {
      setAuthState({
        isAuthenticated: true,
        user: authData.user,
        token: localStorage.getItem('token') || '',
        role: authData.user.role
      });
    } else if (authData !== undefined) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        role: null
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [authData, setAuthState]);

  useEffect(() => {
    if (!isLoading && !authState.isAuthenticated && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [isLoading, authState.isAuthenticated]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!authState.isAuthenticated ? <LoginPage /> : <Navigate to="/student/dashboard" />} />
          <Route path="/register" element={!authState.isAuthenticated ? <RegisterPage /> : <Navigate to="/student/dashboard" />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={authState.isAuthenticated && authState.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/calendar" element={authState.isAuthenticated && authState.role === 'admin' ? <AdminCalendar /> : <Navigate to="/login" />} />
          <Route path="/admin/profile" element={authState.isAuthenticated && authState.role === 'admin' ? <AdminProfile /> : <Navigate to="/login" />} />
           <Route path="/admin/users" element={authState.isAuthenticated && authState.role === 'admin' ? <Users /> : <Navigate to="/login" />} />
          <Route path="/admin/approvals" element={authState.isAuthenticated && authState.role === 'admin' ? <Approvals /> : <Navigate to="/login" />} />
          <Route path="/admin/settings" element={authState.isAuthenticated && authState.role === 'admin' ? <Settings /> : <Navigate to="/login" />} />
           <Route path="/admin/reports" element={authState.isAuthenticated && authState.role === 'admin' ? <AdminReports /> : <Navigate to="/login" />} />
          
          {/* Instructor Routes */}
          <Route path="/instructor/dashboard" element={authState.isAuthenticated && authState.role === 'instructor' ? <InstructorDashboard /> : <Navigate to="/login" />} />
          <Route path="/instructor/messages" element={authState.isAuthenticated && authState.role === 'instructor' ? <InstructorMessages /> : <Navigate to="/login" />} />
          <Route path="/instructor/calendar" element={authState.isAuthenticated && authState.role === 'instructor' ? <InstructorCalendar /> : <Navigate to="/login" />} />
          <Route path="/instructor/profile" element={authState.isAuthenticated && authState.role === 'instructor' ? <InstructorProfile /> : <Navigate to="/login" />} />
          <Route path="/instructor/courses" element={authState.isAuthenticated && authState.role === 'instructor' ? <InstructorCourses /> : <Navigate to="/login" />} />
          <Route path="/instructor/quiz-manager" element={authState.isAuthenticated && authState.role === 'instructor' ? <QuizManager /> : <Navigate to="/login" />} />
          <Route path="/instructor/students" element={authState.isAuthenticated && authState.role === 'instructor' ? <Students /> : <Navigate to="/login" />} />
          <Route path="/instructor/submissions" element={authState.isAuthenticated && authState.role === 'instructor' ? <Submissions /> : <Navigate to="/login" />} />
          <Route path="/instructor/create-course" element={authState.isAuthenticated && authState.role === 'instructor' ? <CreateCourse /> : <Navigate to="/login" />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={authState.isAuthenticated ? <StudentDashboard /> : <Navigate to="/login" />} />
          <Route path="/student/courses" element={authState.isAuthenticated ? <Courses /> : <Navigate to="/login" />} />
          <Route path="/student/my-courses" element={authState.isAuthenticated ? <MyCourses /> : <Navigate to="/login" />} />
          <Route path="/student/course/:courseId/module/:moduleId" element={authState.isAuthenticated ? <CourseLearning /> : <Navigate to="/login" />} />
          <Route path="/student/course/:id" element={authState.isAuthenticated ? <CourseLearning /> : <Navigate to="/login" />} />
          <Route path="/student/quizzes" element={authState.isAuthenticated ? <Quizzes /> : <Navigate to="/login" />} />
          <Route path="/student/quiz/:id" element={authState.isAuthenticated ? <QuizTaking /> : <Navigate to="/login" />} />
          <Route path="/student/quiz-results/:submissionId" element={authState.isAuthenticated ? <QuizResults /> : <Navigate to="/login" />} />
          <Route path="/student/certificates" element={authState.isAuthenticated ? <Certificates /> : <Navigate to="/login" />} />
          <Route path="/student/messages" element={authState.isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
          <Route path="/student/calendar" element={authState.isAuthenticated ? <Calendar /> : <Navigate to="/login" />} />
          <Route path="/student/profile" element={authState.isAuthenticated ? <Profile /> : <Navigate to="/login" />} />

          {/* Default Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
