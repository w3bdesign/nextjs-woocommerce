import { ChangeEvent } from 'react';

interface IRangeSliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  startValue?: number;
  formatValue?: (value: number) => string;
}

/**
 * A reusable range slider component with labels
 * @function RangeSlider
 * @param {string} id - Unique identifier for the slider
 * @param {string} label - Accessible label for the slider
 * @param {number} min - Minimum value of the range
 * @param {number} max - Maximum value of the range
 * @param {number} value - Current value of the slider
 * @param {function} onChange - Handler for when the slider value changes
 * @param {number} startValue - Optional starting value to display (defaults to min)
 * @param {function} formatValue - Optional function to format the displayed values
 * @returns {JSX.Element} - Rendered component
 */
const RangeSlider = ({
  id,
  label,
  min,
  max,
  value,
  onChange,
  startValue = min,
  formatValue = (val: number) => val.toString(),
}: IRangeSliderProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-full cursor-pointer"
      />
      <div className="flex justify-between mt-2">
        <span>{formatValue(startValue)}</span>
        <span>{formatValue(value)}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
