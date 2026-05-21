
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Clock, Play, Award, CheckCircle, BookOpen, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getEnrolledCourses } from '../../services/courseService';
import { getCourseQuizzes } from '../../services/quizService';
import { getAvailableAttemptsForStudentBatch } from '../../services/submissionService';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Quizzes: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'available' | 'completed'>('available');
  
  const { data: enrolledCoursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: getEnrolledCourses,
  });

  const enrolledCourses = enrolledCoursesData?.data || [];
  
  // Get all quizzes for enrolled courses
  const { data: allQuizzesData, isLoading: quizzesLoading } = useQuery({
    queryKey: ['allCourseQuizzes', enrolledCourses.map((c: any) => c._id)],
    queryFn: async () => {
      const allQuizzes = [];
      for (const course of enrolledCourses) {
        try {
          const courseQuizzes = await getCourseQuizzes(course._id);
          if (courseQuizzes.data) {
            allQuizzes.push(...courseQuizzes.data.map((quiz: any) => ({
              ...quiz,
              courseName: course.title,
              courseProgress: course.progress
            })));
          }
        } catch (error) {
          console.error(`Error fetching quizzes for course ${course._id}:`, error);
        }
      }
      return allQuizzes;
    },
    enabled: enrolledCourses.length > 0,
  });

  const allQuizzes = allQuizzesData || [];
  const quizIds = allQuizzes.map((q: any) => q._id);

  // Get available attempts for all quizzes
  const { data: attemptsData, isLoading: attemptsLoading } = useQuery({
    queryKey: ['availableAttemptsBatch', quizIds],
    queryFn: () => getAvailableAttemptsForStudentBatch(quizIds),
    enabled: quizIds.length > 0,
  });

  const availableAttemptsMap = attemptsData?.data || {};
  
  // Filter quizzes based on course completion and availability
  const availableQuizzes = allQuizzes.filter((quiz: any) => {
    // Show quiz if course is completed or if it's available during course
    return quiz.courseProgress === 100 || !quiz.showAfterModuleComplete;
  });
  
  const completedQuizzes = allQuizzes.filter((quiz: any) => 
    quiz.submissions && quiz.submissions.length > 0
  );

  const handleStartQuiz = (quiz: any) => {
    navigate(`/student/quiz/${quiz._id}`);
  };

  const handleViewResults = (quiz: any) => {
    navigate(`/student/quiz-results/${quiz._id}`);
  };

  const getQuizStatus = (quiz: any) => {
    if (quiz.submissions && quiz.submissions.length > 0) {
      const lastSubmission = quiz.submissions[quiz.submissions.length - 1];
      const passed = lastSubmission.score >= quiz.passScore;
      return passed ? 'passed' : 'failed';
    }
    return 'not-attempted';
  };

  const getAttemptsLeft = (quizId: string) => {
    const attempts = availableAttemptsMap[quizId]?.availableAttempts;
    return typeof attempts === 'number' ? Math.max(0, attempts) : '...';
  };

  if (coursesLoading || quizzesLoading || (quizIds.length > 0 && attemptsLoading)) {
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
        <h1 className="text-3xl font-bold text-white mb-2">Quizzes</h1>
        <p className="text-gray-400">Test your knowledge with course quizzes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{availableQuizzes.length}</p>
              <p className="text-gray-400">Available Quizzes</p>
            </div>
          </div>
        </div>
        
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {completedQuizzes.filter(q => getQuizStatus(q) === 'passed').length}
              </p>
              <p className="text-gray-400">Passed Quizzes</p>
            </div>
          </div>
        </div>
        
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Award className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {completedQuizzes.filter(q => getQuizStatus(q) === 'passed').length}
              </p>
              <p className="text-gray-400">Certificates Eligible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedTab('available')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'available'
              ? 'bg-lms-primary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Available ({availableQuizzes.length})
        </button>
        <button
          onClick={() => setSelectedTab('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'completed'
              ? 'bg-lms-primary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Completed ({completedQuizzes.length})
        </button>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(selectedTab === 'available' ? availableQuizzes : completedQuizzes).map((quiz: any) => {
          const attemptsLeft = getAttemptsLeft(quiz._id);

          return (
            <div key={quiz._id} className="lms-card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">Course: {quiz.courseName}</p>
                  {quiz.description && (
                    <p className="text-sm text-gray-300 mb-3">{quiz.description}</p>
                  )}
                </div>
                <Badge
                  variant={
                    getQuizStatus(quiz) === 'passed' ? 'default' :
                    getQuizStatus(quiz) === 'failed' ? 'destructive' : 'secondary'
                  }
                >
                  {getQuizStatus(quiz) === 'passed' ? 'Passed' :
                   getQuizStatus(quiz) === 'failed' ? 'Failed' : 'Available'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Questions:</span>
                  <span className="text-white">{quiz.questions?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="text-white">{quiz.timeLimit} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pass Score:</span>
                  <span className="text-white">{quiz.passScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Attempts Left:</span>
                  <span className={`text-white font-semibold ${attemptsLeft === 0 ? 'text-red-400' : ''}`}>
                    {attemptsLeft}
                  </span>
                </div>
                {quiz.dueDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Due Date:</span>
                    <span className="text-white">
                      {new Date(quiz.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {quiz.submissions && quiz.submissions.length > 0 && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Last Attempt</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Score:</span>
                    <span className={`font-medium ${
                      quiz.submissions[quiz.submissions.length - 1].score >= quiz.passScore
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {quiz.submissions[quiz.submissions.length - 1].score}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">
                      {new Date(quiz.submissions[quiz.submissions.length - 1].submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {selectedTab === 'available' ? (
                  <Button
                    onClick={() => handleStartQuiz(quiz)}
                    className="flex-1 bg-lms-primary hover:bg-lms-primary-dark"
                  >
                    <Play size={16} className="mr-2" />
                    {quiz.submissions && quiz.submissions.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleViewResults(quiz)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Results
                  </Button>
                )}
                
                {getQuizStatus(quiz) === 'passed' && (
                  <Button
                    onClick={() => navigate('/student/certificates')}
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  >
                    <Award size={16} />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {allQuizzes.length === 0 && (
        <div className="text-center py-12">
          <Clock size={64} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No quizzes available</h3>
          <p className="text-gray-400 mb-4">Enroll in courses to access quizzes</p>
          <Button
            onClick={() => navigate('/student/browse-courses')}
            className="bg-lms-primary hover:bg-lms-primary-dark"
          >
            Browse Courses
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Quizzes;
