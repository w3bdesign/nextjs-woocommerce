import { TypographyP } from '@/components/ui/Typography.component';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { StarRating } from './StarRating.component';

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  reviewCount,
}) => {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="text-5xl font-bold text-foreground mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" className="mb-2" />
          <TypographyP className="text-muted-foreground">
            Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </TypographyP>
        </div>
      </CardContent>
    </Card>
  );
};
