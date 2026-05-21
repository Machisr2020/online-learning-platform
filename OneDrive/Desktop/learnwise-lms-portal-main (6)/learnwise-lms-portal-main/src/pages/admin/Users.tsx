
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight, Shield, UserCog, Trash, User } from 'lucide-react';

const Users: React.FC = () => {
  // Filter and search state
  const [role, setRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Mock users data
  const usersData = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      joinDate: '2025-03-10',
      lastActive: '2025-05-18',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'student',
      joinDate: '2025-02-28',
      lastActive: '2025-05-19',
      status: 'active'
    },
    {
      id: 3,
      name: 'Dr. Robert Chen',
      email: 'robert@example.com',
      role: 'instructor',
      joinDate: '2025-01-15',
      lastActive: '2025-05-17',
      status: 'active'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'student',
      joinDate: '2025-04-05',
      lastActive: '2025-05-10',
      status: 'inactive'
    },
    {
      id: 5,
      name: 'Michael Brown',
      email: 'michael@example.com',
      role: 'instructor',
      joinDate: '2025-03-22',
      lastActive: '2025-05-15',
      status: 'active'
    },
    {
      id: 6,
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'admin',
      joinDate: '2025-01-05',
      lastActive: '2025-05-20',
      status: 'active'
    },
    {
      id: 7,
      name: 'Lisa Johnson',
      email: 'lisa@example.com',
      role: 'student',
      joinDate: '2025-05-18',
      lastActive: '2025-05-19',
      status: 'active'
    },
    {
      id: 8,
      name: 'James Miller',
      email: 'james@example.com',
      role: 'student',
      joinDate: '2025-05-10',
      lastActive: '2025-05-18',
      status: 'active'
    }
  ];
  
  // Filter users based on role and search query
  const filteredUsers = usersData
    .filter(user => role === 'all' || user.role === role)
    .filter(user => {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  
  // Pagination
  const usersPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  
  // Role counts
  const roleCounts = {
    all: usersData.length,
    student: usersData.filter(user => user.role === 'student').length,
    instructor: usersData.filter(user => user.role === 'instructor').length,
    admin: usersData.filter(user => user.role === 'admin').length
  };

  // Function to handle user action
  const handleAction = (action: string, userId: number) => {
    console.log(`${action} user ${userId}`);
    
    if (action === 'delete') {
      const confirmed = window.confirm('Are you sure you want to delete this user?');
      if (confirmed) {
        // Handle delete (in a real app, this would call an API)
        console.log(`Confirmed: Delete user ${userId}`);
      }
    } else {
      // Handle other actions like promote/demote, etc.
      console.log(`Handle ${action} for user ${userId}`);
    }
  };
  
  // Function to get role badge class
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900/30 text-red-400';
      case 'instructor':
        return 'bg-blue-900/30 text-blue-400';
      case 'student':
        return 'bg-purple-900/30 text-purple-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };
  
  // Function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={14} />;
      case 'instructor':
        return <UserCog size={14} />;
      case 'student':
        return <User size={14} />;
      default:
        return <User size={14} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">View and manage all user accounts</p>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div className="flex bg-gray-800 rounded-full p-1">
          <button 
            className={`px-3 py-1 text-sm rounded-full ${role === 'all' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
            onClick={() => setRole('all')}
          >
            All ({roleCounts.all})
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${role === 'student' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
            onClick={() => setRole('student')}
          >
            Students ({roleCounts.student})
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${role === 'instructor' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
            onClick={() => setRole('instructor')}
          >
            Instructors ({roleCounts.instructor})
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${role === 'admin' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
            onClick={() => setRole('admin')}
          >
            Admins ({roleCounts.admin})
          </button>
        </div>
        
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-full md:w-64 py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
          />
        </div>
      </div>
      
      {/* User table */}
      <div className="lms-card mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-400">User</th>
                <th className="p-4 text-sm font-medium text-gray-400">Email</th>
                <th className="p-4 text-sm font-medium text-gray-400">Role</th>
                <th className="p-4 text-sm font-medium text-gray-400">Join Date</th>
                <th className="p-4 text-sm font-medium text-gray-400">Last Active</th>
                <th className="p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-700 text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="ml-3 font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getRoleBadgeClass(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-300">{new Date(user.lastActive).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="relative group">
                      <button className="p-1 rounded-full hover:bg-gray-700">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      
                      <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-10 hidden group-hover:block">
                        <div className="py-1">
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handleAction('makeAdmin', user.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              Make Admin
                            </button>
                          )}
                          {user.role === 'student' && (
                            <button 
                              onClick={() => handleAction('promoteToInstructor', user.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              Promote to Instructor
                            </button>
                          )}
                          {user.role === 'instructor' && (
                            <button 
                              onClick={() => handleAction('demoteToStudent', user.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              Demote to Student
                            </button>
                          )}
                          {user.status === 'active' ? (
                            <button 
                              onClick={() => handleAction('deactivate', user.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleAction('activate', user.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              Activate
                            </button>
                          )}
                          <button 
                            onClick={() => handleAction('delete', user.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-gray-800'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  currentPage === page ? 'bg-lms-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-gray-800'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Users;
