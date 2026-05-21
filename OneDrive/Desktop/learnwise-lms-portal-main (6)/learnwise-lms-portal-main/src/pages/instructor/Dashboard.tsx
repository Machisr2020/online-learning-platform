import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BookOpen, Users, Award, ChevronRight, BarChart3, Calendar, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInstructorCourses } from '../../services/courseService';
import { getInstructorAnalytics } from '../../services/analyticsService';
import { useToast } from '@/components/ui/use-toast';

interface Course {
  id: string;
  title: string;
  image: string;
  status: string;
  students: number;
  rating?: number;
  avgCompletion?: number;
  isPublished: boolean;
}

interface Analytics {
  counts?: {
    students?: number;
    avgCompletion?: number;
  };
}

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch instructor courses
  const { 
    data: coursesData, 
    isLoading: coursesLoading 
  } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: getInstructorCourses,
    meta: {
      onError: () => {
        toast({
          title: "Error fetching courses",
          description: "There was a problem loading your courses. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Fetch instructor analytics
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading 
  } = useQuery({
    queryKey: ['instructorAnalytics'],
    queryFn: getInstructorAnalytics,
    meta: {
      onError: () => {
        toast({
          title: "Error fetching analytics",
          description: "There was a problem loading your analytics. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Extract courses and analytics data with proper typing
  const courses = (coursesData as { data?: Course[] })?.data || [];
  const analytics = (analyticsData as { data?: Analytics })?.data || {};
  
  // Calculate stats
  const totalStudents = analytics.counts?.students || 0;
  const publishedCourses = courses.filter((course: Course) => course.isPublished).length;
  const avgCompletionRate = analytics.counts?.avgCompletion || 0;

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Live Session: React Hooks',
      date: 'Jun 02, 2025',
      time: '11:00 AM - 12:30 PM',
      students: 45
    },
    {
      id: 2,
      title: 'Office Hours',
      date: 'May 28, 2025',
      time: '3:00 PM - 4:00 PM',
      students: 12
    },
    {
      id: 3,
      title: 'JavaScript Workshop',
      date: 'Jun 10, 2025',
      time: '2:00 PM - 4:00 PM',
      students: 28
    }
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      message: "New student enrolled in React Fundamentals",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      message: "Quiz submission from Advanced JavaScript",
      timestamp: "Yesterday"
    },
    {
      id: 3,
      message: "Course content updated in Node.js Masterclass",
      timestamp: "2 days ago"
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.firstName}</h1>
        <p className="text-gray-400">Here's an overview of your teaching activity</p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mr-4">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{courses.length}</h3>
            <p className="text-gray-400">Total Courses</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mr-4">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{totalStudents}</h3>
            <p className="text-gray-400">Total Students</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mr-4">
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{Math.round(avgCompletionRate)}%</h3>
            <p className="text-gray-400">Avg. Completion</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 mr-4">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{publishedCourses}</h3>
            <p className="text-gray-400">Published Courses</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course section */}
        <div className="lg:col-span-2">
          <div className="lms-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Courses</h2>
              <a href="#" className="text-sm text-lms-primary hover:underline">View all</a>
            </div>
            
            <div className="space-y-6">
              {courses.map((course: Course) => (
                <div key={course.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        course.status === 'Published' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-2">
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
                  <div className="self-center">
                    <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                      <ChevronRight size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <a href="#" className="lms-button-primary inline-flex items-center">
                <span>Create New Course</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Right side */}
        <div className="space-y-6">
          {/* Upcoming sessions */}
          <div className="lms-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Upcoming Sessions</h2>
              <a href="#" className="text-sm text-lms-primary hover:underline">View all</a>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-white mr-3">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{event.title}</h4>
                    <p className="text-xs text-lms-primary">{event.date} • {event.time}</p>
                    <p className="text-xs text-gray-400 mt-1">{event.students} students registered</p>
                  </div>
                </div>
              ))}
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
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
