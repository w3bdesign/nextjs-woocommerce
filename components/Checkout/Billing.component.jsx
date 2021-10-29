import { useForm } from 'react-hook-form';
import { InputField } from '../Input/InputField.component';

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
          <InputField
            label="Fornavn"
            name="firstName"
            errors={errors}
            register={register}
          />
          <InputField
            label="Etternavn"
            name="lastName"
            errors={errors}
            register={register}
          />
          <InputField
            label="Adresse"
            name="address1"
            errors={errors}
            register={register}
          />
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
                value: /^[0-9]+$/i,
                message: 'Postnummer må bare være tall',
              },
            }}
          />
          <InputField
            label="Sted"
            name="city"
            errors={errors}
            register={register}
          />
          <InputField
            label="Epost"
            name="email"
            errors={errors}
            register={register}
            customValidation={{
              pattern: {
                value: /[^@]+@[^@]+\.[^@]+/i,
                message: 'Du må oppgi en gyldig epost',
              },
            }}
          />
          <InputField
            label="Telefon"
            name="phone"
            errors={errors}
            register={register}
            customValidation={{
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
