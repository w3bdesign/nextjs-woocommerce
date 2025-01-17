import { ReactNode } from 'react';
import Link from 'next/link';

type TButtonColors = 'red' | 'blue';

interface IButtonProps {
  handleButtonClick?: () => void;
  buttonDisabled?: boolean;
  color?: TButtonColors;
  children: ReactNode;
  fullWidth?: boolean;
  isHero?: boolean;
  href?: string;
}

/**
 * Renders a clickable button
 * @function Button
 * @param {void} handleButtonClick - Handle button click
 * @param {boolean?} buttonDisabled - Is button disabled?
 * @param {TButtonColors?} color - Color for button, either red or blue
 * @param {ReactNode} children - Children for button
 * @param {boolean?} fullWidth - Whether the button should be full-width on mobile
 * @returns {JSX.Element} - Rendered component
 */
const Button = ({
  handleButtonClick,
  buttonDisabled,
  color = 'blue',
  children,
  fullWidth = false,
  isHero = false,
  href,
}: IButtonProps) => {
  const getColorClasses = (buttonColor: TButtonColors) => {
    if (buttonColor === 'blue') {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    return 'bg-red-500 hover:bg-red-600';
  };

  const buttonClasses = isHero
    ? 'inline-block px-8 py-4 text-sm tracking-wider uppercase bg-white text-gray-900 hover:bg-gray-400 hover:text-white hover:shadow-md'
    : `px-2 lg:px-4 py-2 font-bold border border-gray-400 border-solid rounded text-white ${getColorClasses(color)}`;

  const classes = `${buttonClasses} ease-in-out transition-all duration-300 disabled:opacity-50 ${
    fullWidth ? 'w-full md:w-auto' : ''
  }`;

  if (href && isHero) {
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
    >
      {children}
    </button>
  );
};

export default Button;
