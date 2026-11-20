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
  Store,
  CheckCircle2,
  Play
} from 'lucide-react';
import apiClient from '../../api/client';
import ProductCard from '../../components/ui/ProductCard';
import LocationPicker from '../../components/map/LocationPicker';
import { CATEGORY_IMAGES, ARTISAN_PORTRAITS } from '../../utils/productImages';

const CATEGORIES = [
  { slug: 'pickles', en: 'Pickles', mr: 'लोणची', image: CATEGORY_IMAGES.pickles },
  { slug: 'masalas', en: 'Spices & Masalas', mr: 'मसाले', image: CATEGORY_IMAGES.masalas },
  { slug: 'sweets_snacks', en: 'Sweets & Snacks', mr: 'फराळ व मिठाई', image: CATEGORY_IMAGES.sweets_snacks },
  { slug: 'grains_flours', en: 'Grains & Flours', mr: 'धान्य व पिठे', image: CATEGORY_IMAGES.grains_flours },
  { slug: 'honey_preserves', en: 'Honey & Preserves', mr: 'मध व जॅम', image: CATEGORY_IMAGES.honey_preserves },
  { slug: 'dairy_ghee', en: 'Village Ghee & Dairy', mr: 'साजुक तूप व दुग्धजन्य', image: CATEGORY_IMAGES.dairy_ghee },
  { slug: 'handicrafts', en: 'Handicrafts', mr: 'हस्तकला', image: CATEGORY_IMAGES.handicrafts },
  { slug: 'personal_care', en: 'Personal Care', mr: 'नैसर्गिक सौंदर्यप्रसाधने', image: CATEGORY_IMAGES.personal_care }
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
          apiClient.get('/products?limit=8&sort=popular'),
          apiClient.get('/catalog/sellers')
        ]);
        if (mounted) {
          const prodList = prodRes?.items || prodRes?.data?.items || prodRes?.data?.products || (Array.isArray(prodRes) ? prodRes : []);
          setFeaturedProducts(prodList.slice(0, 8));

          const sellList = Array.isArray(sellRes) ? sellRes : (sellRes?.sellers || sellRes?.items || sellRes?.data?.sellers || []);
          setSellers(sellList.slice(0, 4));
        }
      } catch {
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
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section (GrameenBazaar Premium Split Layout) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5EFE6] via-cream to-cream pt-10 sm:pt-16 pb-12 sm:pb-20 border-b border-line">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge: Support Rural India / Maharashtra */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-800 shadow-sm">
                <span className="text-base">🌾</span>
                <span>{isMr ? 'ग्रामीण भारताला व महाराष्ट्राला पाठबळ' : 'Support Rural Maharashtra'}</span>
              </div>

              {/* Headline with highlighted 'village' */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-ink tracking-tight leading-[1.15]">
                {isMr ? (
                  <>
                    गावापासून <span className="text-emerald-700">तुमच्या दारापर्यंत</span>.
                  </>
                ) : (
                  <>
                    From the <span className="text-emerald-700">village</span> to your doorstep.
                  </>
                )}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-ink-2/90 max-w-xl leading-relaxed">
                {isMr
                  ? 'महाराष्ट्रातील ग्रामीण महिला बचत गट, हस्तकला कारागीर आणि लहान शेतकऱ्यांची अस्सल उत्पादने — थेट त्यांच्या घरातून तुमच्या दारापर्यंत.'
                  : 'Discover authentic, handcrafted and locally sourced products from rural Maharashtra. Support our villages, empower local artisans.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="h-13 px-8 rounded-full bg-emerald-700 text-white font-bold flex items-center gap-2.5 hover:bg-emerald-800 active:scale-95 transition-all shadow-md"
                >
                  <ShoppingBag className="w-5 h-5 text-amber-200" />
                  <span>{isMr ? 'उत्पादने पहा' : 'Explore Products'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/shops"
                  className="h-13 px-7 rounded-full bg-surface border-2 border-stone-300 text-ink font-bold flex items-center gap-2 hover:bg-stone-50 active:scale-95 transition-all shadow-sm"
                >
                  <Store className="w-5 h-5 text-clay" />
                  <span>{isMr ? 'गावची दुकाने' : 'Village Shops'}</span>
                </Link>
              </div>

              {/* Trust Bullets */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-2">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {isMr ? '१००% अस्सल गावरान' : 'Trusted & Authentic'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {isMr ? 'थेट उत्पादकांकडून' : 'Direct from Artisans'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {isMr ? 'थेट GPS ट्रॅकिंग' : 'Live GPS Delivery'}
                </span>
              </div>

              {/* Feasibility Check Link */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-clay hover:text-emerald-800 underline underline-offset-4"
                >
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {isMr
                      ? 'तुमच्या गावात डिलिव्हरी उपलब्ध आहे का? येथे तपासा'
                      : 'Check delivery feasibility to your area'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Visual Artwork (Rural Village Cottage & Bull Cart Scenery) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&auto=format&fit=crop&q=80"
                  alt="Rural Village Life"
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
                    {isMr ? 'हस्तनिर्मित व अस्सल' : 'Direct Village Heritage'}
                  </span>
                  <p className="text-lg font-serif font-bold text-white mt-1">
                    {isMr ? 'गावची पारंपरिक कला व शेतमालाची समृद्धी' : 'Artisans, Self-Help Groups & Organic Cultivators'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category (Photorealistic Rounded Cards) */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {isMr ? 'विभागानुसार खरेदी करा' : 'Shop by Category'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-2 mt-1">
              {isMr ? 'अस्सल गावरान आणि घरगुती उत्पादने' : 'Explore our wide range of authentic village products'}
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
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
              className="group flex flex-col items-center p-3 bg-surface border border-line/80 rounded-2xl hover:border-emerald-600 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF7F2] p-1.5 mb-2.5 shadow-inner">
                <img
                  src={cat.image}
                  alt={isMr ? cat.mr : cat.en}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-bold text-ink group-hover:text-emerald-700 line-clamp-1">
                {isMr ? cat.mr : cat.en}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid (High Value Photorealistic Cards) */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {isMr ? 'लोकप्रिय गावरान उत्पादने' : 'Featured Village Products'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-2 mt-1">
              {isMr ? 'ग्राहकांची पहिली पसंती असणारी उत्पादने' : 'Handpicked authentic products from rural artisans'}
            </p>
          </div>
          <Link
            to="/products?sort=popular"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>{isMr ? 'सर्व उत्पादने' : 'View More'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 bg-cream-2 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <p className="text-ink-2 text-sm">{isMr ? 'उत्पादने उपलब्ध नाहीत' : 'No products found'}</p>
        )}
      </section>

      {/* 4. Meet Our Village Entrepreneurs (Warm Artisan Profile Cards) */}
      <section className="bg-gradient-to-b from-[#F7F2EA] to-cream border-y border-line py-14 sm:py-18">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                {isMr ? 'भेटा आमच्या ग्रामीण उद्योजकांना' : 'Meet Our Village Entrepreneurs'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-2 mt-1">
                {isMr ? 'खरे लोक. खऱ्या गोष्टी. खरा प्रभाव.' : 'Real people. Real stories. Real impact.'}
              </p>
            </div>
            <Link
              to="/shops"
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{isMr ? 'सर्व दुकाने' : 'View More'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {Object.values(ARTISAN_PORTRAITS).map((artisan, idx) => (
              <div
                key={idx}
                className="bg-surface border border-line/90 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-600 shadow-sm shrink-0">
                      <img
                        src={artisan.image}
                        alt={isMr ? artisan.nameMr : artisan.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink text-sm sm:text-base leading-snug">
                        {isMr ? artisan.nameMr : artisan.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-clay shrink-0" />
                        <span>{isMr ? artisan.locationMr : artisan.location}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-ink-2/90 leading-relaxed italic border-l-2 border-amber-400 pl-3">
                    &ldquo;{isMr ? artisan.quoteMr : artisan.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-line/70 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-600">
                    ⭐ 4.9 (Artisan)
                  </span>
                  <Link
                    to="/shops"
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{isMr ? 'दुकान पहा' : 'Visit Shop'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Value Propositions / Trust Guarantees */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface border border-line/90 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center text-xl shrink-0">
              🌿
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1 text-sm sm:text-base">
                {isMr ? '१००% अस्सल गावरान उत्पादने' : '100% Authentic Village Products'}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed">
                {isMr
                  ? 'कोणतीही भेसळ नाही. ग्रामीण महिला बचत गट, शेतकरी आणि कारागिरांकडून थेट.'
                  : 'Direct from trusted artisans and farmers. Zero adulteration, pure traditional heritage.'}
              </p>
            </div>
          </div>

          <div className="p-6 bg-surface border border-line/90 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center text-xl shrink-0">
              🤝
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1 text-sm sm:text-base">
                {isMr ? 'ग्रामीण अर्थव्यवस्थेला बळ' : 'Support Rural Economy'}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed">
                {isMr
                  ? 'मध्यस्थांशिवाय तुमची रक्कम थेट ग्रामीण उत्पादकांपर्यंत पोहोचते व उपजीविका निर्माण करते.'
                  : 'Empower villages and create sustainable livelihoods with every single purchase.'}
              </p>
            </div>
          </div>

          <div className="p-6 bg-surface border border-line/90 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1 text-sm sm:text-base">
                {isMr ? 'सुरक्षित व खात्रीशीर खरेदी' : 'Secure & Hassle-Free Shopping'}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed">
                {isMr
                  ? 'थेट GPS ट्रॅकिंग, सुरक्षित ४-अंकी डिलिव्हरी कोड आणि कॅश ऑन डिलिव्हरी पर्याय.'
                  : 'Live GPS checkpoint tracking, 4-digit verification code, and Cash on Delivery.'}
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
