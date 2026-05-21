import api from './api';

export const submitQuiz = async (quizId: string, answers: any[], timeSpent: number) => {
  console.log('Submitting quiz:', { quizId, answers: answers.length, timeSpent });
  const response = await api.post('/submissions', {
    quizId,
    answers,
    timeSpent
  });
  return response.data;
};

export const getStudentSubmissions = async () => {
  const response = await api.get('/submissions/student');
  return response.data;
};

export const getSubmissionById = async (submissionId: string) => {
  const response = await api.get(`/submissions/${submissionId}`);
  return response.data;
};

export const getQuizSubmissions = async (quizId: string) => {
  console.log('Fetching quiz submissions for quiz:', quizId);
  const response = await api.get(`/submissions/quiz/${quizId}`);
  return response.data;
};

export const getQuizAttemptsForStudent = async (quizId: string) => {
  const response = await api.get(`/submissions/quiz/${quizId}/attempts`);
  return response.data;
};

export const getAvailableAttemptsForStudent = async (quizId: string) => {
  console.log('Fetching available attempts for quiz:', quizId);
  const response = await api.get(`/submissions/quiz/${quizId}/available-attempts`);
  console.log('Available attempts response:', response.data);
  return response.data;
};

export const getAvailableAttemptsForStudentBatch = async (quizIds: string[]) => {
  const response = await api.post('/submissions/available-attempts-batch', { quizIds });
  return response.data;
};

export const checkPendingRequestForQuiz = async (quizId: string) => {
  console.log('Checking pending request for quiz:', quizId);
  const response = await api.get(`/submissions/quiz/${quizId}/pending-request`);
  return response.data;
};

export const requestExtraAttempt = async (quizId: string, reason: string) => {
  console.log('Requesting extra attempt:', { quizId, reason });

  if (!quizId || !reason || reason.trim().length === 0) {
    throw new Error('Quiz ID and reason are required');
  }

  try {
    const response = await api.post('/submissions/request-extra-attempt', {
      quizId,
      reason: reason.trim()
    });
    console.log('Extra attempt request response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[requestExtraAttempt] Full error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });

    // Enhanced error handling with detailed logging
    if (error.response?.data) {
      console.error('[requestExtraAttempt] Backend error message:', error.response.data.message);
      throw {
        ...error,
        message: error.response.data.message || 'Request failed',
        backend: error.response.data,
      };
    } else {
      console.error('[requestExtraAttempt] Network or other error:', error.message);
      throw error;
    }
  }
};

export const getPendingAttemptRequests = async () => {
  console.log('[getPendingAttemptRequests] Starting fetch...');
  try {
    const response = await api.get('/submissions/pending-requests');
    console.log('[getPendingAttemptRequests] Success response status:', response.status);
    console.log('[getPendingAttemptRequests] Success response data:', response.data);
    
    if (response.data.success) {
      console.log('[getPendingAttemptRequests] Found', response.data.data?.length || 0, 'requests');
      console.log('[getPendingAttemptRequests] Debug info:', response.data.debug);
      return response.data;
    } else {
      console.error('[getPendingAttemptRequests] API returned success: false');
      throw new Error(response.data.message || 'Failed to fetch requests');
    }
  } catch (error: any) {
    console.error('[getPendingAttemptRequests] Detailed error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
    
    // More specific error handling
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    } else if (error.response?.status === 500) {
      throw new Error(`Server error: ${error.response?.data?.message || 'Internal server error'}`);
    }
    
    throw error;
  }
};

export const approveAttemptRequest = async (requestId: string) => {
  console.log('[approveAttemptRequest] Approving request:', requestId);
  try {
    const response = await api.put(`/submissions/requests/${requestId}/approve`);
    console.log('[approveAttemptRequest] Success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[approveAttemptRequest] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const rejectAttemptRequest = async (requestId: string) => {
  console.log('[rejectAttemptRequest] Rejecting request:', requestId);
  try {
    const response = await api.put(`/submissions/requests/${requestId}/reject`);
    console.log('[rejectAttemptRequest] Success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[rejectAttemptRequest] Error:', error.response?.data || error.message);
    throw error;
  }
};
