import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight } from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShowIframe(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowIframe(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden" data-testid="dialog-demo-modal">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Play className="h-3 w-3 mr-1" />
                Interactive Demo
              </Badge>
            </div>
            <DialogTitle className="text-lg font-semibold">
              Plan Travel and Connect with Tango Community Worldwide
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              aspectRatio: '1.83',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            {showIframe ? (
              <iframe
                src="https://app.supademo.com/embed/cmjndbuaj5i483zz2jwg0vsca?embed_v=2&utm_source=embed"
                loading="eager"
                title="Plan Travel and Connect with Tango Community Worldwide"
                allow="clipboard-write"
                frameBorder={0}
                allowFullScreen
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  border: 'none'
                }}
                data-testid="iframe-supademo"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading demo...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Link href="/register" className="flex-1">
              <Button 
                className="w-full ocean-gradient text-white" 
                size="lg"
                onClick={() => onOpenChange(false)}
                data-testid="button-start-trial-modal"
              >
                Join Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing" className="flex-1">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => onOpenChange(false)}
                data-testid="button-view-pricing-modal"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
