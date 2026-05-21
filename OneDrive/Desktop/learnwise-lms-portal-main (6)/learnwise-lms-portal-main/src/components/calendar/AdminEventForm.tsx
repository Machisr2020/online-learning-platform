
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { createEvent, updateEvent, getUsers, EventData, Event } from '@/services/eventService';
import { toast } from '@/hooks/use-toast';
import AdminEventFormSteps from './AdminEventFormSteps';
import AdminEventBasicInfo from './AdminEventBasicInfo';
import AdminEventSettings from './AdminEventSettings';
import AdminEventParticipants from './AdminEventParticipants';

const adminEventSchema = z.object({
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
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  sendNotification: z.boolean().default(true),
  requireAttendance: z.boolean().default(false),
  maxParticipants: z.number().optional(),
  tags: z.string().optional(),
});

type AdminEventFormData = z.infer<typeof adminEventSchema>;

interface AdminEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  userRole: 'admin' | 'instructor' | 'student';
}

const AdminEventForm: React.FC<AdminEventFormProps> = ({ isOpen, onClose, event, userRole }) => {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(event?.participants || []);
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();

  const form = useForm<AdminEventFormData>({
    resolver: zodResolver(adminEventSchema),
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
      priority: 'medium',
      sendNotification: true,
      requireAttendance: false,
      tags: '',
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
      toast({ 
        title: 'Success', 
        description: 'Event created successfully with admin privileges',
        duration: 3000,
      });
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
      toast({ 
        title: 'Success', 
        description: 'Event updated successfully',
        duration: 3000,
      });
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

  const onSubmit = (data: AdminEventFormData) => {
    const eventData: EventData = {
      title: data.title,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {event ? 'Edit Event' : 'Create New Event'}
              </h2>
              <p className="text-sm text-gray-400">Administrative Event Management</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Step Indicator */}
        <AdminEventFormSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && <AdminEventBasicInfo form={form} />}

            {/* Step 2: Settings */}
            {currentStep === 2 && <AdminEventSettings form={form} />}

            {/* Step 3: Participants & Visibility */}
            {currentStep === 3 && (
              <AdminEventParticipants 
                form={form} 
                users={users}
                selectedParticipants={selectedParticipants}
                setSelectedParticipants={setSelectedParticipants}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-700">
              <div className="flex items-center gap-2">
                {form.watch('priority') && (
                  <Badge className={getPriorityColor(form.watch('priority'))}>
                    {form.watch('priority')} Priority
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Previous
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {currentStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? 'Saving...' 
                      : event ? 'Update Event' : 'Create Event'
                    }
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminEventForm;
