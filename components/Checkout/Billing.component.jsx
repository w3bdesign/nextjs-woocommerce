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
      <section className="text-gray-700">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="container p-4 py-2 mx-auto">
            <div className="mx-auto lg:w-1/2 md:w-2/3">
              <div className="flex flex-wrap -m-2">
                <div className="w-1/2 p-2">
                  <label for="firstName" className="pb-4">Fornavn</label>
                  <input
                    className={inputClasses}
                    name="firstName"
                    id="firstName"
                    placeholder="Fornavn"
                    label="Fornavn"
                    type="text"
                    {...register('firstName', {
                      required: 'Dette feltet er påkrevd',
                    })}
                  />
                  {errors.firstName && (
                    <span className="text-red-500">
                      FEIL: {errors.firstName.message}
                    </span>
                  )}
                </div>
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
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default Billing;
