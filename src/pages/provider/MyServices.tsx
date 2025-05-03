
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { useAuth } from "@/contexts/AuthContext";

export default function MyServicesPage() {
  const { user } = useAuth();
  
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
        <ServicesGrid providerId={user?.id} />
      </div>
    </ProviderLayout>
  );
}
