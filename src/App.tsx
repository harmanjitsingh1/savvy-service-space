
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ServicesPage from "./pages/services/ServicesPage";
import ServiceDetailsPage from "./pages/services/ServiceDetailsPage";
import ProfilePage from "./pages/user/Profile";
import DashboardPage from "./pages/user/Dashboard";
import ProviderDashboardPage from "./pages/provider/ProviderDashboard";
import MyServicesPage from "./pages/provider/MyServices";
import AddServicePage from "./pages/provider/AddService";
import EditServicePage from "./pages/provider/EditService";
import BookingRequestsPage from "./pages/provider/BookingRequests";
import EarningsPage from "./pages/provider/Earnings";
import ProviderMessagesPage from "./pages/provider/Messages";
import ProviderProfilePage from "./pages/provider/Profile";
import ProviderSettingsPage from "./pages/provider/Settings";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - accessible to both logged in and non-logged in users */}
            <Route element={<ProtectedRoute redirectPath="/login" />}>
              {/* Root path - will redirect based on role in the ProtectedRoute component */}
              <Route path="/" element={<Index />} />
            </Route>
            
            {/* Service browsing routes - accessible to everyone but with redirects for providers */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
            
            {/* Auth routes - only accessible when NOT logged in */}
            <Route element={<PublicRoute redirectPath="/" />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
            
            {/* Protected routes - only accessible when logged in as a user */}
            <Route element={<ProtectedRoute requiredRole="user" />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            
            {/* Provider routes - only accessible when logged in as a provider */}
            <Route element={<ProtectedRoute requiredRole="provider" redirectPath="/dashboard" />}>
              <Route path="/provider" element={<ProviderDashboardPage />} />
              <Route path="/provider/services" element={<MyServicesPage />} />
              <Route path="/provider/add" element={<AddServicePage />} />
              <Route path="/provider/edit/:id" element={<EditServicePage />} />
              <Route path="/provider/bookings" element={<BookingRequestsPage />} />
              <Route path="/provider/earnings" element={<EarningsPage />} />
              <Route path="/provider/messages" element={<ProviderMessagesPage />} />
              <Route path="/provider/profile" element={<ProviderProfilePage />} />
              <Route path="/provider/settings" element={<ProviderSettingsPage />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
