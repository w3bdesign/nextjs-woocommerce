import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useForm, FormProvider } from 'react-hook-form';
import { CREATE_USER } from '../../utils/gql/GQL_MUTATIONS';
import { InputField } from '../Input/InputField.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import Button from '../UI/Button.component';

interface IRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * User registration component that handles WooCommerce customer creation
 * @function UserRegistration
 * @returns {JSX.Element} - Rendered component with registration form
 */
const UserRegistration = () => {
  const methods = useForm<IRegistrationData>();
  const [registerUser, { loading, error }] = useMutation(CREATE_USER);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  const onSubmit = async (data: IRegistrationData) => {
    try {
      const response = await registerUser({
        variables: data,
      });

      const customer = response.data?.registerCustomer?.customer;
      if (customer) {
        setRegistrationCompleted(true);
      } else {
        throw new Error('Failed to register customer');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
    }
  };

  if (registrationCompleted) {
    return (
      <div className="text-center my-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Registrering vellykket!
        </h2>
        <p>Du kan nå logge inn med din konto.</p>
      </div>
    );
  }

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="mx-auto lg:w-1/2 flex flex-wrap">
            <InputField
              inputName="username"
              inputLabel="Brukernavn"
              type="text"
              customValidation={{ required: true }}
            />
            <InputField
              inputName="email"
              inputLabel="E-post"
              type="email"
              customValidation={{ required: true }}
            />
            <InputField
              inputName="password"
              inputLabel="Passord"
              type="password"
              customValidation={{ required: true }}
            />
            <InputField
              inputName="firstName"
              inputLabel="Fornavn"
              type="text"
              customValidation={{ required: true }}
            />
            <InputField
              inputName="lastName"
              inputLabel="Etternavn"
              type="text"
              customValidation={{ required: true }}
            />

            {error && (
              <div className="w-full p-2 text-red-600 text-sm text-center">
                {error.message}
              </div>
            )}

            <div className="w-full p-2">
              <div className="mt-4 flex justify-center">
                <Button variant="primary" buttonDisabled={loading}>
                  {loading ? <LoadingSpinner /> : 'Registrer'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </section>
  );
};

export default UserRegistration;
