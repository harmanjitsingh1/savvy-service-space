
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { ProviderServices } from "@/components/provider/ProviderServices";

export default function MyServicesPage() {
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
        <ProviderServices />
      </div>
    </ProviderLayout>
  );
}
