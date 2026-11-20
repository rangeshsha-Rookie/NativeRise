// client/src/components/ui/RatingStars.jsx
import React from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

export function RatingStars({
  rating = 0,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
  count
}) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (interactive) {
    return (
      <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {stars.map((starVal) => (
          <button
            key={starVal}
            type="button"
            role="radio"
            aria-checked={rating >= starVal}
            aria-label={`${starVal} stars`}
            onClick={() => onChange && onChange(starVal)}
            className="p-1 text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 rounded"
          >
            <Star
              size={size}
              className={clsx(
                starVal <= rating
                  ? 'fill-ink text-ink'
                  : 'fill-transparent text-line hover:text-ink-2'
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`${rating} out of 5 stars`}>
      <div className="inline-flex items-center gap-0.5">
        {stars.map((starVal) => {
          const isFilled = starVal <= Math.round(rating);
          return (
            <Star
              key={starVal}
              size={size}
              className={clsx(
                isFilled ? 'fill-ink text-ink' : 'fill-transparent text-line'
              )}
            />
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs sm:text-sm font-medium text-ink-2">
          ({count})
        </span>
      )}
    </div>
  );
}

export default RatingStars;
