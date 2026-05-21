
import React from 'react';
import RegisterPage from './RegisterPage';

// This is a redirect component to maintain backward compatibility
const Register: React.FC = () => {
  return <RegisterPage />;
};

export default Register;
