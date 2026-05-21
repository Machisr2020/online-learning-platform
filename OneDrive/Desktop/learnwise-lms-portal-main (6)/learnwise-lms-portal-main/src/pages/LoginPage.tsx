import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../components/layout/PublicLayout';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, role } = useAuth();
  const navigate = useNavigate();

  // Demo credentials for quick login
  const demoCredentials = {
    student: { email: 'student@example.com', password: 'password123' },
    instructor: { email: 'trainer@example.com', password: 'password123' },
    admin: { email: 'admin@example.com', password: 'password123' }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    
    // Auto-fill credentials based on selected role
    if (demoCredentials[role as keyof typeof demoCredentials]) {
      const { email, password } = demoCredentials[role as keyof typeof demoCredentials];
      setEmail(email);
      setPassword(password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Login successful!',
        });
        
        // Redirect based on user role
        switch (role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'instructor':
            navigate('/instructor/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        toast({
          title: 'Error',
          description: 'Invalid credentials. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'Server error. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <PublicLayout hideNavigation>
      <div className="flex min-h-screen bg-gray-900">
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 mb-8">Please enter your credentials to access your account</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-400 mb-2">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white border-gray-700"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 text-white border-gray-700 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-lms-primary hover:bg-purple-600" 
                disabled={isLoading}
              >
                <LogIn size={18} />
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
            {/* Demo role selector buttons */}
            <div className="mt-8">
              <h3 className="text-gray-400 mb-3 text-center">Demo Login</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={selectedRole === 'student' ? 'default' : 'outline'}
                  className={`${selectedRole === 'student' ? 'bg-lms-primary hover:bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                  onClick={() => handleRoleSelect('student')}
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === 'trainer' ? 'default' : 'outline'}
                  className={`${selectedRole === 'trainer' ? 'bg-lms-primary hover:bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                  onClick={() => handleRoleSelect('trainer')}
                >
                  Trainer
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === 'admin' ? 'default' : 'outline'}
                  className={`${selectedRole === 'admin' ? 'bg-lms-primary hover:bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                  onClick={() => handleRoleSelect('admin')}
                >
                  Admin
                </Button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account? <Link to="/register">Contact admin for registration.</Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900&q=80')`,
          backgroundSize: 'cover',
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.5)'
        }}>
          <div className="h-full flex flex-col justify-center items-center p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">LMS Portal</h2>
            <p className="text-xl max-w-md text-center">
              Transforming education through technology and innovation.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
