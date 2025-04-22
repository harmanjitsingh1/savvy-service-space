
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function ProviderEarnings() {
  const { user } = useAuth();

  // Fetch provider's earnings
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['providerEarnings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('provider_earnings')
        .select('*, bookings(service_id)')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching earnings:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user
  });

  // Calculate total earnings
  const totalEarnings = earnings?.reduce((sum, earning) => sum + earning.amount, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
        </CardHeader>
        <CardContent>Loading earnings...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings</CardTitle>
        <CardDescription>Overview of your service earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <IndianRupee className="h-6 w-6 mr-2" />
            {totalEarnings.toFixed(2)}
          </h2>
          <p className="text-sm text-muted-foreground">Total Earnings</p>
        </div>

        {earnings && earnings.length > 0 ? (
          <div className="space-y-4">
            {earnings.map((earning) => (
              <div 
                key={earning.id} 
                className="flex justify-between items-center p-4 border rounded-md"
              >
                <div>
                  <h3 className="font-medium">
                    Service: {earning.bookings?.service_id || 'Unknown'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(earning.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {earning.amount.toFixed(2)}
                  </div>
                  <Badge 
                    variant={
                      earning.status === 'pending' ? 'outline' :
                      earning.status === 'completed' ? 'default' :
                      'destructive'
                    }
                  >
                    {earning.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No earnings yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
