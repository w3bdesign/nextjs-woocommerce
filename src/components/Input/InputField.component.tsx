import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldValues, useFormContext, UseFormRegister } from 'react-hook-form';

interface ICustomValidation {
  required?: boolean;
  minlength?: number;
}

interface IErrors {}

export interface IInputRootObject {
  inputLabel: string;
  inputName: string;
  customValidation: ICustomValidation;
  errors?: IErrors;
  register?: UseFormRegister<FieldValues>;
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
  type,
}: IInputRootObject) => {
  const { register } = useFormContext();

  return (
    <div className="w-1/2 p-2">
      <Label htmlFor={inputName} className="pb-2 block">
        {inputLabel}
      </Label>
      <Input
        id={inputName}
        placeholder={inputLabel}
        type={type ?? 'text'}
        {...customValidation}
        {...register(inputName)}
      />
    </div>
  );
};
