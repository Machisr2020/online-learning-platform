
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Camera, Save, Pencil, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';

// Services for API calls
const getUserProfile = async (userId: string) => {
  const response = await fetch(`/api/users/profile/${userId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

const updateUserProfile = async (profileData: any) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(profileData)
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

const updatePassword = async (passwordData: any) => {
  const response = await fetch('/api/users/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(passwordData)
  });
  if (!response.ok) throw new Error('Failed to update password');
  return response.json();
};

const Profile: React.FC = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile', authState.user?._id],
    queryFn: () => getUserProfile(authState.user!._id),
    enabled: !!authState.user?._id,
  });

  const [editedProfile, setEditedProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditingProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Success",
        description: "Password changed successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    }
  });

  React.useEffect(() => {
    if (profileData?.data) {
      setEditedProfile({
        firstName: profileData.data.firstName || '',
        lastName: profileData.data.lastName || '',
        email: profileData.data.email || '',
        phone: profileData.data.phone || '',
        bio: profileData.data.bio || '',
        address: {
          street: profileData.data.address?.street || '',
          city: profileData.data.address?.city || '',
          state: profileData.data.address?.state || '',
          pincode: profileData.data.address?.pincode || ''
        }
      });
    }
  }, [profileData]);

  const handleProfileSave = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lms-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const profile = profileData?.data;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your personal information and account settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - User info */}
        <div className="lg:col-span-1">
          <div className="lms-card flex flex-col items-center p-6 mb-6">
            <div className="relative mb-4">
              <div className="h-24 w-24 bg-lms-primary/20 text-lms-primary rounded-full flex items-center justify-center overflow-hidden">
                <User className="h-12 w-12" />
              </div>
              <button className="absolute bottom-0 right-0 bg-lms-primary text-white rounded-full p-2 hover:bg-lms-primary/80">
                <Camera size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">
              {profile?.firstName} {profile?.lastName}
            </h3>
            <p className="text-sm text-gray-400 mb-4">Student</p>
            
            <div className="w-full space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="text-gray-400 mr-2" size={16} />
                <span className="text-white">{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="text-gray-400 mr-2" size={16} />
                  <span className="text-white">{profile.phone}</span>
                </div>
              )}
              {profile?.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="text-gray-400 mr-2" size={16} />
                  <span className="text-white">
                    {profile.address.city}, {profile.address.state}
                  </span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="text-gray-400 mr-2" size={16} />
                <span className="text-white">
                  Joined: {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="text-lms-primary" size={20} />
                </div>
                <p className="text-2xl font-bold text-white">{profile?.enrolledCourses || 0}</p>
                <p className="text-xs text-gray-400">Courses</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="text-lms-primary" size={20} />
                </div>
                <p className="text-2xl font-bold text-white">{profile?.certificates || 0}</p>
                <p className="text-xs text-gray-400">Certificates</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Profile details */}
        <div className="lg:col-span-2">
          <div className="lms-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Profile Information</h3>
              {!isEditingProfile ? (
                <Button 
                  variant="outline"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Pencil className="mr-2" size={16} />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="mr-2" size={16} />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
            
            {!isEditingProfile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">First Name</h4>
                    <p className="text-white">{profile?.firstName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Last Name</h4>
                    <p className="text-white">{profile?.lastName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Email</h4>
                    <p className="text-white">{profile?.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Phone</h4>
                    <p className="text-white">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                {profile?.bio && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Biography</h4>
                    <p className="text-white">{profile.bio}</p>
                  </div>
                )}
                
                {profile?.address && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Address</h4>
                    <p className="text-white">
                      {profile.address.street && `${profile.address.street}, `}
                      {profile.address.city && `${profile.address.city}, `}
                      {profile.address.state && `${profile.address.state} `}
                      {profile.address.pincode}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">First Name</label>
                    <input
                      type="text"
                      value={editedProfile.firstName}
                      onChange={(e) => setEditedProfile({...editedProfile, firstName: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={editedProfile.lastName}
                      onChange={(e) => setEditedProfile({...editedProfile, lastName: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Biography</label>
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Street</label>
                    <input
                      type="text"
                      value={editedProfile.address.street}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile, 
                        address: {...editedProfile.address, street: e.target.value}
                      })}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">City</label>
                    <input
                      type="text"
                      value={editedProfile.address.city}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile, 
                        address: {...editedProfile.address, city: e.target.value}
                      })}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">State</label>
                    <input
                      type="text"
                      value={editedProfile.address.state}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile, 
                        address: {...editedProfile.address, state: e.target.value}
                      })}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={editedProfile.address.pincode}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile, 
                        address: {...editedProfile.address, pincode: e.target.value}
                      })}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Password Change Section */}
          <div className="lms-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Security Settings</h3>
              {!isChangingPassword ? (
                <Button 
                  variant="outline"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <Lock className="mr-2" size={16} />
                  Change Password
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                  >
                    <Save className="mr-2" size={16} />
                    Update Password
                  </Button>
                </div>
              )}
            </div>
            
            {isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                <p>Click "Change Password" to update your password</p>
                <p className="text-sm mt-2">Last password change: Never</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
