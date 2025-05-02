
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ServiceForm } from "@/components/provider/ServiceForm";

export default function AddServicePage() {
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Service</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Create a new service listing for clients to book
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm />
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
}
