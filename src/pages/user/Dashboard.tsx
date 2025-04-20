import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  MessageSquare, 
  Heart, 
  Settings, 
  Clock, 
  CheckCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  IndianRupee 
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: bookings, refetch } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select('*')
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true });

      if (bookingsError) throw bookingsError;
      
      const bookingsWithServices = await Promise.all(bookingsData.map(async (booking) => {
        const { data: service, error: serviceError } = await supabase
          .from("services")
          .select('*')
          .eq("id", booking.service_id)
          .single();
          
        if (serviceError) {
          console.error("Error fetching service:", serviceError);
          return {
            ...booking,
            service: {
              title: "Unknown Service",
              duration: booking.duration,
              price: booking.total_amount / booking.duration
            }
          };
        }
        
        return {
          ...booking,
          service
        };
      }));
      
      return bookingsWithServices;
    },
    enabled: !!user,
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  const handleCancelBooking = (id: string) => {
    updateBookingStatus.mutate({ id, status: "cancelled" });
  };

  const getUpcomingBookings = () => {
    return bookings?.filter(
      (booking) => 
        new Date(booking.booking_date) > new Date() && 
        booking.status !== "cancelled"
    ) || [];
  };

  const getPastBookings = () => {
    return bookings?.filter(
      (booking) => 
        new Date(booking.booking_date) < new Date() && 
        booking.status !== "cancelled"
    ) || [];
  };

  const getCancelledBookings = () => {
    return bookings?.filter((booking) => booking.status === "cancelled") || [];
  };

  const { data: savedServices } = useQuery({
    queryKey: ["savedServices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: savedData, error: savedError } = await supabase
        .from("saved_services")
        .select(`
          service_id,
          services (
            id,
            title,
            description,
            price,
            duration,
            category,
            provider_id
          )
        `)
        .eq("user_id", user.id);

      if (savedError) throw savedError;
      return savedData.map(item => item.services);
    },
    enabled: !!user,
  });

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-64 h-fit shrink-0">
            <CardHeader>
              <CardTitle className="text-xl">Dashboard</CardTitle>
              <CardDescription>Manage your bookings and services</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="bookings" className="w-full" orientation="vertical">
                <TabsList className="flex flex-col h-auto w-full rounded-none border-r bg-transparent p-0">
                  <TabsTrigger 
                    value="bookings" 
                    className="justify-start rounded-none border-r-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="messages" 
                    className="justify-start rounded-none border-r-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger 
                    value="saved" 
                    className="justify-start rounded-none border-r-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Saved Services
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="justify-start rounded-none border-r-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex-1">
            <Tabs defaultValue="bookings" className="w-full">
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
                    <Tabs defaultValue="upcoming">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upcoming" className="pt-4">
                        {getUpcomingBookings().length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground">
                            <p>No upcoming bookings</p>
                          </div>
                        ) : (
                          getUpcomingBookings().map((booking) => (
                            <div key={booking.id} className="rounded-lg border shadow-sm mb-4">
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">{booking.service.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Scheduled for {format(new Date(booking.booking_date), "PPP 'at' p")}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => navigate(`/booking/${booking.id}/reschedule`)}
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      Reschedule
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleCancelBooking(booking.id)}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>{booking.service.duration} hour(s)</span>
                                  </div>
                                  <div>
                                    <span className="text-primary font-medium flex items-center">
                                      <IndianRupee className="h-3 w-3 mr-1" />
                                      {booking.total_amount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        
                        <div className="mt-4 text-center">
                          <Button variant="outline" onClick={() => navigate('/services')}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Book New Service
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="past" className="pt-4">
                        {getPastBookings().length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground">
                            <p>No past bookings</p>
                          </div>
                        ) : (
                          getPastBookings().map((booking) => (
                            <div key={booking.id} className="rounded-lg border shadow-sm mb-4">
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">{booking.service.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Completed on {format(new Date(booking.booking_date), "PPP")}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Leave Review
                                  </Button>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>{booking.service.duration} hour(s)</span>
                                  </div>
                                  <div>
                                    <span className="text-primary font-medium flex items-center">
                                      <IndianRupee className="h-3 w-3 mr-1" />
                                      {booking.total_amount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </TabsContent>
                      
                      <TabsContent value="cancelled" className="pt-4">
                        {getCancelledBookings().length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground">
                            <p>No cancelled bookings</p>
                          </div>
                        ) : (
                          getCancelledBookings().map((booking) => (
                            <div key={booking.id} className="rounded-lg border shadow-sm mb-4">
                              <div className="p-6">
                                <div>
                                  <h3 className="font-semibold text-lg">{booking.service.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Was scheduled for {format(new Date(booking.booking_date), "PPP")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 text-sm mt-4">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>{booking.service.duration} hour(s)</span>
                                  </div>
                                  <div>
                                    <span className="text-primary font-medium flex items-center">
                                      <IndianRupee className="h-3 w-3 mr-1" />
                                      {booking.total_amount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>Chat with service providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No messages yet</p>
                    </div>
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
                    {savedServices && savedServices.length > 0 ? (
                      <div className="space-y-4">
                        {savedServices.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{service.title}</h4>
                              <p className="text-sm text-muted-foreground">{service.category}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                <span className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {service.price}
                                </span>
                                <span>•</span>
                                <span>{service.duration} hour(s)</span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/services/${service.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <p>No saved services</p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate('/services')}>
                          <Heart className="h-4 w-4 mr-2" />
                          Browse Services
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => navigate('/profile')}
                    >
                      Edit Profile
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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
