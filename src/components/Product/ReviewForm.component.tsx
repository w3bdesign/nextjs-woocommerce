import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getAuthToken } from '@/utils/auth';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { SUBMIT_REVIEW } from '@/utils/gql/SUBMIT_REVIEW';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review must be less than 5000 characters'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: number;
  productSlug: string;
  isAuthenticated: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productSlug,
  isAuthenticated: ssrIsAuthenticated,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(ssrIsAuthenticated);
  const { toast } = useToast();

  // Check client-side authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      setIsAuthenticated(!!token);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      content: '',
    },
  });

  const contentValue = watch('content') || '';

  const [submitReview, { loading }] = useMutation(SUBMIT_REVIEW, {
    refetchQueries: [
      {
        query: GET_PRODUCT_REVIEWS,
        variables: { slug: productSlug, first: 10 },
      },
    ],
  });

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Rating required',
        description: 'Please select a star rating before submitting.',
      });
      return;
    }

    try {
      const { data: mutationData } = await submitReview({
        variables: {
          input: {
            productId,
            rating,
            content: data.content,
            clientMutationId: `review-${Date.now()}`,
          },
        },
      });

      if (mutationData?.submitReview?.success) {
        setSubmitted(true);
        reset();
        setRating(0);
        toast({
          title: 'Review submitted!',
          description:
            'Thank you for your review. It will appear after moderation.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Submission failed',
          description:
            mutationData?.submitReview?.message ||
            'Unable to submit review. Please try again.',
        });
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while submitting your review.',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be{' '}
          <Link
            href={`/login?redirect=/product/${productSlug}`}
            className="underline font-medium"
          >
            logged in
          </Link>{' '}
          to submit a review.
        </AlertDescription>
      </Alert>
    );
  }

  if (submitted) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your review has been submitted and is awaiting moderation. Thank you!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Star Rating Input */}
          <div className="space-y-2">
            <Label htmlFor="rating">
              Your Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    setValue('rating', star);
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setRating(star);
                      setValue('rating', star);
                    }
                  }}
                  aria-label={`Rate ${star} stars`}
                  aria-pressed={star <= rating}
                  tabIndex={0}
                  className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300',
                    )}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Your Review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Share your experience with this product..."
              rows={6}
              {...register('content')}
              aria-invalid={!!errors.content}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">Minimum 10 characters</p>
              <p className="text-xs text-gray-500">
                {contentValue.length} / 5000
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading || rating === 0}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
