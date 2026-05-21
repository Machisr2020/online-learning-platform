import api from './api';
import { io, Socket } from 'socket.io-client';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
}

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  messageType?: 'text' | 'media';
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
  readStatus: boolean;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Socket instance
let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
    auth: {
      token
    }
  });
  
  return socket;
};

export const getSocket = () => socket;

// Legacy conversation-based functions (for backward compatibility)
export const getConversations = async () => {
  const response = await api.get('/messages/contacts/all');
  return response.data;
};

export const getMessages = async (conversationId: string) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async (receiverId: string, content: string, attachments?: File[]) => {
  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    formData.append('content', content);
    attachments.forEach((file) => {
      formData.append('media', file);
    });

    const response = await api.post('/messages/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    const response = await api.post('/messages', {
      receiverId,
      content
    });
    return response.data;
  }
};

export const markAsRead = async (conversationId: string) => {
  const response = await api.patch(`/messages/${conversationId}/read`);
  return response.data;
};

export const reportMessage = async (messageId: string) => {
  const response = await api.post(`/messages/${messageId}/report`);
  return response.data;
};

export const createConversation = async (participantId: string) => {
  return { data: { _id: participantId } };
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getContacts = async () => {
  const response = await api.get('/messages/contacts/all');
  return response.data;
};

export const getConversation = async (userId: string) => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

export const markMessageAsRead = async (messageId: string) => {
  const response = await api.put(`/messages/${messageId}/read`);
  return response.data;
};

export const markConversationAsRead = async (userId: string) => {
  const response = await api.patch(`/messages/conversation/${userId}/read`);
  return response.data;
};

export const getAllStudents = async () => {
  const response = await api.get('/messages/all-students');
  return response.data;
};

export const getAllInstructors = async () => {
  const response = await api.get('/messages/all-instructors');
  return response.data;
};

export const getAllAdmins = async () => {
  const response = await api.get('/messages/all-admins');
  return response.data;
};

export const sendMessageWithMedia = async (receiverId: string, content: string, file: File) => {
  const formData = new FormData();
  formData.append('receiverId', receiverId);
  formData.append('content', content);
  formData.append('media', file);

  const response = await api.post('/messages/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const reportUser = async (userId: string, reason: string, description: string) => {
  const response = await api.post('/messages/report-user', {
    userId,
    reason,
    description
  });
  return response.data;
};
