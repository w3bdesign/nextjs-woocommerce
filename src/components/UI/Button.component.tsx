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
        return 'inline-block px-8 py-4 text-sm tracking-wider uppercase bg-white text-gray-900 hover:bg-gray-400 hover:text-white hover:shadow-md';
      case 'filter':
        return selected 
          ? 'px-3 py-1 border rounded bg-gray-900 text-white'
          : 'px-3 py-1 border rounded hover:bg-gray-100 bg-white text-gray-900';
      case 'reset':
        return 'w-full mt-8 py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors';
      case 'secondary':
        return 'px-2 lg:px-4 py-2 font-bold border border-gray-400 border-solid rounded text-white bg-red-500 hover:bg-red-600';
      default: // primary
        return 'px-2 lg:px-4 py-2 font-bold border border-gray-400 border-solid rounded text-white bg-blue-500 hover:bg-blue-600';
    }
  };

  const classes = `${getVariantClasses(variant)} ease-in-out transition-all duration-300 disabled:opacity-50 ${
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
