import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CheckCircle, Eye, Filter, MessageSquare, X, Video, Clock, User, Calendar, FileText, AlertTriangle, HelpCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { getPendingQuizzes, approveQuiz, rejectQuiz } from '../../services/quizService';
import { getPendingAttemptRequests, approveAttemptRequest, rejectAttemptRequest } from '../../services/submissionService';

interface PendingCourse {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category: string;
  level: string;
  modules: Array<{
    title: string;
    description: string;
    contentType: string;
    duration: number;
  }>;
  duration: number;
  price: number;
  createdAt: string;
  thumbnail: string;
}

interface PendingQuiz {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  questions: Array<any>;
  timeLimit: number;
  passScore: number;
  maxAttempts: number;
  dueDate?: string;
  createdAt: string;
}

interface PendingAttemptRequest {
  _id: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  quiz: {
    title: string;
  };
  reason: string;
  requestedAt: string;
}

const Approvals: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter state
  const [filterType, setFilterType] = useState<string>('courses');
  const [selectedItem, setSelectedItem] = useState<PendingCourse | PendingQuiz | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [itemType, setItemType] = useState<'course' | 'quiz' | 'request'>('course');

  // Fetch pending courses
  const { data: pendingCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['pendingCourses'],
    queryFn: async () => {
      const response = await api.get('/courses/pending/approval');
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Fetch pending quizzes
  const { data: pendingQuizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ['pendingQuizzes'],
    queryFn: getPendingQuizzes,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Fetch pending attempt requests
  const { data: pendingAttemptRequestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['pendingAttemptRequests'],
    queryFn: getPendingAttemptRequests,
    refetchInterval: 30000,
  });

  // Add debug log to inspect raw data
  useEffect(() => {
    if (pendingAttemptRequestsData) {
      console.log('[Admin Approvals] Pending attempt requests raw:', pendingAttemptRequestsData);
    }
  }, [pendingAttemptRequestsData]);

  // Approve course mutation
  const approveMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.put(`/courses/${courseId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course approved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingCourses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve course",
        variant: "destructive",
      });
    },
  });

  // Reject course mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ courseId, reason }: { courseId: string; reason: string }) => {
      const response = await api.put(`/courses/${courseId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course rejected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingCourses'] });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject course",
        variant: "destructive",
      });
    },
  });

  // Approve quiz mutation
  const approveQuizMutation = useMutation({
    mutationFn: approveQuiz,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz approved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingQuizzes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve quiz",
        variant: "destructive",
      });
    },
  });

  // Reject quiz mutation
  const rejectQuizMutation = useMutation({
    mutationFn: ({ quizId, reason }: { quizId: string; reason: string }) => rejectQuiz(quizId, reason),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz rejected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingQuizzes'] });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject quiz",
        variant: "destructive",
      });
    },
  });

  // Approve and Reject Attempt Request Mutations
  const approveAttemptRequestMutation = useMutation({
    mutationFn: approveAttemptRequest,
    onSuccess: () => {
      toast({ title: "Success", description: "Attempt request approved!" });
      queryClient.invalidateQueries({ queryKey: ['pendingAttemptRequests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  const rejectAttemptRequestMutation = useMutation({
    mutationFn: rejectAttemptRequest,
    onSuccess: () => {
      toast({ title: "Success", description: "Attempt request rejected." });
      queryClient.invalidateQueries({ queryKey: ['pendingAttemptRequests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string, type: 'course' | 'quiz' | 'request') => {
    if (type === 'course') {
      approveMutation.mutate(id);
    } else if (type === 'quiz') {
      approveQuizMutation.mutate(id);
    } else if (type === 'request') {
      approveAttemptRequestMutation.mutate(id);
    }
  };

  const handleReject = (item: PendingCourse | PendingQuiz | PendingAttemptRequest, type: 'course' | 'quiz' | 'request') => {
    setSelectedItem(item as any);
    setItemType(type);
    if (type === 'request') {
      rejectAttemptRequestMutation.mutate(item._id); // For now, reject without modal/reason
    } else {
      setShowRejectModal(true);
    }
  };

  const confirmReject = () => {
    if (selectedItem) {
      if (itemType === 'course') {
        rejectMutation.mutate({
          courseId: selectedItem._id,
          reason: rejectReason
        });
      } else {
        rejectQuizMutation.mutate({
          quizId: selectedItem._id,
          reason: rejectReason
        });
      }
    }
  };

  const handleView = (item: PendingCourse | PendingQuiz | PendingAttemptRequest, type: string) => {
    console.log(`View ${type} details:`, item);
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Details`,
      description: `Viewing details for "${'title' in item ? item.title : `request by ${item.student.firstName}`}"`,
    });
  };

  const isLoading = coursesLoading || quizzesLoading || requestsLoading;
  const courses = pendingCourses || [];
  const quizzes = pendingQuizzes?.data || [];
  const requests = pendingAttemptRequestsData?.data || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lms-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Approvals</h1>
        <p className="text-gray-400">Review and manage course and quiz submissions from instructors</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setFilterType('courses')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterType === 'courses'
                ? 'bg-lms-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilterType('quizzes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterType === 'quizzes'
                ? 'bg-lms-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setFilterType('requests')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterType === 'requests'
                ? 'bg-lms-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Attempt Requests ({requests.length})
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="lms-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-900/30 mr-4">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Pending Courses</p>
              <p className="text-2xl font-bold text-white">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="lms-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-900/30 mr-4">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Pending Quizzes</p>
              <p className="text-2xl font-bold text-white">{quizzes.length}</p>
            </div>
          </div>
        </div>
        <div className="lms-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-900/30 mr-4">
              <HelpCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-white">{requests.length}</p>
            </div>
          </div>
        </div>
        <div className="lms-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-900/30 mr-4">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Approved Today</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content based on filter */}
      <div className="space-y-6">
        {filterType === 'courses' && (
          <>
            {courses.length > 0 ? (
              courses.map((course: PendingCourse) => (
                <div key={course._id} className="lms-card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
                          <div className="flex items-center text-sm text-gray-400 space-x-4">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
{course.instructor?.firstName || 'Unknown'} {course.instructor?.lastName || 'User'}                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="text-sm text-white">{course.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Level</p>
                          <p className="text-sm text-white">{course.level}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Modules</p>
                          <p className="text-sm text-white">{course.modules?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm text-white">{Math.floor((course.duration || 0) / 60)}h {(course.duration || 0) % 60}m</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-sm text-white">₹{course.price || 0}</p>
                        </div>
                      </div>

                      {/* Modules Preview */}
                      {course.modules && course.modules.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-400 mb-2">Course Modules:</p>
                          <div className="space-y-1">
                            {course.modules.slice(0, 3).map((module, index) => (
                              <div key={index} className="text-sm text-gray-300 flex items-center">
                                <div className="w-1 h-1 bg-lms-primary rounded-full mr-2"></div>
                                {module.title} ({module.duration || 0} min)
                              </div>
                            ))}
                            {course.modules.length > 3 && (
                              <div className="text-sm text-gray-400">
                                +{course.modules.length - 3} more modules
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-800 mt-4">
                    <button 
                      onClick={() => handleView(course, 'course')}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center text-sm"
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handleReject(course, 'course')}
                      disabled={rejectMutation.isPending}
                      className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-md flex items-center text-sm disabled:opacity-50"
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(course._id, 'course')}
                      disabled={approveMutation.isPending}
                      className="px-4 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 hover:text-green-300 rounded-md flex items-center text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="lms-card text-center py-12">
                <CheckCircle size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-white mb-1">No pending course approvals</h3>
                <p className="text-gray-400">All course submissions have been reviewed</p>
              </div>
            )}
          </>
        )}

        {filterType === 'quizzes' && (
          <>
            {quizzes.length > 0 ? (
              quizzes.map((quiz: PendingQuiz) => (
                <div key={quiz._id} className="lms-card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{quiz.title}</h3>
                          <div className="flex items-center text-sm text-gray-400 space-x-4">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {quiz.createdBy.firstName} {quiz.createdBy.lastName}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-2">{quiz.description}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Course</p>
                          <p className="text-sm text-white">{quiz.course?.title || 'No Course'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Questions</p>
                          <p className="text-sm text-white">{quiz.questions?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time Limit</p>
                          <p className="text-sm text-white">{quiz.timeLimit} min</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pass Score</p>
                          <p className="text-sm text-white">{quiz.passScore}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Max Attempts</p>
                          <p className="text-sm text-white">{quiz.maxAttempts}</p>
                        </div>
                      </div>

                      {quiz.dueDate && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-400 mb-1">Due Date:</p>
                          <p className="text-sm text-white">{new Date(quiz.dueDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-800 mt-4">
                    <button 
                      onClick={() => handleView(quiz, 'quiz')}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center text-sm"
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handleReject(quiz, 'quiz')}
                      disabled={rejectQuizMutation.isPending}
                      className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-md flex items-center text-sm disabled:opacity-50"
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(quiz._id, 'quiz')}
                      disabled={approveQuizMutation.isPending}
                      className="px-4 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 hover:text-green-300 rounded-md flex items-center text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="lms-card text-center py-12">
                <CheckCircle size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-white mb-1">No pending quiz approvals</h3>
                <p className="text-gray-400">All quiz submissions have been reviewed</p>
              </div>
            )}
          </>
        )}
        
        {filterType === 'requests' && (
          <>
            {Array.isArray(requests) && requests.length > 0 ? (
              requests.map((request: PendingAttemptRequest) => (
                <div key={request._id} className="lms-card">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                        <HelpCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Extra Attempt Request</h3>
                        <div className="flex items-center text-sm text-gray-400 space-x-4">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {request.student.firstName} {request.student.lastName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-l-4 border-gray-700 pl-4 py-2 mb-4">
                        <p className="text-xs text-gray-500">Quiz</p>
                        <p className="text-md text-white font-semibold mb-2">{request.quiz.title}</p>
                        <p className="text-xs text-gray-500">Reason Provided</p>
                        <p className="text-gray-300 italic">"{request.reason}"</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-800 mt-4">
                    <button 
                      onClick={() => handleReject(request, 'request')}
                      disabled={rejectAttemptRequestMutation.isPending}
                      className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-md flex items-center text-sm disabled:opacity-50"
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(request._id, 'request')}
                      disabled={approveAttemptRequestMutation.isPending}
                      className="px-4 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 hover:text-green-300 rounded-md flex items-center text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="lms-card text-center py-12">
                <CheckCircle size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-white mb-1">
                  No pending attempt requests <span className="font-normal text-base text-gray-400 block">Debug: {Array.isArray(requests) ? 'requests array is empty' : 'pendingAttemptRequestsData structure invalid'}</span>
                </h3>
                <pre className="text-xs text-gray-400 bg-gray-800 p-2 rounded mt-3 overflow-x-auto">
                  {JSON.stringify(pendingAttemptRequestsData, null, 2)}
                </pre>
                <p className="text-gray-400 mt-2">All student requests have been reviewed</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Reject {itemType === 'course' ? 'Course' : 'Quiz'}
            </h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to reject "{selectedItem?.title}"?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedItem(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejectMutation.isPending || rejectQuizMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {(rejectMutation.isPending || rejectQuizMutation.isPending) ? 'Rejecting...' : `Reject ${itemType === 'course' ? 'Course' : 'Quiz'}`}
              </button>
            </div>
          </div>
          // Around line 398 and similar places, add null checks:

// For courses mapping:
{courses.map((course: PendingCourse) => (
  <div key={course._id} className="lms-card">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
        <p className="text-gray-400 mb-3">{course.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-sm">
            {course.category}
          </span>
          <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-sm">
            {course.level}
          </span>
          <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-sm">
            ${course.price}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <User className="h-4 w-4 mr-1" />
          <span>
            {course.instructor?.firstName || 'Unknown'} {course.instructor?.lastName || 'User'}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{new Date(course.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
    {/* Rest of your course component */}
  </div>
))}

// For attempt requests mapping (if you have it):
{requests.map((request: PendingAttemptRequest) => (
  <div key={request._id} className="lms-card">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-2">
          Quiz Attempt Request
        </h3>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <User className="h-4 w-4 mr-1" />
          <span>
            {request.student?.firstName || 'Unknown'} {request.student?.lastName || 'Student'}
          </span>
        </div>
        <div className="text-gray-400 mb-2">
          Quiz: {request.quiz?.title || 'Unknown Quiz'}
        </div>
        <p className="text-gray-300 mb-3">{request.reason}</p>
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
    {/* Rest of your request component */}
  </div>
))}
        </div>
        
      )}
    </DashboardLayout>
  );
};

export default Approvals;
