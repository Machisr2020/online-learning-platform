
import api from './api';

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getAllCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourseById = async (id: string) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (courseData: any) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

export const updateCourse = async (id: string, courseData: any) => {
  const response = await api.put(`/courses/${id}`, courseData);
  return response.data;
};

export const deleteCourse = async (id: string) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

export const getEnrollmentByCourse = async (courseId: string) => {
  const response = await api.get(`/enrollments/course/${courseId}`);
  return response.data;
};

export const getEnrolledCourses = async () => {
  const response = await api.get('/enrollments/student');
  return response.data;
};

export const enrollInCourse = async (courseId: string) => {
  const response = await api.post('/enrollments', { courseId });
  return response.data;
};

export const updateModuleProgress = async (enrollmentId: string, moduleId: string) => {
  const response = await api.put(`/enrollments/${enrollmentId}/progress`, { moduleId });
  return response.data;
};

export const saveModuleNotes = async (enrollmentId: string, moduleId: string, notes: string) => {
  const response = await api.put(`/enrollments/${enrollmentId}/notes`, { moduleId, notes });
  return response.data;
};

export const getModuleNotes = async (enrollmentId: string, moduleId: string) => {
  const response = await api.get(`/enrollments/${enrollmentId}/notes/${moduleId}`);
  return response.data;
};

export const getInstructorCourses = async () => {
  const response = await api.get('/courses/instructor');
  return response.data;
};

export const submitCourseRating = async (ratingData: { courseId: string; rating: number; comment: string }) => {
  const response = await api.post('/courses/rating', ratingData);
  return response.data;
};
