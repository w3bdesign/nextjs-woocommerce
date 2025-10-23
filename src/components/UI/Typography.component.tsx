import { cn } from '@/lib/utils';
import { type ElementType, type ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

/**
 * H1 - Main page heading
 * Used for primary page titles
 */
export const TypographyH1 = ({ children, className, as }: TypographyProps) => {
  const Component = as || 'h1';
  return (
    <Component
      className={cn(
        'text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl',
        className,
      )}
    >
      {children}
    </Component>
  );
};

/**
 * H2 - Section heading
 * Used for major section titles
 */
export const TypographyH2 = ({ children, className, as }: TypographyProps) => {
  const Component = as || 'h2';
  return (
    <Component
      className={cn(
        'text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl',
        className,
      )}
    >
      {children}
    </Component>
  );
};

/**
 * H3 - Subsection heading
 * Used for subsection titles and card headings
 */
export const TypographyH3 = ({ children, className, as }: TypographyProps) => {
  const Component = as || 'h3';
  return (
    <Component
      className={cn(
        'text-2xl font-bold tracking-tight text-gray-900',
        className,
      )}
    >
      {children}
    </Component>
  );
};

/**
 * H4 - Small heading
 * Used for smaller section titles
 */
export const TypographyH4 = ({ children, className, as }: TypographyProps) => {
  const Component = as || 'h4';
  return (
    <Component
      className={cn(
        'text-xl font-semibold tracking-tight text-gray-900',
        className,
      )}
    >
      {children}
    </Component>
  );
};

/**
 * P - Body text
 * Default paragraph styling
 */
export const TypographyP = ({ children, className, as }: TypographyProps) => {
  const Component = as || 'p';
  return (
    <Component className={cn('text-base leading-7 text-gray-700', className)}>
      {children}
    </Component>
  );
};

/**
 * Lead - Intro/lead paragraph
 * Used for introductory text with emphasis
 */
export const TypographyLead = ({
  children,
  className,
  as,
}: TypographyProps) => {
  const Component = as || 'p';
  return (
    <Component className={cn('text-xl leading-8 text-gray-700', className)}>
      {children}
    </Component>
  );
};

/**
 * Large - Larger text
 * Used for prominent text elements
 */
export const TypographyLarge = ({
  children,
  className,
  as,
}: TypographyProps) => {
  const Component = as || 'div';
  return (
    <Component className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </Component>
  );
};

/**
 * Small - Smaller text
 * Used for captions, labels, and secondary information
 */
export const TypographySmall = ({
  children,
  className,
  as,
}: TypographyProps) => {
  const Component = as || 'small';
  return (
    <Component className={cn('text-sm leading-5 text-gray-600', className)}>
      {children}
    </Component>
  );
};

/**
 * Muted - De-emphasized text
 * Used for secondary or less important information
 */
export const TypographyMuted = ({
  children,
  className,
  as,
}: TypographyProps) => {
  const Component = as || 'p';
  return (
    <Component className={cn('text-sm text-gray-500', className)}>
      {children}
    </Component>
  );
};

/**
 * Code - Inline code
 * Used for code snippets or technical text
 */
export const TypographyCode = ({
  children,
  className,
}: Omit<TypographyProps, 'as'>) => {
  return (
    <code
      className={cn(
        'relative rounded bg-gray-100 px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className,
      )}
    >
      {children}
    </code>
  );
};

/**
 * Blockquote - Quoted text
 * Used for quotes or emphasized blocks
 */
export const TypographyBlockquote = ({
  children,
  className,
}: Omit<TypographyProps, 'as'>) => {
  return (
    <blockquote
      className={cn(
        'border-l-4 border-gray-300 pl-4 italic text-gray-700',
        className,
      )}
    >
      {children}
    </blockquote>
  );
};

/**
 * List - Unordered list
 */
export const TypographyList = ({
  children,
  className,
}: Omit<TypographyProps, 'as'>) => {
  return (
    <ul className={cn('ml-6 list-disc space-y-2 text-gray-700', className)}>
      {children}
    </ul>
  );
};

/**
 * InlineCode - For inline code without block formatting
 */
export const TypographyInlineCode = ({
  children,
  className,
}: Omit<TypographyProps, 'as'>) => {
  return (
    <code className={cn('font-mono text-sm text-gray-800', className)}>
      {children}
    </code>
  );
};
