
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallback values for development
// This ensures we don't get "supabaseUrl is required" errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-placeholder-key-for-dev-only';

// Create the Supabase client only if we have valid values
const supabase = createClient(supabaseUrl, supabaseKey);

// Log for debugging
console.log('Supabase initialization with URL:', supabaseUrl ? 'URL present' : 'URL missing');

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

// Mock user data for demo purposes (will be replaced with Supabase data)
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user',
    bio: 'Regular user looking for great services',
    phone: '555-123-4567',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    address: '123 User St',
    city: 'Usertown',
    state: 'UT',
    zipCode: '12345',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'provider@example.com',
    name: 'Jane Smith',
    role: 'provider',
    bio: 'Professional service provider with 10 years of experience',
    phone: '555-987-6543',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    address: '456 Provider Ave',
    city: 'Providertown',
    state: 'PT',
    zipCode: '67890',
    createdAt: new Date().toISOString()
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Check for stored session on initial load
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        // First check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase session error:', error);
          throw error;
        }
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) throw profileError;
          
          // Transform Supabase user data to match our User type
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || '',
            role: profile?.role || 'user',
            bio: profile?.bio || '',
            phone: profile?.phone || '',
            image: profile?.image || '',
            address: profile?.address || '',
            city: profile?.city || '',
            state: profile?.state || '',
            zipCode: profile?.zipCode || '',
            createdAt: profile?.created_at || new Date().toISOString(),
          };
          
          setUser(userData);
        } else {
          // Check for local storage fallback (for development)
          const savedUser = localStorage.getItem('serviceBookingUser');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Session error:', error);
        // Fallback to localStorage if Supabase fails
        const savedUser = localStorage.getItem('serviceBookingUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Update the user state when signed in
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || '',
            role: profile?.role || 'user',
            bio: profile?.bio || '',
            phone: profile?.phone || '',
            image: profile?.image || '',
            address: profile?.address || '',
            city: profile?.city || '',
            state: profile?.state || '',
            zipCode: profile?.zipCode || '',
            createdAt: profile?.created_at || new Date().toISOString(),
          };
          
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // If Supabase auth fails, fall back to mock users (for development)
        if (import.meta.env.DEV) {
          // Simple mock authentication
          const foundUser = MOCK_USERS.find(u => u.email === email);
          
          if (foundUser && password === 'password') {
            setUser(foundUser);
            localStorage.setItem('serviceBookingUser', JSON.stringify(foundUser));
            toast({
              title: "Login successful (MOCK)",
              description: `Welcome back, ${foundUser.name}!`,
            });
            return;
          }
        }
        throw new Error(error.message || 'Invalid email or password');
      }
      
      if (data?.user) {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        });
      }
    } catch (error: any) {
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
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      });
      
      if (error) {
        // If Supabase registration fails, fall back to mock users (for development)
        if (import.meta.env.DEV) {
          // Check if email already exists
          if (MOCK_USERS.some(u => u.email === email)) {
            throw new Error('Email already in use');
          }
          
          // Create new user
          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name,
            role,
            createdAt: new Date().toISOString()
          };
          
          setUser(newUser);
          localStorage.setItem('serviceBookingUser', JSON.stringify(newUser));
          
          toast({
            title: "Registration successful (MOCK)",
            description: `Welcome, ${newUser.name}!`,
          });
          return;
        }
        throw new Error(error.message || 'Registration failed');
      }
      
      if (data?.user) {
        // Create a profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              role,
              email,
              created_at: new Date().toISOString()
            }
          ]);
          
        if (profileError) throw new Error(profileError.message);
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`,
        });
      }
    } catch (error: any) {
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
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage as well
      localStorage.removeItem('serviceBookingUser');
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: Clear local storage anyway
      localStorage.removeItem('serviceBookingUser');
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset link sent",
        description: "If your email is in our system, you will receive a password reset link.",
      });
    } catch (error: any) {
      // Still show success message for security reasons
      toast({
        title: "Reset link sent",
        description: "If your email is in our system, you will receive a password reset link.",
      });
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
    } catch (error: any) {
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
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update the Supabase profile
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
          zipCode: userData.zipCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        // If Supabase update fails, fallback to local storage for development
        if (import.meta.env.DEV) {
          const updatedUser = { ...user, ...userData };
          setUser(updatedUser);
          localStorage.setItem('serviceBookingUser', JSON.stringify(updatedUser));
          
          toast({
            title: "Profile updated (MOCK)",
            description: "Your profile has been updated successfully.",
          });
          return;
        }
        throw error;
      }
      
      // Update the local user state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
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
