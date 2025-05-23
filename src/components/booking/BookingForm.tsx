
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar as CalendarIcon, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BookingFormProps {
  service: Service;
  onSuccess?: () => void;
}

type FormData = {
  date: Date;
  time: string;
  notes: string;
};

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
  "15:00", "16:00", "17:00", "18:00"
];

export function BookingForm({ service, onSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const { toast: legacyToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Please log in to book this service");
      navigate("/login", { state: { from: `/services/${service.id}` } });
      return;
    }

    setIsSubmitting(true);
    const bookingDateTime = new Date(data.date);
    const [hours, minutes] = data.time.split(":");
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      const bookingData = {
        service_id: service.id,
        provider_id: service.providerId,
        user_id: user.id,
        booking_date: bookingDateTime.toISOString(),
        duration: service.duration || 1,
        total_amount: service.price * (service.duration || 1),
        notes: data.notes,
        status: "pending"
      };
      
      console.log("Creating booking with data:", bookingData);
      
      const { data: insertedBooking, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select()
        .single();
        
      if (error) {
        console.error("Error during booking insertion:", error);
        throw error;
      }
      
      console.log("Booking created successfully:", insertedBooking);
      
      toast.success("Your service has been booked successfully.");

      if (onSuccess) {
        onSuccess();
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during booking:", error);
      toast.error("Failed to book the service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          rules={{ required: "Please select a date" }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) field.onChange(date);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          rules={{ required: "Please select a time slot" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requirements or instructions..." 
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service Duration</span>
            <span>{service.duration} hour(s)</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total Amount</span>
            <span className="flex items-center">
              <IndianRupee className="h-4 w-4 mr-1" />
              {service.price * service.duration}
            </span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Confirming..." : "Confirm Booking"}
        </Button>
      </form>
    </Form>
  );
}
