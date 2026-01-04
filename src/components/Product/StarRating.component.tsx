import { cn } from '@/lib/utils';
import React from 'react';

interface StarRatingProps {
  rating: number; // 0-5, supports decimals (e.g., 4.5)
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}) => {
  // Use stable ID based on rating to prevent SSR hydration mismatch
  const stableId = React.useMemo(
    () => `star-${rating.toFixed(2).replace('.', '-')}`,
    [rating],
  );

  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  const starSize = sizeMap[size];

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const filled = Math.min(Math.max(rating - (i - 1), 0), 1);
      const clipId = `${stableId}-${i}`;

      stars.push(
        <svg
          key={i}
          width={starSize}
          height={starSize}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={`${filled * 100}%`} height="20" />
            </clipPath>
          </defs>
          {/* Background star (empty) */}
          <path
            d="M10 1.5L12.39 7.21L18.5 8.02L14.25 12.13L15.28 18.5L10 15.27L4.72 18.5L5.75 12.13L1.5 8.02L7.61 7.21L10 1.5Z"
            fill="#D1D5DB"
            stroke="#D1D5DB"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Foreground star (filled portion) */}
          <path
            d="M10 1.5L12.39 7.21L18.5 8.02L14.25 12.13L15.28 18.5L10 15.27L4.72 18.5L5.75 12.13L1.5 8.02L7.61 7.21L10 1.5Z"
            fill="#FBBF24"
            stroke="#FBBF24"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#${clipId})`}
          />
        </svg>,
      );
    }
    return stars;
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex"
        role="img"
        aria-label={`${rating} out of ${maxRating} stars`}
      >
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};
