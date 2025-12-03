import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="p-12 text-center" data-testid="empty-state">
        <div className="flex flex-col items-center gap-4">
          <div 
            className="p-4 rounded-full bg-muted"
            data-testid="empty-state-icon"
          >
            <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          
          <div className="space-y-2">
            <h3 
              className="text-xl font-semibold"
              data-testid="empty-state-title"
            >
              {title}
            </h3>
            <p 
              className="text-muted-foreground max-w-sm mx-auto"
              data-testid="empty-state-description"
            >
              {description}
            </p>
          </div>
          
          <div className="flex gap-3 mt-4">
            {actionLabel && (onAction || actionHref) && (
              actionHref ? (
                <Button asChild data-testid="empty-state-action">
                  <a href={actionHref}>{actionLabel}</a>
                </Button>
              ) : (
                <Button 
                  onClick={onAction}
                  data-testid="empty-state-action"
                >
                  {actionLabel}
                </Button>
              )
            )}
            
            {secondaryActionLabel && onSecondaryAction && (
              <Button 
                variant="outline"
                onClick={onSecondaryAction}
                data-testid="empty-state-secondary-action"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
