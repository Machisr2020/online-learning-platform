
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Eye, Globe, Shield, Users } from 'lucide-react';

interface AdminEventParticipantsProps {
  form: UseFormReturn<any>;
  users: any[];
  selectedParticipants: string[];
  setSelectedParticipants: (participants: string[]) => void;
}

const AdminEventParticipants: React.FC<AdminEventParticipantsProps> = ({
  form,
  users,
  selectedParticipants,
  setSelectedParticipants,
}) => {
  const handleParticipantToggle = (userId: string) => {
    setSelectedParticipants(
      selectedParticipants.includes(userId) 
        ? selectedParticipants.filter(id => id !== userId)
        : [...selectedParticipants, userId]
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gray-800/30 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visibility & Participants
        </h3>

        <FormField
          control={form.control}
          name="visibilityType"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="text-white">Event Visibility</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="role">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Specific Roles
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Specific Users
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('visibilityType') === 'role' && (
          <div className="space-y-3 p-4 bg-gray-900/30 rounded-lg">
            <Label className="text-sm font-medium text-white">Visible to Roles:</Label>
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
                  <Label htmlFor={role} className="capitalize text-white">{role}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {form.watch('visibilityType') === 'specific' && (
          <div className="space-y-3 p-4 bg-gray-900/30 rounded-lg">
            <Label className="text-sm font-medium text-white">Select Participants:</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-600 rounded-md p-3">
              {users.map((user: any) => (
                <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={user._id}
                      checked={selectedParticipants.includes(user._id)}
                      onCheckedChange={() => handleParticipantToggle(user._id)}
                    />
                    <div>
                      <Label htmlFor={user._id} className="text-sm text-white">
                        {user.firstName} {user.lastName}
                      </Label>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Selected: {selectedParticipants.length} participants
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminEventParticipants;
