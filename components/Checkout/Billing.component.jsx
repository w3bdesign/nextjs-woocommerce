import { useForm } from 'react-hook-form';

import CheckoutTitle from 'components/Header/CheckoutTitle.component';

const Input = ({
  name,
  label,
  register,
  placeholder,
  value,
  parameters,
  type = 'text',  
  readOnly = false,
}) => (
  <>
    <label className="pb-4">{label}</label>
    <input
      className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
      name={name}
      placeholder={placeholder}
      type="text"
      value={value}
      ref={register(parameters)}
      type={type}      
      readOnly={readOnly}
    />
  </>
);

const Billing = ({ onSubmit }) => {
  const { register, handleSubmit, errors } = useForm();

  return (
    <>
      <section className="relative text-gray-700 body-font">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="container px-5 py-2 mx-auto">
            <CheckoutTitle title="Betalingsdetaljer" />
            <div className="mx-auto lg:w-1/2 md:w-2/3">
              <div className="flex flex-wrap -m-2">
                <div className="w-1/2 p-2">
                  <Input
                    name="firstName"
                    placeholder="Fornavn"
                    label="Fornavn"
                    register={register}
                    parameters={{ required: 'Dette feltet er påkrevd' }}
                  />
                  {errors.firstName && (
                    <span className="text-red-500">
                      FEIL: {errors.firstName.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <Input
                    name="lastName"
                    placeholder="Etternavn"
                    label="Etternavn"
                    register={register}
                    parameters={{ required: 'Dette feltet er påkrevd' }}
                  />
                  {errors.lastName && (
                    <span className="text-red-500">
                      FEIL: {errors.lastName.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <Input
                    name="address1"
                    placeholder="Adresse"
                    label="Adresse"
                    register={register}
                    parameters={{ required: 'Dette feltet er påkrevd' }}
                  />
                  {errors.address1 && (
                    <span className="text-red-500">
                      FEIL: {errors.address1.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <Input
                    name="postcode"
                    placeholder="Postnummer"
                    label="Postnummer"
                    register={register}
                    parameters={{
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
                    }}
                  />
                  {errors.postcode && (
                    <span className="text-red-500">
                      FEIL: {errors.postcode.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <Input
                    name="city"
                    placeholder="Sted"
                    label="Sted"
                    register={register}
                    parameters={{ required: 'Dette feltet er påkrevd' }}
                  />
                  {errors.city && (
                    <span className="text-red-500">
                      FEIL: {errors.city.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <Input
                    name="email"
                    placeholder="Epost"
                    label="Epost"
                    register={register}
                    parameters={{
                      required: 'Dette feltet er påkrevd',
                      pattern: {
                        value: /[^@]+@[^@]+\.[^@]+/i,
                        message: 'Du må oppgi en gyldig epost',
                      },
                    }}
                  />
                  {errors.email && (
                    <span className="text-red-500">
                      FEIL: {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <Input
                    name="phone"
                    placeholder="Telefon"
                    label="Telefon"
                    register={register}
                    parameters={{
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
                    }}
                  />
                  {errors.phone && (
                    <span className="text-red-500">
                      FEIL: {errors.phone.message}
                    </span>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <Input
                    name="paymentMethod"
                    placeholder="paymentMethod"
                    label=""
                    type="hidden"
                    value="cod"
                    register={register}
                    checked
                    readOnly
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
