import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Edit, Trash2, Eye, Users, Clock, Calendar, FileText, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getInstructorQuizzes, createQuiz, updateQuiz, deleteQuiz, extractQuestionsFromPDF } from '../../services/quizService';
import { getInstructorCourses } from '../../services/courseService';
import { toast } from 'sonner';

interface Question {
  question: string;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[];
  correctAnswer: string | string[];
  points: number;
}

const QuizManager: React.FC = () => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  // Form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    course: '',
    timeLimit: 30,
    passScore: 70,
    maxAttempts: 1,
    dueDate: '',
    questions: [] as Question[]
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    questionType: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });

  // Fetch instructor's quizzes
  const { data: quizzesData, isLoading: quizzesLoading, refetch: refetchQuizzes } = useQuery({
    queryKey: ['instructorQuizzes'],
    queryFn: getInstructorQuizzes,
    enabled: !!authState.user
  });

  // Fetch instructor's courses
  const { data: coursesData } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: getInstructorCourses,
    enabled: !!authState.user
  });

  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (response) => {
      console.log('Quiz created successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['instructorQuizzes'] });
      toast.success('Quiz created successfully and sent for approval!');
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create quiz error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create quiz';
      toast.error(errorMessage);
    }
  });

  // Update quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateQuiz(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorQuizzes'] });
      toast.success('Quiz updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update quiz error:', error);
      toast.error('Failed to update quiz');
    }
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorQuizzes'] });
      toast.success('Quiz deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete quiz error:', error);
      toast.error('Failed to delete quiz');
    }
  });

  const resetForm = () => {
    setQuizForm({
      title: '',
      description: '',
      course: '',
      timeLimit: 30,
      passScore: 70,
      maxAttempts: 1,
      dueDate: '',
      questions: []
    });
    setCurrentQuestion({
      question: '',
      questionType: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploadingPDF(true);
    try {
      const response = await extractQuestionsFromPDF(file);
      if (response.success && response.data.questions) {
        setQuizForm(prev => ({
          ...prev,
          questions: [...prev.questions, ...response.data.questions]
        }));
        toast.success(`${response.data.questions.length} questions extracted from PDF!`);
      } else {
        toast.error('Failed to extract questions from PDF');
      }
    } catch (error: any) {
      console.error('PDF extraction error:', error);
      toast.error('Failed to process PDF file');
    } finally {
      setUploadingPDF(false);
      event.target.value = '';
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (currentQuestion.questionType === 'multiple-choice' && currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('Please fill all options for multiple choice questions');
      return;
    }

    if (!currentQuestion.correctAnswer) {
      toast.error('Please set the correct answer');
      return;
    }

    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      question: '',
      questionType: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });

    toast.success('Question added successfully!');
  };

  const removeQuestion = (index: number) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title.trim()) {
      toast.error('Please enter quiz title');
      return;
    }

    if (!quizForm.course) {
      toast.error('Please select a course');
      return;
    }

    if (quizForm.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Ensure proper data structure for backend
    const quizData = {
      title: quizForm.title.trim(),
      description: quizForm.description.trim(),
      course: quizForm.course,
      timeLimit: Number(quizForm.timeLimit),
      passScore: Number(quizForm.passScore),
      maxAttempts: Number(quizForm.maxAttempts),
      dueDate: quizForm.dueDate ? new Date(quizForm.dueDate).toISOString() : null,
      questions: quizForm.questions.map(q => ({
        question: q.question.trim(),
        questionType: q.questionType,
        options: q.questionType === 'multiple-choice' ? q.options.filter(opt => opt.trim()) : [],
        correctAnswer: q.correctAnswer,
        points: Number(q.points)
      })),
      status: 'pending'
    };

    console.log('Creating quiz with data:', quizData);
    createQuizMutation.mutate(quizData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400"><CheckCircle size={12} className="mr-1" />Published</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400"><AlertCircle size={12} className="mr-1" />Pending Approval</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400"><FileText size={12} className="mr-1" />Draft</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400"><XCircle size={12} className="mr-1" />Archived</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">Unknown</span>;
    }
  };

  const quizzes = quizzesData?.data || [];
  const courses = coursesData?.data || [];

  if (quizzesLoading) {
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Manager</h1>
          <p className="text-gray-400">Create and manage quizzes for your courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary/80 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Create Quiz
        </button>
      </div>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="lms-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-white">{quizzes.length}</p>
            </div>
            <FileText className="text-lms-primary" size={32} />
          </div>
        </div>
        <div className="lms-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Published</p>
              <p className="text-2xl font-bold text-white">{quizzes.filter((q: any) => q.status === 'published').length}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="lms-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-white">{quizzes.filter((q: any) => q.status === 'pending').length}</p>
            </div>
            <AlertCircle className="text-yellow-400" size={32} />
          </div>
        </div>
        <div className="lms-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Drafts</p>
              <p className="text-2xl font-bold text-white">{quizzes.filter((q: any) => q.status === 'draft').length}</p>
            </div>
            <FileText className="text-gray-400" size={32} />
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="lms-card">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Your Quizzes</h2>
        </div>
        <div className="p-6">
          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">No quizzes yet</h3>
              <p className="text-gray-400 mb-4">Create your first quiz to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-lms-primary text-white rounded-lg hover:bg-lms-primary/80 transition-colors"
              >
                Create Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz: any) => (
                <div key={quiz._id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{quiz.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{quiz.course?.title || 'No Course'}</p>
                      <p className="text-sm text-gray-400 line-clamp-2">{quiz.description}</p>
                    </div>
                    {getStatusBadge(quiz.status)}
                  </div>

                  <div className="flex items-center text-sm text-gray-400 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {quiz.timeLimit} min
                    </div>
                    <div className="flex items-center">
                      <FileText size={14} className="mr-1" />
                      {quiz.questions?.length || 0} questions
                    </div>
                    {quiz.dueDate && (
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(quiz.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setShowViewModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {quiz.status === 'draft' && (
                        <button
                          onClick={() => {
                            setQuizForm({
                              title: quiz.title,
                              description: quiz.description,
                              course: quiz.course?._id || '',
                              timeLimit: quiz.timeLimit,
                              passScore: quiz.passScore,
                              maxAttempts: quiz.maxAttempts,
                              dueDate: quiz.dueDate ? new Date(quiz.dueDate).toISOString().split('T')[0] : '',
                              questions: quiz.questions || []
                            });
                            setShowCreateModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          title="Edit Quiz"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this quiz?')) {
                            deleteQuizMutation.mutate(quiz._id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Users size={14} className="mr-1" />
                      {quiz.submissions?.length || 0} submissions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Create Quiz</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Quiz Title *</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Course *</label>
                  <select
                    value={quizForm.course}
                    onChange={(e) => setQuizForm({ ...quizForm, course: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course: any) => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Pass Score (%)</label>
                  <input
                    type="number"
                    value={quizForm.passScore}
                    onChange={(e) => setQuizForm({ ...quizForm, passScore: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Attempts</label>
                  <input
                    type="number"
                    value={quizForm.maxAttempts}
                    onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={quizForm.dueDate}
                    onChange={(e) => setQuizForm({ ...quizForm, dueDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  rows={3}
                  placeholder="Enter quiz description"
                />
              </div>

              {/* PDF Upload Section */}
              <div className="mb-6 p-4 border border-dashed border-gray-600 rounded-lg">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <h3 className="text-lg font-semibold text-white mb-2">Upload PDF to Extract Questions</h3>
                  <p className="text-gray-400 mb-4">Upload a PDF file to automatically extract quiz questions</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    disabled={uploadingPDF}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`inline-flex items-center px-4 py-2 bg-lms-primary text-white rounded cursor-pointer hover:bg-lms-primary/80 transition-colors ${
                      uploadingPDF ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload size={16} className="mr-2" />
                    {uploadingPDF ? 'Processing PDF...' : 'Choose PDF File'}
                  </label>
                </div>
              </div>

              {/* Add Question Section */}
              <div className="border border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add Question Manually</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Question Type</label>
                    <select
                      value={currentQuestion.questionType}
                      onChange={(e) => setCurrentQuestion({ 
                        ...currentQuestion, 
                        questionType: e.target.value as 'multiple-choice' | 'true-false' | 'short-answer',
                        options: e.target.value === 'true-false' ? ['True', 'False'] : ['', '', '', ''],
                        correctAnswer: ''
                      })}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="short-answer">Short Answer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Points</label>
                    <input
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                      min="1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Question *</label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    rows={3}
                    placeholder="Enter your question"
                  />
                </div>

                {currentQuestion.questionType === 'multiple-choice' && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Options *</label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary mr-2"
                          placeholder={`Option ${index + 1}`}
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === option}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                          className="text-lms-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.questionType === 'true-false' && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Correct Answer *</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="True"
                          checked={currentQuestion.correctAnswer === 'True'}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-white">True</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="False"
                          checked={currentQuestion.correctAnswer === 'False'}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-white">False</span>
                      </label>
                    </div>
                  </div>
                )}

                {currentQuestion.questionType === 'short-answer' && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Correct Answer *</label>
                    <input
                      type="text"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-3 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                      placeholder="Enter the correct answer"
                    />
                  </div>
                )}

                <button
                  onClick={addQuestion}
                  className="px-4 py-2 bg-lms-primary text-white rounded hover:bg-lms-primary/80 transition-colors"
                >
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              {quizForm.questions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Questions ({quizForm.questions.length})</h3>
                  <div className="space-y-4">
                    {quizForm.questions.map((question, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-sm bg-lms-primary/20 text-lms-primary px-2 py-1 rounded mr-2">
                                {question.questionType.replace('-', ' ').toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-400">{question.points} points</span>
                            </div>
                            <p className="text-white mb-2">{question.question}</p>
                            {question.questionType === 'multiple-choice' && (
                              <ul className="text-sm text-gray-400 list-disc list-inside">
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex} className={option === question.correctAnswer ? 'text-green-400 font-semibold' : ''}>
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {question.questionType !== 'multiple-choice' && (
                              <p className="text-sm text-green-400">Correct Answer: {question.correctAnswer}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeQuestion(index)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuiz}
                disabled={createQuizMutation.isPending}
                className="px-4 py-2 bg-lms-primary text-white rounded hover:bg-lms-primary/80 disabled:opacity-50 transition-colors"
              >
                {createQuizMutation.isPending ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Quiz Modal */}
      {showViewModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{selectedQuiz.title}</h2>
                {getStatusBadge(selectedQuiz.status)}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Course</p>
                  <p className="text-white">{selectedQuiz.course?.title || 'No Course'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time Limit</p>
                  <p className="text-white">{selectedQuiz.timeLimit} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pass Score</p>
                  <p className="text-white">{selectedQuiz.passScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Max Attempts</p>
                  <p className="text-white">{selectedQuiz.maxAttempts}</p>
                </div>
                {selectedQuiz.dueDate && (
                  <div>
                    <p className="text-sm text-gray-400">Due Date</p>
                    <p className="text-white">{new Date(selectedQuiz.dueDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Questions</p>
                  <p className="text-white">{selectedQuiz.questions?.length || 0}</p>
                </div>
              </div>

              {selectedQuiz.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <p className="text-white">{selectedQuiz.description}</p>
                </div>
              )}

              {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Questions</h3>
                  <div className="space-y-4">
                    {selectedQuiz.questions.map((question: any, index: number) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center mb-2">
                          <span className="text-sm bg-lms-primary/20 text-lms-primary px-2 py-1 rounded mr-2">
                            Q{index + 1}
                          </span>
                          <span className="text-sm text-gray-400">{question.points} points</span>
                        </div>
                        <p className="text-white mb-2">{question.question}</p>
                        {question.questionType === 'multiple-choice' && (
                          <ul className="text-sm text-gray-400 list-disc list-inside">
                            {question.options.map((option: string, optIndex: number) => (
                              <li key={optIndex} className={option === question.correctAnswer ? 'text-green-400 font-semibold' : ''}>
                                {option}
                              </li>
                            ))}
                          </ul>
                        )}
                        {question.questionType !== 'multiple-choice' && (
                          <p className="text-sm text-green-400">Correct Answer: {question.correctAnswer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default QuizManager;
