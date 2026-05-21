import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { getAllCourses, getEnrolledCourses } from '../../services/courseService';
import { BookOpen, Search, Filter, Clock, UserCheck, Star, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: string;
  duration: number;
  rating: number;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  enrollmentCount: number;
  isEnrolled?: boolean;
}

const Courses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  // Fetch all courses
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getAllCourses
  });

  // Fetch enrolled courses to check enrollment status
  const { data: enrolledCoursesData } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: getEnrolledCourses
  });
  
  // Get enrolled course IDs for quick lookup
  const enrolledCourseIds = useMemo(() => {
    if (!enrolledCoursesData?.data) return new Set();
    return new Set(enrolledCoursesData.data.map((course: any) => course._id));
  }, [enrolledCoursesData]);
  
  // Filter and search courses
  const filteredCourses = useMemo(() => {
    if (!coursesData?.data) return [];
    
    return coursesData.data.filter((course: Course) => {
      // Search filter
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = 
        !filters.category || course.category === filters.category;
      
      // Level filter
      const matchesLevel = 
        !filters.level || course.level === filters.level;
      
      return matchesSearch && matchesCategory && matchesLevel;
    }).map((course: Course) => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course._id)
    }));
  }, [coursesData, searchQuery, filters, enrolledCourseIds]);
  
  // Get unique categories and levels for filters
  const categories = useMemo(() => {
    if (!coursesData?.data) return [];
    const allCategories = coursesData.data.map((course: Course) => course.category);
    return [...new Set(allCategories)];
  }, [coursesData]);
  
  const levels = useMemo(() => {
    if (!coursesData?.data) return [];
    const allLevels = coursesData.data.map((course: Course) => course.level);
    return [...new Set(allLevels)];
  }, [coursesData]);
  
  // Enroll in course
  const handleEnroll = async (courseId: string) => {
    try {
      const { enrollInCourse } = await import('../../services/courseService');
      await enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      // Refresh courses list
      navigate('/student/my-courses');
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in course. Please try again.');
    }
  };
  
  // Format duration (minutes to hours and minutes)
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} min`;
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: '',
      level: ''
    });
    setSearchQuery('');
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Available Courses</h1>
        <p className="text-gray-400">Browse and enroll in courses</p>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="search" 
            placeholder="Search courses by title or description..." 
            className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          className="flex items-center justify-center py-2 px-4 bg-gray-800 border border-gray-700 rounded-md text-white hover:bg-gray-700"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="w-full md:w-auto">
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category as string} value={category as string}>
                    {category as string}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Level Filter */}
            <div className="w-full md:w-auto">
              <label className="block text-sm text-gray-400 mb-1">Level</label>
              <select
                className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
                value={filters.level}
                onChange={(e) => setFilters({...filters, level: e.target.value})}
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level as string} value={level as string}>
                    {level as string}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Reset Button */}
            <div className="w-full md:w-auto md:self-end">
              <button 
                className="w-full py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-lms-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-gray-400">Loading courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course: Course) => (
            <div key={course._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col">
              {/* Course Image */}
              <div className="relative h-40">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white opacity-30" />
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-2 right-2">
                  <span className="inline-block bg-lms-primary text-white text-xs px-2 py-1 rounded">
                    {course.category}
                  </span>
                </div>
              </div>
              
              {/* Course Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>
                
                {/* Course Details */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">{formatDuration(course.duration)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">{course.enrollmentCount} students</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-400">{course.rating.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">Self-paced</span>
                  </div>
                </div>
                
                {/* Instructor */}
                <div className="text-sm text-gray-400 mb-4">
                  Instructor: <span className="text-white">{course.instructor.firstName} {course.instructor.lastName}</span>
                </div>
                
                {/* Action Button */}
                <div className="mt-auto">
                  {course.isEnrolled ? (
                    <button 
                      className="w-full flex items-center justify-center py-2 px-4 bg-green-600/20 text-green-400 rounded-md cursor-default border border-green-600/30"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enrolled
                    </button>
                  ) : (
                    <button 
                      className="w-full py-2 px-4 bg-lms-primary hover:bg-lms-primary/80 text-white rounded-md"
                      onClick={() => handleEnroll(course._id)}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-gray-800/50 rounded-lg p-10 text-center border border-gray-700">
            <Search className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button 
              onClick={resetFilters}
              className="inline-block bg-lms-primary hover:bg-lms-primary/80 text-white rounded-md py-2 px-6"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses;
