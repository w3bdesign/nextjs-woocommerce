import { ReactNode } from 'react';

type TButtonColors = 'red' | 'blue';

interface IButtonProps {
  handleButtonClick?: () => void;
  buttonDisabled?: boolean;
  color?: TButtonColors;
  children: ReactNode;
}

/**
 * Renders a clickable button
 * @function PageTitle
 * @param {void} handleButtonClick - Handle button click
 * @param {boolean?} buttonDisabled - Is button disabled? *
 * @param {ReactNode} children - Children for button
 * @returns {JSX.Element} - Rendered component
 */
const Button = ({
  handleButtonClick,
  buttonDisabled,
  color = 'blue',
  children,
}: IButtonProps) => (
  <button
    onClick={handleButtonClick}
    disabled={buttonDisabled}
    className={`px-4 py-2 font-bold bg-blue-500 border border-gray-400 border-solid rounded text-white ease-in-out transition-all duration-300 disabled:opacity-50
    ${
      color === 'blue'
        ? 'bg-blue-500 hover:bg-blue-600'
        : 'bg-red-500 hover:bg-red-600'
    }
    `}
  >
    {children}
  </button>
);

export default Button;
