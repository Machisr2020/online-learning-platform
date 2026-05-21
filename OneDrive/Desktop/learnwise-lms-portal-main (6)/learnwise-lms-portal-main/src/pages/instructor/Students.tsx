
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Search, Filter, ChevronDown, BookOpen, Award, Clock, ArrowUpRight } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  enrollmentDate: string;
  coursesEnrolled: number;
  completedCourses: number;
  averageScore: number;
  lastActive: string;
}

const Students: React.FC = () => {
  // Mock data for students
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      enrollmentDate: 'Jan 15, 2025',
      coursesEnrolled: 3,
      completedCourses: 1,
      averageScore: 92,
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      enrollmentDate: 'Feb 3, 2025',
      coursesEnrolled: 2,
      completedCourses: 0,
      averageScore: 78,
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Carol Taylor',
      email: 'carol@example.com',
      enrollmentDate: 'Mar 22, 2025',
      coursesEnrolled: 4,
      completedCourses: 2,
      averageScore: 88,
      lastActive: '3 hours ago'
    },
    {
      id: 4,
      name: 'Dave Wilson',
      email: 'dave@example.com',
      enrollmentDate: 'Apr 5, 2025',
      coursesEnrolled: 1,
      completedCourses: 0,
      averageScore: 65,
      lastActive: '1 week ago'
    },
    {
      id: 5,
      name: 'Emma Davis',
      email: 'emma@example.com',
      enrollmentDate: 'Apr 18, 2025',
      coursesEnrolled: 2,
      completedCourses: 1,
      averageScore: 95,
      lastActive: 'Just now'
    },
    {
      id: 6,
      name: 'Frank Miller',
      email: 'frank@example.com',
      enrollmentDate: 'May 1, 2025',
      coursesEnrolled: 3,
      completedCourses: 0,
      averageScore: 0,
      lastActive: '5 hours ago'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Mock course list
  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 'web-dev', name: 'Web Development Fundamentals' },
    { id: 'js', name: 'JavaScript Mastery' },
    { id: 'react', name: 'React for Beginners' }
  ];

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
        <p className="text-gray-400">View and manage your enrolled students</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="lms-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-md bg-lms-primary/20 flex items-center justify-center text-lms-primary">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">{students.length}</h3>
          <p className="text-sm text-gray-400">Total Students</p>
        </div>
        
        <div className="lms-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-md bg-green-500/20 flex items-center justify-center text-green-500">
              <BookOpen size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">16</h3>
          <p className="text-sm text-gray-400">Active Enrollments</p>
        </div>
        
        <div className="lms-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-md bg-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Award size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">4</h3>
          <p className="text-sm text-gray-400">Course Completions</p>
        </div>
        
        <div className="lms-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-md bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Clock size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">85%</h3>
          <p className="text-sm text-gray-400">Average Score</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="search" 
            placeholder="Search by name or email..." 
            className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <button className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-md w-64">
              <div className="flex items-center">
                <Filter size={16} className="mr-2 text-gray-400" />
                <span>{courses.find(c => c.id === selectedCourse)?.name}</span>
              </div>
              <ChevronDown size={16} />
            </button>
            <div className="absolute mt-2 w-64 bg-gray-800 rounded-md shadow-lg z-10 hidden">
              <div className="py-1">
                {courses.map(course => (
                  <a 
                    href="#" 
                    key={course.id}
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700" 
                    onClick={() => setSelectedCourse(course.id)}
                  >
                    {course.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lms-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Courses
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Average Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-lms-primary/20 flex items-center justify-center text-lms-primary">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{student.name}</div>
                        <div className="text-sm text-gray-400">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {student.enrollmentDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {student.coursesEnrolled}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm text-white mr-2">
                          {student.completedCourses}/{student.coursesEnrolled}
                        </span>
                        <span className="text-xs text-gray-400">
                          {student.coursesEnrolled > 0 ? 
                            `(${Math.round((student.completedCourses / student.coursesEnrolled) * 100)}%)` : 
                            '(0%)'}
                        </span>
                      </div>
                      <div className="mt-1 h-1 w-20 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-lms-primary rounded-full" 
                          style={{ 
                            width: student.coursesEnrolled > 0 ? 
                              `${(student.completedCourses / student.coursesEnrolled) * 100}%` : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.averageScore > 0 ? (
                      <span className={`font-medium ${
                        student.averageScore >= 90 ? 'text-green-400' : 
                        student.averageScore >= 70 ? 'text-yellow-400' : 'text-rose-400'
                      }`}>
                        {student.averageScore}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-lms-primary hover:text-lms-primary/80 flex items-center justify-end">
                      <span className="mr-1">View</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
        <div>Showing {filteredStudents.length} of {students.length} students</div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">Previous</button>
          <button className="px-3 py-1 bg-lms-primary text-white rounded">1</button>
          <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">2</button>
          <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">Next</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Students;
