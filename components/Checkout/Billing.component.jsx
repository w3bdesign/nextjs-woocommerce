import { useForm } from 'react-hook-form';
import { InputField } from '../Input/InputField.component';

const getCustomNumberValidation = (
  value,
  { minLength, maxLength, pattern }
) => ({
  minLength: { value, message: minLength },
  maxLength: { value, message: maxLength },
  pattern: { value: /^\d+$/i, message: pattern },
});

const inputs = [
  { label: 'Fornavn', name: 'firstName' },
  { label: 'Etternavn', name: 'lastName' },
  { label: 'Adresse', name: 'address1' },
  {
    label: 'Postnummer',
    name: 'postcode',
    customValidation: getCustomNumberValidation(4, {
      minLength: 'Postnummer må være minimum 4 tall',
      maxLength: 'Postnummer må være maksimalt 4 tall',
      pattern: 'Postnummer må bare være tall',
    }),
  },
  { label: 'Sted', name: 'city' },
  {
    label: 'Epost',
    name: 'email',
    customValidation: {
      pattern: {
        value: /[^@]+@[^@]+\.[^@]+/i,
        message: 'Du må oppgi en gyldig epost',
      },
    },
  },
  {
    label: 'Telefon',
    name: 'phone',
    customValidation: getCustomNumberValidation(8, {
      minLength: 'Minimum 8 tall i telefonnummeret',
      maxLength: 'Maksimalt 8 tall i telefonnummeret',
      pattern: 'Ikke gyldig telefonnummer',
    }),
  },
];

const Billing = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto lg:w-1/2 flex flex-wrap">
          {inputs.map(({ label, name, customValidation }, key) => (
            <InputField
              key={key}
              label={label}
              name={name}
              customValidation={customValidation}
              errors={errors}
              register={register}
            />
          ))}
          <InputField
            label="Postnummer"
            name="postcode"
            errors={errors}
            register={register}
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
                value: /^\d+$/i,
                message: 'Postnummer må bare være tall',
              },
            }}
          />
          <OrderButton register={register} />
        </div>
      </form>
    </section>
  );
};

export default Billing;

const OrderButton = ({ register }) => (
  <div className="w-full p-2">
    <input
      name="paymentMethod"
      placeholder="paymentMethod"
      type="hidden"
      value="cod"
      checked
      {...register('paymentMethod')}
    />
    <button className="flex px-4 py-2 mx-auto font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
      BESTILL
    </button>
  </div>
);
