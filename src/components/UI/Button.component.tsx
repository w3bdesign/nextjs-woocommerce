import { ReactNode } from 'react';
import Link from 'next/link';

type TButtonVariant = 'primary' | 'secondary' | 'hero' | 'filter' | 'reset';

interface IButtonProps {
  handleButtonClick?: () => void;
  buttonDisabled?: boolean;
  variant?: TButtonVariant;
  children?: ReactNode;
  fullWidth?: boolean;
  href?: string;
  title?: string;
  selected?: boolean;
}

/**
 * Renders a clickable button
 * @function Button
 * @param {void} handleButtonClick - Handle button click
 * @param {boolean?} buttonDisabled - Is button disabled?
 * @param {TButtonVariant?} variant - Button variant
 * @param {ReactNode} children - Children for button
 * @param {boolean?} fullWidth - Whether the button should be full-width on mobile
 * @param {boolean?} selected - Whether the button is in a selected state
 * @returns {JSX.Element} - Rendered component
 */
const Button = ({
  handleButtonClick,
  buttonDisabled,
  variant = 'primary',
  children,
  fullWidth = false,
  href,
  title,
  selected = false,
}: IButtonProps) => {
  const getVariantClasses = (variant: TButtonVariant = 'primary') => {
    switch (variant) {
      case 'hero':
        return 'inline-block px-8 py-4 text-sm tracking-wider uppercase bg-white text-text hover:bg-surface-alt hover:shadow-md active:scale-[0.98]';
      case 'filter':
        return selected
          ? 'px-3 py-1 border border-border rounded-md bg-primary text-white'
          : 'px-3 py-1 border border-border rounded-md hover:bg-surface-alt bg-surface text-text active:scale-[0.98]';
      case 'reset':
        return 'w-full mt-8 py-2 px-4 bg-surface-alt text-text-muted rounded-md hover:bg-border active:scale-[0.98]';
      case 'secondary':
        return 'px-2 lg:px-4 py-2 font-bold border border-error rounded-md text-white bg-error hover:bg-red-700 active:scale-[0.98]';
      default: // primary
        return 'px-2 lg:px-4 py-2 font-bold border border-primary rounded-md text-white bg-primary hover:bg-primary-dark active:scale-[0.98]';
    }
  };

  const classes = `${getVariantClasses(variant)} ease-in-out transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
    fullWidth ? 'w-full md:w-auto' : ''
  }`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={buttonDisabled}
      className={classes}
      title={title}
    >
      {children}
    </button>
  );
};

export default Button;
