
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Service } from "@/types";
import { BookingForm } from "./BookingForm";
import { Calendar } from "lucide-react";

interface BookingDialogProps {
  service: Service;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function BookingDialog({ service, trigger, onOpenChange: externalOnOpenChange }: BookingDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use either external or internal state
  const setOpen = externalOnOpenChange || setInternalOpen;

  const handleBookingSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={internalOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 flex items-center justify-center">
            <Calendar className="h-4 w-4 mr-2" /> Book Now
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Service</DialogTitle>
          <DialogDescription>
            Fill in the details to book this service.
          </DialogDescription>
        </DialogHeader>
        <BookingForm service={service} onSuccess={handleBookingSuccess} />
      </DialogContent>
    </Dialog>
  );
}
