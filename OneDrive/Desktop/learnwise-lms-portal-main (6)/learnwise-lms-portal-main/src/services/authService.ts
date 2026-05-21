
import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const login = async (email: string, password: string) => {
  try {
    console.log('Attempting login for:', email);
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      const { token, user } = response.data;
      console.log('Login successful, storing token and user data');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Login successful, user role:', user.role);
      return { token, user, success: true };
    }
    
    throw new Error(response.data.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const loginUser = login;

export const register = async (userData: RegisterData) => {
  try {
    console.log('Attempting registration for:', userData.email);
    const response = await api.post('/auth/register', userData);
    
    if (response.data.success) {
      const { token, user } = response.data;
      console.log('Registration successful, storing token and user data');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user, success: true };
    }
    
    throw new Error(response.data.message || 'Registration failed');
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const registerUser = register;

export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Checking auth - token exists:', !!token);
    console.log('Checking auth - stored user exists:', !!storedUser);
    
    if (!token) {
      console.log('No token found in localStorage, clearing any stored user data');
      localStorage.removeItem('user');
      throw new Error('No token found');
    }
    
    // First try to return stored user if available
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Found stored user data:', parsedUser.email, 'role:', parsedUser.role);
        
        // Verify token is still valid by making a quick API call
        console.log('Verifying token validity with server...');
        const response = await api.get('/auth/verify');
        console.log('Token verification successful');
        
        // Update stored user with latest data from server
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      } catch (parseError) {
        console.error('Error parsing stored user data:', parseError);
        localStorage.removeItem('user');
      }
    }
    
    // If no stored user or parsing failed, fetch from server
    console.log('Making auth verification request...');
    const response = await api.get('/auth/verify');
    console.log('Auth verification successful, user:', response.data.user.email);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data.user;
  } catch (error) {
    console.error('Auth check error:', error);
    console.log('Clearing authentication data due to error');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

// Alias for backward compatibility
export const getCurrentUser = async () => {
  try {
    console.log('Getting current user...');
    const response = await api.get('/auth/verify');
    console.log('Got current user:', response.data.user.email);
    return {
      success: response.data.success,
      data: response.data.user
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: error
    };
  }
};

export const updateProfile = async (profileData: UpdateProfileData) => {
  try {
    console.log('Updating profile for user...');
    const response = await api.put('/auth/profile', profileData);
    
    if (response.data.success) {
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Profile updated successfully');
      return { success: true, user: updatedUser };
    }
    
    throw new Error(response.data.message || 'Profile update failed');
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const changePassword = async (passwordData: ChangePasswordData) => {
  try {
    console.log('Attempting password change...');
    const response = await api.put('/auth/change-password', passwordData);
    
    if (response.data.success) {
      console.log('Password changed successfully');
      return { success: true, message: 'Password changed successfully' };
    }
    
    throw new Error(response.data.message || 'Password change failed');
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const logout = () => {
  console.log('Logging out user...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Authentication data cleared');
};
