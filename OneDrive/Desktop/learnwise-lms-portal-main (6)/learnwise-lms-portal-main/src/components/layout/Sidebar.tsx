
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, FileQuestion, Award, Calendar,
  MessageSquare, User, BookCopy, PenTool, CheckSquare,
  FilePlus, Users, FileText, Settings, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive }) => (
  <Link to={to} className={`lms-sidebar-item ${isActive ? 'active' : ''}`}>
    <span className="lms-sidebar-icon">{icon}</span>
    <span>{label}</span>
  </Link>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Student navigation items
  const studentItems = [
    { to: '/student/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/student/courses', icon: <GraduationCap size={18} />, label: 'All Courses' },
    { to: '/student/my-courses', icon: <BookOpen size={18} />, label: 'My Courses' },
    { to: '/student/quizzes', icon: <FileQuestion size={18} />, label: 'Quizzes' },
    { to: '/student/certificates', icon: <Award size={18} />, label: 'Certificates' },
    { to: '/student/calendar', icon: <Calendar size={18} />, label: 'Calendar' },
    { to: '/student/messages', icon: <MessageSquare size={18} />, label: 'Messages' },
    { to: '/student/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  // Instructor navigation items
  const instructorItems = [
    { to: '/instructor/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/instructor/courses', icon: <BookCopy size={18} />, label: 'My Courses' },
    { to: '/instructor/create-course', icon: <FilePlus size={18} />, label: 'Create Course' },
    { to: '/instructor/quiz-manager', icon: <PenTool size={18} />, label: 'Quiz Manager' },
    { to: '/instructor/submissions', icon: <CheckSquare size={18} />, label: 'Submissions' },
    { to: '/instructor/students', icon: <Users size={18} />, label: 'Student List' },
    { to: '/instructor/calendar', icon: <Calendar size={18} />, label: 'Calendar' },
    { to: '/instructor/messages', icon: <MessageSquare size={18} />, label: 'Messages' },
    { to: '/instructor/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  // Admin navigation items
  const adminItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/admin/approvals', icon: <CheckSquare size={18} />, label: 'Approvals' },
    { to: '/admin/reports', icon: <FileText size={18} />, label: 'Reports' },
    { to: '/admin/calendar', icon: <Calendar size={18} />, label: 'Calendar' },
    { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' },
    { to: '/admin/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  // Select navigation items based on user role
  let navigationItems;
  let roleLabel;

  switch (role) {
    case 'student':
      navigationItems = studentItems;
      roleLabel = 'Student';
      break;
    case 'instructor':
      navigationItems = instructorItems;
      roleLabel = 'Instructor';
      break;
    case 'admin':
      navigationItems = adminItems;
      roleLabel = 'Admin';
      break;
    default:
      navigationItems = [];
      roleLabel = '';
  }

  return (
    <div className="lms-sidebar fixed top-0 left-0 w-60 h-screen bg-gray-900 border-r border-gray-800 z-30 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="flex items-center text-xl font-bold text-white">
          <span className="text-lms-primary">LMS</span>&nbsp;Portal
        </h2>
      </div>
      
      <div className="py-4 space-y-1 px-2 flex-1 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <SidebarItem
            key={index}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.to)}
          />
        ))}
      </div>
      
      {role && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-8 w-8 rounded bg-gray-800 text-white font-semibold uppercase">
              {roleLabel.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{roleLabel}</p>
              <p className="text-xs text-gray-400">Role</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
