
import api from './api';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  eventType: 'class' | 'assignment' | 'exam' | 'college' | 'meeting' | 'other';
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  meetLink?: string;
  course?: {
    _id: string;
    title: string;
  };
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  participants: string[];
  visibilityType: 'all' | 'specific' | 'role';
  visibleToRoles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventData {
  title: string;
  description?: string;
  eventType: 'class' | 'assignment' | 'exam' | 'college' | 'meeting' | 'other';
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  meetLink?: string;
  course?: string;
  participants?: string[];
  visibilityType: 'all' | 'specific' | 'role';
  visibleToRoles?: string[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
}

export const getEvents = async () => {
  console.log('Fetching events...');
  const response = await api.get('/events');
  console.log('Events fetched successfully:', response.data.count, 'events');
  return response.data;
};

export const getMyEvents = async () => {
  const response = await api.get('/events/my');
  return response.data;
};

export const getEventById = async (id: string) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData: EventData) => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const updateEvent = async (id: string, eventData: Partial<EventData>) => {
  const response = await api.put(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id: string) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

export const joinEvent = async (eventId: string) => {
  const response = await api.post(`/events/${eventId}/join`);
  return response.data;
};

export const leaveEvent = async (eventId: string) => {
  const response = await api.delete(`/events/${eventId}/leave`);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};
