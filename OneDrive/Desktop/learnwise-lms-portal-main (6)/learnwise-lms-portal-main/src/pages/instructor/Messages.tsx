
import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MessageSquare, Send, User, Search, Flag, Users, UserCheck, Paperclip, Image, FileText, Video, Download, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, getConversation, sendMessage, sendMessageWithMedia, markMessageAsRead, getAllStudents, reportUser } from '../../services/messageService';
import { getSocket, initializeSocket } from '../../services/messageService';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  readStatus: boolean;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
}

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  lastLogin?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
}

const InstructorMessages: React.FC = () => {
  const { user, authState } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'all-students' | 'admin'>('conversations');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize socket connection
  useEffect(() => {
    if (authState.token) {
      const socket = initializeSocket(authState.token);
      
      socket.on('message:received', (message: Message) => {
        if (selectedContact && message.sender._id === selectedContact._id) {
          setMessages(prev => {
            const exists = prev.find(m => m._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });
          socket.emit('message:read', message._id);
        } else {
          toast.info(`New message from ${message.sender.firstName} ${message.sender.lastName}`, {
            description: message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content
          });
        }
        
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['all-students'] });
      });
      
      socket.on('message:sent', (message: Message) => {
        setMessages(prev => {
          const exists = prev.find(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      });
      
      socket.on('typing:indicator', (data: { userId: string; status: string }) => {
        if (selectedContact && data.userId === selectedContact._id) {
          setTyping(data.status === 'typing');
        }
      });
      
      return () => {
        socket.off('message:received');
        socket.off('message:sent');
        socket.off('typing:indicator');
      };
    }
  }, [authState.token, selectedContact, queryClient]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch contacts with faster updates
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
    refetchInterval: 3000
  });

  const { data: allStudentsData, isLoading: allStudentsLoading } = useQuery({
    queryKey: ['all-students'],
    queryFn: getAllStudents,
    refetchInterval: 5001
  });
  
  const adminContact = {
    _id: 'admin',
    firstName: 'Admin',
    lastName: 'Support',
    role: 'admin',
    unread: 0
  };
  
  const contacts = React.useMemo(() => {
    let dataSource;
    if (activeTab === 'conversations') dataSource = contactsData?.data || [];
    else if (activeTab === 'all-students') dataSource = allStudentsData?.data || [];
    else dataSource = [adminContact];
    
    return dataSource
      .filter((contact: Contact) => 
        (contact.firstName + ' ' + contact.lastName).toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a: Contact, b: Contact) => {
        if ((a.unread || 0) > 0 && (b.unread || 0) === 0) return -1;
        if ((a.unread || 0) === 0 && (b.unread || 0) > 0) return 1;
        
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
  }, [contactsData, allStudentsData, searchQuery, activeTab]);
  
  const { data: conversationData, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation', selectedContact?._id],
    queryFn: () => selectedContact && selectedContact._id !== 'admin' ? getConversation(selectedContact._id) : null,
    enabled: !!selectedContact && selectedContact._id !== 'admin',
    staleTime: 1000
  });
  
  useEffect(() => {
    if (conversationData?.data) {
      setMessages(conversationData.data);
    }
  }, [conversationData]);
  
  // Send message mutation with media support
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string; file?: File }) => {
      const socket = getSocket();
      
      if (data.file) {
        return sendMessageWithMedia(data.receiverId, data.content, data.file);
      } else if (socket?.connected) {
        return new Promise<void>((resolve, reject) => {
          socket.emit('message:send', data, (response: any) => {
            if (response?.error) reject(new Error(response.error));
            else resolve();
          });
        });
      } else {
        return sendMessage(data.receiverId, data.content);
      }
    },
    onSuccess: () => {
      setNewMessage('');
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedContact?._id] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  });
  
  // Mark message as read mutation
  const markMessageAsReadMutation = useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
    }
  });

  // Report user mutation (fixed)
  const reportUserMutation = useMutation({
    mutationFn: ({ userId, reason, description }: { userId: string; reason: string; description: string }) =>
      reportUser(userId, reason, description),
    onSuccess: () => {
      toast.success('User reported successfully. Admins have been notified.');
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
    },
    onError: (error) => {
      console.error('Error reporting user:', error);
      toast.error('Failed to report user. Please try again.');
    }
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() === '' && !selectedFile) || !selectedContact || selectedContact._id === 'admin') return;
    
    const messageData = {
      receiverId: selectedContact._id,
      content: newMessage || (selectedFile ? `Shared ${selectedFile.name}` : ''),
      ...(selectedFile && { file: selectedFile })
    };
    
    sendMessageMutation.mutate(messageData);
  };
  
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedContact && selectedContact._id !== 'admin') {
      const socket = getSocket();
      if (socket?.connected) {
        if (e.target.value) {
          socket.emit('typing:start', selectedContact._id);
          
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', selectedContact._id);
          }, 3000);
        } else {
          socket.emit('typing:stop', selectedContact._id);
        }
      }
    }
  };

  const handleReportUser = () => {
    if (!selectedContact || !reportReason || !reportDescription || selectedContact._id === 'admin') {
      toast.error('Please fill in all fields');
      return;
    }

    reportUserMutation.mutate({
      userId: selectedContact._id,
      reason: reportReason,
      description: reportDescription
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Image className="h-4 w-4" />;
    if (['mp4', 'avi', 'mov', 'webm'].includes(ext || '')) return <Video className="h-4 w-4" />;
    if (['pdf'].includes(ext || '')) return <FileText className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };

  const isLoading = activeTab === 'conversations' ? contactsLoading : 
                   activeTab === 'admin' ? false : allStudentsLoading;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-gray-400">Chat with your students and admin</p>
      </div>
      
      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-gray-800 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
        {/* Enhanced sidebar */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="grid grid-cols-3 gap-1 mb-4">
              <Button
                variant={activeTab === 'conversations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('conversations')}
                className="flex flex-col items-center space-y-1 h-auto py-2"
              >
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">Chats</span>
              </Button>
              <Button
                variant={activeTab === 'all-students' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('all-students')}
                className="flex flex-col items-center space-y-1 h-auto py-2"
              >
                <Users className="h-3 w-3" />
                <span className="text-xs">Students</span>
              </Button>
              <Button
                variant={activeTab === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('admin')}
                className="flex flex-col items-center space-y-1 h-auto py-2"
              >
                <Shield className="h-3 w-3" />
                <span className="text-xs">Admin</span>
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="search" 
                placeholder="Search..." 
                className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2"></div>
                Loading...
              </div>
            ) : contacts.length > 0 ? (
              contacts.map((contact: Contact) => (
                <div
                  key={contact._id}
                  className={`flex items-center p-4 hover:bg-gray-800 cursor-pointer border-l-2 transition-all ${
                    selectedContact?._id === contact._id ? 'border-lms-primary bg-gray-800' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex-shrink-0 relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${
                      contact.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.firstName} className="h-full w-full object-cover" />
                      ) : contact.role === 'admin' ? (
                        <Shield className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    {contact.role === 'admin' && (
                      <Badge className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-black">A</Badge>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white truncate">{contact.firstName} {contact.lastName}</h3>
                      <span className="text-xs text-gray-400">
                        {contact.lastMessageTime ? new Date(contact.lastMessageTime).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {contact.lastMessage || 'Click to start conversation'}
                    </p>
                  </div>
                  {(contact.unread || 0) > 0 && (
                    <Badge className="bg-lms-primary text-white text-xs">
                      {contact.unread}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                <Users className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                {searchQuery ? 'No matches found' : 'No contacts available'}
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced chat content */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {selectedContact ? (
            <>
              {/* Chat header with report button */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${
                    selectedContact.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {selectedContact.avatar ? (
                      <img src={selectedContact.avatar} alt={selectedContact.firstName} className="h-full w-full object-cover" />
                    ) : selectedContact.role === 'admin' ? (
                      <Shield className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-white">{selectedContact.firstName} {selectedContact.lastName}</h3>
                    <p className="text-xs text-gray-400 capitalize">{selectedContact.role}</p>
                  </div>
                </div>
                
                {selectedContact.role === 'student' && (
                  <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400/10">
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report Student</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-200">Reason for reporting</label>
                          <Select value={reportReason} onValueChange={setReportReason}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                              <SelectItem value="harassment">Harassment</SelectItem>
                              <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                              <SelectItem value="spam">Spam</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-200">Description</label>
                          <Textarea
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            placeholder="Please provide details about the issue..."
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleReportUser}
                            disabled={reportUserMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {reportUserMutation.isPending ? 'Reporting...' : 'Submit Report'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedContact._id === 'admin' ? (
                  <div className="text-center text-gray-400 py-8">
                    <Shield className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <p className="text-lg font-medium text-white mb-2">Contact Admin Support</p>
                    <p>Need help? Contact our admin team for assistance.</p>
                    <p className="text-sm mt-2">Feature coming soon!</p>
                  </div>
                ) : messagesLoading ? (
                  <div className="text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2"></div>
                    Loading conversation...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex items-start ${
                        message.sender._id === user?.id ? 'justify-end' : ''
                      }`}
                    >
                      {message.sender._id !== user?.id && (
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-8 w-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender._id === user?.id
                            ? 'bg-lms-primary text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {message.mediaUrl && (
                          <div className="mb-2">
                            {message.mediaType?.startsWith('image/') ? (
                              <img 
                                src={message.mediaUrl} 
                                alt="Shared media" 
                                className="rounded max-w-xs cursor-pointer"
                                onClick={() => window.open(message.mediaUrl, '_blank')}
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                                {getFileIcon(message.fileName || '')}
                                <span className="text-sm">{message.fileName}</span>
                                <Button size="sm" variant="ghost" onClick={() => window.open(message.mediaUrl, '_blank')}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="mt-1 text-xs opacity-70 flex items-center gap-1">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.sender._id === user?.id && (
                            <span className={message.readStatus ? 'text-green-300' : 'text-gray-300'}>
                              {message.readStatus ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {message.sender._id === user?.id && (
                        <div className="flex-shrink-0 ml-3">
                          <div className="h-8 w-8 bg-lms-primary/20 text-lms-primary rounded-full flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                )}
                
                {typing && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="bg-gray-800 text-white rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Enhanced message input */}
              {selectedContact._id !== 'admin' && (
                <div className="border-t border-gray-800 p-4">
                  {selectedFile && (
                    <div className="mb-3 p-2 bg-gray-800 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(selectedFile.name)}
                        <span className="text-sm text-white">{selectedFile.name}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedFile(null)}>×</Button>
                    </div>
                  )}
                  
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type your message..."
                        className="w-full py-2 px-4 pr-10 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-lms-primary"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className="bg-lms-primary text-white rounded-md px-4 py-2 hover:bg-lms-primary/80"
                      disabled={sendMessageMutation.isPending || (!newMessage.trim() && !selectedFile)}
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send size={18} />
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-white">Select a conversation</h3>
                <p className="mt-1 text-sm text-gray-400">Choose someone to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorMessages;
