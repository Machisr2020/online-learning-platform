
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { getQuizById } from '../../services/quizService';
import { submitQuiz, getAvailableAttemptsForStudent, requestExtraAttempt, checkPendingRequestForQuiz } from '../../services/submissionService';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';

const QuizTaking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false);
  const hasAutoSubmitted = useRef(false);

  const { data: quiz, isLoading: isQuizLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => getQuizById(id!),
    enabled: !!id,
  });

  const { data: availableAttemptsData, isLoading: areAttemptsLoading, refetch: refetchAttempts } = useQuery({
    queryKey: ['availableAttempts', id],
    queryFn: () => getAvailableAttemptsForStudent(id!),
    enabled: !!id,
  });

  const { data: pendingRequestData, refetch: refetchPendingRequest } = useQuery({
    queryKey: ['pendingRequest', id],
    queryFn: () => checkPendingRequestForQuiz(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { quizId: string; answers: any[]; timeSpent: number }) =>
      submitQuiz(data.quizId, data.answers, data.timeSpent),
    onSuccess: (result) => {
      setIsSubmitting(false);
      toast({
        title: "Quiz Submitted",
        description: `You scored ${result.data.score}/${result.data.maxScore} (${result.data.percentage.toFixed(1)}%)`,
      });
      navigate(`/student/quiz-results/${result.data.submissionId}`);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error('Quiz submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit quiz",
        variant: "destructive",
      });
    }
  });

  const requestAttemptMutation = useMutation({
    mutationFn: (data: { quizId: string; reason: string }) => requestExtraAttempt(data.quizId, data.reason),
    onSuccess: () => {
        toast({
            title: "Request Submitted",
            description: "Your request for an extra attempt has been sent to the admin for review.",
        });
        setShowRequestModal(false);
        setRequestReason('');
        refetchAttempts();
        refetchPendingRequest();
    },
    onError: (error: any) => {
        console.error('[RequestAttemptMutation] Full error object:', error);
        
        let errorMessage = 'Failed to submit request';
        
        if (error?.backend?.message) {
            errorMessage = error.backend.message;
        } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        toast({
            title: "Request Failed",
            description: errorMessage,
            variant: "destructive",
        });
    }
  });

  // Initialize timer when quiz loads
  useEffect(() => {
    if (quiz?.data && quiz.data.timeLimit > 0) {
      setTimeLeft(quiz.data.timeLimit * 60);
      setHasStartedQuiz(true);
    }
  }, [quiz]);

  // Timer countdown effect - only auto-submit if user has answered at least one question
  useEffect(() => {
    if (timeLeft > 0 && hasStartedQuiz && !isSubmitting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz?.data && !hasAutoSubmitted.current && !isSubmitting && hasStartedQuiz) {
      // Check if user has answered at least one question before auto-submitting
      const hasAnswers = Object.keys(answers).length > 0 && Object.values(answers).some(answer => answer && answer.trim() !== '');
      
      if (hasAnswers) {
        hasAutoSubmitted.current = true;
        handleSubmit(true);
      } else {
        // If no answers, just show a warning and don't auto-submit
        toast({
          title: "Time's Up!",
          description: "Please answer at least one question before submitting.",
          variant: "destructive",
        });
        // Reset timer to give user a chance to answer
        setTimeLeft(60); // Give 1 more minute
      }
    }
  }, [timeLeft, quiz?.data, isSubmitting, hasStartedQuiz, answers]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const hasAtLeastOneAnswer = () => {
    return Object.keys(answers).length > 0 && Object.values(answers).some(answer => answer && answer.trim() !== '');
  };

  const handleSubmit = (isAutoSubmit = false) => {
    if (!quiz?.data || !id || isSubmitting) return;

    // Check if user has answered at least one question
    if (!hasAtLeastOneAnswer() && !isAutoSubmit) {
      toast({
        title: "No Answers Provided",
        description: "Please answer at least one question before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting quiz:', { isAutoSubmit, timeLeft, hasAutoSubmitted: hasAutoSubmitted.current });
    
    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    if (isAutoSubmit) {
      toast({
        title: "Time's Up!",
        description: "Quiz auto-submitted due to time limit.",
        variant: "default",
      });
    }

    submitMutation.mutate({
      quizId: id,
      answers: formattedAnswers,
      timeSpent
    });
  };

  const handleRequestSubmit = () => {
    if (id && requestReason.trim()) {
        console.log('[QuizTaking] Submitting request with:', { 
          quizId: id, 
          reason: requestReason.trim() 
        });
        requestAttemptMutation.mutate({ 
          quizId: String(id).trim(), 
          reason: requestReason.trim()
        });
    } else {
        toast({
            title: "Error",
            description: "Please provide a valid reason for your request",
            variant: "destructive",
        });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isQuizLoading || areAttemptsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading quiz...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz?.data) {
    return (
      <DashboardLayout>
        <div className="text-center text-white">Quiz not found</div>
      </DashboardLayout>
    );
  }

  const availableAttempts = availableAttemptsData?.data?.availableAttempts ?? 0;
  const hasPendingRequest = pendingRequestData?.data?.hasPendingRequest || false;
  
  // Show no attempts left page
  if (!areAttemptsLoading && availableAttempts <= 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="lms-card">
            <div className="p-8">
              <AlertCircle size={64} className="mx-auto text-red-400 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Attempts Remaining</h2>
              <p className="text-gray-300 mb-6">
                You have used all available attempts for "{quiz.data.title}". 
                {availableAttemptsData?.data && (
                  <span className="block mt-2 text-sm text-gray-400">
                    Attempts used: {availableAttemptsData.data.submissionsCount} / {availableAttemptsData.data.totalAllowedAttempts}
                  </span>
                )}
              </p>
              
              {hasPendingRequest ? (
                <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6">
                  <p className="text-blue-400">
                    ✓ Your request for an extra attempt has been submitted and is pending admin review.
                  </p>
                </div>
              ) : (
                <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-lms-primary hover:bg-lms-primary-dark mb-4">
                      Request Extra Attempt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-lms-card border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Request Extra Attempt</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Please provide a detailed reason for requesting an extra attempt. This will be reviewed by an administrator.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason" className="text-gray-400">
                          Reason for Request *
                        </Label>
                        <Textarea
                          id="reason"
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                          className="bg-gray-800 border-gray-600 min-h-[100px]"
                          placeholder="Please explain why you need an extra attempt (e.g., technical issues, personal circumstances, etc.)"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setShowRequestModal(false);
                          setRequestReason('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleRequestSubmit} 
                        disabled={requestAttemptMutation.isPending || !requestReason.trim()}
                        className="bg-lms-primary hover:bg-lms-primary-dark"
                      >
                        {requestAttemptMutation.isPending ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={() => navigate('/student/quizzes')}
                  variant="outline"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Quizzes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{quiz.data.title}</h1>
            <p className="text-gray-400">{quiz.data.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              Attempts remaining: {availableAttempts}
            </p>
          </div>
          <div className="flex items-center bg-lms-card rounded-lg px-4 py-2">
            <Clock size={20} className="text-lms-primary mr-2" />
            <span className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {timeLeft < 300 && timeLeft > 0 && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle size={20} className="text-red-400 mr-2" />
            <span className="text-red-400">Warning: Less than 5 minutes remaining!</span>
          </div>
        )}

        <div className="space-y-6">
          {quiz.data.questions.map((question: any, index: number) => (
            <Card key={question._id} className="bg-lms-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Question {index + 1}: {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.questionType === 'multiple-choice' && question.options.map((option: string, optionIndex: number) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question._id}-${optionIndex}`}
                        checked={answers[question._id] === option}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleAnswerChange(question._id, option);
                          }
                        }}
                      />
                      <label
                        htmlFor={`${question._id}-${optionIndex}`}
                        className="text-gray-300 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                  
                  {question.questionType === 'true-false' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question._id}-true`}
                          checked={answers[question._id] === 'true'}
                          onCheckedChange={(checked) => {
                            if (checked) handleAnswerChange(question._id, 'true');
                          }}
                        />
                        <label htmlFor={`${question._id}-true`} className="text-gray-300 cursor-pointer">
                          True
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question._id}-false`}
                          checked={answers[question._id] === 'false'}
                          onCheckedChange={(checked) => {
                            if (checked) handleAnswerChange(question._id, 'false');
                          }}
                        />
                        <label htmlFor={`${question._id}-false`} className="text-gray-300 cursor-pointer">
                          False
                        </label>
                      </div>
                    </div>
                  )}

                  {question.questionType === 'short-answer' && (
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                      placeholder="Type your answer here..."
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || timeLeft === 0 || !hasAtLeastOneAnswer()}
            className="bg-lms-primary hover:bg-lms-primary-dark text-white px-8 py-3 text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            {!hasAtLeastOneAnswer() && (
              <span className="ml-2 text-xs">(Answer at least one question)</span>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuizTaking;
