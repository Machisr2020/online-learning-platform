
import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MessageSquare, Send, User, Search, Users, Shield, Flag, Paperclip, Image, FileText, Video, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, getConversation, sendMessage, markMessageAsRead, getAllStudents, getAllInstructors } from '../../services/messageService';
import { getSocket, initializeSocket } from '../../services/messageService';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card } from '../../components/ui/card';
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

const AdminMessages: React.FC = () => {
  const { user, authState } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'students' | 'instructors'>('conversations');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize socket connection with optimized settings
  useEffect(() => {
    if (authState.token) {
      const socket = initializeSocket(authState.token);
      
      // Optimized message handling for real-time updates
      socket.on('message:received', (message: Message) => {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.find(m => m._id === message._id);
          if (exists) return prev;
          
          // Add to messages if viewing the conversation
          if (selectedContact && message.sender._id === selectedContact._id) {
            markMessageAsReadMutation.mutate(message._id);
            return [...prev, message];
          }
          
          // Show notification for new message
          toast.info(`New message from ${message.sender.firstName} ${message.sender.lastName}`, {
            description: message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content,
            duration: 3000
          });
          
          return prev;
        });
        
        // Refresh contacts list immediately
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['all-students'] });
        queryClient.invalidateQueries({ queryKey: ['all-instructors'] });
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
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch contacts with message history
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
    refetchInterval: 5001 // Refresh every 5 seconds
  });

  // Fetch all students
  const { data: allStudentsData, isLoading: allStudentsLoading } = useQuery({
    queryKey: ['all-students'],
    queryFn: getAllStudents,
    refetchInterval: 10000
  });

  // Fetch all instructors
  const { data: allInstructorsData, isLoading: allInstructorsLoading } = useQuery({
    queryKey: ['all-instructors'],
    queryFn: getAllInstructors,
    refetchInterval: 10000
  });
  
  // Create contacts list based on active tab
  const contacts = React.useMemo(() => {
    let dataSource;
    if (activeTab === 'conversations') dataSource = contactsData?.data;
    else if (activeTab === 'students') dataSource = allStudentsData?.data;
    else dataSource = allInstructorsData?.data;
    
    if (!dataSource) return [];
    
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
  }, [contactsData, allStudentsData, allInstructorsData, searchQuery, activeTab]);
  
  // Fetch conversation with optimized caching
  const { data: conversationData, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation', selectedContact?._id],
    queryFn: () => selectedContact ? getConversation(selectedContact._id) : null,
    enabled: !!selectedContact,
    staleTime: 1000 // Consider data stale after 1 second
  });
  
  // Update messages when conversation changes
  useEffect(() => {
    if (conversationData?.data) {
      setMessages(conversationData.data);
      
      // Mark unread messages as read
      conversationData.data.forEach((message: Message) => {
        if (!message.readStatus && message.sender._id === selectedContact?._id) {
          markMessageAsReadMutation.mutate(message._id);
        }
      });
    }
  }, [conversationData]);
  
  // Optimized send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string; file?: File }) => {
      const socket = getSocket();
      
      if (data.file) {
        // Handle file upload via REST API
        const formData = new FormData();
        formData.append('receiverId', data.receiverId);
        formData.append('content', data.content);
        formData.append('media', data.file);
        
        const response = await fetch('/api/messages/media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`
          },
          body: formData
        });
        
        if (!response.ok) throw new Error('Failed to send media');
        return response.json();
      } else if (socket?.connected) {
        // Send text message via socket for speed
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
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
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
      queryClient.invalidateQueries({ queryKey: ['all-instructors'] });
    }
  });
  
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
          
          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          // Set timeout to stop typing after 3 seconds of no input
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
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setShowMediaPreview(true);
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
                   activeTab === 'students' ? allStudentsLoading : allInstructorsLoading;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-yellow-400" />
              Admin Messages
            </h1>
            <p className="text-gray-400">Manage communications across the platform</p>
          </div>
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/20 p-4">
            <div className="text-center">
              <p className="text-sm text-yellow-300">Total Contacts</p>
              <p className="text-2xl font-bold text-white">{contacts.length}</p>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Enhanced sidebar */}
        <div className="w-96 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 flex flex-col">
          {/* Enhanced tab selector */}
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-yellow-900/10 to-orange-900/10">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant={activeTab === 'conversations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('conversations')}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Active Chats</span>
              </Button>
              <Button
                variant={activeTab === 'students' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('students')}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <Users className="h-4 w-4" />
                <span className="text-xs">Students</span>
              </Button>
              <Button
                variant={activeTab === 'instructors' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('instructors')}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <Shield className="h-4 w-4" />
                <span className="text-xs">Instructors</span>
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="search" 
                placeholder="Search users..." 
                className="w-full py-3 pl-10 pr-4 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Enhanced contacts list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                Loading users...
              </div>
            ) : contacts.length > 0 ? (
              contacts.map((contact: Contact) => (
                <div
                  key={contact._id}
                  className={`flex items-center p-4 hover:bg-gray-700/50 cursor-pointer border-l-4 transition-all ${
                    selectedContact?._id === contact._id 
                      ? 'border-yellow-500 bg-gray-700/30' 
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex-shrink-0 relative">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden ${
                      contact.role === 'instructor' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.firstName} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`absolute -top-1 -right-1 text-xs ${
                        contact.role === 'instructor' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}
                    >
                      {contact.role === 'instructor' ? 'I' : 'S'}
                    </Badge>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white truncate">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {contact.lastMessageTime ? new Date(contact.lastMessageTime).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {contact.lastMessage || 'Click to start conversation'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{contact.role}</p>
                  </div>
                  {(contact.unread || 0) > 0 && (
                    <Badge className="bg-yellow-500 text-black text-xs font-medium">
                      {contact.unread}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                <Users className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                {searchQuery ? 'No users match your search' : 'No users found'}
                <p className="text-xs mt-2">
                  {activeTab === 'conversations' ? 'Start a conversation with users' : 'All registered users will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced chat content */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
          {selectedContact ? (
            <>
              {/* Enhanced chat header */}
              <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-yellow-900/10 to-orange-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden ${
                      selectedContact.role === 'instructor' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {selectedContact.avatar ? (
                        <img src={selectedContact.avatar} alt={selectedContact.firstName} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedContact.role === 'instructor' ? 'secondary' : 'outline'}>
                          {selectedContact.role}
                        </Badge>
                        {selectedContact.lastLogin && (
                          <span className="text-xs text-gray-400">
                            Last seen: {new Date(selectedContact.lastLogin).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowReportDialog(true)}
                    className="text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    Report User
                  </Button>
                </div>
              </div>
              
              {/* Enhanced messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900/50 to-gray-800/50">
                {messagesLoading ? (
                  <div className="text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                    Loading conversation...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex items-end gap-3 ${
                        message.sender._id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender._id !== user?.id && (
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          selectedContact.role === 'instructor' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sender._id === user?.id
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}>
                        {message.mediaUrl && (
                          <div className="mb-2">
                            {message.mediaType?.startsWith('image/') ? (
                              <img 
                                src={message.mediaUrl} 
                                alt="Shared media" 
                                className="rounded-lg max-w-xs cursor-pointer"
                                onClick={() => window.open(message.mediaUrl, '_blank')}
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-gray-600 rounded-lg">
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
                        <div className="mt-2 text-xs opacity-70 flex items-center gap-2">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.sender._id === user?.id && (
                            <span className={message.readStatus ? 'text-green-300' : 'text-gray-300'}>
                              {message.readStatus ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {message.sender._id === user?.id && (
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                )}
                
                {typing && (
                  <div className="flex items-end gap-3">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      selectedContact.role === 'instructor' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className="bg-gray-700 text-white rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Enhanced message input */}
              <div className="border-t border-gray-700 p-4 bg-gradient-to-r from-gray-900 to-gray-800">
                {selectedFile && (
                  <div className="mb-3 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(selectedFile.name)}
                      <span className="text-sm text-white">{selectedFile.name}</span>
                      <span className="text-xs text-gray-400">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedFile(null)}>
                      ×
                    </Button>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Type your message..."
                      className="w-full py-3 px-4 pr-12 bg-gray-700 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-2xl px-6 py-3"
                    disabled={sendMessageMutation.isPending || (!newMessage.trim() && !selectedFile)}
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-900/50 to-gray-800/50">
              <div className="text-center">
                <Shield className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Admin Message Center</h3>
                <p className="text-gray-400">Select a user to start messaging</p>
                <p className="text-sm text-gray-500 mt-2">Manage communications across the platform</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-200">Reason for reporting</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="policy_violation">Policy Violation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-200">Description</label>
              <Textarea
                placeholder="Please provide details about the issue..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminMessages;
