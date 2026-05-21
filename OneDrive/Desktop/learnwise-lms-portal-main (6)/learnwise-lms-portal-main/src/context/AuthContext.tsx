
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, getCurrentUser } from '../services/authService';

// Add the UserRole type definition
export type UserRole = 'student' | 'instructor' | 'admin';

interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  name?: string; // For backward compatibility
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  role: UserRole | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: string | null;
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  role: null,
  authState: initialAuthState,
  setAuthState: () => {},
  login: async () => false,
  logout: () => {},
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Validate token by fetching current user
          const response = await getCurrentUser();
          if (response.success) {
            const userData = response.data;
            // Add name property for backward compatibility
            userData.name = `${userData.firstName} ${userData.lastName}`;
            
            // Ensure consistent role naming
            if (userData.role === 'trainer') {
              userData.role = 'instructor';
            }
            
            // Ensure _id is set from id if needed
            if (!userData._id && userData.id) {
              userData._id = userData.id;
            }
            
            setAuthState({
              isAuthenticated: true,
              user: userData,
              token,
              role: userData.role
            });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuthState(initialAuthState);
          }
        } catch (error) {
          console.error('Auth validation error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState(initialAuthState);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginService(email, password);
      
      if (response.success) {
        const { token, user } = response;
        
        // Add name property for backward compatibility
        user.name = `${user.firstName} ${user.lastName}`;
        
        // Ensure consistent role naming
        if (user.role === 'trainer') {
          user.role = 'instructor';
        }
        
        // Ensure _id is set from id if needed
        if (!user._id && user.id) {
          user._id = user.id;
        }
        
        // Save auth data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          role: user.role
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState(initialAuthState);
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        role: authState.role,
        authState,
        setAuthState,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
