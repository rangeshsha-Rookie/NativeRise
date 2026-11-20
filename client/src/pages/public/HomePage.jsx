// client/src/pages/public/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Sparkles,
  ShoppingBag,
  Store
} from 'lucide-react';
import apiClient from '../../api/client';
import ProductCard from '../../components/ui/ProductCard';
import LocationPicker from '../../components/map/LocationPicker';

const CATEGORIES = [
  { slug: 'pickles', en: 'Pickles', mr: 'लोणची', icon: '🥒', bg: 'bg-amber-100' },
  { slug: 'masalas', en: 'Spices & Masalas', mr: 'मसाले', icon: '🌶️', bg: 'bg-red-100' },
  { slug: 'sweets_snacks', en: 'Sweets & Snacks', mr: 'फराळ व मिठाई', icon: '🍪', bg: 'bg-orange-100' },
  { slug: 'grains_flours', en: 'Grains & Flours', mr: 'धान्य व पिठे', icon: '🌾', bg: 'bg-yellow-100' },
  { slug: 'honey_preserves', en: 'Honey & Preserves', mr: 'मध व जॅम', icon: '🍯', bg: 'bg-amber-100' },
  { slug: 'dairy_ghee', en: 'Village Ghee & Dairy', mr: 'साजुक तूप व दुग्धजन्य', icon: '🥛', bg: 'bg-blue-100' },
  { slug: 'handicrafts', en: 'Handicrafts', mr: 'हस्तकला', icon: '🧺', bg: 'bg-emerald-100' },
  { slug: 'personal_care', en: 'Personal Care', mr: 'नैसर्गिक सौंदर्यप्रसाधने', icon: '🌿', bg: 'bg-teal-100' }
];

