
import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';

const ForgotPassword: React.FC = () => {
  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-white">Forgot Password</h1>
          <p className="text-gray-300 text-center">
            Please contact your administrator to reset your password.
          </p>
          <div className="text-center">
            <Link to="/login" className="text-purple-400 hover:text-purple-300">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForgotPassword;
