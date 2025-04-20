
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Service } from "@/types";
import { BookingForm } from "./BookingForm";
import { Calendar } from "lucide-react";

interface BookingDialogProps {
  service: Service;
  trigger?: React.ReactNode;
}

export function BookingDialog({ service, trigger }: BookingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Calendar className="h-4 w-4 mr-2" /> Book Now
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Service</DialogTitle>
        </DialogHeader>
        <BookingForm service={service} />
      </DialogContent>
    </Dialog>
  );
}
