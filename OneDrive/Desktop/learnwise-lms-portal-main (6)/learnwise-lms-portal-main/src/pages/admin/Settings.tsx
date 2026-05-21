
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Settings as SettingsIcon, Lock, Bell, Palette, Mail, Activity, Save } from 'lucide-react';

const Settings: React.FC = () => {
  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      siteName: 'LMS Portal',
      siteDescription: 'Learning Management System for students and instructors',
      adminEmail: 'admin@lmsportal.com',
      timeZone: 'UTC-8 (Pacific Time)',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12 hour'
    },
    security: {
      requireStrongPasswords: true,
      twoFactorAuthentication: true,
      sessionTimeout: 30,
      ipRestriction: false,
      passwordExpiryDays: 90,
      loginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      courseUpdates: true,
      systemAnnouncements: true,
      newUserRegistrations: true,
      courseCompletions: true,
      failedLogins: true
    },
    appearance: {
      theme: 'dark',
      primaryColor: '#6366f1',
      logoUrl: '/logo.svg',
      enableCustomCss: false,
      menuLayout: 'sidebar',
      enableStudentThemes: false
    },
    course: {
      defaultCourseVisibility: 'draft',
      requireApproval: true,
      allowMultipleAttempts: true,
      showProgressBar: true,
      enableCertificates: true,
      enableBadges: true
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (category: string, field: string, value: any) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [field]: value
      }
    });
    setHasChanges(true);
  };

  const handleToggleChange = (category: string, field: string) => {
    const currentValue = settings[category as keyof typeof settings][field as any];
    handleInputChange(category, field, !currentValue);
  };

  const handleSave = () => {
    // In a real app, we would save the settings to the backend
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
        <p className="text-gray-400">Configure and customize the learning platform</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings tabs sidebar */}
        <div className="lg:col-span-1">
          <div className="lms-card p-4">
            <div className="space-y-1">
              <button 
                className={`w-full flex items-center p-3 rounded-md transition-colors ${
                  activeTab === 'general' ? 'bg-lms-primary text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <SettingsIcon size={18} className="mr-3" />
                General
              </button>
              <button 
                className={`w-full flex items-center p-3 rounded-md transition-colors ${
                  activeTab === 'security' ? 'bg-lms-primary text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Lock size={18} className="mr-3" />
                Security
              </button>
              <button 
                className={`w-full flex items-center p-3 rounded-md transition-colors ${
                  activeTab === 'notifications' ? 'bg-lms-primary text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} className="mr-3" />
                Notifications
              </button>
              <button 
                className={`w-full flex items-center p-3 rounded-md transition-colors ${
                  activeTab === 'appearance' ? 'bg-lms-primary text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('appearance')}
              >
                <Palette size={18} className="mr-3" />
                Appearance
              </button>
              <button 
                className={`w-full flex items-center p-3 rounded-md transition-colors ${
                  activeTab === 'course' ? 'bg-lms-primary text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('course')}
              >
                <Activity size={18} className="mr-3" />
                Course Defaults
              </button>
            </div>
          </div>
          
          {hasChanges && (
            <div className="mt-6 lms-card p-4 bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-400 text-sm">You have unsaved changes</p>
              <button 
                className="mt-3 w-full bg-lms-primary text-white rounded-md py-2 flex items-center justify-center"
                onClick={handleSave}
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
            </div>
          )}
        </div>
        
        {/* Settings content */}
        <div className="lg:col-span-3">
          <div className="lms-card p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Site Description</label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Admin Email</label>
                    <div className="flex items-center">
                      <Mail className="text-gray-400 mr-2" size={18} />
                      <input
                        type="email"
                        value={settings.general.adminEmail}
                        onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Time Zone</label>
                      <select
                        value={settings.general.timeZone}
                        onChange={(e) => handleInputChange('general', 'timeZone', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                      >
                        <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                        <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                        <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                        <option value="UTC+1 (Central European Time)">UTC+1 (Central European Time)</option>
                        <option value="UTC+5:30 (Indian Standard Time)">UTC+5:30 (Indian Standard Time)</option>
                        <option value="UTC+8 (China Standard Time)">UTC+8 (China Standard Time)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Date Format</label>
                      <select
                        value={settings.general.dateFormat}
                        onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Time Format</label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={settings.general.timeFormat === '12 hour'}
                          onChange={() => handleInputChange('general', 'timeFormat', '12 hour')}
                          className="text-lms-primary"
                        />
                        <span className="ml-2 text-white">12-hour (AM/PM)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={settings.general.timeFormat === '24 hour'}
                          onChange={() => handleInputChange('general', 'timeFormat', '24 hour')}
                          className="text-lms-primary"
                        />
                        <span className="ml-2 text-white">24-hour</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Require Strong Passwords</p>
                      <p className="text-sm text-gray-400">Passwords must include uppercase, lowercase, numbers, and symbols</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.security.requireStrongPasswords}
                        onChange={() => handleToggleChange('security', 'requireStrongPasswords')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">Require 2FA for all admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.security.twoFactorAuthentication}
                        onChange={() => handleToggleChange('security', 'twoFactorAuthentication')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">IP Restriction</p>
                      <p className="text-sm text-gray-400">Restrict admin access to specific IP addresses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.security.ipRestriction}
                        onChange={() => handleToggleChange('security', 'ipRestriction')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Password Expiry (days)</label>
                    <input
                      type="number"
                      value={settings.security.passwordExpiryDays}
                      onChange={(e) => handleInputChange('security', 'passwordExpiryDays', parseInt(e.target.value))}
                      min="0"
                      max="365"
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set to 0 to disable password expiry</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Maximum Failed Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-sm text-gray-400">Enable email notifications for all users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.emailNotifications}
                        onChange={() => handleToggleChange('notifications', 'emailNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="pl-6 space-y-4 border-l border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-white">Course Updates</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notifications.courseUpdates}
                          onChange={() => handleToggleChange('notifications', 'courseUpdates')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-white">System Announcements</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notifications.systemAnnouncements}
                          onChange={() => handleToggleChange('notifications', 'systemAnnouncements')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-white">New User Registrations</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notifications.newUserRegistrations}
                          onChange={() => handleToggleChange('notifications', 'newUserRegistrations')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-white">Course Completions</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notifications.courseCompletions}
                          onChange={() => handleToggleChange('notifications', 'courseCompletions')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-white">Failed Login Attempts</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notifications.failedLogins}
                          onChange={() => handleToggleChange('notifications', 'failedLogins')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Theme</label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={settings.appearance.theme === 'dark'}
                          onChange={() => handleInputChange('appearance', 'theme', 'dark')}
                          className="text-lms-primary"
                        />
                        <span className="ml-2 text-white">Dark</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={settings.appearance.theme === 'light'}
                          onChange={() => handleInputChange('appearance', 'theme', 'light')}
                          className="text-lms-primary"
                        />
                        <span className="ml-2 text-white">Light</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={settings.appearance.theme === 'system'}
                          onChange={() => handleInputChange('appearance', 'theme', 'system')}
                          className="text-lms-primary"
                        />
                        <span className="ml-2 text-white">System Default</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                    <div className="grid grid-cols-6 gap-4">
                      <div 
                        className={`h-10 w-10 bg-indigo-500 rounded-full cursor-pointer ${
                          settings.appearance.primaryColor === '#6366f1' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        onClick={() => handleInputChange('appearance', 'primaryColor', '#6366f1')}
                      ></div>
                      <div 
                        className={`h-10 w-10 bg-blue-500 rounded-full cursor-pointer ${
                          settings.appearance.primaryColor === '#3b82f6' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        onClick={() => handleInputChange('appearance', 'primaryColor', '#3b82f6')}
                      ></div>
                      <div 
                        className={`h-10 w-10 bg-purple-500 rounded-full cursor-pointer ${
                          settings.appearance.primaryColor === '#8b5cf6' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        onClick={() => handleInputChange('appearance', 'primaryColor', '#8b5cf6')}
                      ></div>
                      <div 
                        className={`h-10 w-10 bg-pink-500 rounded-full cursor-pointer ${
                          settings.appearance.primaryColor === '#ec4899' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        onClick={() => handleInputChange('appearance', 'primaryColor', '#ec4899')}
                      ></div>
                      <div 
                        className={`h-10 w-10 bg-green-500 rounded-full cursor-pointer ${
                          settings.appearance.primaryColor === '#22c55e' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        onClick={() => handleInputChange('appearance', 'primaryColor', '#22c55e')}
                      ></div>
                      <div 
                        className={`h-10 w-10 bg-orange-500 rounded-full cursor-pointer ${
                          settings.appearance.primaryColor === '#f97316' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        onClick={() => handleInputChange('appearance', 'primaryColor', '#f97316')}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Logo URL</label>
                    <input
                      type="text"
                      value={settings.appearance.logoUrl}
                      onChange={(e) => handleInputChange('appearance', 'logoUrl', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Menu Layout</label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={settings.appearance.menuLayout === 'sidebar'}
                          onChange={() => handleInputChange('appearance', 'menuLayout', 'sidebar')}
                          className="text-lms-primary"
                        />
                        <span className="ml-2 text-white">Sidebar</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={settings.appearance.menuLayout === 'topnav'}
                          onChange={() => handleInputChange('appearance', 'menuLayout', 'topnav')}
                          className="text-lms-primary"
                        />
                        <span className="ml-2 text-white">Top Navigation</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Enable Custom CSS</p>
                      <p className="text-sm text-gray-400">Allow custom CSS to be injected</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.appearance.enableCustomCss}
                        onChange={() => handleToggleChange('appearance', 'enableCustomCss')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Student Theme Selection</p>
                      <p className="text-sm text-gray-400">Allow students to select their preferred theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.appearance.enableStudentThemes}
                        onChange={() => handleToggleChange('appearance', 'enableStudentThemes')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Course Settings */}
            {activeTab === 'course' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Course Default Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Default Course Visibility</label>
                    <select
                      value={settings.course.defaultCourseVisibility}
                      onChange={(e) => handleInputChange('course', 'defaultCourseVisibility', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Require Course Approval</p>
                      <p className="text-sm text-gray-400">New courses require admin approval before publishing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.course.requireApproval}
                        onChange={() => handleToggleChange('course', 'requireApproval')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Allow Multiple Quiz Attempts</p>
                      <p className="text-sm text-gray-400">Students can retry quizzes multiple times</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.course.allowMultipleAttempts}
                        onChange={() => handleToggleChange('course', 'allowMultipleAttempts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Show Course Progress Bar</p>
                      <p className="text-sm text-gray-400">Display progress in course listings and dashboards</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.course.showProgressBar}
                        onChange={() => handleToggleChange('course', 'showProgressBar')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Enable Course Certificates</p>
                      <p className="text-sm text-gray-400">Generate certificates upon course completion</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.course.enableCertificates}
                        onChange={() => handleToggleChange('course', 'enableCertificates')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Enable Achievement Badges</p>
                      <p className="text-sm text-gray-400">Award badges for course milestones and achievements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.course.enableBadges}
                        onChange={() => handleToggleChange('course', 'enableBadges')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lms-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lms-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <button 
                className="bg-lms-primary text-white px-4 py-2 rounded hover:bg-lms-primary/80 flex items-center"
                onClick={handleSave}
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
