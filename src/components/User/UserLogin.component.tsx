import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../../utils/auth';

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
  const form = useForm<ILoginData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: ILoginData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(data.username, data.password);
      if (result.authToken && result.user) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        router.push('/my-account');
      } else {
        throw new Error('Failed to login');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setError('An unknown error occurred.');
        toast({
          title: 'Login failed',
          description: 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mx-auto lg:w-1/2 flex flex-wrap">
            <FormField
              control={form.control}
              name="username"
              rules={{ required: 'Username or email is required' }}
              render={({ field }) => (
                <FormItem className="w-1/2 p-2">
                  <FormLabel>Username or email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username or email"
                      type="text"
                      {...field}
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="w-full p-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            <div className="w-full p-2">
              <div className="mt-4 flex justify-center">
                <Button variant="default" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
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

export default UserLogin;
