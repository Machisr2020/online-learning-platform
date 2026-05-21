
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BookOpen, Clock, CheckCircle, Play, Calendar, Award, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEnrolledCourses, enrollInCourse } from '../../services/courseService';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import CourseRatingModal from '../../components/course/CourseRatingModal';
import CourseCompletionFlow from '../../components/course/CourseCompletionFlow';

const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'enrolled' | 'completed'>('enrolled');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [completionFlowOpen, setCompletionFlowOpen] = useState(false);
  const [completionCourse, setCompletionCourse] = useState<any>(null);
  
  const { data: enrolledCoursesData, isLoading } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: getEnrolledCourses,
  });

  const enrollMutation = useMutation({
    mutationFn: enrollInCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
      toast({
        title: "Enrollment successful",
        description: "You have been enrolled in the course successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment failed",
        description: error.response?.data?.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });

  const enrolledCourses = enrolledCoursesData?.data || [];
  const completedCourses = enrolledCourses.filter((course: any) => course.status === 'completed');
  const activeCourses = enrolledCourses.filter((course: any) => course.status === 'active');

  const handleContinueLearning = (course: any) => {
    console.log('Course data in handleContinueLearning:', course);
    
    // Check if course is completed and hasn't been rated
    if (course.status === 'completed' && !course.rated) {
      setCompletionCourse(course);
      setCompletionFlowOpen(true);
      return;
    }

    const modules = course.modules;
    if (!modules || modules.length === 0) {
      console.warn(`No modules found for course: ${course.title}`);
      return;
    }

    // Find the next incomplete module
    const nextModule = modules.find((module: any) =>
      !course.completedModules?.some((completed: any) =>
        completed.module === module._id
      )
    );

    const targetModule = nextModule || modules[0];

    if (targetModule?._id) {
      console.log('Navigating to module:', targetModule);
      navigate(`/student/course/${course._id}/module/${targetModule._id}`);
    } else {
      console.warn(`No valid module ID found for course: ${course.title}`);
    }
  };

  const handleRateCourse = (course: any) => {
    setSelectedCourse(course);
    setRatingModalOpen(true);
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some((course: any) => course._id === courseId);
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrolledCourses.find((course: any) => course._id === courseId);
    return enrollment?.status || null;
  };

  const formatLastAccessed = (date: string) => {
    const now = new Date();
    const accessDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - accessDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lms-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
        <p className="text-gray-400">Your enrolled courses and progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeCourses.length}</p>
              <p className="text-gray-400">Active Courses</p>
            </div>
          </div>
        </div>
        
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Award className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedCourses.length}</p>
              <p className="text-gray-400">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round(activeCourses.reduce((acc: number, course: any) => acc + course.progress, 0) / activeCourses.length) || 0}%
              </p>
              <p className="text-gray-400">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'enrolled'
              ? 'bg-lms-primary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Enrolled Courses ({activeCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-lms-primary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Completed Courses ({completedCourses.length})
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(activeTab === 'enrolled' ? activeCourses : completedCourses).map((course: any) => (
          <div key={course._id} className="lms-card">
            <div className="flex flex-col sm:flex-row gap-4">
              <img 
                src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
                alt={course.title}
                className="w-full sm:w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  <div className="flex items-center gap-2">
                    {course.status === 'completed' && !course.rated && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400 animate-pulse">
                        Rate & Get Certificate
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.status === 'completed' 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {course.status === 'completed' ? 'Completed' : 'Enrolled'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Instructor: {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{Math.round(course.progress)}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Last accessed: {formatLastAccessed(course.lastAccessed)}
                </p>
                {course.completedAt && (
                  <p className="text-xs text-green-400 mt-1">
                    Completed: {new Date(course.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-white mb-2">Course Modules</h4>
              {course.modules && course.modules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {course.modules.slice(0, 4).map((module: any, index: number) => {
                    const isCompleted = course.completedModules?.some((completed: any) => 
                      completed.module === module._id
                    );
                    return (
                      <div key={module._id} className="flex items-center text-sm">
                        {isCompleted ? (
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <Clock size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        )}
                        <span className={isCompleted ? "text-white" : "text-gray-400"}>
                          {module.title}
                        </span>
                      </div>
                    );
                  })}
                  {course.modules.length > 4 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{course.modules.length - 4} more modules
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-400">
                  <p>This course has no modules yet.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              {course.modules && course.modules.length > 0 && (
                <Button
                  onClick={() => handleContinueLearning(course)}
                  className={`flex-1 text-white ${
                    course.status === 'completed' && !course.rated
                      ? 'bg-yellow-600 hover:bg-yellow-700 animate-pulse'
                      : 'bg-lms-primary hover:bg-lms-primary-dark'
                  }`}
                >
                  <Play size={16} className="mr-2" />
                  {course.status === 'completed' && !course.rated 
                    ? 'Complete Course Journey' 
                    : course.status === 'completed' 
                    ? 'Review Course' 
                    : 'Continue Learning'}
                </Button>
              )}
              
              {course.status === 'completed' && !course.rated && (
                <Button
                  onClick={() => handleRateCourse(course)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
                >
                  <Star size={16} className="mr-1" />
                  Rate
                </Button>
              )}
              
              {course.status === 'completed' && (
                <Button
                  onClick={() => navigate(`/student/certificates`)}
                  variant="outline"
                  size="sm"
                >
                  <Award size={16} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No courses enrolled yet</h3>
          <p className="text-gray-400 mb-4">Discover and enroll in courses to start your learning journey</p>
          <Button
            onClick={() => navigate('/student/browse-courses')}
            className="bg-lms-primary hover:bg-lms-primary-dark"
          >
            Browse Courses
          </Button>
        </div>
      )}

      <CourseRatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        course={selectedCourse}
        onRatingSubmitted={() => {
          queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
          setRatingModalOpen(false);
        }}
      />

      {completionFlowOpen && completionCourse && (
        <CourseCompletionFlow
          course={completionCourse}
          enrollment={completionCourse}
          onClose={() => {
            setCompletionFlowOpen(false);
            setCompletionCourse(null);
            queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default MyCourses;
