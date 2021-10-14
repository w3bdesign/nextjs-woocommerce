import {useForm} from 'react-hook-form';

const Billing = ({onSubmit}) => {
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm();

    return (
        <section className="text-gray-700 container p-4 py-2 mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mx-auto lg:w-1/2 flex flex-wrap">
                    <InputField label='Fornavn' name='firstName' errors={errors} register={register}/>
                    <InputField label='Etternavn' name='lastName' errors={errors} register={register}/>
                    <InputField label='Adresse' name='address1' errors={errors} register={register}/>
                    <InputField label='Postnummer' name='postcode' errors={errors} register={register}
                                customValidation={{
                                    minLength: {
                                        value: 4,
                                        message: 'Postnummer må være minimum 4 tall',
                                    },
                                    maxLength: {
                                        value: 4,
                                        message: 'Postnummer må være maksimalt 4 tall',
                                    },
                                    pattern: {
                                        value: /^[0-9]+$/i,
                                        message: 'Postnummer må bare være tall',
                                    }
                                }}/>
                    <InputField label='Sted' name='city' errors={errors} register={register}/>
                    <InputField label='Epost' name='email' errors={errors} register={register} customValidation={{
                        pattern: {
                            value: /[^@]+@[^@]+\.[^@]+/i,
                            message: 'Du må oppgi en gyldig epost',
                        }
                    }}/>
                    <InputField label='Telefon' name='phone' errors={errors} register={register} customValidation={{
                        minLength: {
                            value: 8,
                            message: 'Minimum 8 tall i telefonnummeret',
                        },
                        maxLength: {
                            value: 8,
                            message: 'Maksimalt 8 tall i telefonnummeret',
                        },
                        pattern: {
                            value: /^[0-9]+$/i,
                            message: 'Ikke gyldig telefonnummer',
                        }
                    }}/>
                    <OrderButton register={register}/>
                </div>
            </form>
        </section>
    );
};

export default Billing;

const OrderButton = ({register}) => <div className="w-full p-2">
    <input
        name="paymentMethod"
        placeholder="paymentMethod"
        type="hidden"
        value="cod"
        checked
        {...register('paymentMethod')}
    />
    <submit
        className="flex px-4 py-2 mx-auto font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
        BESTILL
    </submit>
</div>;


/**
 * Input field component displays an input in a form, with label.
 * The various properties of the input field can be determined with the props:
 * @param {Object} [customValidation] - the validation rules to apply to the input field
 * @param {Object} errors - the form errors object provided by react-hook-form
 * @param {string} label - used for the display label
 * @param {string} name - the key of the value in the submitted data. Must be unique
 * @param {function} register - register function from react-hook-form
 * @param {boolean} [required=true] - whether or not this field is required. default true
 * @param {'text'|'number'} [type='text'] - the input type. defaults to text
 */
const InputField = ({customValidation = {}, errors, label, name, register, required = true, type = 'text'}) =>
    <div className="w-1/2 p-2">
        <label for={name} className="pb-4">{label}</label>
        <input
            className='w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black'
            name={name}
            id={name}
            placeholder={label}
            label={label}
            type={type ?? 'text'}
            {...register(name, required ? {
                required: 'Dette feltet er påkrevd',
                ...customValidation
            } : customValidation)}
        />
        {errors[name] && (
            <span className="text-red-500">
      FEIL: {errors[name].message}
    </span>
        )}
    </div>;
