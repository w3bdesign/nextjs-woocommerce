/*eslint complexity: ["error", 20]*/
// Imports
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Components
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TypographyH2,
  TypographyLarge,
} from '@/components/UI/Typography.component';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import CartContents from '../Cart/CartContents.component';
import Billing from './Billing.component';

// GraphQL
import { useCartStore } from '@/stores/cartStore';
import { CHECKOUT_MUTATION } from '@/utils/gql/GQL_MUTATIONS';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';

// Utils
import {
  createCheckoutData,
  getFormattedCart,
  ICheckoutDataProps,
} from '@/utils/functions/functions';

export interface IBilling {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  postcode: string;
  email: string;
  phone: string;
}

export interface IShipping {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  postcode: string;
  email: string;
  phone: string;
}

export interface ICheckoutData {
  clientMutationId: string;
  billing: IBilling;
  shipping: IShipping;
  shipToDifferentAddress: boolean;
  paymentMethod: string;
  isPaid: boolean;
  transactionId: string;
}

const CheckoutForm = () => {
  const { cart, clearWooCommerceSession, syncWithWooCommerce } = useCartStore();
  const [orderData, setOrderData] = useState<ICheckoutData | null>(null);
  const [requestError, setRequestError] = useState<ApolloError | null>(null);
  const [orderCompleted, setorderCompleted] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  });

  // Sync cart data when query completes
  useEffect(() => {
    if (data) {
      const updatedCart = getFormattedCart(data);
      if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
        clearWooCommerceSession();
        return;
      }
      if (updatedCart) {
        syncWithWooCommerce(updatedCart);
      }
    }
  }, [data, clearWooCommerceSession, syncWithWooCommerce]);

  // Checkout GraphQL mutation
  const [
    checkout,
    { loading: checkoutLoading, data: checkoutData, error: checkoutError },
  ] = useMutation(CHECKOUT_MUTATION, {
    variables: {
      input: orderData,
    },
  });

  // Handle checkout completion with useEffect instead of deprecated onCompleted
  useEffect(() => {
    if (checkoutData) {
      clearWooCommerceSession();
      setorderCompleted(true);
      toast({
        title: 'Order placed successfully!',
        description: 'Thank you for your order. We will process it shortly.',
      });
      refetch();
      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [checkoutData, clearWooCommerceSession, refetch, toast, router]);

  // Handle checkout error
  useEffect(() => {
    if (checkoutError) {
      setRequestError(checkoutError);
      toast({
        title: 'Checkout error',
        description:
          'An error occurred while processing your order. Please try again.',
        variant: 'destructive',
      });
      refetch();
    }
  }, [checkoutError, refetch, toast]);

  useEffect(() => {
    if (null !== orderData) {
      // Perform checkout mutation when the value for orderData changes.
      checkout();
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [checkout, orderData, refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleFormSubmit = (submitData: ICheckoutDataProps) => {
    const checkOutData = createCheckoutData(submitData);

    setOrderData(checkOutData);
    setRequestError(null);
  };

  return (
    <>
      {cart && !orderCompleted ? (
        <div className="container mx-auto">
          {/*	Order*/}
          <CartContents />
          {/*Payment Details*/}
          <Billing handleFormSubmit={handleFormSubmit} />
          {/*Error display*/}
          {requestError && (
            <div className="max-w-2xl mx-auto my-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Checkout Error</AlertTitle>
                <AlertDescription>
                  An error occurred while processing your order. Please try
                  again or contact support if the problem persists.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {/* Checkout Loading*/}
          {checkoutLoading && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-64 mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-10 w-32 mx-auto mt-6" />
            </div>
          )}
        </div>
      ) : (
        <>
          {!cart && !orderCompleted && (
            <TypographyH2 className="m-12 mt-24 text-center">
              No products in cart
            </TypographyH2>
          )}
          {orderCompleted && (
            <TypographyLarge className="container h-24 m-12 mx-auto mt-24 text-center">
              Thank you for your order!
            </TypographyLarge>
          )}
        </>
      )}
    </>
  );
};

export default CheckoutForm;
