
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session?.user) {
          try {
            // Fetch the profile using the user id from the session
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              console.error("Error fetching profile:", error);
              setUser(null);
            } else if (profile) {
              console.log("Profile loaded:", profile);
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.name || '',
                role: profile.role as UserRole || 'user',
                bio: profile.bio || '',
                phone: profile.phone || '',
                image: profile.image || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                zipCode: profile.zipcode || '',
                createdAt: profile.created_at || new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error("Error in auth state change handler:", err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Login successful:", data);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      console.log("Attempting registration with:", { email, name, role });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) throw error;
      
      console.log("Registration successful:", data);

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting logout");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting password reset for:", email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Failed to send reset link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting to update password");
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!user?.id) throw new Error('User not authenticated');

      console.log("Updating profile for user:", user.id, userData);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          bio: userData.bio,
          phone: userData.phone,
          image: userData.image,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zipcode: userData.zipCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(currentUser => currentUser ? { ...currentUser, ...userData } : null);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
