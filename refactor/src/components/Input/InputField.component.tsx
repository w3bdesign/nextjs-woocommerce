/**
 * Input field component displays a text input in a form, with label.
 * The various properties of the input field can be determined with the props:
 * @param {Object} [customValidation] - the validation rules to apply to the input field
 * @param {Object} errors - the form errors object provided by react-hook-form
 * @param {string} label - used for the display label
 * @param {string} name - the key of the value in the submitted data. Must be unique
 * @param {function} register - register function from react-hook-form
 * @param {boolean} [required=true] - whether or not this field is required. default true
 * @param {'text'|'number'} [type='text'] - the input type. defaults to text
 */
export const InputField = ({
  customValidation = {},
  label,
  name,
  register,
  type = 'text',
}: any) => (
  <div className="w-1/2 p-2">
    <label htmlFor={name} className="pb-4">
      {label}
    </label>
    <input
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      name={name}
      id={name}
      placeholder={label}
      label={label}
      type={type ?? 'text'}
      {...customValidation}
      {...register(name)}
    />
  </div>
);
