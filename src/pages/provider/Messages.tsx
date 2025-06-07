
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { MessageSquare, User, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ConversationInfo {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_image?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function ProviderMessagesPage() {
  const { user } = useAuth();

  // Fetch conversations for the provider
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['provider-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required');
      
      // Get all unique conversation partners
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('recipient_id, created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });
        
      if (sentError) throw sentError;
      
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
        
      if (receivedError) throw receivedError;
      
      // Get unique conversation partners
      const partners = new Set<string>();
      sentMessages.forEach(msg => partners.add(msg.recipient_id));
      receivedMessages.forEach(msg => partners.add(msg.sender_id));
      
      if (partners.size === 0) return [];
      
      // Fetch conversation details for each partner
      const conversationPromises = Array.from(partners).map(async (partnerId) => {
        // Get partner profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, image')
          .eq('id', partnerId)
          .single();
        
        // Get last message between users
        const { data: lastMessageSent } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('sender_id', user.id)
          .eq('recipient_id', partnerId)
          .order('created_at', { ascending: false })
          .limit(1);
          
        const { data: lastMessageReceived } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('sender_id', partnerId)
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Find the most recent message
        const allLastMessages = [
          ...(lastMessageSent || []),
          ...(lastMessageReceived || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        const lastMessage = allLastMessages[0];
        
        // Count unread messages from this partner
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', partnerId)
          .eq('recipient_id', user.id)
          .eq('read', false);
        
        return {
          id: partnerId,
          other_user_id: partnerId,
          other_user_name: profile?.name || 'Unknown User',
          other_user_image: profile?.image,
          last_message: lastMessage?.content || 'No messages yet',
          last_message_time: lastMessage?.created_at || new Date().toISOString(),
          unread_count: unreadCount || 0,
        } as ConversationInfo;
      });
      
      const conversations = await Promise.all(conversationPromises);
      
      // Sort by last message time
      return conversations.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );
    },
    enabled: !!user?.id,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <ProviderLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading conversations...</span>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <Badge variant="secondary">
            {conversations?.length || 0} conversation{(conversations?.length || 0) !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {conversations && conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={conversation.other_user_image || ""} 
                          alt={conversation.other_user_name} 
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {conversation.other_user_name}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count} unread
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-1 mt-1">
                          {conversation.last_message}
                        </p>
                        
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(conversation.last_message_time), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                    
                    <Link to={`/chat/${conversation.other_user_id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open Chat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                No Messages Yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't received any messages from clients yet. Once clients start contacting you about your services, their messages will appear here.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/provider/services">
                    View My Services
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProviderLayout>
  );
}
