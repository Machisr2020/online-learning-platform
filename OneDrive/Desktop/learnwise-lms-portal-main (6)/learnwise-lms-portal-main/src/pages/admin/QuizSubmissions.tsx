
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { getQuizSubmissions } from '../../services/submissionService';

const QuizSubmissions: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'student'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'passed' | 'failed'>('all');

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['quizSubmissions', quizId],
    queryFn: () => getQuizSubmissions(quizId!),
    enabled: !!quizId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading submissions...</div>
        </div>
      </DashboardLayout>
    );
  }

  const submissions = submissionsData?.data || [];

  const filteredSubmissions = submissions.filter((submission: any) => {
    if (filterBy === 'passed') return submission.passed;
    if (filterBy === 'failed') return !submission.passed;
    return true;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score;
      case 'student':
        return a.student.firstName.localeCompare(b.student.firstName);
      case 'date':
      default:
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
  });

  const handleFilterChange = (value: string) => {
    setFilterBy(value as 'all' | 'passed' | 'failed');
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'date' | 'score' | 'student');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Quiz Submissions</h1>
          <div className="flex gap-4">
            <Select value={filterBy} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {sortedSubmissions.map((submission: any) => (
            <Card key={submission._id} className="bg-lms-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {submission.student.firstName} {submission.student.lastName}
                      </h3>
                      <p className="text-gray-400 text-sm">{submission.student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">
                        {submission.score}/{submission.maxScore}
                      </span>
                      <Badge
                        variant={submission.passed ? 'default' : 'destructive'}
                        className="flex items-center gap-1"
                      >
                        {submission.passed ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {submission.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {((submission.score / submission.maxScore) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </span>
                  <span>
                    Time spent: {Math.floor(submission.timeSpent / 60)}m {submission.timeSpent % 60}s
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No submissions yet</h3>
            <p className="text-gray-400">Students haven't submitted this quiz yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizSubmissions;
