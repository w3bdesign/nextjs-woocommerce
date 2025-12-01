import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthenticationError, login } from '../../utils/auth';

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
    // Clear any existing form errors
    form.clearErrors();

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
      if (error instanceof AuthenticationError) {
        // Handle field-specific errors
        if (error.field) {
          form.setError(error.field, {
            type: 'server',
            message: error.message,
          });
          form.setFocus(error.field);
        } else {
          // General error without specific field
          setError(error.message);
        }
      } else if (error instanceof Error) {
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
                      className={cn(
                        form.formState.errors.username && 'border-destructive',
                      )}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors('username');
                      }}
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
                    <Input
                      placeholder="Password"
                      type="password"
                      className={cn(
                        form.formState.errors.password && 'border-destructive',
                      )}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors('password');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="w-full p-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  Forgot your password?
                </Link>
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

            {/* Create Account Section */}
            <div className="w-full p-2 mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    New to Mebl?
                  </span>
                </div>
              </div>

              <Card className="mt-6 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-primary/10 p-3">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Create an Account
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Join us to track your orders, save your favorite items,
                        and enjoy a personalized shopping experience.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      size="lg"
                    >
                      <Link href="/register">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default UserLogin;
