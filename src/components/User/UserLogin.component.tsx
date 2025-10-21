import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { login } from '../../utils/auth';
import { InputField } from '../Input/InputField.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import Button from '../UI/Button.component';
import { useRouter } from 'next/router';

interface ILoginData {
  username: string;
  password: string;
}

/**
 * User login component that handles user authentication
 * @function UserLogin
 * @returns {JSX.Element} - Rendered component with login form
 */
const UserLogin = () => {
  const methods = useForm<ILoginData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: ILoginData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(data.username, data.password);
      if (result.success && result.status === 'SUCCESS') {
        router.push('/my-account');
      } else {
        throw new Error('Failed to login');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="mx-auto lg:w-1/2 flex flex-wrap">
            <InputField
              inputName="username"
              inputLabel="Username or email"
              type="text"
              customValidation={{ required: true }}
            />
            <InputField
              inputName="password"
              inputLabel="Password"
              type="password"
              customValidation={{ required: true }}
            />

            {error && (
              <div className="w-full p-2 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div className="w-full p-2">
              <div className="mt-4 flex justify-center">
                <Button variant="primary" buttonDisabled={loading}>
                  {loading ? <LoadingSpinner /> : 'Login'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </section>
  );
};

export default UserLogin;
