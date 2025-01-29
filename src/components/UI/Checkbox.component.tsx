import { ChangeEvent } from 'react';

interface ICheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A reusable checkbox component with a label
 * @function Checkbox
 * @param {string} id - Unique identifier for the checkbox
 * @param {string} label - Label text to display next to the checkbox
 * @param {boolean} checked - Whether the checkbox is checked
 * @param {function} onChange - Handler for when the checkbox state changes
 * @returns {JSX.Element} - Rendered component
 */
const Checkbox = ({ id, label, checked, onChange }: ICheckboxProps) => {
  return (
    <label htmlFor={id} className="flex items-center py-2 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className="form-checkbox h-5 w-5 cursor-pointer"
        checked={checked}
        onChange={onChange}
      />
      <span className="ml-3 text-base">{label}</span>
    </label>
  );
};

export default Checkbox;
