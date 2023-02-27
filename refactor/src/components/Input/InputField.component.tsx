import { FieldValues, UseFormRegister } from 'react-hook-form';

interface ICustomValidation {
  required?: boolean;
  minlength?: number;
}

interface IErrors {}

export interface IInputRootObject {
  inputLabel: string;
  inputName: string;
  customValidation: ICustomValidation;
  errors: IErrors;
  register: UseFormRegister<FieldValues>;
  type?: string;
}

/**
 * Input field component displays a text input in a form, with label.
 * The various properties of the input field can be determined with the props:
 * @param {ICustomValidation} [customValidation] - the validation rules to apply to the input field
 * @param {IErrors} errors - the form errors object provided by react-hook-form
 * @param {string} inputLabel - used for the display label
 * @param {string} inputName - the key of the value in the submitted data. Must be unique
 * @param {UseFormRegister<FieldValues>} register - register function from react-hook-form
 * @param {boolean} [required=true] - whether or not this field is required. default true
 * @param {string} [type='text'] - the input type. defaults to text
 */
export const InputField = ({
  customValidation,
  inputLabel,
  inputName,
  register,
  type,
}: IInputRootObject) => (
  <div className="w-1/2 p-2">
    <label htmlFor={inputName} className="pb-4">
      {inputLabel}
    </label>
    <input
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      id={inputName}
      placeholder={inputLabel}
      type={type ?? 'text'}
      {...customValidation}
      {...register(inputName)}
    />
  </div>
);
