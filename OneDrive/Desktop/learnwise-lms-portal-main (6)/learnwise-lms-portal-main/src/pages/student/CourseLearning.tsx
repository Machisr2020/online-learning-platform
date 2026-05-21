import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import VideoPlayer from '../../components/course/VideoPlayer';
import NotesPanel from '../../components/course/NotesPanel';
import { ChevronLeft, ChevronRight, BookOpen, Clock, MessageSquare, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseById, getEnrollmentByCourse, updateModuleProgress, saveModuleNotes, getModuleNotes } from '../../services/courseService';
import { toast } from 'sonner';

const CourseLearning: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [moduleNotes, setModuleNotes] = useState('');

  // Fetch course data
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId
  });

  // Fetch enrollment data
  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: () => getEnrollmentByCourse(courseId!),
    enabled: !!courseId
  });

  // Define variables after we have the data
  const course = courseData?.data;
  const enrollment = enrollmentData?.data;
  const modules = course?.modules || [];
  const currentModule = modules[currentModuleIndex];

  // Fetch module notes
  const { data: notesData } = useQuery({
    queryKey: ['moduleNotes', enrollment?._id, currentModule?._id],
    queryFn: () => getModuleNotes(enrollment!._id, currentModule!._id),
    enabled: !!enrollment?._id && !!currentModule?._id
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ enrollmentId, moduleId }: { enrollmentId: string; moduleId: string }) =>
      updateModuleProgress(enrollmentId, moduleId),
    onSuccess: () => {
      // Invalidate both enrollment and enrolled courses to update progress
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
      toast.success('Module marked as complete!');
    },
    onError: (error) => {
      console.error('Update progress error:', error);
      toast.error('Failed to update progress');
    }
  });

  // Update notes when module changes or notes data is fetched
  useEffect(() => {
    if (notesData?.data) {
      setModuleNotes(notesData.data);
    } else {
      setModuleNotes('');
    }
  }, [notesData, currentModuleIndex]);

  // Handle module completion
  const handleMarkAsComplete = () => {
    if (enrollment && currentModule) {
      updateProgressMutation.mutate({
        enrollmentId: enrollment._id,
        moduleId: currentModule._id
      });
    }
  };

  // Handle saving notes
  const handleSaveNotes = async (notes: string) => {
    if (enrollment && currentModule) {
      try {
        await saveModuleNotes(enrollment._id, currentModule._id, notes);
        queryClient.invalidateQueries({ queryKey: ['moduleNotes', enrollment._id, currentModule._id] });
        toast.success('Notes saved successfully!');
      } catch (error) {
        console.error('Save notes error:', error);
        throw error;
      }
    }
  };

  // Navigation functions
  const goToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const goToNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return enrollment?.completedModules?.some((completed: any) => 
      completed.module === moduleId
    ) || false;
  };

  if (courseLoading || enrollmentLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading course...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Link to="/student/my-courses" className="text-lms-primary hover:underline">
            Back to My Courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/student/my-courses" className="flex items-center text-gray-400 hover:text-white mb-2">
            <ChevronLeft size={16} className="mr-1" />
            Back to My Courses
          </Link>
          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
          <p className="text-gray-400 mt-1">{course.description}</p>
        </div>
        
        {/* Chat with Instructor Button */}
        {course.instructor && (
          <Link
            to={`/student/messages`}
            className="flex items-center px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary/80 transition-colors"
          >
            <MessageSquare size={18} className="mr-2" />
            Chat with Instructor
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course modules sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BookOpen size={18} className="mr-2" />
              Course Modules
            </h3>
            <div className="space-y-2">
              {modules.map((module, index) => (
                <button
                  key={module._id}
                  onClick={() => setCurrentModuleIndex(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    index === currentModuleIndex
                      ? 'bg-lms-primary/20 border-lms-primary text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{module.title}</div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock size={12} className="mr-1" />
                        {module.duration || 0} min
                      </div>
                    </div>
                    {isModuleCompleted(module._id) && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Instructor Info */}
            {course.instructor && (
              <div className="mt-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-2">Instructor</h4>
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                    <p className="text-xs text-gray-400">Course Instructor</p>
                  </div>
                </div>
                <Link
                  to="/student/messages"
                  className="mt-3 w-full flex items-center justify-center px-3 py-2 bg-lms-primary/20 text-lms-primary rounded border border-lms-primary/30 hover:bg-lms-primary/30 transition-colors text-sm"
                >
                  <MessageSquare size={14} className="mr-2" />
                  Send Message
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          {currentModule && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              {/* Module header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentModule.title}</h2>
                    <p className="text-gray-400 mt-1">{currentModule.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowNotes(!showNotes)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        showNotes
                          ? 'bg-lms-primary text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Notes
                    </button>
                    {!isModuleCompleted(currentModule._id) && (
                      <button
                        onClick={handleMarkAsComplete}
                        disabled={updateProgressMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        {updateProgressMutation.isPending ? 'Saving...' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Video player */}
              <div className="aspect-video">
                <VideoPlayer 
                  videoUrl={currentModule.content}
                  title={currentModule.title}
                />
              </div>

              {/* Module navigation */}
              <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                <button
                  onClick={goToPreviousModule}
                  disabled={currentModuleIndex === 0}
                  className="flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} className="mr-2" />
                  Previous
                </button>

                <span className="text-gray-400">
                  Module {currentModuleIndex + 1} of {modules.length}
                </span>

                <button
                  onClick={goToNextModule}
                  disabled={currentModuleIndex === modules.length - 1}
                  className="flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Notes panel */}
          {showNotes && currentModule && enrollment && (
            <div className="mt-6">
              <NotesPanel
                enrollmentId={enrollment._id}
                moduleId={currentModule._id}
                onSaveNotes={handleSaveNotes}
                initialNotes={moduleNotes}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseLearning;
