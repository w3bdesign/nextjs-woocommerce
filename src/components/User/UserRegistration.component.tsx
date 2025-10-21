import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { CREATE_USER } from '../../utils/gql/GQL_MUTATIONS';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TypographyH2, TypographyP } from '@/components/UI/Typography.component';

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
  const form = useForm<IRegistrationData>();
  const [registerUser, { loading, error }] = useMutation(CREATE_USER);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: IRegistrationData) => {
    try {
      const response = await registerUser({
        variables: data,
      });

      const customer = response.data?.registerCustomer?.customer;
      if (customer) {
        setRegistrationCompleted(true);
        toast({
          title: 'Registration successful!',
          description: 'Your account has been created. You can now log in.',
        });
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        throw new Error('Failed to register customer');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred during registration.',
        variant: 'destructive',
      });
    }
  };

  if (registrationCompleted) {
    return (
      <div className="text-center my-8">
        <TypographyH2 className="text-green-600 mb-4">
          Registration successful!
        </TypographyH2>
        <TypographyP>You can now log in with your account.</TypographyP>
      </div>
    );
  }

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mx-auto lg:w-1/2 flex flex-wrap">
            <FormField
              control={form.control}
              name="username"
              rules={{ required: 'Username is required' }}
              render={({ field }) => (
                <FormItem className="w-1/2 p-2">
                  <FormLabel>Brukernavn</FormLabel>
                  <FormControl>
                    <Input placeholder="Brukernavn" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              rules={{ required: 'Email is required' }}
              render={({ field }) => (
                <FormItem className="w-1/2 p-2">
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input placeholder="E-post" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              rules={{ required: 'Password is required' }}
              render={({ field }) => (
                <FormItem className="w-1/2 p-2">
                  <FormLabel>Passord</FormLabel>
                  <FormControl>
                    <Input placeholder="Passord" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="firstName"
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <FormItem className="w-1/2 p-2">
                  <FormLabel>Fornavn</FormLabel>
                  <FormControl>
                    <Input placeholder="Fornavn" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <FormItem className="w-1/2 p-2">
                  <FormLabel>Etternavn</FormLabel>
                  <FormControl>
                    <Input placeholder="Etternavn" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="w-full p-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              </div>
            )}

            <div className="w-full p-2">
              <div className="mt-4 flex justify-center">
                <Button variant="default" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrerer...
                    </>
                  ) : (
                    'Registrer'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default UserRegistration;
