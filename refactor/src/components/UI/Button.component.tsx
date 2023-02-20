import { ReactNode } from 'react';

/**
 * Renders a clickable button
 * @function PageTitle
 * @param {void} handleButtonClick - Handle button click
 * @param {boolean?} buttonDisabled - Is button disabled? *
 * @param {ReactNode} children - Children for button
 * @returns {JSX.Element} - Rendered component
 */

interface IButtonProps {
  handleButtonClick?: () => void;
  buttonDisabled?: boolean;
  children: ReactNode;
}
const Button = ({
  handleButtonClick,
  buttonDisabled,
  children,
}: IButtonProps) => {
  return (
    <button
      onClick={handleButtonClick}
      disabled={buttonDisabled}
      className="px-4 py-2 font-bold bg-blue-500 border border-gray-400 border-solid rounded hover:bg-blue-600 text-white ease-in-out transition-all duration-300 disabled:opacity-50"
    >
      {children}
    </button>
  );
};

export default Button;
