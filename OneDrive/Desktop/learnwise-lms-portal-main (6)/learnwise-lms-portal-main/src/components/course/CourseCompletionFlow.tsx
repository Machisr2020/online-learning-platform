
import React, { useState } from 'react';
import { Award, Star, BookOpen, Download, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submitCourseRating } from '../../services/courseService';
import { getCourseQuizzes } from '../../services/quizService';
import { getMyCertificates, downloadCertificate } from '../../services/certificateService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CourseCompletionFlowProps {
  course: any;
  enrollment: any;
  onClose: () => void;
}

const CourseCompletionFlow: React.FC<CourseCompletionFlowProps> = ({
  course,
  enrollment,
  onClose
}) => {
  const [step, setStep] = useState<'rating' | 'quizzes' | 'certificate'>('rating');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(enrollment.rated || false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch course quizzes
  const { data: quizzesData } = useQuery({
    queryKey: ['courseQuizzes', course._id],
    queryFn: () => getCourseQuizzes(course._id),
    enabled: hasRated
  });

  // Fetch certificates
  const { data: certificatesData } = useQuery({
    queryKey: ['myCertificates'],
    queryFn: getMyCertificates,
    enabled: step === 'certificate'
  });

  const courseCertificate = certificatesData?.data?.find(
    (cert: any) => cert.course._id === course._id
  );

  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: submitCourseRating,
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this course!"
      });
      setHasRated(true);
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
      setStep('quizzes');
    },
    onError: (error: any) => {
      toast({
        title: "Rating failed",
        description: error.response?.data?.message || "Failed to submit rating",
        variant: "destructive"
      });
    }
  });

  const handleSubmitRating = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive"
      });
      return;
    }

    submitRatingMutation.mutate({
      courseId: course._id,
      rating,
      comment
    });
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/student/quiz/${quizId}`);
  };

  const handleDownloadCertificate = () => {
    if (courseCertificate) {
      const userName = `${user?.firstName} ${user?.lastName}`;
      downloadCertificate(courseCertificate, userName);
    }
  };

  const availableQuizzes = quizzesData?.data || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Award className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Course Completed!</h2>
                <p className="text-gray-400">Congratulations on completing {course.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'rating' ? 'text-lms-primary' : hasRated ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${hasRated ? 'bg-green-500 border-green-500' : step === 'rating' ? 'border-lms-primary' : 'border-gray-600'}`}>
                {hasRated ? <CheckCircle size={16} /> : '1'}
              </div>
              <span className="text-sm font-medium">Rate Course</span>
            </div>
            <div className={`w-8 h-0.5 ${hasRated ? 'bg-green-400' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center space-x-2 ${step === 'quizzes' ? 'text-lms-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'quizzes' ? 'border-lms-primary' : 'border-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Take Quizzes</span>
            </div>
            <div className={`w-8 h-0.5 ${step === 'certificate' ? 'bg-lms-primary' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center space-x-2 ${step === 'certificate' ? 'text-lms-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'certificate' ? 'border-lms-primary' : 'border-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Get Certificate</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Rating Step */}
          {step === 'rating' && !hasRated && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Rate Your Experience</h3>
                <p className="text-gray-400">Help other students by sharing your feedback</p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'
                    }`}
                  >
                    <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Share your thoughts (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like about this course?"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lms-primary"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setStep('quizzes')}
                  variant="outline"
                >
                  Skip Rating
                </Button>
                <Button
                  onClick={handleSubmitRating}
                  disabled={submitRatingMutation.isPending}
                  className="bg-lms-primary hover:bg-lms-primary-dark"
                >
                  {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </div>
            </div>
          )}

          {/* Quizzes Step */}
          {(step === 'quizzes' || hasRated) && step !== 'certificate' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Complete Course Quizzes</h3>
                <p className="text-gray-400">Test your knowledge and earn your certificate</p>
              </div>

              {availableQuizzes.length > 0 ? (
                <div className="grid gap-4">
                  {availableQuizzes.map((quiz: any) => (
                    <div key={quiz._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{quiz.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{quiz.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{quiz.questions?.length || 0} questions</span>
                            <span>{quiz.timeLimit} minutes</span>
                            <span>Pass: {quiz.passScore}%</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartQuiz(quiz._id)}
                          size="sm"
                          className="bg-lms-primary hover:bg-lms-primary-dark"
                        >
                          Start Quiz
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No quizzes available for this course</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setStep('certificate')}
                  className="bg-lms-primary hover:bg-lms-primary-dark"
                >
                  Continue to Certificate
                </Button>
              </div>
            </div>
          )}

          {/* Certificate Step */}
          {step === 'certificate' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Your Certificate</h3>
                <p className="text-gray-400">Download your course completion certificate</p>
              </div>

              {courseCertificate ? (
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30">
                  <div className="text-center">
                    <Award size={48} className="mx-auto text-yellow-400 mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Certificate of Completion</h4>
                    <p className="text-gray-300 mb-4">
                      Congratulations! You have successfully completed {course.title}
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                      Certificate ID: {courseCertificate.certificateId}
                    </p>
                    <Button
                      onClick={handleDownloadCertificate}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Download size={16} className="mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <Award size={48} className="mx-auto text-gray-500 mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Certificate Pending</h4>
                    <p className="text-gray-400 mb-4">
                      Complete all course quizzes with passing scores to earn your certificate
                    </p>
                    <Button
                      onClick={() => setStep('quizzes')}
                      variant="outline"
                    >
                      Back to Quizzes
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCompletionFlow;
