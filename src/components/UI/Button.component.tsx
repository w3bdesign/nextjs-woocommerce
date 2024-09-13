import { ReactNode } from 'react';

type TButtonColors = 'red' | 'blue';

interface IButtonProps {
  handleButtonClick?: () => void;
  buttonDisabled?: boolean;
  color?: TButtonColors;
  children: ReactNode;
  fullWidth?: boolean;
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
}: IButtonProps) => (
  <button
    onClick={handleButtonClick}
    disabled={buttonDisabled}
    className={`px-2 lg:px-4 py-2 font-bold bg-blue-500 border border-gray-400 border-solid rounded text-white ease-in-out transition-all duration-300 disabled:opacity-50
      ${
        color === 'blue'
          ? 'bg-blue-500 hover:bg-blue-600'
          : 'bg-red-500 hover:bg-red-600'
      }
      ${fullWidth ? 'w-full md:w-auto' : ''}
    `}
  >
    {children}
  </button>
);

export default Button;
