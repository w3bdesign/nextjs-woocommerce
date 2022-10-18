import { useForm } from 'react-hook-form';
import { InputField } from '../Input/InputField.component';
import { getCustomNumberValidation } from '../../functions/functions';

const inputs = [
  { label: 'Fornavn', name: 'firstName' },
  { label: 'Etternavn', name: 'lastName' },
  { label: 'Adresse', name: 'address1' },
  {
    label: 'Postnummer',
    name: 'postcode',
    customValidation: getCustomNumberValidation(
      {
        minLength: 'Postnummer må være minimum 4 tall',
        maxLength: 'Postnummer må være maksimalt 4 tall',
        pattern: 'Postnummer må bare være tall',
      },
      4
    ),
  },
  { label: 'Sted', name: 'city' },
  {
    label: 'Epost',
    name: 'email',
    customValidation: getCustomNumberValidation(
      { pattern: 'Du må oppgi en gyldig epost' },
      undefined,
      /^[a-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[a-z0-9.-]+$/gim
    ),
  },
  {
    label: 'Telefon',
    name: 'phone',
    customValidation: getCustomNumberValidation(
      {
        minLength: 'Minimum 8 tall i telefonnummeret',
        maxLength: 'Maksimalt 8 tall i telefonnummeret',
        pattern: 'Ikke gyldig telefonnummer',
      },
      8
    ),
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
