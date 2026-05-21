
import React from 'react';
import LoginPage from './LoginPage';

// This is a redirect component to maintain backward compatibility
const Login: React.FC = () => {
  return <LoginPage />;
};

export default Login;
