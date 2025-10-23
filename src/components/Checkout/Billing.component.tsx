// Imports
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form';

// Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Constants
import { INPUT_FIELDS } from '@/utils/constants/INPUT_FIELDS';
import { ICheckoutDataProps } from '@/utils/functions/functions';

interface IBillingProps {
  handleFormSubmit: SubmitHandler<ICheckoutDataProps>;
}

const OrderButton = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full p-2">
      <input
        placeholder="paymentMethod"
        type="hidden"
        value="cod"
        checked
        {...register('paymentMethod')}
      />
      <div className="mt-4 flex justify-center">
        <Button>PLACE ORDER</Button>
      </div>
    </div>
  );
};

const Billing = ({ handleFormSubmit }: IBillingProps) => {
  const form = useForm<ICheckoutDataProps>();

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="mx-auto lg:w-1/2 flex flex-wrap">
            {INPUT_FIELDS.map(({ id, label, name, customValidation }) => (
              <FormField
                key={id}
                control={form.control}
                name={name as keyof ICheckoutDataProps}
                rules={{
                  required: customValidation.required
                    ? `${label} is required`
                    : false,
                  minLength: customValidation.minlength
                    ? {
                        value: customValidation.minlength,
                        message: `${label} must be at least ${customValidation.minlength} characters`,
                      }
                    : undefined,
                  pattern: customValidation.pattern
                    ? {
                        value: new RegExp(customValidation.pattern),
                        message: `${label} format is invalid`,
                      }
                    : undefined,
                }}
                render={({ field }) => (
                  <FormItem className="w-1/2 p-2">
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={label}
                        type={
                          customValidation.type === 'email' ? 'email' : 'text'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <OrderButton />
          </div>
        </form>
      </Form>
    </section>
  );
};

export default Billing;
