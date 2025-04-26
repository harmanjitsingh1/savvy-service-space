import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, IndianRupee } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export function ProviderServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

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

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { data: serviceData, error: fetchError } = await supabase
        .from('provider_services')
        .select('images')
        .eq('id', serviceId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('provider_services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
      
      if (serviceData?.images && serviceData.images.length > 0) {
        const imagePaths = serviceData.images.map((url: string) => {
          const parts = url.split('services/');
          return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean);
        
        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase
            .storage
            .from('services')
            .remove(imagePaths);
          
          if (storageError) {
            console.error('Error deleting service images:', storageError);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerServices', user?.id] });
      toast({
        title: 'Service Deleted',
        description: 'Your service has been successfully removed.'
      });
      setServiceToDelete(null);
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

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      deleteService.mutate(serviceToDelete);
      setDeleteDialogOpen(false);
    }
  };

  const handleAddService = () => {
    navigate('/provider/add-service');
  };

  const handleEditService = (serviceId: string) => {
    navigate(`/provider/edit-service/${serviceId}`);
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
                <div className="flex gap-4 items-center">
                  {service.images && service.images.length > 0 && (
                    <div className="h-16 w-16 rounded-md overflow-hidden">
                      <img 
                        src={service.images[0]} 
                        alt={service.title} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                    <div className="flex items-center mt-2">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {service.price}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => handleEditService(service.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => handleDeleteClick(service.id)}
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

      <ConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        isDangerous={true}
      />
    </Card>
  );
}
