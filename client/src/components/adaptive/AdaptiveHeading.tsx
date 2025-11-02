/**
 * ADAPTIVE HEADING COMPONENTS
 * Typography that adapts to Bold (800 weight) vs Ocean (600 weight) themes
 */

import { HTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export interface AdaptiveHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const AdaptiveH1 = forwardRef<HTMLHeadingElement, AdaptiveHeadingProps>(
  ({ className, children, ...props }, ref) => {
    const { darkMode } = useTheme();
    const isDark = darkMode === 'dark';
    
    return (
      <h1
        ref={ref}
        className={cn(
          'text-[var(--font-size-h1)]',
          'font-[var(--font-weight-heading)]',
          'leading-[var(--line-height-heading)]',
          isDark ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]',
          className
        )}
        {...props}
      >
        {children}
      </h1>
    );
  }
);

AdaptiveH1.displayName = 'AdaptiveH1';

export const AdaptiveH2 = forwardRef<HTMLHeadingElement, AdaptiveHeadingProps>(
  ({ className, children, ...props }, ref) => {
    const { darkMode } = useTheme();
    const isDark = darkMode === 'dark';
    
    return (
      <h2
        ref={ref}
        className={cn(
          'text-[var(--font-size-h2)]',
          'font-[var(--font-weight-heading)]',
          'leading-[var(--line-height-heading)]',
          isDark ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]',
          className
        )}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

AdaptiveH2.displayName = 'AdaptiveH2';

export const AdaptiveH3 = forwardRef<HTMLHeadingElement, AdaptiveHeadingProps>(
  ({ className, children, ...props }, ref) => {
    const { darkMode } = useTheme();
    const isDark = darkMode === 'dark';
    
    return (
      <h3
        ref={ref}
        className={cn(
          'text-[var(--font-size-h3)]',
          'font-[var(--font-weight-subheading)]',
          'leading-[var(--line-height-heading)]',
          isDark ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

AdaptiveH3.displayName = 'AdaptiveH3';

export const AdaptiveBody = forwardRef<HTMLParagraphElement, AdaptiveHeadingProps>(
  ({ className, children, ...props }, ref) => {
    const { darkMode } = useTheme();
    const isDark = darkMode === 'dark';
    
    return (
      <p
        ref={ref}
        className={cn(
          'text-[var(--font-size-body)]',
          'font-[var(--font-weight-body)]',
          'leading-[var(--line-height-body)]',
          isDark ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-secondary)]',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

AdaptiveBody.displayName = 'AdaptiveBody';
