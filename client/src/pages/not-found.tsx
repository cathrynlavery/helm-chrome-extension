import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbfcfc]">
      {/* Helm Logo aligned with main content */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center">
          <img 
            src="/icons/dark-icon.svg" 
            alt="Helm" 
            className="h-6 w-auto"
          />
          <span className="ml-2 text-[#1A1A1A] ibm-plex-mono-medium text-[16px]">
            Helm
          </span>
        </div>
      </div>
      
      <Card className="w-full max-w-md mx-4 border border-[#CDAA7A]/20 shadow-none bg-transparent">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[#CDAA7A]" />
            <h1 className="text-2xl font-bold text-[#333333]">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-[#333333]/70 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <Link href="/">
            <Button 
              className="flex items-center bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] ibm-plex-mono-medium hover:scale-[1.02] transition-all duration-300 rounded-[16px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
