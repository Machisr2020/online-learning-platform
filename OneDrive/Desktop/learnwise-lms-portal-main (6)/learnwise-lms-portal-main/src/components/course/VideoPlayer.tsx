
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onComplete?: () => void;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title, 
  onComplete,
  autoPlay = false 
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1${autoPlay ? '&autoplay=1' : ''}`;
    }
    
    // If it's not a YouTube URL, return as is (for other video sources)
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  const handleMarkComplete = () => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset completion status when video changes
    setIsCompleted(false);
  }, [videoUrl]);

  return (
    <div className="bg-lms-card rounded-lg overflow-hidden">
      <div className="relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lms-primary"></div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">Click "Mark as Complete" when finished watching</p>
          </div>
          
          <Button
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={`flex items-center gap-2 ${
              isCompleted 
                ? 'bg-green-600 hover:bg-green-600' 
                : 'bg-lms-primary hover:bg-lms-primary-dark'
            }`}
          >
            <CheckCircle size={16} />
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
