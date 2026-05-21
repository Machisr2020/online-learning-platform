
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { submitCourseRating } from '../../services/courseService';
import { useToast } from '@/components/ui/use-toast';

interface CourseRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onRatingSubmitted: () => void;
}

const CourseRatingModal: React.FC<CourseRatingModalProps> = ({
  isOpen,
  onClose,
  course,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const ratingMutation = useMutation({
    mutationFn: submitCourseRating,
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this course!",
      });
      onRatingSubmitted();
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit rating",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose a star rating before submitting",
        variant: "destructive",
      });
      return;
    }

    ratingMutation.mutate({
      courseId: course._id,
      rating,
      comment
    });
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Rate Course: {course.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-gray-400 mb-4">How would you rate this course?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-colors"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comments (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this course..."
              className="bg-gray-800 border-gray-600 text-white"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-lms-primary hover:bg-lms-primary-dark"
              disabled={ratingMutation.isPending}
            >
              {ratingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseRatingModal;
