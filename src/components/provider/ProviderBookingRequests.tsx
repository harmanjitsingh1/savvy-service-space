
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Define a type for the booking data with optional provider_services
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
    title?: string;
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
      
      try {
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
          
          return basicData as BookingWithService[];
        }
        
        // Ensure we handle potential errors with the relation by processing the data
        const processedData = data?.map(booking => {
          // If there's an error with provider_services, replace it with null
          if (booking.provider_services && typeof booking.provider_services === 'object' && 'error' in booking.provider_services) {
            return {
              ...booking,
              provider_services: null
            };
          }
          return booking;
        });
        
        return processedData as BookingWithService[] || [];
      } catch (error) {
        console.error('Unexpected error in booking fetch:', error);
        return [];
      }
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
      <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
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
                className="flex flex-col sm:flex-row justify-between gap-4 p-4 border rounded-md border-brand-100 dark:border-slate-800 hover:bg-brand-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {booking.provider_services && 
                       booking.provider_services.title ? 
                        booking.provider_services.title : 
                        'Service'}
                    </h3>
                    <Badge
                      className={
                        booking.provider_status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' :
                        booking.provider_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
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
                        className="bg-brand-500 hover:bg-brand-600"
                        onClick={() => updateBookingStatus.mutate({ 
                          bookingId: booking.id, 
                          status: 'confirmed' 
                        })}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-800 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-900/20"
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
