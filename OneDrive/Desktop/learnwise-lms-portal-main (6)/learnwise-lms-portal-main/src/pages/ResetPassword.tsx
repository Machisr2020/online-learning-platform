
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-white">Reset Password</h1>
          <p className="text-gray-300 text-center">
            Please contact your administrator to reset your password.
            <br />
            Token: {token}
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

export default ResetPassword;
