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
                               errors,
                               label,
                               name,
                               register,
                               required = true,
                               type = "text",
                           }) => (
    <div className="w-1/2 p-2">
        <label for={name} className="pb-4">
            {label}
        </label>
        <input
            className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
            name={name}
            id={name}
            placeholder={label}
            label={label}
            type={type ?? "text"}
            {...register(
                name,
                required
                    ? {
                        required: "Dette feltet er påkrevd",
                        ...customValidation,
                    }
                    : customValidation
            )}
        />
        {errors[`${name}`] && (
            <span className="text-red-500">FEIL: {errors[`${name}`].message}</span>
        )}
    </div>
);
