// client/src/pages/seller/SellerReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare } from 'lucide-react';
import apiClient from '../../api/client';
import { RatingStars } from '../../components/ui/RatingStars';

export function SellerReviewsPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/seller/reviews')
      .then((res) => {
        if (res?.ok && res.data) {
          setReviewsData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="h-32 bg-cream-2 rounded-card animate-pulse" />
      </div>
    );
  }

  const reviews = reviewsData?.reviews || reviewsData || [];
  const ratingAverage = reviewsData?.ratingAverage || 5.0;
  const ratingCount = reviewsData?.ratingCount || reviews.length;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'ग्राहक पुनरावलोकने व रेटिंग' : 'Customer Reviews & Ratings'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'तुमच्या सर्व उत्पादनांवर ग्राहकांनी दिलेले अभिप्राय.'
            : 'Verified customer feedback across all your listed village products.'}
        </p>
      </div>

      {/* Summary Score Card */}
      <div className="p-6 bg-surface border border-line rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-bold font-serif text-ink">
              {ratingAverage ? ratingAverage.toFixed(1) : '5.0'}
            </span>
            <span className="text-sm text-ink-2 font-medium">/ 5.0</span>
          </div>
          <div className="mt-1">
            <RatingStars rating={ratingAverage} size={20} />
          </div>
          <span className="text-xs text-ink-2 mt-1 block">
            {isMr ? `${ratingCount} ग्राहकांचा अभिप्राय` : `Based on ${ratingCount} verified reviews`}
          </span>
        </div>

        <div className="text-xs text-ink-2 max-w-sm bg-cream-2 p-3.5 rounded-xl border border-line">
          <p>
            {isMr
              ? 'उत्तम रेटिंगमुळे तुमच्या दुकानाचा विश्वास वाढतो आणि नवीन ग्राहकांकडून जास्त ऑर्डर्स मिळतात.'
              : 'Maintaining high ratings helps your shop rank higher in searches and unlocks new loyal buyers.'}
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-ink">
          {isMr ? 'सर्व प्रतिक्रिया' : 'All Reviews'}
        </h2>

        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev._id || rev.id} className="p-5 bg-surface border border-line rounded-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cream-2 text-ink font-bold text-xs flex items-center justify-center">
                      {(rev.customerName || 'Customer')[0]}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-ink block leading-tight">
                        {rev.customerName || 'Customer'}
                      </span>
                      <span className="text-[11px] text-ink-2">
                        {rev.productName && <strong className="text-clay">{rev.productName} · </strong>}
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <RatingStars rating={rev.rating} size={14} />
                </div>
                <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface border border-line rounded-card">
            <p className="text-xs text-ink-2 italic">
              {isMr ? 'अद्याप पुनरावलोकने प्राप्त झालेली नाहीत.' : 'No customer reviews received yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerReviewsPage;
