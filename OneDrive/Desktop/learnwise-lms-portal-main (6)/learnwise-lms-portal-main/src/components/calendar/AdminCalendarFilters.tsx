
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface AdminCalendarFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterCreator: string;
  setFilterCreator: (creator: string) => void;
}

const AdminCalendarFilters: React.FC<AdminCalendarFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCreator,
  setFilterCreator,
}) => {
  return (
    <div className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="text-gray-400 h-4 w-4" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 bg-gray-900/50 border-gray-600">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="class">Classes</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="exam">Exams</SelectItem>
              <SelectItem value="college">College Events</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCreator} onValueChange={setFilterCreator}>
            <SelectTrigger className="w-48 bg-gray-900/50 border-gray-600">
              <SelectValue placeholder="Filter by creator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="instructor">Instructors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarFilters;