export function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadHomeData = async () => {
      try {
        const [prodRes, sellRes] = await Promise.all([
          apiClient.get('/catalog/products?limit=8&sort=popular'),
          apiClient.get('/catalog/sellers')
        ]);
        if (mounted) {
          if (prodRes?.ok && prodRes.data) {
            setFeaturedProducts(prodRes.data.products || prodRes.data);
          }
          if (sellRes?.ok && sellRes.data) {
            setSellers((sellRes.data.sellers || sellRes.data || []).slice(0, 4));
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section with Tagline */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-100/50 via-cream to-cream pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-line text-xs font-semibold text-clay shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-800" />
              <span>{isMr ? '१००% अस्सल गावरान चव' : '100% Authentic Rural Marketplace'}</span>
            </div>

            {/* Tagline per spec: From the village to your doorstep / गावापासून तुमच्या दारापर्यंत */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-ink tracking-tight leading-tight">
              {isMr ? (
                <>
                  <span className="text-clay">गावापासून</span> तुमच्या दारापर्यंत.
                </>
              ) : (
                <>
                  From the <span className="text-clay">village</span> to your doorstep.
                </>
              )}
            </h1>

            <p className="text-base sm:text-xl text-ink-2 leading-relaxed">
              {isMr
                ? 'महाराष्ट्रातील ग्रामीण महिला बचत गट, कारागीर आणि शेतकऱ्यांची अस्सल उत्पादने — थेट त्यांच्या घरातून तुमच्या दारापर्यंत, जलद ट्रॅकिंगसह.'
                : 'Direct marketplace connecting rural Maharashtra entrepreneurs, women SHGs, and small farmers directly to your home with live checkpoint delivery.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="h-12 px-7 rounded-full bg-primary text-ink font-semibold flex items-center gap-2 hover:bg-primary-600 active:scale-95 transition-all shadow-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isMr ? 'उत्पादने पहा' : 'Explore Products'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shops"
                className="h-12 px-6 rounded-full bg-surface border border-ink text-ink font-semibold flex items-center gap-2 hover:bg-cream-2 active:scale-95 transition-all"
              >
                <Store className="w-5 h-5 text-clay" />
                <span>{isMr ? 'गावची दुकाने' : 'Village Shops'}</span>
              </Link>
            </div>

            {/* Feasibility Estimator Trigger */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink underline underline-offset-4"
              >
                <MapPin className="w-4 h-4 text-clay" />
                <span>
                  {isMr
                    ? 'तुमच्या गावात डिलिव्हरी उपलब्ध आहे का? तपासा'
                    : 'Check delivery feasibility to your area'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {isMr ? 'विभागानुसार खरेदी करा' : 'Shop by Category'}
            </h2>
            <p className="text-sm text-ink-2 mt-1">
              {isMr ? 'हस्तनिर्मित व घरगुती उत्पादने' : 'Handcrafted, homemade village essentials'}
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-clay hover:text-primary-800 flex items-center gap-1"
          >
            <span>{isMr ? 'सर्व पहा' : 'View All'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              className="group flex flex-col items-center p-4 bg-surface border border-line rounded-card hover:border-ink hover:shadow-md transition-all text-center"
            >
              <div
                className={`w-14 h-14 rounded-full ${cat.bg} flex items-center justify-center text-2xl mb-2.5 group-hover:scale-110 transition-transform`}
              >
                {cat.icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-ink group-hover:text-primary-800">
                {isMr ? cat.mr : cat.en}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured / Trending Products */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {isMr ? 'लोकप्रिय उत्पादने' : 'Featured Village Products'}
            </h2>
            <p className="text-sm text-ink-2 mt-1">
              {isMr ? 'ग्राहकांची पहिली पसंती' : 'Most loved by customers this week'}
            </p>
          </div>
          <Link
            to="/products?sort=popular"
            className="text-sm font-semibold text-clay hover:text-primary-800 flex items-center gap-1"
          >
            <span>{isMr ? 'सर्व उत्पादने' : 'All Products'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-cream-2 rounded-card animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <p className="text-ink-2">{isMr ? 'उत्पादने उपलब्ध नाहीत' : 'No products found'}</p>
        )}
      </section>

      {/* 4. Rural Entrepreneurs / Sellers Spotlight */}
      <section className="bg-surface border-y border-line py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                {isMr ? 'गावचे उद्योजक आणि त्यांची गोष्ट' : 'Meet Our Village Entrepreneurs'}
              </h2>
              <p className="text-sm text-ink-2 mt-1">
                {isMr
                  ? 'थेट उत्पादक, बचत गट आणि शेतकरी यांच्याकडून खरेदी करा'
                  : 'Empowering rural women and small producers across Maharashtra'}
              </p>
            </div>
            <Link
              to="/shops"
              className="text-sm font-semibold text-clay hover:text-primary-800 flex items-center gap-1"
            >
              <span>{isMr ? 'सर्व दुकाने' : 'All Shops'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellers.map((s) => {
              const shopTitle = s.shopName?.[isMr ? 'mr' : 'en'] || s.shopName?.mr || s.shopName?.en || 'Shop';
              const story = s.story?.[isMr ? 'mr' : 'en'] || s.story?.mr || s.story?.en || '';
              const village = s.location?.village || '';
              const district = s.location?.district || '';

              return (
                <div
                  key={s._id || s.id}
                  className="bg-cream border border-line rounded-card p-5 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-clay text-cream flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                        {s.shopPhoto ? (
                          <img src={s.shopPhoto} alt={shopTitle} className="w-full h-full object-cover" />
                        ) : (
                          shopTitle[0]
                        )}
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-ink truncate">{shopTitle}</h3>
                        <p className="text-xs text-ink-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-clay shrink-0" />
                          <span>{village ? `${village}, ${district}` : district}</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-ink-2 line-clamp-3 leading-relaxed">
                      {story}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                    <span className="text-xs text-ink-2">
                      ⭐ {s.ratingAverage ? s.ratingAverage.toFixed(1) : '5.0'}
                    </span>
                    <Link
                      to={`/shops/${s._id || s.id}`}
                      className="text-xs font-semibold text-clay hover:underline flex items-center gap-1"
                    >
                      <span>{isMr ? 'दुकान पहा' : 'Visit Shop'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Trust & Transparency Guarantees */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface border border-line rounded-card flex items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1">
                {isMr ? '१००% अस्सल गावरान' : '100% Authentic Village Origin'}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed">
                {isMr
                  ? 'कोणतीही भेसळ नाही. प्रत्येक उत्पादन गावातील शेतकरी किंवा बचत गटाकडून प्रत्यक्ष तयार केलेले.'
                  : 'Zero adulteration. Pure farm-made and women-crafted products straight from the source.'}
              </p>
            </div>
          </div>

          <div className="p-6 bg-surface border border-line rounded-card flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-ink">
                {isMr ? 'थेट चेकपॉईंट ट्रॅकिंग' : 'Live Checkpoint Delivery'}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed">
                {isMr
                  ? 'डिलिव्हरी पार्टनरच्या खऱ्याखुऱ्या GPS लोकेशनसह नकाशावर थेट ट्रॅकिंग. सुरक्षित ४-अंकी कोड.'
                  : 'Track partner real GPS checkpoints on a live map. Secure 4-digit code on arrival.'}
              </p>
            </div>
          </div>

          <div className="p-6 bg-surface border border-line rounded-card flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-ink">
                {isMr ? 'ग्रामीण उद्योजकांना थेट आधार' : 'Direct Support to Rural Income'}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed">
                {isMr
                  ? 'मध्यस्थांशिवाय तुमची रक्कम थेट ग्रामीण उत्पादकांपर्यंत पोहोचते.'
                  : 'No middlemen. Your money goes straight to empowering rural families and communities.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}

export default HomePage;
