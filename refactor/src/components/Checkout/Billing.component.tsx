// Imports
import {
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormRegister,
} from 'react-hook-form';

// Components
import { InputField } from '@/components/Input/InputField.component';
import Button from '../UI/Button.component';

// Constants
import { INPUT_FIELDS } from '@/utils/constants/INPUT_FIELDS';

interface IBillingProps {
  onSubmit: SubmitHandler<FieldValues>;
}

interface IOrderButtonProps {
  register: UseFormRegister<FieldValues>;
}

const OrderButton = ({ register }: IOrderButtonProps) => (
  <div className="w-full p-2">
    <input
      placeholder="paymentMethod"
      type="hidden"
      value="cod"
      checked
      {...register('paymentMethod')}
    />
    <div className="mt-4 flex justify-center">
      <Button>BESTILL</Button>
    </div>
  </div>
);

const Billing = ({ onSubmit }: IBillingProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto lg:w-1/2 flex flex-wrap">
          {INPUT_FIELDS.map(({ id, label, name, customValidation }) => (
            <InputField
              key={id}
              inputLabel={label}
              inputName={name}
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
