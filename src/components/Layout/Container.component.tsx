import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ContainerProps {
  /**
   * The content to be wrapped in the container
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to add default padding
   */
  withPadding?: boolean;
  /**
   * Custom padding className (overrides withPadding)
   */
  paddingClassName?: string;
  /**
   * Max width variant
   */
  maxWidth?: 'default' | 'wide' | 'narrow' | 'full';
  /**
   * HTML element to render as
   */
  as?: 'div' | 'section' | 'article' | 'main';
}

/**
 * Container component for consistent layout and spacing across pages
 * Provides centered content with responsive padding and max-width options
 */
export const Container = ({
  children,
  className,
  withPadding = true,
  paddingClassName,
  maxWidth = 'default',
  as: Component = 'div',
}: ContainerProps) => {
  const maxWidthClasses = {
    default: 'max-w-7xl',
    wide: 'max-w-full',
    narrow: 'max-w-4xl',
    full: '',
  };

  const defaultPadding = 'px-4 sm:px-6';

  return (
    <Component
      className={cn(
        'container mx-auto',
        maxWidth !== 'full' && maxWidthClasses[maxWidth],
        paddingClassName || (withPadding && defaultPadding),
        className,
      )}
    >
      {children}
    </Component>
  );
};
