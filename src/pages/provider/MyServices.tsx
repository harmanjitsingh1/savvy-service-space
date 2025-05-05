
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ProviderServices } from "@/components/provider/ProviderServices";

export default function MyServicesPage() {
  const { user } = useAuth();
  
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
          <Link to="/provider/add-service">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          </Link>
        </div>
        
        <ProviderServices />
      </div>
    </ProviderLayout>
  );
}
