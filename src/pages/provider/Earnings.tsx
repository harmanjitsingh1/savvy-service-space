
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { ProviderEarnings } from "@/components/provider/ProviderEarnings";

export default function EarningsPage() {
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <ProviderEarnings />
      </div>
    </ProviderLayout>
  );
}
