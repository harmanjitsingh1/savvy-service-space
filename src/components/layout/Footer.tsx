
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-700">
                ServeBay
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your one-stop platform for booking reliable services from verified professionals.
            </p>
            <div className="flex space-x-3">
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary">Services</Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link>
              </li>
              <li>
                <Link to="/become-provider" className="text-muted-foreground hover:text-primary">Become a Provider</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services?category=House Cleaning" className="text-muted-foreground hover:text-primary">House Cleaning</Link>
              </li>
              <li>
                <Link to="/services?category=Plumbing" className="text-muted-foreground hover:text-primary">Plumbing</Link>
              </li>
              <li>
                <Link to="/services?category=Electrical" className="text-muted-foreground hover:text-primary">Electrical</Link>
              </li>
              <li>
                <Link to="/services?category=Carpentry" className="text-muted-foreground hover:text-primary">Carpentry</Link>
              </li>
              <li>
                <Link to="/services?category=Pet Services" className="text-muted-foreground hover:text-primary">Pet Services</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  123 Service Road, Service City, SC 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">support@servebay.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ServeBay. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-primary">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
