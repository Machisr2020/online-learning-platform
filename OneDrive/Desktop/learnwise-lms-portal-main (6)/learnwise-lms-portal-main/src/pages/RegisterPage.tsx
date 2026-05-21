import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { register } from '../services/authService';
import PublicLayout from '../components/layout/PublicLayout';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Users, Shield, Settings } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const navigate = useNavigate();

  // Admin access code (in production, this should be more secure)
  const ADMIN_ACCESS_CODE = 'ADMIN2024';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleAdminCodeSubmit = () => {
    if (adminCode === ADMIN_ACCESS_CODE) {
      setShowAdminOption(true);
      toast({
        title: 'Admin Access Granted',
        description: 'You can now register as an admin.',
      });
    } else {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the correct admin access code.',
        variant: 'destructive'
      });
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast({
        title: 'Error',
        description: 'First name is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.lastName.trim()) {
      toast({
        title: 'Error',
        description: 'Last name is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.email) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return false;
    }

    if (!agreeToTerms) {
      toast({
        title: 'Error',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await register(registrationData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Registration successful! Please login with your credentials.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Student', icon: User, description: 'Join courses and learn' },
    { id: 'instructor', label: 'Instructor', icon: Users, description: 'Teach and create courses' },
    ...(showAdminOption ? [{ id: 'admin', label: 'Admin', icon: Shield, description: 'Manage the platform' }] : [])
  ];

  return (
    <PublicLayout hideNavigation>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Left side - Registration form */}
          <div className="p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-lms-primary rounded-full mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-gray-400">Join our learning platform today</p>
              </div>
              
              {/* Admin Access Code Section */}
              {!showAdminOption && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Settings className="w-5 h-5 text-gray-400 mr-2" />
                    <Label className="text-gray-300">Admin Registration</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter admin access code"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="bg-gray-600 text-white border-gray-500 text-sm"
                    />
                    <Button
                      type="button"
                      onClick={handleAdminCodeSubmit}
                      variant="outline"
                      size="sm"
                      className="bg-gray-600 text-white border-gray-500 hover:bg-gray-500"
                    >
                      Verify
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter admin code to enable admin registration</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300 mb-2 block">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-gray-700 text-white border-gray-600 focus:border-lms-primary"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300 mb-2 block">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-gray-700 text-white border-gray-600 focus:border-lms-primary"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <Label htmlFor="email" className="text-gray-300 mb-2 block">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-gray-700 text-white border-gray-600 focus:border-lms-primary pl-10"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password fields */}
                <div>
                  <Label htmlFor="password" className="text-gray-300 mb-2 block">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-gray-700 text-white border-gray-600 focus:border-lms-primary pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300 mb-2 block">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="bg-gray-700 text-white border-gray-600 focus:border-lms-primary pl-10 pr-10"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Role selection */}
                <div>
                  <Label className="text-gray-300 mb-3 block">Select Your Role</Label>
                  <div className={`grid gap-3 ${roles.length === 3 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {roles.map((role) => {
                      const IconComponent = role.icon;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleRoleChange(role.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.role === role.id
                              ? 'border-lms-primary bg-lms-primary/10 text-lms-primary'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                          } ${role.id === 'admin' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : ''}`}
                        >
                          <IconComponent className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{role.label}</div>
                          <div className="text-xs opacity-75 mt-1">{role.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-lms-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-lms-primary hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  className="w-full bg-lms-primary hover:bg-purple-600 text-white font-medium py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-lms-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
          {/* Right side - Welcome content */}
          <div className="bg-gradient-to-br from-lms-primary to-purple-600 p-8 lg:p-12 flex flex-col justify-center text-white">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold mb-6">Join Our Learning Community</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <p className="text-lg">Create your account in minutes</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <p className="text-lg">Choose your learning path</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <p className="text-lg">Start your journey today</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Why Choose Us?</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Expert-led courses</li>
                  <li>• Interactive learning experience</li>
                  <li>• Flexible scheduling</li>
                  <li>• Industry-recognized certificates</li>
                </ul>
              </div>
              
              {showAdminOption && (
                <div className="mt-6 bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-yellow-400 mr-2" />
                    <h4 className="text-yellow-400 font-semibold">Admin Access Enabled</h4>
                  </div>
                  <p className="text-sm text-yellow-200">
                    You can now register as an administrator with full platform management capabilities.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default RegisterPage;
