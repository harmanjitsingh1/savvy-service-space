
import React from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { ProviderBookingRequests } from "@/components/provider/ProviderBookingRequests";

export default function BookingRequestsPage() {
  return (
    <ProviderLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Booking Requests</h1>
        <ProviderBookingRequests />
      </div>
    </ProviderLayout>
  );
}
