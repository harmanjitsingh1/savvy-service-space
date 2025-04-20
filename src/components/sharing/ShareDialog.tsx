
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Link, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareDialogProps {
  serviceId: string;
  serviceTitle: string;
}

export function ShareDialog({ serviceId, serviceTitle }: ShareDialogProps) {
  const { toast } = useToast();
  const serviceUrl = `${window.location.origin}/services/${serviceId}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(serviceUrl);
    toast({
      description: "Link copied to clipboard",
    });
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this service: ${serviceTitle}\n${serviceUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Service</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleCopyLink}
            >
              <Link className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleWhatsAppShare}
            >
              Share on WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
