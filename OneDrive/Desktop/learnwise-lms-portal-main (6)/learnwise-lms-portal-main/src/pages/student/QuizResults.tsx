
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CheckCircle, XCircle, ArrowLeft, RotateCcw, Download, Award } from 'lucide-react';
import { getSubmissionById, getQuizAttemptsForStudent } from '../../services/submissionService';
import { useAuth } from '../../context/AuthContext';
import { downloadCertificate } from '../../services/certificateService';

const QuizResults: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log('QuizResults - submissionId:', submissionId);

  const { data: submissionResponse, isLoading: submissionLoading, error: submissionError } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => getSubmissionById(submissionId!),
    enabled: !!submissionId,
    retry: 2,
  });

  const quizId = submissionResponse?.data?.quiz?._id;

  const { data: attemptsResponse, isLoading: attemptsLoading } = useQuery({
    queryKey: ['quizAttempts', quizId],
    queryFn: () => getQuizAttemptsForStudent(quizId!),
    enabled: !!quizId,
  });

  if (submissionLoading || (!!quizId && attemptsLoading)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading results...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (submissionError || !submissionResponse?.data) {
    console.error('Error loading submission:', submissionError);
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            {submissionError ? 'Error Loading Results' : 'Results not found'}
          </h2>
          <p className="text-gray-400 mb-4">
            {submissionError 
              ? 'There was an error loading your quiz results. Please try again.'
              : 'The quiz results you are looking for could not be found.'
            }
          </p>
          <Button
            onClick={() => navigate('/student/quizzes')}
            variant="outline"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Quizzes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const submissionData = submissionResponse.data;
  const quizData = submissionData.quiz;
  const percentage = (submissionData.score / submissionData.maxScore) * 100;
  const attemptsCount = attemptsResponse?.count ?? 0;
  const canRetry = quizData.maxAttempts > attemptsCount;

  const handleDownloadCertificate = () => {
    if (quizData.course && user) {
        const certificate = {
            certificateId: `CERT-${quizData.course._id.toString().slice(-4)}-${Date.now().toString().slice(-6)}`,
            course: {
                title: quizData.course.title
            },
            issuedAt: new Date().toISOString()
        };
        const userName = `${user.firstName} ${user.lastName}`;
        downloadCertificate(certificate, userName);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/student/quizzes')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Quizzes
          </Button>
          
          <h1 className="text-3xl font-bold text-white">{quizData.title} - Results</h1>
        </div>

        <Card className="bg-lms-card border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Quiz Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-lms-primary">{submissionData.score}</div>
                <div className="text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{submissionData.maxScore}</div>
                <div className="text-gray-400">Total Points</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${percentage >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-gray-400">Percentage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${submissionData.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {submissionData.passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="text-gray-400">Result</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Question Review</h2>
          
          {quizData.questions.map((question: any, index: number) => {
            const userAnswer = submissionData.answers.find((a: any) => a.questionId === question._id);
            const isCorrect = (() => {
              if (!userAnswer || !userAnswer.answer) return false;
              const correctAnswer = question.correctAnswer;
              if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
                  return userAnswer.answer === correctAnswer;
              } else if (question.questionType === 'short-answer') {
                  return typeof userAnswer.answer === 'string' && typeof correctAnswer === 'string' && userAnswer.answer.toLowerCase() === correctAnswer.toLowerCase();
              }
              return false;
            })();
            
            return (
              <Card key={question._id} className="bg-lms-card border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-3">Question {index + 1}</span>
                    {isCorrect ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : (
                      <XCircle size={20} className="text-red-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">{question.question}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-400 mr-2">Your Answer:</span>
                        <span className={`${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {userAnswer?.answer || 'Not answered'}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-400 mr-2">Correct Answer:</span>
                          <span className="text-green-400">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {submissionData.passed ? (
            <Card className="bg-lms-card border-gray-700 mt-8">
                <CardHeader>
                    <CardTitle className="text-white flex items-center"><Award className="mr-2 text-yellow-400" /> Certificate Unlocked!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300 mb-4">Congratulations! You passed the quiz. You can now download your certificate of completion.</p>
                    <Button onClick={handleDownloadCertificate} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Download size={16} className="mr-2" />
                        Download Certificate
                    </Button>
                </CardContent>
            </Card>
        ) : (
            <Card className="bg-lms-card border-gray-700 mt-8">
                <CardHeader>
                    <CardTitle className="text-white">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    {canRetry ? (
                      <Button
                        onClick={() => navigate(`/student/quiz/${quizData._id}`)}
                        className="bg-lms-primary hover:bg-lms-primary-dark text-white"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Retry Quiz ({quizData.maxAttempts - attemptsCount} attempt(s) left)
                      </Button>
                    ) : (
                      <p className="text-gray-400">You have reached the maximum number of attempts.</p>
                    )}
                    {quizData.course?._id &&
                      <Button
                          onClick={() => navigate(`/student/course-learning/${quizData.course._id}`)}
                          variant="outline"
                      >
                          Review Course Material
                      </Button>
                    }
                </CardContent>
            </Card>
        )}

      </div>
    </DashboardLayout>
  );
};

export default QuizResults;
