
import api from './api';

// Get all notifications
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async () => {
  try {
    const response = await api.get('/notifications/unread');
    return response.data;
  } catch (error) {
    console.error('Get unread notifications count error:', error);
    return { count: 0 };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put('/notifications/read/all');
    return response.data;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};
