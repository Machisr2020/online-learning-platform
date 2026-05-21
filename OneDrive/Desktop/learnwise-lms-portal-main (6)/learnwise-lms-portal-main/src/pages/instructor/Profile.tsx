
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Users, Camera, Save, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InstructorProfile: React.FC = () => {
  const { user } = useAuth();
  
  // Mock profile data
  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. Smith',
    email: user?.email || 'smith@university.edu',
    phone: '+1 (555) 987-6543',
    address: '456 Faculty Boulevard, University City, CA 90210',
    dateJoined: 'September 10, 2024',
    coursesCount: 5,
    studentsCount: 128,
    bio: 'Professor of Computer Science with over 10 years of experience in teaching web development, programming languages, and software engineering. Passionate about creating interactive and engaging learning experiences for students.',
    expertise: ['Web Development', 'JavaScript', 'React', 'Python', 'Database Design', 'Software Engineering'],
    education: [
      'Ph.D. in Computer Science, Stanford University',
      'M.S. in Information Technology, MIT',
      'B.S. in Computer Science, UCLA'
    ],
    socialLinks: {
      website: 'drsmith.edu',
      github: 'github.com/drsmith',
      linkedin: 'linkedin.com/in/drsmith',
      twitter: 'twitter.com/drsmith'
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };
  
  const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const expertise = e.target.value.split(',').map(item => item.trim());
    setEditedProfile({ ...editedProfile, expertise });
  };
  
  const handleEducationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const education = e.target.value.split('\n').filter(item => item.trim());
    setEditedProfile({ ...editedProfile, education });
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
        <h1 className="text-3xl font-bold text-white mb-2">Instructor Profile</h1>
        <p className="text-gray-400">Manage your personal and professional information</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - User info */}
        <div className="lg:col-span-1">
          <div className="lms-card flex flex-col items-center p-6 mb-6">
            <div className="relative mb-4">
              <div className="h-24 w-24 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center overflow-hidden">
                <User className="h-12 w-12" />
              </div>
              <button className="absolute bottom-0 right-0 bg-lms-primary text-white rounded-full p-2 hover:bg-lms-primary/80">
                <Camera size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
            <p className="text-sm text-gray-400 mb-4">Instructor</p>
            
            <div className="w-full space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="text-gray-400 mr-2" size={16} />
                <span className="text-white">{profile.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="text-gray-400 mr-2" size={16} />
                <span className="text-white">{profile.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="text-gray-400 mr-2" size={16} />
                <span className="text-white">{profile.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="text-gray-400 mr-2" size={16} />
                <span className="text-white">Joined: {profile.dateJoined}</span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="text-lms-primary" size={20} />
                </div>
                <p className="text-2xl font-bold text-white">{profile.coursesCount}</p>
                <p className="text-xs text-gray-400">Courses</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="text-lms-primary" size={20} />
                </div>
                <p className="text-2xl font-bold text-white">{profile.studentsCount}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
            </div>
          </div>
          
          <div className="lms-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="w-20 text-gray-400">Website</span>
                <span className="text-white">{profile.socialLinks.website}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-20 text-gray-400">GitHub</span>
                <span className="text-white">{profile.socialLinks.github}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-20 text-gray-400">LinkedIn</span>
                <span className="text-white">{profile.socialLinks.linkedin}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-20 text-gray-400">Twitter</span>
                <span className="text-white">{profile.socialLinks.twitter}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Profile details */}
        <div className="lg:col-span-2">
          <div className="lms-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Profile Information</h3>
              {!isEditing ? (
                <button 
                  className="text-lms-primary hover:text-lms-primary/80 flex items-center"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-1" size={16} />
                  Edit Profile
                </button>
              ) : (
                <button 
                  className="text-lms-primary hover:text-lms-primary/80 flex items-center"
                  onClick={handleSave}
                >
                  <Save className="mr-1" size={16} />
                  Save Changes
                </button>
              )}
            </div>
            
            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Biography</h4>
                  <p className="text-white">{profile.bio}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((item, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-800 text-white text-xs rounded-full px-3 py-1"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Education</h4>
                  <ul className="list-disc text-white pl-5 space-y-1">
                    {profile.education.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
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
                  <label className="block text-sm text-gray-400 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editedProfile.address}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Biography</label>
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Areas of Expertise (comma separated)</label>
                  <input
                    type="text"
                    value={editedProfile.expertise.join(', ')}
                    onChange={handleExpertiseChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Education (one per line)</label>
                  <textarea
                    value={editedProfile.education.join('\n')}
                    onChange={handleEducationChange}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                  ></textarea>
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-800 border border-gray-700 rounded text-white p-2 focus:outline-none focus:ring-1 focus:ring-lms-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorProfile;
