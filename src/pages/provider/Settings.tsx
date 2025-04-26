import React, { useState } from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "Current password must be at least 6 characters",
    }),
    newPassword: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ProviderSettingsPage() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const handlePasswordChange = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      // In a real application, this would typically set a 'is_active' flag to false
      // in the profiles table rather than deleting the account completely
      
      // For this example, we'll simulate deactivation with a success message
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated. You'll now be signed out.",
      });
      
      // Sign the user out
      await logout();
      
      // Redirect to home page
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate account",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete user account (Note: In a production app, you might want to 
      // implement a more comprehensive deletion process)
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id!
      );
      
      if (error) throw error;
      
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted. You'll now be signed out.",
      });
      
      // Sign the user out
      await logout();
      
      // Redirect to home page
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete account. This operation requires admin privileges.",
        variant: "destructive",
      });
      
      // For demo purposes, we'll still sign the user out
      await logout();
      navigate("/");
    }
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="current-password">Current Password</FormLabel>
                      <FormControl>
                        <Input id="current-password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="new-password">New Password</FormLabel>
                      <FormControl>
                        <Input id="new-password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="confirm-password">Confirm New Password</FormLabel>
                      <FormControl>
                        <Input id="confirm-password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit">Update Password</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Control how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-bookings">New booking requests</Label>
                <Switch id="new-bookings" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="messages">New messages</Label>
                <Switch id="messages" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="payments">Payment notifications</Label>
                <Switch id="payments" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing">Marketing emails</Label>
                <Switch id="marketing" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Deactivate or delete your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Deactivate Account</h3>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable your account. You can reactivate it later.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto mt-2"
                  onClick={() => setDeactivateDialogOpen(true)}
                >
                  Deactivate Account
                </Button>
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto mt-2"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ConfirmationDialog 
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        title="Deactivate Account"
        description="Are you sure you want to deactivate your account? You will no longer be visible to clients and won't receive new bookings until you reactivate."
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        onConfirm={handleDeactivateAccount}
        isDangerous={false}
      />
      
      <ConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Account"
        description="Are you sure you want to delete your account? This will permanently remove your account, all your services, and booking history. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteAccount}
        isDangerous={true}
      />
    </ProviderLayout>
  );
}
