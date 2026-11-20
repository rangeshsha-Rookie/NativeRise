// client/src/pages/public/ShopsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Store, ArrowRight, Star, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/client';

export function ShopsPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchSellers = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/catalog/sellers');
        if (mounted && res?.ok && res.data) {
          setSellers(res.data.sellers || res.data || []);
        }
      } catch (err) {
        // Handled
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSellers();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clay/10 text-clay text-xs font-bold uppercase tracking-wider mb-2">
          <Store className="w-4 h-4" />
          <span>{isMr ? 'गावची अस्सल दुकाने' : 'Authentic Village Shops'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
          {isMr ? 'महाराष्ट्रातील ग्रामीण उद्योजक' : 'Rural Entrepreneurs of Maharashtra'}
        </h1>
        <p className="text-sm sm:text-base text-ink-2 mt-2 max-w-2xl">
          {isMr
            ? 'प्रत्येक दुकानाची एक अनोखी गोष्ट आहे. गावातील महिला बचत गट, शेतकरी आणि कारागीर यांच्या थेट दुकानातून अस्सल उत्पादने खरेदी करा.'
            : 'Every shop has a story of heritage, hard work, and rural pride. Discover village makers bringing authentic flavours and crafts straight to you.'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      ) : sellers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((s) => {
            const shopName = s.shopName?.[isMr ? 'mr' : 'en'] || s.shopName?.mr || s.shopName?.en || 'Shop';
            const story = s.story?.[isMr ? 'mr' : 'en'] || s.story?.mr || s.story?.en || '';
            const village = s.location?.village || '';
            const district = s.location?.district || '';
            const sellerId = s._id || s.id;

            return (
              <div
                key={sellerId}
                className="bg-surface border border-line rounded-card overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-clay text-cream flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 shadow-sm">
                      {s.shopPhoto ? (
                        <img src={s.shopPhoto} alt={shopName} className="w-full h-full object-cover" />
                      ) : (
                        shopName[0]
                      )}
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-lg text-ink group-hover:text-primary-800 transition-colors truncate">
                        {shopName}
                      </h3>
                      <p className="text-xs text-ink-2 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-clay shrink-0" />
                        <span>{village ? `${village}, ${district}` : district}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <span className="font-semibold text-ink">⭐ {s.ratingAverage ? s.ratingAverage.toFixed(1) : '5.0'}</span>
                        <span className="text-ink-2">({s.ratingCount || 0} {t('product.reviews', 'reviews')})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-ink-2 line-clamp-3 leading-relaxed">
                    {story}
                  </p>
                </div>

                <div className="px-6 py-4 bg-cream-2 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-2">
                    {s.deliveryMode === 'SELLER_PAYS'
                      ? isMr
                        ? 'मोफत डिलिव्हरी'
                        : 'Free Delivery'
                      : isMr
                      ? 'स्टँडर्ड डिलिव्हरी'
                      : 'Standard Delivery'}
                  </span>
                  <Link
                    to={`/shops/${sellerId}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-clay hover:underline"
                  >
                    <span>{isMr ? 'दुकान पहा' : 'Visit Shop'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-ink-2">{isMr ? 'कोणतीही दुकाने आढळली नाहीत.' : 'No village shops found.'}</p>
      )}
    </div>
  );
}

export default ShopsPage;
