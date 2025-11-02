/**
 * ADAPTIVE CARD COMPONENT
 * Automatically switches between Bold solid and MT Ocean glassmorphic styles
 */

import { HTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export interface AdaptiveCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'glass' | 'outlined';
  children: React.ReactNode;
}

export const AdaptiveCard = forwardRef<HTMLDivElement, AdaptiveCardProps>(
  ({ variant = 'solid', className, children, ...props }, ref) => {
    const { visualTheme, darkMode } = useTheme();
    
    const isBold = visualTheme === 'bold-minimaximalist';
    const isDark = darkMode === 'dark';
    
    // Base styles
    const baseStyles = 'overflow-hidden';
    
    // Variant styles (theme-aware)
    const variantStyles = {
      solid: cn(
        isDark ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-background)]',
        'shadow-[var(--shadow-medium)]',
        isBold ? 'border-none' : 'border border-gray-200 dark:border-gray-700'
      ),
      glass: cn(
        // Glassmorphic only available in Ocean theme
        isBold ? (
          // Fallback to solid for Bold theme
          isDark ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-background)]'
        ) : (
          // True glassmorphic for Ocean theme
          cn(
            'bg-[var(--glass-background)]',
            'backdrop-blur-[var(--glass-backdrop-blur)]',
            'border border-[var(--glass-border)]'
          )
        ),
        'shadow-[var(--shadow-large)]'
      ),
      outlined: cn(
        'bg-transparent',
        'border-2 border-[var(--border-color)]',
        'shadow-none'
      ),
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          'rounded-[var(--radius-card)]',
          'p-[var(--spacing-card)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AdaptiveCard.displayName = 'AdaptiveCard';
