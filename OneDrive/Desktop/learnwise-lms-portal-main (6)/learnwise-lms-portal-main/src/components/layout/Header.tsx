
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 right-0 left-60 h-16 bg-gray-900 border-b border-gray-800 z-20 flex items-center justify-between px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-white">
          Welcome back, {user?.firstName}!
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <NotificationDropdown />
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-lms-primary rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-lms-primary rounded-lg"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
