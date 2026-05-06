import { FieldValues, useFormContext, UseFormRegister } from 'react-hook-form';

interface ICustomValidation {
  required?: boolean;
  minlength?: number;
  pattern?: string;
}

interface IErrors {}

export interface IInputRootObject {
  inputLabel: string;
  inputName: string;
  customValidation: ICustomValidation;
  errors?: IErrors;
  register?: UseFormRegister<FieldValues>;
  type?: string;
  autoComplete?: string;
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
 * @param {string} [autoComplete] - the autocomplete attribute for the input
 */
export const InputField = ({
  customValidation,
  inputLabel,
  inputName,
  type,
  autoComplete,
}: IInputRootObject) => {
  const { register, formState: { errors } } = useFormContext();
  const hasError = Object.hasOwn(errors, inputName);

  return (
    <div className="w-full md:w-1/2 p-2">
      <label htmlFor={inputName} className="block text-sm font-medium text-text mb-1">
        {inputLabel}
        {customValidation?.required && (
          <span className="text-error ml-1" aria-hidden="true">*</span>
        )}
      </label>
      <input
        className={`bg-surface border text-text text-sm block w-full p-2.5 rounded-md transition-colors duration-200 ${
          hasError
            ? 'border-error focus:ring-error focus:border-error'
            : 'border-border focus:ring-primary focus:border-primary'
        } focus:ring-2 focus:outline-none`}
        id={inputName}
        placeholder={inputLabel}
        type={type ?? 'text'}
        autoComplete={autoComplete}
        aria-invalid={hasError ? 'true' : 'false'}
        {...(hasError ? { 'aria-describedby': `${inputName}-error` } : {})}
        {...customValidation}
        {...register(inputName)}
      />
      {hasError && (
        <p
          id={`${inputName}-error`}
          className="mt-1 text-sm text-error"
          role="alert"
        >
          {inputLabel} er påkrevd
        </p>
      )}
    </div>
  );
};
