import Layout from '@/components/Layout/Layout.component';
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
import {
  TypographyH2,
  TypographyP,
} from '@/components/ui/Typography.component';
import { Info } from 'lucide-react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

interface IForgotPasswordData {
  email: string;
}

/**
 * Forgot password page stub
 * @function ForgotPasswordPage
 * @returns {JSX.Element} - Rendered page with password reset form (placeholder)
 */
const ForgotPasswordPage: NextPage = () => {
  const form = useForm<IForgotPasswordData>();

  const onSubmit = (data: IForgotPasswordData) => {
    // TODO: Implement password reset functionality
    console.log('Password reset requested for:', data.email);
  };

  return (
    <Layout title="Reset Password | Mebl">
      <div className="container mx-auto max-w-md px-4 py-16">
        <TypographyH2 className="mb-8 text-center">
          Reset Your Password
        </TypographyH2>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Password reset functionality is coming soon. Please contact support
            if you need to reset your password.
          </AlertDescription>
        </Alert>

        <section className="text-gray-700">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <TypographyP className="text-sm text-muted-foreground mt-2">
                      Enter the email address associated with your account.
                    </TypographyP>
                  </FormItem>
                )}
              />

              <Button
                variant="default"
                className="w-full"
                type="submit"
                disabled
              >
                Reset Password (Coming Soon)
              </Button>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
