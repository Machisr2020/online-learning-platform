
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Clock, User, BookOpen, MessageSquare, RefreshCw, AlertTriangle } from 'lucide-react';
import { getPendingAttemptRequests, approveAttemptRequest, rejectAttemptRequest } from '../../services/submissionService';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';

const QuizAttemptRequests: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: requestsResponse, isLoading, refetch, error } = useQuery({
    queryKey: ['pendingAttemptRequests'],
    queryFn: getPendingAttemptRequests,
    refetchInterval: 5001, // Refetch every 5 seconds
    retry: 3,
    refetchOnWindowFocus: true,
  });

  console.log('[QuizAttemptRequests] Query response:', requestsResponse);
  console.log('[QuizAttemptRequests] Error:', error);
  console.log('[QuizAttemptRequests] Loading:', isLoading);

  const approveMutation = useMutation({
    mutationFn: approveAttemptRequest,
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "The extra attempt request has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingAttemptRequests'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Approve error:', error);
      toast({
        title: "Approval Failed",
        description: error.response?.data?.message || "Failed to approve request",
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAttemptRequest,
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "The extra attempt request has been rejected.",
      });
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['pendingAttemptRequests'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Reject error:', error);
      toast({
        title: "Rejection Failed",
        description: error.response?.data?.message || "Failed to reject request",
        variant: "destructive",
      });
    }
  });

  const handleApprove = (requestId: string) => {
    console.log('[QuizAttemptRequests] Approving request:', requestId);
    approveMutation.mutate(requestId);
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (selectedRequest) {
      console.log('[QuizAttemptRequests] Rejecting request:', selectedRequest._id);
      rejectMutation.mutate(selectedRequest._id);
    }
  };

  const handleRefresh = () => {
    console.log('[QuizAttemptRequests] Manual refresh triggered');
    refetch();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading attempt requests...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.error('[QuizAttemptRequests] Error loading requests:', error);
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <div className="text-red-400 text-center">
            <h3 className="text-lg font-semibold mb-2">Error Loading Requests</h3>
            <p>{error?.message || 'Unknown error occurred'}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const requests = requestsResponse?.data || [];
  const requestCount = requestsResponse?.count || requests.length;

  console.log('[QuizAttemptRequests] Requests to display:', requests);
  console.log('[QuizAttemptRequests] Request count:', requestCount);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Quiz Attempt Requests</h1>
            <p className="text-gray-400 mt-1">Manage student requests for extra quiz attempts</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {requestCount} Pending
            </Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card className="bg-lms-card border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{requestCount}</div>
                <div className="text-sm text-gray-400">Pending Requests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {approveMutation.isSuccess ? '✓' : '-'}
                </div>
                <div className="text-sm text-gray-400">Recently Approved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {rejectMutation.isSuccess ? '✓' : '-'}
                </div>
                <div className="text-sm text-gray-400">Recently Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {requestCount === 0 ? (
          <Card className="bg-lms-card border-gray-700">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
              <p className="text-gray-400 mb-4">All quiz attempt requests have been processed.</p>
              <div className="text-sm text-gray-500">
                <p>Debug Info:</p>
                <p>Response: {JSON.stringify(requestsResponse)}</p>
              </div>
              <Button onClick={handleRefresh} variant="outline" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for New Requests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request: any) => {
              console.log('[QuizAttemptRequests] Rendering request:', request);
              return (
                <Card key={request._id} className="bg-lms-card border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-900/20 rounded-lg">
                          <User className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {request.student?.firstName || 'Unknown'} {request.student?.lastName || 'Student'}
                          </CardTitle>
                          <p className="text-gray-400 text-sm">{request.student?.email || 'No email'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 bg-yellow-900/20 text-yellow-400 border-yellow-600">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">Quiz:</span>
                      <span>{request.quiz?.title || 'Unknown Quiz'}</span>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-400">Student's Reason:</span>
                      </div>
                      <p className="text-gray-300 pl-6 leading-relaxed">{request.reason || 'No reason provided'}</p>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex justify-between items-center">
                      <span>Requested: {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'Unknown date'}</span>
                      <span>ID: {request._id}</span>
                    </div>
                    
                    <div className="flex gap-3 pt-3 border-t border-gray-700">
                      <Button
                        onClick={() => handleApprove(request._id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approveMutation.isPending ? 'Approving...' : 'Approve Request'}
                      </Button>
                      <Button
                        onClick={() => handleReject(request)}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="sm:max-w-[425px] bg-lms-card border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Reject Attempt Request</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to reject the extra attempt request from{' '}
                <span className="font-medium text-white">
                  {selectedRequest?.student?.firstName} {selectedRequest?.student?.lastName}
                </span>
                {' '}for the quiz{' '}
                <span className="font-medium text-white">"{selectedRequest?.quiz?.title}"</span>?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  Rejection Reason (Optional)
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Provide a reason for rejection (optional)..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmReject}
                disabled={rejectMutation.isPending}
                variant="destructive"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default QuizAttemptRequests;
