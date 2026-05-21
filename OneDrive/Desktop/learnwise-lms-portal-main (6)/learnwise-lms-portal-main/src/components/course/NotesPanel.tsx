
import React, { useState, useEffect } from 'react';
import { Save, FileText, Download } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

interface NotesPanelProps {
  enrollmentId: string;
  moduleId: string;
  instructorNotesPdf?: string;
  onSaveNotes: (notes: string) => Promise<void>;
  initialNotes?: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({
  enrollmentId,
  moduleId,
  instructorNotesPdf,
  onSaveNotes,
  initialNotes = ''
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await onSaveNotes(notes);
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadInstructorNotes = () => {
    if (instructorNotesPdf) {
      window.open(instructorNotesPdf, '_blank');
    }
  };

  return (
    <div className="bg-lms-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText size={20} />
          Module Notes
        </h3>
        {instructorNotesPdf && (
          <Button
            onClick={downloadInstructorNotes}
            variant="outline"
            size="sm"
            className="text-lms-primary border-lms-primary hover:bg-lms-primary hover:text-white"
          >
            <Download size={16} className="mr-2" />
            Instructor Notes (PDF)
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your notes here while watching the video..."
            className="min-h-[200px] bg-gray-800 border-gray-700 text-white resize-none"
          />
        </div>
        
        <Button
          onClick={handleSaveNotes}
          disabled={saving}
          className="w-full bg-lms-primary hover:bg-lms-primary-dark text-white"
        >
          <Save size={16} className="mr-2" />
          {saving ? 'Saving...' : 'Save Notes'}
        </Button>
      </div>
    </div>
  );
};

export default NotesPanel;
