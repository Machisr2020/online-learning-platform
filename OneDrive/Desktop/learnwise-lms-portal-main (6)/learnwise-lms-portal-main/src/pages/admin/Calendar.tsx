
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar } from '../../components/ui/calendar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, PlusCircle, Search, Filter, Users, BarChart3, Settings, Clock, MapPin, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, deleteEvent, Event } from '@/services/eventService';
import { checkAuth } from '@/services/authService';
import AdminEventForm from '../../components/calendar/AdminEventForm';
import EventCard from '../../components/calendar/EventCard';
import AdminCalendarStats from '../../components/calendar/AdminCalendarStats';
import AdminCalendarFilters from '../../components/calendar/AdminCalendarFilters';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const AdminCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  const queryClient = useQueryClient();

  // Fetch current user with better error handling
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: checkAuth,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch events with better error handling
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    enabled: !!currentUser && !userError,
    refetchInterval: 30000,
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  console.log('Admin Calendar - Current User:', currentUser);
  console.log('Admin Calendar - Events Data:', eventsData);

  const events: Event[] = eventsData?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Success', description: 'Event deleted successfully' });
    },
    onError: (error: any) => {
      console.error('Delete event error:', error);
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
    const matchesCreator = filterCreator === 'all' || event.createdBy?.role === filterCreator;
    return matchesSearch && matchesFilter && matchesCreator;
  });

  // Filter events for selected date
  const eventsForSelectedDate = filteredEvents.filter(
    event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    }
  );

  // Get upcoming events
  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 6);

  // Check if date has events
  const hasEvents = (checkDate: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === checkDate.toDateString();
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteMutation.mutate(eventId);
    }
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(undefined);
  };

  // Loading states
  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Error states
  if (userError) {
    console.error('User authentication error:', userError);
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">Authentication Error</p>
            <p className="text-gray-400 mb-4">Please log in to access the admin calendar</p>
            <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Loading user data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Administrative Calendar
            </h1>
            <p className="text-gray-400">Comprehensive event management and oversight</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            <Button 
              onClick={() => setShowEventForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <AdminCalendarStats events={events} />

      {/* Search and Filter Controls */}
      <AdminCalendarFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCreator={filterCreator}
        setFilterCreator={setFilterCreator}
      />
      
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="xl:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Events Overview</span>
                </div>
              </div>
              
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="bg-gray-900/50 rounded-lg p-3 border border-gray-700"
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
          
          {/* Events Section */}
          <div className="xl:col-span-1">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <Badge variant="outline" className="bg-gray-700 text-white border-gray-600">
                  {eventsForSelectedDate.length} Events
                </Badge>
              </div>
              
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {eventsForSelectedDate.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      userRole="admin"
                      currentUserId={currentUser?.id || ''}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <CalendarIcon className="h-12 w-12 text-gray-600 mb-2" />
                  <p className="text-gray-400 mb-2">No events scheduled for this day</p>
                  <Button 
                    onClick={() => setShowEventForm(true)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        // List View
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">All Events</h2>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  userRole="admin"
                  currentUserId={currentUser?.id || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">No events found</p>
            </div>
          )}
        </Card>
      )}

      {/* Upcoming Events Section */}
      <div className="mt-6">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Events
          </h2>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  userRole="admin"
                  currentUserId={currentUser?.id || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">No upcoming events</p>
              <Button 
                onClick={() => setShowEventForm(true)}
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Event
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Admin Event Form Modal */}
      <AdminEventForm
        isOpen={showEventForm}
        onClose={handleCloseForm}
        event={editingEvent}
        userRole="admin"
      />
    </DashboardLayout>
  );
};

export default AdminCalendar;
