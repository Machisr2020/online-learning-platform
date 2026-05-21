
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BookOpen, Clock, Award, CheckSquare, Calendar, Bell, FileQuestion } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEnrolledCourses } from '../../services/courseService';
import { getMyCertificates } from '../../services/certificateService';
import { getMyEvents } from '../../services/eventService';
import { useToast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch enrolled courses
  const { data: enrollmentData, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: getEnrolledCourses,
  });

  // Fetch certificates
  const { data: certificatesData, isLoading: certificatesLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: getMyCertificates,
  });

  // Fetch upcoming events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['myEvents'],
    queryFn: getMyEvents,
  });

  useEffect(() => {
    if (coursesError) {
      toast({
        title: "Error fetching courses",
        description: "There was a problem loading your courses. Please try again.",
        variant: "destructive",
      });
    }
  }, [coursesError, toast]);

  // Extract data
  const enrolledCourses = enrollmentData?.data || [];
  const certificates = certificatesData?.data || [];
  const upcomingEvents = eventsData?.data?.filter((event: any) => 
    new Date(event.startDate) > new Date()
  ).slice(0, 3) || [];

  // Generate recent activities from enrollment data
  const recentActivities = enrolledCourses.flatMap((course: any) => {
    const activities = [];
    
    // Course enrollment activity
    activities.push({
      id: `enroll-${course._id}`,
      type: 'course_enrollment',
      message: `Enrolled in ${course.title}`,
      timestamp: new Date(course.enrolledAt).toLocaleDateString(),
      date: new Date(course.enrolledAt)
    });

    // Module completion activities
    if (course.completedModules && course.completedModules.length > 0) {
      course.completedModules.slice(-2).forEach((completed: any, index: number) => {
        const module = course.modules?.find((m: any) => m._id === completed.module);
        if (module) {
          activities.push({
            id: `module-${completed.module}-${index}`,
            type: 'course_progress',
            message: `Completed ${module.title} in ${course.title}`,
            timestamp: new Date(completed.completedAt).toLocaleDateString(),
            date: new Date(completed.completedAt)
          });
        }
      });
    }

    // Course completion activity
    if (course.status === 'completed' && course.completedAt) {
      activities.push({
        id: `complete-${course._id}`,
        type: 'certificate_earned',
        message: `Earned certificate in ${course.title}`,
        timestamp: new Date(course.completedAt).toLocaleDateString(),
        date: new Date(course.completedAt)
      });
    }

    return activities;
  }).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);

  // Calculate stats
  const averageCompletion = enrolledCourses.length 
    ? enrolledCourses.reduce((acc: number, course: any) => acc + course.progress, 0) / enrolledCourses.length
    : 0;

  const totalQuizzesAttempted = enrolledCourses.reduce((acc: number, course: any) => {
    return acc + (course.quizzesAttempted || 0);
  }, 0);
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.firstName}</h1>
        <p className="text-gray-400">Here's what's happening with your learning</p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mr-4">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{enrolledCourses.length}</h3>
            <p className="text-gray-400">Enrolled Courses</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mr-4">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{Math.round(averageCompletion)}%</h3>
            <p className="text-gray-400">Completion Rate</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 mr-4">
            <CheckSquare size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{totalQuizzesAttempted}</h3>
            <p className="text-gray-400">Attempted Quizzes</p>
          </div>
        </div>
        
        <div className="lms-card flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mr-4">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{certificates.length}</h3>
            <p className="text-gray-400">Earned Certificates</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course progress section */}
        <div className="lg:col-span-2">
          <div className="lms-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Course Progress</h2>
              <a href="/student/my-courses" className="text-sm text-lms-primary hover:underline">View all</a>
            </div>
            
            <div className="space-y-6">
              {coursesLoading ? (
                <div className="text-center py-10">
                  <p className="text-gray-400">Loading your courses...</p>
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400">You haven't enrolled in any courses yet.</p>
                </div>
              ) : (
                enrolledCourses.slice(0, 3).map((course: any) => (
                  <div key={course._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                    <img 
                      src={course.thumbnail || 'https://placehold.co/600x400?text=Course'} 
                      alt={course.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">Last accessed: {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'N/A'}</p>
                      <div className="progress-bar">
                        <div className="progress-value" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-400">{course.progress}% Complete</span>
                        <a href={`/student/course/${course._id}`} className="text-sm text-lms-primary">Continue</a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Right side */}
        <div className="space-y-6">
          {/* Upcoming events */}
          <div className="lms-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
              <a href="/student/calendar" className="text-sm text-lms-primary hover:underline">View all</a>
            </div>
            
            <div className="space-y-4">
              {eventsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">Loading events...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event: any) => (
                  <div key={event._id} className="flex items-start pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-white mr-3">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{event.title}</h4>
                      <p className="text-xs text-gray-400">{event.description?.substring(0, 50)}...</p>
                      <p className="text-xs text-lms-primary mt-1">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Recent activities */}
          <div className="lms-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Recent Activities</h2>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-white mr-3">
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-white">{activity.message}</p>
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
