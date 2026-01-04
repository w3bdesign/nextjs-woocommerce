import { TypographyP } from '@/components/ui/Typography.component';
import { Card, CardContent } from '@/components/ui/card';
import { ProductReview } from '@/types/review';
import React from 'react';
import { StarRating } from './StarRating.component';

interface ReviewCardProps {
  review: ProductReview;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  // Debug: Log review data
  console.log('[REVIEW_CARD]', JSON.stringify(review, null, 2));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Strip HTML tags from content
  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') {
      // Server-side: simple regex strip
      return html.replace(/<[^>]*>/g, '');
    }
    // Client-side: use DOM parser
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const cleanContent = stripHtml(review.content);

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {review.author.node.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  {review.author.node.name}
                </p>
                {review.rating && (
                  <StarRating rating={review.rating} size="sm" />
                )}
              </div>
              <time
                className="text-sm text-muted-foreground"
                dateTime={review.date}
              >
                {formatDate(review.date)}
              </time>
            </div>
          </div>
        </div>

        {/* Content */}
        <TypographyP className="text-foreground whitespace-pre-line mt-3">
          {cleanContent}
        </TypographyP>
      </CardContent>
    </Card>
  );
};
