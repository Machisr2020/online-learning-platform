
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  BookOpen,
  PlusCircle,
  Search,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, deleteEvent, Event } from '@/services/eventService';
import { checkAuth } from '@/services/authService';
import EventForm from '../../components/calendar/EventForm';
import EventCard from '../../components/calendar/EventCard';
import { toast } from '@/hooks/use-toast';

const InstructorCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: checkAuth,
  });

  // Fetch events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    refetchInterval: 30000,
  });

  const events: Event[] = eventsData?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Success', description: 'Event deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to delete event',
        variant: 'destructive'
      });
    },
  });

  // Filter events based on search and filter criteria
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.eventType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Filter events for selected date
  const selectedDateEvents = date 
    ? filteredEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getFullYear() === date.getFullYear() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getDate() === date.getDate();
      }).sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
    : [];

  // Get upcoming events
  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 6);

  // Check if date has events
  const hasEvents = (date: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(eventId);
    }
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(undefined);
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-400">Manage your classes, office hours and deadlines</p>
          </div>
          <Button 
            onClick={() => setShowEventForm(true)}
            className="bg-lms-primary text-white hover:bg-lms-primary/80"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 h-4 w-4" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="class">Classes</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="exam">Exams</SelectItem>
              <SelectItem value="college">College Events</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <Card className="lms-card p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="bg-background text-white rounded-md border-gray-800"
              modifiers={{
                hasEvents: (date) => hasEvents(date)
              }}
              modifiersStyles={{
                hasEvents: { 
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
          </Card>
        </div>
        
        <div className="md:col-span-5">
          <Card className="lms-card p-4 h-full">
            <h2 className="text-lg font-semibold text-white mb-4">
              {date ? date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Select a date'}
            </h2>
            
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedDateEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    userRole="instructor"
                    currentUserId={currentUser?.id || ''}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-600" />
                <p className="mt-2 text-gray-400">No events scheduled for this day</p>
                <Button 
                  onClick={() => setShowEventForm(true)}
                  className="mt-4 bg-lms-primary text-white hover:bg-lms-primary/80"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="mt-6">
        <Card className="lms-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Upcoming Events</h2>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  userRole="instructor"
                  currentUserId={currentUser?.id || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">No upcoming events</p>
              <Button 
                onClick={() => setShowEventForm(true)}
                className="mt-4 bg-lms-primary text-white hover:bg-lms-primary/80"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Event
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Event Form Modal */}
      <EventForm
        isOpen={showEventForm}
        onClose={handleCloseForm}
        event={editingEvent}
        userRole="instructor"
      />
    </DashboardLayout>
  );
};

export default InstructorCalendar;
