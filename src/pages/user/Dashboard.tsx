import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Clock,
  MessageSquare,
  Heart,
  Settings,
  MapPin,
  ChevronRight,
  IndianRupee,
  X,
  UserCircle,
  LogOut,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Provider-specific imports
import { ProviderServices } from "@/components/provider/ProviderServices";
import { ProviderBookingRequests } from "@/components/provider/ProviderBookingRequests";
import { ProviderEarnings } from "@/components/provider/ProviderEarnings";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const queryClient = useQueryClient();

  // Only show provider tabs if user is a provider
  const isProvider = user?.role === 'provider';

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            service:service_id (
              title
            )
          `)
          .eq("user_id", user.id)
          .order("booking_date", { ascending: false });

        if (error) {
          console.error("Error fetching bookings:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Exception fetching bookings:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  const { data: savedServices, isLoading: loadingSavedServices } = useQuery({
    queryKey: ["savedServices", user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("saved_services")
          .select(`
            service_id,
            services:service_id (*)
          `)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching saved services:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Exception fetching saved services:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  const { data: conversations, isLoading: loadingMessages } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      // This would normally fetch from a messages/conversations table
      // For now, we'll return mock data
      return [
        {
          id: "1",
          participantId: "provider1",
          participantName: "John Doe",
          participantImage: "https://via.placeholder.com/150",
          lastMessage: "Thanks for booking the service",
          unreadCount: 2,
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          participantId: "provider2",
          participantName: "Jane Smith",
          participantImage: "https://via.placeholder.com/150",
          lastMessage: "Your service has been confirmed",
          unreadCount: 0,
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    },
    enabled: !!user && activeTab === "messages",
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeSavedService = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("saved_services")
        .delete()
        .eq("user_id", user.id)
        .eq("service_id", serviceId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedServices", user?.id] });
      toast({
        title: "Service removed",
        description: "Service has been removed from your saved list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove service. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isProvider) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Provider Dashboard</CardTitle>
                <CardDescription>Manage your services</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" orientation="vertical">
                  <TabsList className="flex flex-col h-auto w-full rounded-none border-r bg-transparent p-0">
                    <TabsTrigger 
                      value="services" 
                      className="justify-start rounded-none border-b data-[state=active]:bg-muted"
                    >
                      <Calendar className="h-4 w-4 mr-2" /> My Services
                    </TabsTrigger>
                    <TabsTrigger 
                      value="bookings" 
                      className="justify-start rounded-none border-b data-[state=active]:bg-muted"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" /> Booking Requests
                    </TabsTrigger>
                    <TabsTrigger 
                      value="earnings" 
                      className="justify-start rounded-none border-b data-[state=active]:bg-muted"
                    >
                      <IndianRupee className="h-4 w-4 mr-2" /> Earnings
                    </TabsTrigger>
                    <TabsTrigger 
                      value="messages" 
                      className="justify-start rounded-none border-b data-[state=active]:bg-muted"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" /> Messages
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings" 
                      className="justify-start rounded-none data-[state=active]:bg-muted"
                    >
                      <Settings className="h-4 w-4 mr-2" /> Settings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            <div className="md:col-span-3">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="hidden">
                  <TabsList>
                    <TabsTrigger value="services">My Services</TabsTrigger>
                    <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="services" className="mt-0">
                  <ProviderServices />
                </TabsContent>

                <TabsContent value="bookings" className="mt-0">
                  <ProviderBookingRequests />
                </TabsContent>

                <TabsContent value="earnings" className="mt-0">
                  <ProviderEarnings />
                </TabsContent>

                <TabsContent value="messages" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Messages</CardTitle>
                      <CardDescription>Communicate with clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingMessages ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-16 bg-muted rounded-md"></div>
                            </div>
                          ))}
                        </div>
                      ) : conversations && conversations.length > 0 ? (
                        <div className="space-y-2">
                          {conversations.map((conversation: any) => (
                            <div
                              key={conversation.id}
                              className="flex items-center gap-4 p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                              onClick={() => navigate(`/messages/${conversation.participantId}`)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={conversation.participantImage}
                                  alt={conversation.participantName}
                                />
                                <AvatarFallback>
                                  {conversation.participantName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium truncate">
                                    {conversation.participantName}
                                  </h3>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(conversation.updatedAt), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage}
                                </p>
                              </div>
                              {conversation.unreadCount > 0 && (
                                <Badge className="rounded-full">{conversation.unreadCount}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                          <p className="text-muted-foreground mb-4">
                            You haven't started any conversations yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Provider Settings</CardTitle>
                      <CardDescription>Manage your profile and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={user?.image} alt={user?.name} />
                              <AvatarFallback>
                                <UserCircle className="h-20 w-20 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-medium">{user?.name || "User"}</h4>
                              <p className="text-sm text-muted-foreground">
                                {user?.email || ""}
                              </p>
                              <Button size="sm" variant="outline" className="mt-2">
                                Update Profile
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-medium mb-4">Account</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">Change Password</h4>
                                <p className="text-sm text-muted-foreground">
                                  Update your password
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Change
                              </Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">Notifications</h4>
                                <p className="text-sm text-muted-foreground">
                                  Manage your notification preferences
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Configure
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <Button variant="destructive" className="w-full sm:w-auto">
                          <LogOut className="h-4 w-4 mr-2" /> Sign Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Manage your bookings and services</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" orientation="vertical">
                <TabsList className="flex flex-col h-auto w-full rounded-none border-r bg-transparent p-0">
                  <TabsTrigger 
                    value="bookings" 
                    className="justify-start rounded-none border-b data-[state=active]:bg-muted"
                  >
                    <Calendar className="h-4 w-4 mr-2" /> My Bookings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="messages" 
                    className="justify-start rounded-none border-b data-[state=active]:bg-muted"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Messages
                  </TabsTrigger>
                  <TabsTrigger 
                    value="saved" 
                    className="justify-start rounded-none border-b data-[state=active]:bg-muted"
                  >
                    <Heart className="h-4 w-4 mr-2" /> Saved Services
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="justify-start rounded-none data-[state=active]:bg-muted"
                  >
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="hidden">
                <TabsList>
                  <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="saved">Saved Services</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="bookings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>My Bookings</CardTitle>
                    <CardDescription>View and manage your service bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingBookings ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-20 bg-muted rounded-md"></div>
                          </div>
                        ))}
                      </div>
                    ) : bookings && bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking: any) => (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row justify-between gap-4 p-4 border rounded-md"
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">
                                  {booking.service?.title || "Unknown Service"}
                                </h3>
                                <Badge
                                  variant={
                                    booking.status === "confirmed"
                                      ? "default"
                                      : booking.status === "cancelled"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {new Date(booking.booking_date).toLocaleDateString()} at{" "}
                                  {new Date(booking.booking_date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="flex items-center">
                                  <IndianRupee className="h-4 w-4 mr-1" />
                                  {booking.total_amount}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/services/${booking.service_id}`)}
                              >
                                View Details
                              </Button>
                              {booking.status === "pending" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => cancelBooking.mutate(booking.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't booked any services yet
                        </p>
                        <Button onClick={() => navigate("/services")}>Browse Services</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                      Communicate with service providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingMessages ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-muted rounded-md"></div>
                          </div>
                        ))}
                      </div>
                    ) : conversations && conversations.length > 0 ? (
                      <div className="space-y-2">
                        {conversations.map((conversation: any) => (
                          <div
                            key={conversation.id}
                            className="flex items-center gap-4 p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                            onClick={() => navigate(`/messages/${conversation.participantId}`)}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={conversation.participantImage}
                                alt={conversation.participantName}
                              />
                              <AvatarFallback>
                                {conversation.participantName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">
                                  {conversation.participantName}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(conversation.updatedAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge className="rounded-full">{conversation.unreadCount}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't started any conversations yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Services</CardTitle>
                    <CardDescription>Services you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSavedServices ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-muted rounded-md"></div>
                          </div>
                        ))}
                      </div>
                    ) : savedServices && savedServices.length > 0 ? (
                      <div className="space-y-4">
                        {savedServices.map((item: any) => (
                          <div
                            key={item.service_id}
                            className="flex items-center gap-4 p-4 border rounded-md"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">
                                  {item.services?.title || "Service"}
                                </h3>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeSavedService.mutate(item.service_id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.services?.location || "Unknown location"}
                              </div>
                              <div className="flex items-center mt-1">
                                <Badge variant="secondary" className="mr-2">
                                  {item.services?.category || "General"}
                                </Badge>
                                <span className="text-sm font-medium flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-0.5" />
                                  {item.services?.price || 0}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/services/${item.service_id}`)}
                            >
                              View
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No saved services</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't saved any services yet
                        </p>
                        <Button onClick={() => navigate("/services")}>Browse Services</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.image} alt={user?.name} />
                            <AvatarFallback>
                              <UserCircle className="h-20 w-20 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium">{user?.name || "User"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {user?.email || ""}
                            </p>
                            <Button size="sm" variant="outline" className="mt-2">
                              Update Profile
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Account</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">Change Password</h4>
                              <p className="text-sm text-muted-foreground">
                                Update your password
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Change
                            </Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">Notifications</h4>
                              <p className="text-sm text-muted-foreground">
                                Manage your notification preferences
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <Button variant="destructive" className="w-full sm:w-auto">
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
