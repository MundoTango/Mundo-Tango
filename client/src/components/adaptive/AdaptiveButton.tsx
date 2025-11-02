/**
 * ADAPTIVE BUTTON COMPONENT
 * Automatically switches between Bold Minimaximalist and MT Ocean styles
 * Based on current route/theme context
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export interface AdaptiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const AdaptiveButton = forwardRef<HTMLButtonElement, AdaptiveButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const { visualTheme } = useTheme();
    
    const isBold = visualTheme === 'bold-minimaximalist';
    
    // Base styles (theme-independent)
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    // Size styles
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    // Variant styles (theme-aware)
    const variantStyles = {
      primary: cn(
        'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
        'shadow-[var(--shadow-medium)] focus:ring-[var(--color-primary)]',
        isBold ? 'font-semibold' : 'font-normal'
      ),
      secondary: cn(
        'bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)]',
        'hover:bg-[var(--color-surface)]',
        isBold ? 'font-semibold' : 'font-normal'
      ),
      ghost: cn(
        'bg-transparent text-[var(--color-text-primary)]',
        'hover:bg-[var(--color-surface)]',
        isBold ? 'font-medium' : 'font-normal'
      ),
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          'rounded-[var(--radius-button)]',
          'transition-all duration-[var(--transition-speed)]',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AdaptiveButton.displayName = 'AdaptiveButton';
