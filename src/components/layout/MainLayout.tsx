
import React, { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useLocation } from "react-router-dom";
import { PageBreadcrumb } from "./PageBreadcrumb";

interface MainLayoutProps {
  children: ReactNode;
  showBreadcrumb?: boolean;
}

export function MainLayout({ children, showBreadcrumb = true }: MainLayoutProps) {
  const location = useLocation();
  
  // Don't show breadcrumbs on homepage
  const shouldShowBreadcrumb = showBreadcrumb && location.pathname !== '/';
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {shouldShowBreadcrumb && (
          <div className="container pt-4">
            <PageBreadcrumb />
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
