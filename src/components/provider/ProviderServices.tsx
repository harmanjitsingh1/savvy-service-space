
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function ProviderServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch provider's services
  const { data: services, isLoading } = useQuery({
    queryKey: ['providerServices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('provider_services')
        .select('*')
        .eq('provider_id', user.id);
      
      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user
  });

  // Delete service mutation
  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('provider_services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerServices', user?.id] });
      toast({
        title: 'Service Deleted',
        description: 'Your service has been successfully removed.'
      });
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service.',
        variant: 'destructive'
      });
    }
  });

  const handleAddService = () => {
    // Navigate to add service form
    // You'll need to create this route/component
    console.log('Navigate to add service form');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Services</CardTitle>
        </CardHeader>
        <CardContent>Loading services...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Services</CardTitle>
            <CardDescription>Manage your service offerings</CardDescription>
          </div>
          <Button onClick={handleAddService}>
            <Plus className="h-4 w-4 mr-2" /> Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {services && services.length > 0 ? (
          <div className="space-y-4">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="flex justify-between items-center p-4 border rounded-md"
              >
                <div>
                  <h3 className="font-medium">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.category}</p>
                  <div className="flex items-center mt-2">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {service.price}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => console.log(`Edit service ${service.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => deleteService.mutate(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You have no services yet.</p>
            <Button onClick={handleAddService} className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Service
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
