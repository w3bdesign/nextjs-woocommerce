import { useForm } from 'react-hook-form';

const Billing = ({ onSubmit }) => {
  const inputClasses =
    'w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black';
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <>
      <section className="text-gray-700 container p-4 py-2 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mx-auto lg:w-1/2 flex flex-wrap">
            <InputField label='Fornavn' name='firstName' errors={errors} register={register} />
                <div className="w-1/2 p-2">
                  <label for="lastName" className="pb-4">Etternavn</label>
                  <input
                    className={inputClasses}
                    name="lastName"
                    id="lastName"
                    placeholder="Etternavn"
                    label="Etternavn"
                    type="text"
                    {...register('lastName', {
                      required: 'Dette feltet er påkrevd',
                    })}
                  />
                  {errors.lastName && (
                    <span className="text-red-500">
                      FEIL: {errors.lastName.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <label for="address1" className="pb-4">Adresse</label>
                  <input
                    className={inputClasses}
                    name="address1"
                    id="address1"
                    placeholder="Adresse"
                    label="Adresse"
                    type="text"
                    {...register('address1', {
                      required: 'Dette feltet er påkrevd',
                    })}
                  />
                  {errors.address1 && (
                    <span className="text-red-500">
                      FEIL: {errors.address1.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <label for="postcode" className="pb-4">Postnummer</label>
                  <input
                    className={inputClasses}
                    name="postcode"
                    id="postcode"
                    placeholder="Postnummer"
                    label="Postnummer"
                    type="text"
                    {...register('postcode', {
                      required: 'Dette feltet er påkrevd',
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
                      },
                    })}
                  />
                  {errors.postcode && (
                    <span className="text-red-500">
                      FEIL: {errors.postcode.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <label for="city" className="pb-4">Sted</label>
                  <input
                    className={inputClasses}
                    name="city"
                    id="city"
                    placeholder="Sted"
                    label="Sted"
                    type="text"
                    {...register('city', {
                      required: 'Dette feltet er påkrevd',
                    })}
                  />
                  {errors.city && (
                    <span className="text-red-500">
                      FEIL: {errors.city.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <label for="email" className="pb-4">Epost</label>
                  <input
                    className={inputClasses}
                    name="email"
                    id="email"
                    placeholder="Epost"
                    label="Epost"
                    type="text"
                    {...register('email', {
                      required: 'Dette feltet er påkrevd',
                      pattern: {
                        value: /[^@]+@[^@]+\.[^@]+/i,
                        message: 'Du må oppgi en gyldig epost',
                      },
                    })}
                  />
                  {errors.email && (
                    <span className="text-red-500">
                      FEIL: {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <label for="phone" className="pb-4">Telefon</label>
                  <input
                    className={inputClasses}
                    name="phone"
                    id="phone"
                    placeholder="Telefon"
                    label="Telefon"
                    type="text"
                    {...register('phone', {
                      required: 'Dette feltet er påkrevd',
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
                      },
                    })}
                  />
                  {errors.phone && (
                    <span className="text-red-500">
                      FEIL: {errors.phone.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <input
                    name="paymentMethod"
                    placeholder="paymentMethod"
                    label=""
                    type="hidden"
                    value="cod"
                    checked
                    type="hidden"
                    {...register('paymentMethod')}
                  />
                </div>
                <div className="w-full p-2">
                  <button className="flex px-4 py-2 mx-auto font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
                    BESTILL
                  </button>
                </div>
              </div>
        </form>
      </section>
    </>
  );
};

export default Billing;


/**
 * Input field component displays an input in a form, with label.
 * The various properties of the input field can be determined with the props:
 *  - label: string, used for the display label
 *  - name: string, the key of the value in the submitted data. Must be unique
 *  - type: 'text'|'number'|'hidden', the input type. defaults to text
 *  - errors: Object, the form errors object provided by react-hook-form
 *  - register: register function from react-hook-form
 *  - required: boolean, whether or not this field is required. default true
 *  - customValidation: Object, the validation rules to apply to the input field
 */
const InputField = (props) =>
<div className="w-1/2 p-2">
  <label for={props.name} className="pb-4">{props.label}</label>
  <input
    className='w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black'
    name={props.name}
    id={props.name}
    placeholder={props.label}
    label={props.label}
    type={props.type ?? 'text'}
    {...props.register(props.name, (props.required ?? true) ? {
      required: 'Dette feltet er påkrevd',
      ...(props.customValidation ?? {})
    }:props.customValidation)}
  />
  {props.errors[props.name] && (
    <span className="text-red-500">
      FEIL: {props.errors[props.name].message}
    </span>
  )}
</div>
