
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Settings, Clock, Bell, UserCheck } from 'lucide-react';

interface AdminEventSettingsProps {
  form: UseFormReturn<any>;
}

const AdminEventSettings: React.FC<AdminEventSettingsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gray-800/30 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Event Configuration
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <Label className="text-white">All Day Event</Label>
                <p className="text-sm text-gray-400">This event lasts the entire day</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-green-400" />
              <div>
                <Label className="text-white">Send Notifications</Label>
                <p className="text-sm text-gray-400">Notify participants about this event</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="sendNotification"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-purple-400" />
              <div>
                <Label className="text-white">Require Attendance</Label>
                <p className="text-sm text-gray-400">Mark attendance for this event</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="requireAttendance"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Maximum Participants (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter max participants" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="bg-gray-900/50 border-gray-600 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Tags (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., important, urgent, mandatory" 
                    {...field} 
                    className="bg-gray-900/50 border-gray-600 text-white"
                  />
                </FormControl>
                <p className="text-xs text-gray-400">Separate tags with commas</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminEventSettings;
