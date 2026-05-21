
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Award, Download, Shield, Check, ExternalLink, Star, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMyCertificates } from '../../services/certificateService';
import { downloadCertificate } from '../../services/certificateService';
import { getUserBadges, checkBadgeProgress } from '../../services/badgeService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';

interface Certificate {
  _id: string;
  certificateId: string;
  issuedAt: string;
  course: {
    _id: string;
    title: string;
    description: string;
    instructor: {
      firstName: string;
      lastName: string;
    };
    thumbnail?: string;
  };
}

interface Badge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  goal: number;
  progress: number;
  earned: boolean;
  earnedAt?: string;
}

const Certificates: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch certificates data
  const { data: certificatesData, isLoading: certificatesLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: getMyCertificates
  });

  // Fetch badges data
  const { data: badgesData, isLoading: badgesLoading, refetch: refetchBadges } = useQuery({
    queryKey: ['userBadges'],
    queryFn: getUserBadges
  });

  // Check badge progress on mount
  React.useEffect(() => {
    checkBadgeProgress().then(() => {
      refetchBadges();
    }).catch(error => {
      console.error('Error checking badge progress:', error);
    });
  }, [refetchBadges]);
  
  const handleDownload = (certificate: Certificate) => {
    try {
      if (!user) {
        toast.error('You need to be logged in to download certificates');
        return;
      }
      
      const userName = `${user.firstName} ${user.lastName}`;
      downloadCertificate(certificate, userName);
      toast.success('Certificate downloading...');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate. Please try again.');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBadgeIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      award: Award,
      star: Star,
      trophy: Trophy,
      shield: Shield
    };
    return icons[iconName] || Award;
  };

  const getBadgeColor = (color: string) => {
    const colors: { [key: string]: string } = {
      purple: 'bg-purple-500/20 text-purple-400',
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      red: 'bg-red-500/20 text-red-400'
    };
    return colors[color] || colors.purple;
  };

  const badges: Badge[] = badgesData?.data || [];
  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Certificates & Badges</h1>
        <p className="text-gray-400">Your achievements and recognitions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Award className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {certificatesData?.data?.length || 0}
              </p>
              <p className="text-gray-400">Certificates Earned</p>
            </div>
          </div>
        </div>
        
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{earnedBadges.length}</p>
              <p className="text-gray-400">Badges Earned</p>
            </div>
          </div>
        </div>
        
        <div className="lms-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{availableBadges.length}</p>
              <p className="text-gray-400">Badges Available</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Certificates Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Award className="mr-2 text-lms-primary" size={24} />
          Certificates
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificatesLoading ? (
            <div className="col-span-full text-center py-10 text-gray-400">
              Loading your certificates...
            </div>
          ) : certificatesData?.data && certificatesData.data.length > 0 ? (
            certificatesData.data.map((certificate: Certificate) => (
              <div key={certificate._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col">
                <div className="mb-4 relative h-40 w-full">
                  {certificate.course.thumbnail ? (
                    <img 
                      src={certificate.course.thumbnail} 
                      alt={certificate.course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
                      <Award className="h-20 w-20 text-white opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-lg font-bold text-white">{certificate.course.title}</h3>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Instructor</p>
                    <p className="text-white">{certificate.course.instructor.firstName} {certificate.course.instructor.lastName}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Issue Date</p>
                    <p className="text-white">{formatDate(certificate.issuedAt)}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Certificate ID</p>
                    <p className="text-white">{certificate.certificateId}</p>
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-2">
                    <Button 
                      className="bg-lms-primary hover:bg-lms-primary/80 text-white"
                      onClick={() => handleDownload(certificate)}
                    >
                      <Download size={16} className="mr-2" />
                      Download Certificate
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-gray-600 hover:border-gray-500 text-white"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Verify Certificate
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-800/50 rounded-lg p-10 text-center border border-gray-700">
              <Award className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No certificates yet</h3>
              <p className="text-gray-400 mb-4">Complete courses to earn certificates</p>
              <Button 
                onClick={() => window.location.href = "/student/my-courses"}
                className="bg-lms-primary hover:bg-lms-primary/80 text-white"
              >
                Browse Courses
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Earned Badges Section */}
      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Shield className="mr-2 text-lms-primary" size={24} />
            Earned Badges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {earnedBadges.map((badge) => {
              const IconComponent = getBadgeIcon(badge.icon);
              return (
                <div key={badge._id} className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center text-center p-6">
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-4 ${getBadgeColor(badge.color)}`}>
                    <IconComponent size={40} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{badge.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
                  <div className="flex items-center mt-auto">
                    <Check size={14} className="text-green-500 mr-2" />
                    <p className="text-xs text-lms-primary">
                      Earned on {formatDate(badge.earnedAt!)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Available Badges Section */}
      {availableBadges.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Trophy className="mr-2 text-gray-400" size={24} />
            Available Badges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {availableBadges.map((badge) => {
              const IconComponent = getBadgeIcon(badge.icon);
              const progressPercentage = (badge.progress / badge.goal) * 100;
              
              return (
                <div key={badge._id} className="bg-gray-800/50 rounded-lg border border-gray-600 flex flex-col items-center text-center p-6">
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-4 opacity-50 ${getBadgeColor(badge.color)}`}>
                    <IconComponent size={40} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-300 mb-2">{badge.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                  
                  <div className="w-full mt-auto">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{badge.progress}/{badge.goal}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 mb-2" />
                    <p className="text-xs text-gray-500">
                      {Math.round(progressPercentage)}% complete
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {badges.length === 0 && !badgesLoading && (
        <div className="bg-gray-800/50 rounded-lg p-10 text-center border border-gray-700">
          <Shield className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No badges available</h3>
          <p className="text-gray-400">Start learning to unlock achievement badges!</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Certificates;
