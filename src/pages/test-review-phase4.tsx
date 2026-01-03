import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TypographyH1,
  TypographyH2,
  TypographyP,
} from '@/components/ui/Typography.component';
import { gql, useMutation } from '@apollo/client';
import { ChangeEvent, useState } from 'react';

const SUBMIT_REVIEW = gql`
  mutation SubmitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      success
      message
      review {
        id
        author
        content
        rating
        verified
      }
      clientMutationId
    }
  }
`;

export default function TestReviewPhase4() {
  const [submitReview, { data, loading, error }] = useMutation(SUBMIT_REVIEW);
  const [productId, setProductId] = useState('67');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState(
    'Excellent product! The quality exceeded my expectations and delivery was fast. Highly recommend to anyone looking for durable furniture.',
  );

  const handleSubmit = async () => {
    try {
      await submitReview({
        variables: {
          input: {
            productId: parseInt(productId),
            rating,
            content,
            clientMutationId: `test-${Date.now()}`,
          },
        },
      });
    } catch (err) {
      console.error('Mutation error:', err);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <TypographyH1 className="mb-2">Phase 4 Review Mutation Test</TypographyH1>
      <TypographyP className="text-muted-foreground mb-8">
        Test the{' '}
        <code className="text-sm bg-muted px-1 py-0.5 rounded">
          submitReview
        </code>{' '}
        GraphQL mutation with live data
      </TypographyP>

      <div className="space-y-6 mb-8 p-6 border rounded-lg bg-card">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product ID</label>
          <Input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter WooCommerce product ID"
          />
          <p className="text-xs text-muted-foreground">
            Find product IDs in WordPress Admin → Products (look at URL:
            post=123)
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rating (1-5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                type="button"
                variant={rating === star ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRating(star)}
              >
                {'★'.repeat(star)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Review Content (10-5000 chars)
          </label>
          <textarea
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setContent(e.target.value)
            }
            rows={6}
            placeholder="Write your review..."
            className="resize-none w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-muted-foreground">
            {content.length} / 5000 characters
          </p>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mb-8"
        size="lg"
      >
        {loading ? 'Submitting Review...' : 'Submit Test Review'}
      </Button>

      {data && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-6">
          <TypographyH2 className="text-green-800 mb-2">
            ✅ {data.submitReview.success ? 'Success' : 'Failed'}
          </TypographyH2>
          <TypographyP className="text-green-700 mb-4">
            {data.submitReview.message}
          </TypographyP>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-green-800">
              View Raw Response
            </summary>
            <pre className="mt-2 text-xs overflow-auto bg-white p-4 rounded border">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <TypographyH2 className="text-red-800 mb-2">❌ Error</TypographyH2>
          <TypographyP className="text-red-700 mb-4">
            {error.message}
          </TypographyP>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-red-800">
              View Error Details
            </summary>
            <pre className="mt-2 text-xs overflow-auto bg-white p-4 rounded border">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-8 p-6 border rounded-lg bg-muted/30">
        <TypographyH2 className="mb-4">Testing Checklist</TypographyH2>
        <ul className="space-y-2 text-sm">
          <li>✅ Valid review submission (success message)</li>
          <li>✅ Authentication error (try when logged out)</li>
          <li>✅ Invalid product ID (product not found)</li>
          <li>✅ Invalid rating (try 0 or 6)</li>
          <li>✅ Content too short (less than 10 chars)</li>
          <li>✅ Content too long (more than 5000 chars)</li>
          <li>✅ Duplicate review (submit twice for same product)</li>
          <li>✅ Rate limit (submit 6 reviews within 1 hour)</li>
        </ul>
      </div>
    </div>
  );
}
