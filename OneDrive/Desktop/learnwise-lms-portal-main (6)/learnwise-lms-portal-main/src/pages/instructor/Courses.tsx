
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BookCopy, Edit, Eye, MoreHorizontal, Plus, Search, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InstructorCourses: React.FC = () => {
  const { user } = useAuth();
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for courses
  const courses = [
    {
      id: 1,
      title: 'Introduction to React',
      students: 245,
      rating: 4.8,
      avgCompletion: 78,
      status: 'published',
      lastUpdated: '2025-04-15',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      students: 180,
      rating: 4.7,
      avgCompletion: 65,
      status: 'published',
      lastUpdated: '2025-03-20',
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 3,
      title: 'Modern Web Design',
      students: 0,
      rating: 0,
      avgCompletion: 0,
      status: 'draft',
      lastUpdated: '2025-05-10',
      image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80'
    },
    {
      id: 4,
      title: 'Node.js Backend Development',
      students: 0,
      rating: 0,
      avgCompletion: 0,
      status: 'pending',
      lastUpdated: '2025-05-05',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80'
    }
  ];
  
  // Status count
  const statusCount = {
    all: courses.length,
    published: courses.filter(course => course.status === 'published').length,
    draft: courses.filter(course => course.status === 'draft').length,
    pending: courses.filter(course => course.status === 'pending').length
  };
  
  // Filter and search courses
  const filteredCourses = courses
    .filter(course => filterStatus === 'all' || course.status === filterStatus)
    .filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // Function to get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-900/30 text-green-400';
      case 'draft':
        return 'bg-gray-700/50 text-gray-400';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };
  
  // Handle course actions
  const handleEdit = (courseId: number) => {
    console.log(`Edit course ${courseId}`);
    // Navigate to edit page in real app
  };
  
  const handlePreview = (courseId: number) => {
    console.log(`Preview course ${courseId}`);
    // Open preview in real app
  };
  
  const handleDelete = (courseId: number) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this course?');
    if (isConfirmed) {
      console.log(`Delete course ${courseId}`);
      // Delete course in real app
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
        <p className="text-gray-400">Manage your courses as an instructor</p>
      </div>
      
      {/* Actions and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <a href="/instructor/create-course" className="lms-button-primary flex items-center">
            <Plus size={16} className="mr-2" />
            Create New Course
          </a>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
            />
          </div>
          
          <div className="flex bg-gray-800 rounded-full p-1">
            <button 
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'all' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({statusCount.all})
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'published' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
              onClick={() => setFilterStatus('published')}
            >
              Published ({statusCount.published})
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'draft' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
              onClick={() => setFilterStatus('draft')}
            >
              Draft ({statusCount.draft})
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'pending' ? 'bg-lms-primary text-white' : 'text-gray-400'}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({statusCount.pending})
            </button>
          </div>
        </div>
      </div>
      
      {/* Course List */}
      <div className="space-y-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="lms-card">
              <div className="flex flex-col sm:flex-row gap-4">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full sm:w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">{course.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-md mt-1 ${getStatusClass(course.status)}`}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(course.id)}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handlePreview(course.id)}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
                        title="Delete"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-400">Last Updated</p>
                      <p className="text-sm font-medium text-white">{new Date(course.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Students</p>
                      <p className="text-sm font-medium text-white">{course.students}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Rating</p>
                      <p className="text-sm font-medium text-white">{course.rating ? `${course.rating}/5` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Completion</p>
                      <p className="text-sm font-medium text-white">{course.avgCompletion ? `${course.avgCompletion}%` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="lms-card flex flex-col items-center justify-center py-12">
            <BookCopy size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-1">No courses found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? `No courses matching "${searchQuery}"`
                : filterStatus !== 'all' 
                  ? `No ${filterStatus} courses found`
                  : 'You have not created any courses yet'
              }
            </p>
            <a href="/instructor/create-course" className="lms-button-primary">
              Create Your First Course
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstructorCourses;
