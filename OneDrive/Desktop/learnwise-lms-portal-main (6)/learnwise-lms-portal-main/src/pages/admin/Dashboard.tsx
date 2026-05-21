
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, BookOpen, CheckCircle, FileCheck, BarChart3, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock summary data
  const summaryData = {
    totalUsers: 2475,
    totalCourses: 86,
    completionRate: 68,
    pendingApprovals: 14
  };
  
  // Mock user distribution data
  const userDistribution = [
    { role: 'Students', count: 2150, percentage: 87 },
    { role: 'Instructors', count: 305, percentage: 12 },
    { role: 'Admins', count: 20, percentage: 1 }
  ];

  // Mock recent users
  const recentUsers = [
    {
      id: 1,
      name: 'Lisa Johnson',
      email: 'lisa.j@example.com',
      joinDate: 'May 18, 2025',
      role: 'Student'
    },
    {
      id: 2,
      name: 'Mark Williams',
      email: 'markw@example.com',
      joinDate: 'May 17, 2025',
      role: 'Student'
    },
    {
      id: 3,
      name: 'Dr. Robert Chen',
      email: 'dr.chen@example.com',
      joinDate: 'May 16, 2025',
      role: 'Instructor'
    },
    {
      id: 4,
      name: 'Sarah Miller',
      email: 's.miller@example.com',
      joinDate: 'May 15, 2025',
      role: 'Student'
    }
  ];

  // Mock pending approvals
  const pendingApprovals = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      type: 'Course',
      submitter: 'Dr. James Wilson',
      submitted: 'May 19, 2025'
    },
    {
      id: 2,
      title: 'React Authentication Quiz',
      type: 'Quiz',
      submitter: 'Prof. Emma Rodriguez',
      submitted: 'May 18, 2025'
    },
    {
      id: 3,
      title: 'CSS Grid Mastery',
      type: 'Course',
      submitter: 'Michael Chen',
      submitted: 'May 17, 2025'
    }
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      message: 'New course submitted for approval',
      timestamp: '1 hour ago',
      type: 'approval'
    },
    {
      id: 2,
      message: '35 new user registrations today',
      timestamp: '3 hours ago',
      type: 'user'
    },
    {
      id: 3,
      message: 'System maintenance completed successfully',
      timestamp: '1 day ago',
      type: 'system'
    },
    {
      id: 4,
      message: '12 new instructor applications received',
      timestamp: '2 days ago',
      type: 'instructor'
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Platform overview and management</p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mr-4">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{summaryData.totalUsers.toLocaleString()}</h3>
            <p className="text-gray-400">Total Users</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mr-4">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{summaryData.totalCourses}</h3>
            <p className="text-gray-400">Active Courses</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{summaryData.completionRate}%</h3>
            <p className="text-gray-400">Completion Rate</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 mr-4">
            <FileCheck size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{summaryData.pendingApprovals}</h3>
            <p className="text-gray-400">Pending Approvals</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* User distribution */}
        <div className="lms-card">
          <h2 className="text-xl font-bold text-white mb-6">User Distribution</h2>
          
          <div className="space-y-4">
            {userDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white">{item.role}</span>
                  <span className="text-sm text-gray-400">{item.count.toLocaleString()} ({item.percentage}%)</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-value ${
                      index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-blue-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <BarChart3 className="w-32 h-32 text-gray-600" />
          </div>
        </div>
        
        {/* Recent users */}
        <div className="lms-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Users</h2>
            <a href="#" className="text-sm text-lms-primary hover:underline">View all</a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-sm font-medium text-gray-400">Name</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Role</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-800 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700 text-white mr-3">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.role === 'Instructor' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-400">{user.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent activities */}
        <div className="lms-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Recent Activities</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-white mr-3">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-sm text-white">{activity.message}</p>
                  <span className="text-xs text-gray-400">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Pending approvals */}
      <div className="lms-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Pending Approvals</h2>
          <a href="#" className="text-sm text-lms-primary hover:underline">View all</a>
        </div>
        
        {pendingApprovals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-sm font-medium text-gray-400">Title</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Type</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Submitted By</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Date</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map(item => (
                  <tr key={item.id} className="border-b border-gray-800 last:border-0">
                    <td className="py-3 text-sm text-white">{item.title}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.type === 'Course' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-white">{item.submitter}</td>
                    <td className="py-3 text-sm text-gray-400">{item.submitted}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 transition-colors">
                          Approve
                        </button>
                        <button className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No pending approvals at this time.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
