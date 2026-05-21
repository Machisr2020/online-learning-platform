
import React from 'react';
import { Card } from '@/components/ui/card';
import { CalendarIcon, Clock, BarChart3, Settings, Users } from 'lucide-react';
import { Event } from '@/services/eventService';

interface AdminCalendarStatsProps {
  events: Event[];
}

const AdminCalendarStats: React.FC<AdminCalendarStatsProps> = ({ events }) => {
  // Get event statistics with null checks
  const eventStats = {
    total: events.length,
    today: events.filter(event => {
      const eventDate = new Date(event.startDate);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length,
    upcoming: events.filter(event => new Date(event.startDate) > new Date()).length,
    byType: events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCreator: events.reduce((acc, event) => {
      // Safe access to createdBy role
      const role = event.createdBy?.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-300">Total Events</p>
            <p className="text-2xl font-bold text-white">{eventStats.total}</p>
          </div>
          <CalendarIcon className="h-8 w-8 text-blue-400" />
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-300">Today</p>
            <p className="text-2xl font-bold text-white">{eventStats.today}</p>
          </div>
          <Clock className="h-8 w-8 text-green-400" />
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-300">Upcoming</p>
            <p className="text-2xl font-bold text-white">{eventStats.upcoming}</p>
          </div>
          <BarChart3 className="h-8 w-8 text-purple-400" />
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-300">By Admins</p>
            <p className="text-2xl font-bold text-white">{eventStats.byCreator.admin || 0}</p>
          </div>
          <Settings className="h-8 w-8 text-orange-400" />
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-300">By Instructors</p>
            <p className="text-2xl font-bold text-white">{eventStats.byCreator.instructor || 0}</p>
          </div>
          <Users className="h-8 w-8 text-cyan-400" />
        </div>
      </Card>
    </div>
  );
};

export default AdminCalendarStats;
