
import api from './api';

export const getUserBadges = async () => {
  const response = await api.get('/badges/user');
  return response.data;
};

export const getAllBadges = async () => {
  const response = await api.get('/badges');
  return response.data;
};

export const checkBadgeProgress = async () => {
  const response = await api.post('/badges/check-progress');
  return response.data;
};

export const createBadge = async (badgeData: any) => {
  const response = await api.post('/badges', badgeData);
  return response.data;
};
