
import api from './api';

export const getCourseQuizzes = async (courseId: string) => {
  const response = await api.get(`/quizzes/course/${courseId}`);
  return response.data;
};

export const getQuizById = async (id: string) => {
  const response = await api.get(`/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (quizData: any) => {
  const response = await api.post('/quizzes', quizData);
  return response.data;
};

export const updateQuiz = async (id: string, quizData: any) => {
  const response = await api.put(`/quizzes/${id}`, quizData);
  return response.data;
};

export const deleteQuiz = async (id: string) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

export const getInstructorQuizzes = async () => {
  const response = await api.get('/quizzes');
  return response.data;
};

export const getPendingQuizzes = async () => {
  const response = await api.get('/quizzes/pending');
  return response.data;
};

export const approveQuiz = async (id: string) => {
  const response = await api.put(`/quizzes/${id}/approve`);
  return response.data;
};

export const rejectQuiz = async (id: string, reason?: string) => {
  const response = await api.put(`/quizzes/${id}/reject`, { reason });
  return response.data;
};

export const extractQuestionsFromPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  const response = await api.post('/quizzes/extract-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
