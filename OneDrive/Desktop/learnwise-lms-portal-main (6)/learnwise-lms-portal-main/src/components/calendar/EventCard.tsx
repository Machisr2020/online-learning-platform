
import React from 'react';
import { Calendar, Clock, MapPin, Users, Link2, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/services/eventService';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  userRole: 'admin' | 'instructor' | 'student';
  currentUserId: string;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onEdit, 
  onDelete, 
  userRole, 
  currentUserId 
}) => {
  // Add null checks for createdBy
  const canEdit = userRole === 'admin' || (event.createdBy?._id === currentUserId);
  
  const getEventTypeColor = (type: string) => {
    switch(type) {
      case 'class': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'assignment': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'exam': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'college': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'meeting': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Safe access to creator information
  const creatorName = event.createdBy 
    ? `${event.createdBy.firstName || ''} ${event.createdBy.lastName || ''}`.trim()
    : 'Unknown Creator';

  return (
    <div className={`p-4 rounded-lg border ${getEventTypeColor(event.eventType)} bg-gray-900/40 hover:bg-gray-900/60 transition-colors`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg">{event.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <User className="h-3 w-3 text-gray-400" />
            <p className="text-sm text-gray-400">
              Created by {creatorName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getEventTypeColor(event.eventType)}>
            {event.eventType}
          </Badge>
          
          {canEdit && (
            <div className="flex gap-1">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-white"
                  onClick={() => onEdit(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-red-400"
                  onClick={() => onDelete(event._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDate(event.startDate)}</span>
          {event.endDate && event.endDate !== event.startDate && (
            <span>- {formatDate(event.endDate)}</span>
          )}
        </div>

        {!event.allDay && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{formatTime(event.startDate)}</span>
            {event.endDate && (
              <span>- {formatTime(event.endDate)}</span>
            )}
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{event.location}</span>
          </div>
        )}

        {event.meetLink && (
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-400" />
            <a 
              href={event.meetLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Join Meeting
            </a>
          </div>
        )}

        {event.course && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>Course: {event.course.title}</span>
          </div>
        )}
      </div>

      {event.description && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-sm text-gray-400">{event.description}</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Visibility: {event.visibilityType === 'all' ? 'All Users' : 
                      event.visibilityType === 'role' ? `Roles: ${event.visibleToRoles?.join(', ')}` : 
                      'Specific Users'}
        </div>
        
        {event.allDay && (
          <Badge variant="secondary" className="text-xs">
            All Day
          </Badge>
        )}
      </div>
    </div>
  );
};

export default EventCard;
