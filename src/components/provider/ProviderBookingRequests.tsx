
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Define a type for the booking data
type BookingWithService = {
  id: string;
  booking_date: string;
  duration: number;
  provider_id: string;
  provider_status: string;
  service_id: string;
  status: string;
  total_amount: number;
  user_id: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  provider_services?: {
    title: string;
  } | null;
};

export function ProviderBookingRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch provider's booking requests
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['providerBookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First attempt to fetch with the provider_services join
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          provider_services(title)
        `)
        .eq('provider_id', user.id)
        .order('booking_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings with provider_services:', error);
        
        // Fallback to just fetching bookings without the join
        const { data: basicData, error: basicError } = await supabase
          .from('bookings')
          .select('*')
          .eq('provider_id', user.id)
          .order('booking_date', { ascending: false });
          
        if (basicError) {
          console.error('Error fetching basic bookings:', basicError);
          return [];
        }
        
        return basicData || [];
      }
      
      return data as BookingWithService[] || [];
    },
    enabled: !!user
  });

  // Mutation to update booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string, status: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          provider_status: status,
          status: status === 'rejected' ? 'cancelled' : status 
        })
        .eq('id', bookingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookings', user?.id] });
      toast({
        title: 'Booking Updated',
        description: 'Booking status has been successfully updated.'
      });
    },
    onError: (error) => {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>Loading booking requests...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Requests</CardTitle>
        <CardDescription>Manage incoming service bookings</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="flex flex-col sm:flex-row justify-between gap-4 p-4 border rounded-md"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {booking.provider_services && 'title' in booking.provider_services 
                        ? booking.provider_services.title 
                        : 'Service'}
                    </h3>
                    <Badge
                      variant={
                        booking.provider_status === 'confirmed' ? 'default' :
                        booking.provider_status === 'rejected' ? 'destructive' :
                        'outline'
                      }
                    >
                      {booking.provider_status || 'Pending'}
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
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.duration} hours
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 justify-end">
                  {booking.provider_status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateBookingStatus.mutate({ 
                          bookingId: booking.id, 
                          status: 'confirmed' 
                        })}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateBookingStatus.mutate({ 
                          bookingId: booking.id, 
                          status: 'rejected' 
                        })}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No booking requests at the moment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
