import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MessageSquare, Send, User, Search, Users, Shield, Paperclip, Image, FileText, Video, Download, Flag } from 'lucide-react';
import { checkAuth } from '../../services/authService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, getConversation, sendMessage, sendMessageWithMedia, markMessageAsRead, getAllInstructors, getAllAdmins, markConversationAsRead, reportUser } from '../../services/messageService';
import { initializeSocket, getSocket } from '../../services/messageService';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';

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

interface AuthResponse {
  data?: {
    id: string;
    token: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface ContactsResponse {
  data?: Contact[];
}

interface ConversationResponse {
  data?: Message[];
}

const StudentMessages: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'all-instructors' | 'all-admins'>('conversations');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get current user
  const { data: currentUser } = useQuery<AuthResponse>({
    queryKey: ['currentUser'],
    queryFn: checkAuth,
  });

  // Initialize socket connection
  useEffect(() => {
    if (currentUser?.data) {
      const socket = initializeSocket(currentUser.data.token);
      
      socket.on('message:received', (message: Message) => {
        if (selectedContact && message.sender._id === selectedContact._id) {
          setMessages(prev => {
            const exists = prev.find(m => m._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });
          // Auto-mark as read when chat is open
          markMessageAsRead(message._id);
        } else {
          toast.info(`New message from ${message.sender.firstName} ${message.sender.lastName}`, {
            description: message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content
          });
        }
        
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['all-instructors'] });
        queryClient.invalidateQueries({ queryKey: ['all-admins'] });
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
  }, [currentUser?.data, selectedContact, queryClient]);
  
  // Mark conversation as read when opening a chat
  useEffect(() => {
    if (selectedContact) {
      markConversationAsRead(selectedContact._id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
          queryClient.invalidateQueries({ queryKey: ['all-instructors'] });
          queryClient.invalidateQueries({ queryKey: ['all-admins'] });
        })
        .catch(console.error);
    }
  }, [selectedContact, queryClient]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch contacts
  const { data: contactsData, isLoading: contactsLoading } = useQuery<ContactsResponse>({
    queryKey: ['contacts'],
    queryFn: getContacts,
    refetchInterval: 3000
  });

  // Fetch all instructors
  const { data: allInstructorsData, isLoading: allInstructorsLoading } = useQuery<ContactsResponse>({
    queryKey: ['all-instructors'],
    queryFn: getAllInstructors,
    refetchInterval: 5001
  });

  // Fetch all admins
  const { data: allAdminsData, isLoading: allAdminsLoading } = useQuery<ContactsResponse>({
    queryKey: ['all-admins'],
    queryFn: getAllAdmins,
    refetchInterval: 5001
  });
  
  const contacts = React.useMemo(() => {
    let dataSource: Contact[] = [];
    if (activeTab === 'conversations') dataSource = contactsData?.data || [];
    else if (activeTab === 'all-instructors') dataSource = allInstructorsData?.data || [];
    else dataSource = allAdminsData?.data || [];
    
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
  }, [contactsData, allInstructorsData, allAdminsData, searchQuery, activeTab]);
  
  const { data: conversationData, isLoading: messagesLoading } = useQuery<ConversationResponse>({
    queryKey: ['conversation', selectedContact?._id],
    queryFn: () => selectedContact ? getConversation(selectedContact._id) : null,
    enabled: !!selectedContact,
    staleTime: 1000
  });
  
  useEffect(() => {
    if (conversationData?.data) {
      setMessages(conversationData.data);
      // Mark all messages as read when conversation loads
      conversationData.data.forEach((message: Message) => {
        if (message.receiver._id === currentUser?.data?.id && !message.readStatus) {
          markMessageAsRead(message._id);
        }
      });
    }
  }, [conversationData, currentUser?.data?.id]);
  
  // Send message mutation
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
  
  // Report user mutation
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

  const handleReportUser = () => {
    if (!selectedContact || !reportReason.trim()) {
      toast.error('Please select a reason for reporting.');
      return;
    }
    
    reportUserMutation.mutate({
      userId: selectedContact._id,
      reason: reportReason,
      description: reportDescription
    });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() === '' && !selectedFile) || !selectedContact) return;
    
    const messageData = {
      receiverId: selectedContact._id,
      content: newMessage || (selectedFile ? `Shared ${selectedFile.name}` : ''),
      ...(selectedFile && { file: selectedFile })
    };
    
    sendMessageMutation.mutate(messageData);
  };
  
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedContact) {
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

  // Fixed media URL function
  const getMediaUrl = (mediaUrl: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    if (mediaUrl.startsWith('http')) {
      return mediaUrl;
    }
    // Ensure proper URL construction without double slashes
    const cleanMediaUrl = mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`;
    return `${baseUrl}${cleanMediaUrl}`;
  };

  // Fixed media opening
  const handleMediaClick = (mediaUrl: string, fileName?: string) => {
    const fullUrl = getMediaUrl(mediaUrl);
    // Create a temporary link to download/view the file
    const link = document.createElement('a');
    link.href = fullUrl;
    link.target = '_blank';
    if (fileName) {
      link.download = fileName;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = activeTab === 'conversations' ? contactsLoading : 
                   activeTab === 'all-instructors' ? allInstructorsLoading : allAdminsLoading;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-gray-400">Chat with instructors and admins</p>
      </div>
      
      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-gray-800 bg-gradient-to-br from-blue-900/10 to-green-900/10">
        {/* Sidebar */}
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
                variant={activeTab === 'all-instructors' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('all-instructors')}
                className="flex flex-col items-center space-y-1 h-auto py-2"
              >
                <Users className="h-3 w-3" />
                <span className="text-xs">Instructors</span>
              </Button>
              <Button
                variant={activeTab === 'all-admins' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('all-admins')}
                className="flex flex-col items-center space-y-1 h-auto py-2"
              >
                <Shield className="h-3 w-3" />
                <span className="text-xs">Admins</span>
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="search" 
                placeholder="Search..." 
                className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading...
              </div>
            ) : contacts.length > 0 ? (
              contacts.map((contact: Contact) => (
                <div
                  key={contact._id}
                  className={`flex items-center p-4 hover:bg-gray-800 cursor-pointer border-l-2 transition-all ${
                    selectedContact?._id === contact._id ? 'border-blue-500 bg-gray-800' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex-shrink-0 relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar} alt={contact.firstName} />
                      <AvatarFallback className={
                        contact.role === 'admin' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : contact.role === 'instructor'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }>
                        {contact.role === 'admin' ? (
                          <Shield className="h-6 w-6" />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white truncate">{contact.firstName} {contact.lastName}</h3>
                      <span className="text-xs text-gray-400">
                        {contact.lastMessageTime ? new Date(contact.lastMessageTime).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {contact.role}
                      </Badge>
                      <p className="text-sm text-gray-400 truncate">
                        {contact.lastMessage || 'Click to start conversation'}
                      </p>
                    </div>
                  </div>
                  {(contact.unread || 0) > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs">
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
        
        {/* Chat content */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {selectedContact ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.firstName} />
                    <AvatarFallback className={
                      selectedContact.role === 'admin' 
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : selectedContact.role === 'instructor'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }>
                      {selectedContact.role === 'admin' ? (
                        <Shield className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-white">{selectedContact.firstName} {selectedContact.lastName}</h3>
                    <p className="text-xs text-gray-400 capitalize">{selectedContact.role}</p>
                  </div>
                </div>
                
                {(selectedContact.role === 'instructor' || selectedContact.role === 'admin') && (
                  <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400/10">
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report {selectedContact.role}</DialogTitle>
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
                {messagesLoading ? (
                  <div className="text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Loading conversation...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => {
                    const isMyMessage = message.sender._id === currentUser?.data?.id;
                    return (
                      <div
                        key={message._id}
                        className={`flex items-start gap-3 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={isMyMessage ? currentUser?.data?.avatar : selectedContact.avatar} 
                              alt="Avatar" 
                            />
                            <AvatarFallback className={
                              isMyMessage 
                                ? 'bg-blue-500 text-white' 
                                : selectedContact.role === 'admin' 
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : selectedContact.role === 'instructor'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-blue-500/20 text-blue-400'
                            }>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Message content */}
                        <div className={`max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              isMyMessage
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-gray-800 text-white rounded-bl-md'
                            }`}
                          >
                            {message.mediaUrl && (
                              <div className="mb-2">
                                {message.mediaType?.startsWith('image/') ? (
                                  <div 
                                    className="relative rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                                    onClick={() => handleMediaClick(message.mediaUrl!, message.fileName)}
                                  >
                                    <img 
                                      src={getMediaUrl(message.mediaUrl)} 
                                      alt="Shared media" 
                                      className="max-w-xs rounded"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                      <Download className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="flex items-center gap-2 p-3 bg-gray-700/50 rounded cursor-pointer hover:bg-gray-600/50 transition-colors border border-gray-600"
                                    onClick={() => handleMediaClick(message.mediaUrl!, message.fileName)}
                                  >
                                    {getFileIcon(message.fileName || '')}
                                    <span className="text-sm flex-1">{message.fileName}</span>
                                    <Download className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            )}
                            {message.content && (
                              <div className="text-sm">{message.content}</div>
                            )}
                          </div>
                          
                          {/* Message time and status */}
                          <div className={`mt-1 text-xs text-gray-400 flex items-center gap-1 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMyMessage && (
                              <span className={message.readStatus ? 'text-green-300' : 'text-gray-300'}>
                                {message.readStatus ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                )}
                
                {typing && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedContact.avatar} alt={selectedContact.firstName} />
                        <AvatarFallback className={
                          selectedContact.role === 'admin' 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-gray-800 text-white rounded-2xl rounded-bl-md px-4 py-2">
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
              
              {/* Message input */}
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
                      className="w-full py-2 px-4 pr-10 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
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

export default StudentMessages;
