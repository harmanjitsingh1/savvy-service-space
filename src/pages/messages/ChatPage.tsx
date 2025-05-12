
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { User, Message } from "@/types";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ChatPage() {
  const { id: recipientId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);

  // Fetch recipient profile
  const { data: recipient, isLoading: loadingRecipient } = useQuery({
    queryKey: ['chat-recipient', recipientId],
    queryFn: async () => {
      if (!recipientId) throw new Error('Recipient ID is required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', recipientId)
        .single();
        
      if (error) {
        console.error('Error fetching recipient profile:', error);
        throw error;
      }
      
      return data as User;
    },
    enabled: !!recipientId && !!user,
  });
  
  // Fetch chat messages
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['chat-messages', user?.id, recipientId],
    queryFn: async () => {
      if (!user?.id || !recipientId) throw new Error('User and recipient IDs are required');
      
      // Get messages sent by user to recipient
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: true });
        
      if (sentError) {
        console.error('Error fetching sent messages:', sentError);
        throw sentError;
      }
      
      // Get messages sent by recipient to user
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', recipientId)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: true });
        
      if (receivedError) {
        console.error('Error fetching received messages:', receivedError);
        throw receivedError;
      }
      
      // Combine and sort messages by creation time
      const allMessages = [...sentMessages, ...receivedMessages]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      // Mark received messages as read
      if (receivedMessages.some(msg => !msg.read)) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('sender_id', recipientId)
          .eq('recipient_id', user.id)
          .eq('read', false);
      }
      
      return allMessages as Message[];
    },
    enabled: !!user?.id && !!recipientId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Real-time subscription for new messages
  useEffect(() => {
    if (!user?.id || !recipientId) return;
    
    // Subscribe to message changes
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      }, (_payload) => {
        // Invalidate and refetch messages query
        queryClient.invalidateQueries({
          queryKey: ['chat-messages', user.id, recipientId]
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, recipientId, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !recipientId || !content.trim()) {
        throw new Error('Cannot send empty message or missing IDs');
      }
      
      const newMessage = {
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim(),
        read: false,
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', user?.id, recipientId]
      });
    }
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isScrolledToBottom = 
        container.scrollHeight - container.clientHeight <= container.scrollTop + 100;
      
      // Save current scroll height before update
      setPreviousScrollHeight(container.scrollHeight);
      
      // If at bottom or new messages, scroll to bottom
      if (isScrolledToBottom || container.scrollHeight > previousScrollHeight) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, previousScrollHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-6 text-center">
              <h2 className="text-xl font-bold mb-2">Please Login</h2>
              <p className="text-muted-foreground">You need to be logged in to chat with providers.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (loadingRecipient || loadingMessages) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading conversation...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4">
        <Card className="h-[calc(100vh-12rem)]">
          {/* Chat Header */}
          <div className="flex items-center p-4 border-b">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={recipient?.image || ""} alt={recipient?.name} />
              <AvatarFallback>{recipient?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium text-lg">{recipient?.name}</h2>
              <p className="text-xs text-muted-foreground">
                {recipient?.role === "provider" ? "Service Provider" : "User"}
              </p>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="p-4 overflow-y-auto flex-1 h-[calc(100%-8rem)]"
          >
            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isUserMessage = msg.sender_id === user.id;
                  const formattedDate = format(new Date(msg.created_at), 'MMM d, HH:mm');
                  
                  return (
                    <div 
                      key={msg.id || index}
                      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] rounded-lg p-3 ${
                          isUserMessage 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-muted rounded-tl-none'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          isUserMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={sendMessageMutation.isPending || !message.trim()}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="ml-2">Send</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
