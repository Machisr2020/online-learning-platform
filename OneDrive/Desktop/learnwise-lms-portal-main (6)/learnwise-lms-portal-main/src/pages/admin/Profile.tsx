
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { User, Mail, Shield, Settings, Calendar, Save, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  
  // Mock profile data
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@lmsportal.com',
    role: 'System Administrator',
    permissions: 'Full Access',
    joinDate: 'January 1, 2025',
    lastLogin: 'May 21, 2025, 9:30 AM',
    bio: 'Platform administrator responsible for managing users, courses, and system settings.',
    phoneNumber: '+1 (555) 789-0123',
    timezone: 'UTC-8 (Pacific Time)',
    twoFactorEnabled: true,
    notifications: {
      emailAlerts: true,
      systemAlerts: true,
      loginAlerts: true
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };
  
  const handleNotificationChange = (notification: string) => {
    setEditedProfile({
      ...editedProfile,
      notifications: {
        ...editedProfile.notifications,
        [notification]: !editedProfile.notifications[notification as keyof typeof editedProfile.notifications]
      }
    });
  };
  
  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // In a real app, we would save this data to the server
    console.log('Saving profile:', editedProfile);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Profile</h1>
        <p className="text-gray-400">Manage your administrator account</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - User info */}
        <div className="lg:col-span-1">
          <div className="lms-card flex flex-col items-center p-6">
            <div className="relative mb-4">
              <div className="h-24 w-24 bg-lms-primary/20 text-lms-primary rounded-full flex items-center justify-center overflow-hidden">
                <User className="h-12 w-12" />
              </div>
              <button className="absolute bottom-0 right-0 bg-lms-primary text-white rounded-full p-2 hover:bg-lms-primary/80">
                <Camera size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
            <div className="bg-lms-primary/20 text-lms-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
              {profile.role}
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="text-gray-400 mr-3" size={16} />
                <span className="text-white">{profile.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="text-gray-400 mr-3" size={16} />
                <span className="text-white">{profile.permissions}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="text-gray-400 mr-3" size={16} />
                <div>
                  <p className="text-white">Joined: {profile.joinDate}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Last login: {profile.lastLogin}</p>
                </div>
              </div>
            </div>
            
            <div className="w-full border-t border-gray-800 mt-6 pt-6">
              <h4 className="text-md font-bold text-white mb-4">Security Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Two-factor authentication</span>
                  {profile.twoFactorEnabled ? (
                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">
                      Enabled
                    </span>
                  ) : (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">
                      Disabled
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Password strength</span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">
                    Strong
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Last password change</span>
                  <span className="text-sm text-white">14 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Profile details and settings */}
        <div className="lg:col-span-2">
          <div className="lms-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Profile Information</h3>
              {!isEditing ? (
                <button 
                  className="text-lms-primary hover:text-lms-primary/80 flex items-center"
                  onClick={() => setIsEditing(true)}
                >
                  <Settings className="mr-2" size={16} />
                  Edit Profile
                </button>
              ) : (
                <button 
                  className="text-lms-primary hover:text-lms-primary/80 flex items-center"
                  onClick={handleSave}
                >
                  <Save className="mr-2" size={16} />
                  Save Changes
                </button>
              )}
            </div>
            
            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">About</h4>
                  <p className="text-white">{profile.bio}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Full Name</h4>
                    <p className="text-white">{profile.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Email</h4>
                    <p className="text-white">{profile.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Phone Number</h4>
                    <p className="text-white">{profile.phoneNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Time Zone</h4>
                    <p className="text-white">{profile.timezone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Notification Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded-sm mr-2 ${profile.notifications.emailAlerts ? 'bg-lms-primary' : 'bg-gray-700'}`}></div>
                      <span className="text-white">Email Alerts</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded-sm mr-2 ${profile.notifications.systemAlerts ? 'bg-lms-primary' : 'bg-gray-700'}`}></div>
                      <span className="text-white">System Alerts</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded-sm mr-2 ${profile.notifications.loginAlerts ? 'bg-lms-primary' : 'bg-gray-700'}`}></div>
                      <span className="text-white">Login Alerts</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editedProfile.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time Zone</label>
                  <select
                    name="timezone"
                    value={editedProfile.timezone}
                    onChange={(e) => setEditedProfile({...editedProfile, timezone: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  >
                    <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                    <option value="UTC-7 (Mountain Time)">UTC-7 (Mountain Time)</option>
                    <option value="UTC-6 (Central Time)">UTC-6 (Central Time)</option>
                    <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                    <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                    <option value="UTC+1 (Central European Time)">UTC+1 (Central European Time)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">About</label>
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notification Preferences</label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedProfile.notifications.emailAlerts}
                        onChange={() => handleNotificationChange('emailAlerts')}
                        className="h-4 w-4 text-lms-primary rounded focus:ring-0 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="ml-2 text-white">Email Alerts</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedProfile.notifications.systemAlerts}
                        onChange={() => handleNotificationChange('systemAlerts')}
                        className="h-4 w-4 text-lms-primary rounded focus:ring-0 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="ml-2 text-white">System Alerts</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedProfile.notifications.loginAlerts}
                        onChange={() => handleNotificationChange('loginAlerts')}
                        className="h-4 w-4 text-lms-primary rounded focus:ring-0 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="ml-2 text-white">Login Alerts</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    className="bg-lms-primary text-white rounded px-4 py-2 hover:bg-lms-primary/80 focus:outline-none w-full"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Security section */}
          <div className="lms-card p-6 mt-6">
            <h3 className="text-lg font-bold text-white mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <div className="relative">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={profile.twoFactorEnabled} 
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-white mb-2">Change Password</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      className="bg-lms-primary text-white rounded px-4 py-2 hover:bg-lms-primary/80 focus:outline-none"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-800 pt-6">
                <h4 className="text-white mb-2">Session Management</h4>
                <p className="text-sm text-gray-400 mb-3">You're currently logged in on 2 devices</p>
                
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Current Session (Chrome on Windows)</p>
                        <p className="text-xs text-gray-400">Started: May 21, 2025, 9:30 AM</p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Safari on iPhone</p>
                        <p className="text-xs text-gray-400">Last active: May 20, 2025, 4:15 PM</p>
                      </div>
                      <button className="text-rose-500 text-sm">
                        End Session
                      </button>
                    </div>
                  </div>
                </div>
                
                <button className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
                  Log Out of All Devices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
