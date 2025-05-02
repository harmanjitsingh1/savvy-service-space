
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { ServiceForm } from "@/components/provider/ServiceForm";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full">
          <p>Service ID is missing. Please go back and try again.</p>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Update your service listing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm serviceId={id} />
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
}
