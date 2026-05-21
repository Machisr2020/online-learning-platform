
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CheckSquare, Search, ChevronDown, Filter, Download } from 'lucide-react';

interface Submission {
  id: number;
  studentName: string;
  studentEmail: string;
  quizTitle: string;
  course: string;
  submittedAt: string;
  score: number;
  totalScore: number;
  status: 'graded' | 'pending' | 'reviewed';
}

const Submissions: React.FC = () => {
  // Mock data for submissions
  const [submissions] = useState<Submission[]>([
    {
      id: 1,
      studentName: 'Alice Johnson',
      studentEmail: 'alice@example.com',
      quizTitle: 'Introduction to HTML Basics',
      course: 'Web Development Fundamentals',
      submittedAt: 'May 20, 2025 • 2:30 PM',
      score: 85,
      totalScore: 100,
      status: 'graded'
    },
    {
      id: 2,
      studentName: 'Bob Smith',
      studentEmail: 'bob@example.com',
      quizTitle: 'CSS Layout Techniques',
      course: 'Web Development Fundamentals',
      submittedAt: 'May 19, 2025 • 4:15 PM',
      score: 72,
      totalScore: 100,
      status: 'graded'
    },
    {
      id: 3,
      studentName: 'Carol Taylor',
      studentEmail: 'carol@example.com',
      quizTitle: 'JavaScript Functions & Objects',
      course: 'JavaScript Mastery',
      submittedAt: 'May 18, 2025 • 10:45 AM',
      score: 0,
      totalScore: 100,
      status: 'pending'
    },
    {
      id: 4,
      studentName: 'Dave Wilson',
      studentEmail: 'dave@example.com',
      quizTitle: 'React Component Lifecycle',
      course: 'React for Beginners',
      submittedAt: 'May 17, 2025 • 3:20 PM',
      score: 0,
      totalScore: 100,
      status: 'pending'
    },
    {
      id: 5,
      studentName: 'Emma Davis',
      studentEmail: 'emma@example.com',
      quizTitle: 'Introduction to HTML Basics',
      course: 'Web Development Fundamentals',
      submittedAt: 'May 16, 2025 • 1:10 PM',
      score: 95,
      totalScore: 100,
      status: 'reviewed'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter submissions based on status and search query
  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = selectedFilter === 'all' || submission.status === selectedFilter;
    const matchesSearch = 
      submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      submission.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Submissions</h1>
        <p className="text-gray-400">Review and grade student quiz submissions</p>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="search" 
            placeholder="Search by student or quiz..." 
            className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <button className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-md w-48">
              <div className="flex items-center">
                <Filter size={16} className="mr-2 text-gray-400" />
                <span>{selectedFilter === 'all' ? 'All Submissions' : 
                       selectedFilter === 'graded' ? 'Graded' : 
                       selectedFilter === 'pending' ? 'Pending' : 'Reviewed'}</span>
              </div>
              <ChevronDown size={16} />
            </button>
            <div className="absolute mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 hidden">
              <div className="py-1">
                <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-700" onClick={() => setSelectedFilter('all')}>
                  All Submissions
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-700" onClick={() => setSelectedFilter('pending')}>
                  Pending
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-700" onClick={() => setSelectedFilter('graded')}>
                  Graded
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-700" onClick={() => setSelectedFilter('reviewed')}>
                  Reviewed
                </a>
              </div>
            </div>
          </div>
          
          <button className="ml-4 bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700">
            <Download size={20} />
          </button>
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
                  Quiz & Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-lms-primary/20 flex items-center justify-center text-lms-primary">
                        {submission.studentName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{submission.studentName}</div>
                        <div className="text-sm text-gray-400">{submission.studentEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{submission.quizTitle}</div>
                    <div className="text-sm text-gray-400">{submission.course}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {submission.submittedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.status === 'pending' ? (
                      <span className="text-sm text-gray-400">Not graded</span>
                    ) : (
                      <div>
                        <span className="text-sm font-bold text-white">
                          {submission.score}/{submission.totalScore}
                        </span>
                        <div className="mt-1 h-1 w-20 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-lms-primary rounded-full" 
                            style={{ width: `${(submission.score / submission.totalScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        submission.status === 'graded' 
                          ? 'bg-green-900 text-green-300' 
                          : submission.status === 'pending' 
                            ? 'bg-yellow-900 text-yellow-300' 
                            : 'bg-purple-900 text-purple-300'
                      }`}
                    >
                      {submission.status === 'graded' ? 'Graded' : 
                       submission.status === 'pending' ? 'Pending' : 'Reviewed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="bg-lms-primary text-white px-3 py-1 rounded hover:bg-lms-primary/80">
                      {submission.status === 'pending' ? 'Grade' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
        <div>Showing {filteredSubmissions.length} of {submissions.length} submissions</div>
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

export default Submissions;
