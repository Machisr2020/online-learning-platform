
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Users, Link2, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createEvent, updateEvent, getUsers, EventData, Event } from '@/services/eventService';
import { toast } from '@/hooks/use-toast';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  eventType: z.enum(['class', 'assignment', 'exam', 'college', 'meeting', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  meetLink: z.string().url().optional().or(z.literal('')),
  course: z.string().optional(),
  visibilityType: z.enum(['all', 'specific', 'role']).default('all'),
  visibleToRoles: z.array(z.string()).optional(),
  participants: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  userRole: 'admin' | 'instructor' | 'student';
}

const EventForm: React.FC<EventFormProps> = ({ isOpen, onClose, event, userRole }) => {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(event?.participants || []);
  const queryClient = useQueryClient();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      eventType: event?.eventType || 'other',
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      allDay: event?.allDay || false,
      location: event?.location || '',
      meetLink: event?.meetLink || '',
      visibilityType: event?.visibilityType || 'all',
      visibleToRoles: event?.visibleToRoles || [],
      participants: event?.participants || [],
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isOpen,
  });

  const users = usersData?.data || [];

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Success', description: 'Event created successfully' });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to create event',
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventData> }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Success', description: 'Event updated successfully' });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to update event',
        variant: 'destructive'
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    // Ensure required fields are properly typed for EventData
    const eventData: EventData = {
      title: data.title, // This is guaranteed to exist due to zod validation
      description: data.description,
      eventType: data.eventType,
      startDate: data.startDate,
      endDate: data.endDate,
      allDay: data.allDay,
      location: data.location,
      meetLink: data.meetLink,
      course: data.course,
      visibilityType: data.visibilityType,
      visibleToRoles: data.visibleToRoles,
      participants: selectedParticipants,
    };

    if (event) {
      updateMutation.mutate({ id: event._id, data: eventData });
    } else {
      createMutation.mutate(eventData);
    }
  };

  const handleParticipantToggle = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="college">College Event</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="role">Specific Roles</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://meet.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter event description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>All Day Event</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('visibilityType') === 'role' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Visible to Roles:</Label>
                <div className="flex gap-4">
                  {['student', 'instructor', 'admin'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={form.watch('visibleToRoles')?.includes(role)}
                        onCheckedChange={(checked) => {
                          const currentRoles = form.getValues('visibleToRoles') || [];
                          if (checked) {
                            form.setValue('visibleToRoles', [...currentRoles, role]);
                          } else {
                            form.setValue('visibleToRoles', currentRoles.filter(r => r !== role));
                          }
                        }}
                      />
                      <Label htmlFor={role} className="capitalize">{role}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {form.watch('visibilityType') === 'specific' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Participants:</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-700 rounded-md p-3">
                  {users.map((user: any) => (
                    <div key={user._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user._id}
                        checked={selectedParticipants.includes(user._id)}
                        onCheckedChange={() => handleParticipantToggle(user._id)}
                      />
                      <Label htmlFor={user._id} className="text-sm">
                        {user.firstName} {user.lastName} ({user.role})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? 'Saving...' 
                  : event ? 'Update Event' : 'Create Event'
                }
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EventForm;
