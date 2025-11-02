import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { usePredictiveContext } from "@/providers/PredictiveContextProvider";
import { useAuth } from "@/contexts/AuthContext";

interface PredictiveLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

export function PredictiveLink({ to, children, className, ...props }: PredictiveLinkProps) {
  const { predictNextPages, predictions } = usePredictiveContext();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find confidence for this link if it's in predictions
  const prediction = predictions.find(p => p.page === to);
  const confidence = prediction?.confidence || 0;

  // Calculate opacity based on confidence (subtle effect)
  const confidenceOpacity = confidence > 0.5 ? 1 : 0.85;

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!user) return;
    
    setIsHovered(true);
    
    // Debounce prediction request (300ms)
    hoverTimeoutRef.current = setTimeout(() => {
      predictNextPages(to);
    }, 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  return (
    <div className="relative inline-block" data-testid="predictive-link">
      <Link
        to={to}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ opacity: confidenceOpacity }}
        {...props}
      >
        {children}
      </Link>
      
      {/* Subtle confidence indicator */}
      {isHovered && confidence > 0.6 && (
        <div
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse"
          data-testid="prediction-indicator"
          style={{ opacity: confidence }}
        />
      )}
    </div>
  );
}
