// client/src/pages/public/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  MapPin,
  Check,
  ShoppingBag,
  Store,
  Play,
  X,
  Sparkles
} from 'lucide-react';
import apiClient from '../../api/client';
import ProductCard from '../../components/ui/ProductCard';
import LocationPicker from '../../components/map/LocationPicker';
import { CATEGORY_IMAGES, ARTISAN_PORTRAITS } from '../../utils/productImages';

const CATEGORIES = [
  { slug: 'grains_flours', en: 'Farming', mr: 'शेती उत्पादने', image: '/mockup-assets/cat-farming.png' },
  { slug: 'handicrafts', en: 'Handicrafts', mr: 'हस्तकला', image: '/mockup-assets/cat-handicrafts.png' },
  { slug: 'handicrafts', en: 'Textiles & Fabrics', mr: 'वस्त्रे व हातमाग', image: '/mockup-assets/cat-textiles.png' },
  { slug: 'honey_preserves', en: 'Food & Honey', mr: 'अन्न व मध', image: '/mockup-assets/cat-food-honey.png' },
  { slug: 'handicrafts', en: 'Home Decor', mr: 'घर सजावट', image: '/mockup-assets/cat-home-decor.png' },
  { slug: 'handicrafts', en: 'Traditional Jewellery', mr: 'पारंपरिक दागिने', image: '/mockup-assets/cat-jewellery.png' },
  { slug: 'personal_care', en: 'Eco-Friendly', mr: 'पर्यावरणपूरक', image: '/mockup-assets/cat-eco-friendly.png' },
  { slug: 'pickles', en: 'Organic Produce', mr: 'सेंद्रिय शेतमाल', image: '/mockup-assets/cat-organic-produce.png' }
];

export function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadHomeData = async () => {
      try {
        const prodRes = await apiClient.get('/products?limit=8&sort=popular');
        if (mounted) {
          const prodList = prodRes?.items || prodRes?.data?.items || prodRes?.data?.products || (Array.isArray(prodRes) ? prodRes : []);
          setFeaturedProducts(prodList.slice(0, 8));
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
    <div className="space-y-14 sm:space-y-16 pb-20 bg-[#FAF7F2]">
      {/* 1. Hero Section (GrameenBazaar Target Design) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5EFE6] via-[#FAF7F2] to-[#FAF7F2] pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-[#EAE3D9]">
        {/* Floating Decorative Leaf Accents */}
        <div className="absolute top-4 left-6 text-2xl select-none opacity-40 pointer-events-none transform -rotate-12">
          🍃
        </div>
        <div className="absolute top-12 right-12 text-3xl select-none opacity-50 pointer-events-none transform rotate-45">
          🌿
        </div>

        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Badge: Support Rural India */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5EC] border border-[#CDE7D2] text-xs font-bold text-[#1b6e3b] shadow-xs">
                <span className="text-sm">🌾</span>
                <span>{isMr ? 'ग्रामीण भारताला व महाराष्ट्राला पाठबळ' : 'Support Rural India'}</span>
              </div>

              {/* Serif Headline with highlighted 'village' in emerald */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-[#1C1917] tracking-tight leading-[1.12]">
                {isMr ? (
                  <>
                    गावापासून <span className="text-[#15803d]">तुमच्या दारापर्यंत</span>.
                  </>
                ) : (
                  <>
                    From the <span className="text-[#15803d]">village</span> to your doorstep.
                  </>
                )}
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
                {isMr
                  ? 'ग्रामीण भागातील अस्सल, हस्तनिर्मित आणि थेट उत्पादकांकडून येणारी उत्पादने. स्थानिक कारागिरांना आणि शेतकऱ्यांना समृद्ध करा.'
                  : 'Discover authentic, handcrafted and locally sourced products from rural India. Support our villages, empower local artisans.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/products"
                  className="h-12 px-7 rounded-full bg-[#15803d] hover:bg-[#166534] text-white font-bold flex items-center gap-2.5 active:scale-95 transition-all shadow-md hover:shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-200" />
                  <span>{isMr ? 'उत्पादने पहा' : 'Explore Products'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="h-12 px-6 rounded-full bg-white border border-[#D5CDBD] text-[#1C1917] font-bold flex items-center gap-2 hover:bg-stone-50 active:scale-95 transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#15803d]/10 flex items-center justify-center text-[#15803d]">
                    <Play className="w-3 h-3 fill-[#15803d]" />
                  </div>
                  <span>{isMr ? 'व्हिडिओ पहा' : 'Watch Video'}</span>
                </button>
              </div>

              {/* Trust Bullets */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <Check className="w-3.5 h-3.5 text-[#15803d] stroke-[3]" />
                  <span>{isMr ? 'विश्वासार्ह' : 'Trusted'}</span>
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1.5 text-stone-700">
                  <Check className="w-3.5 h-3.5 text-[#15803d] stroke-[3]" />
                  <span>{isMr ? 'पर्यावरणपूरक' : 'Sustainable'}</span>
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1.5 text-stone-700">
                  <Check className="w-3.5 h-3.5 text-[#15803d] stroke-[3]" />
                  <span>{isMr ? 'मेड इन इंडिया' : 'Made in India'}</span>
                </span>
              </div>

              {/* Feasibility Check Link */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C581E] hover:text-[#15803d] underline underline-offset-4"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#15803d] shrink-0" />
                  <span>
                    {isMr
                      ? 'तुमच्या गावात डिलिव्हरी उपलब्ध आहे का? येथे तपासा'
                      : 'Check delivery feasibility to your area'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Visual Artwork (Authentic Cottage & Bullock Cart) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-[#F4EDE4]">
                <img
                  src="/mockup-assets/hero-village-scenery.png"
                  alt="Rural Village Heritage"
                  className="w-full h-auto object-cover max-h-[380px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] uppercase font-bold tracking-widest text-amber-300">
                    {isMr ? 'अस्सल ग्रामीण संस्कृती' : 'Authentic Rural Roots'}
                  </span>
                  <p className="text-sm sm:text-base font-serif font-bold text-white mt-0.5">
                    {isMr
                      ? 'स्थानिक कारागीर, शेतकरी आणि महिला बचत गट'
                      : 'Artisans, Self-Help Groups & Organic Cultivators'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category (8 Authentic Mockup Cards) */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
              {isMr ? 'विभागानुसार खरेदी करा' : 'Shop by Category'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {isMr ? 'अस्सल गावरान आणि घरगुती उत्पादने' : 'Explore our wide range of village products'}
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-[#15803d] hover:text-[#166534] flex items-center gap-1"
          >
            <span>{isMr ? 'सर्व पहा' : 'View All'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              className="group flex flex-col items-center p-3 bg-white border border-[#EDE7DD] rounded-2xl hover:border-[#15803d] hover:shadow-lg hover:-translate-y-1 transition-all text-center shadow-xs"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FBF9F5] p-2 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={cat.image}
                  alt={isMr ? cat.mr : cat.en}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-[#15803d] line-clamp-1">
                {isMr ? cat.mr : cat.en}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid (High Value GrameenBazaar Cards) */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
              {isMr ? 'लोकप्रिय गावरान उत्पादने' : 'Featured Village Products'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {isMr ? 'ग्राहकांची पहिली पसंती असणारी उत्पादने' : 'Handpicked products from rural artisans'}
            </p>
          </div>
          <Link
            to="/products?sort=popular"
            className="text-xs sm:text-sm font-bold text-[#15803d] hover:text-[#166534] flex items-center gap-1"
          >
            <span>{isMr ? 'सर्व उत्पादने' : 'View More'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 bg-stone-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">{isMr ? 'उत्पादने उपलब्ध नाहीत' : 'No products found'}</p>
        )}
      </section>

      {/* 4. Meet Our Village Entrepreneurs (Warm Artisan Profile Cards) */}
      <section className="bg-gradient-to-b from-[#F5EFE6] to-[#FAF7F2] border-y border-[#EAE3D9] py-12 sm:py-16">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
                {isMr ? 'भेटा आमच्या ग्रामीण उद्योजकांना' : 'Meet Our Village Entrepreneurs'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {isMr ? 'खरे लोक. खऱ्या गोष्टी. खरा प्रभाव.' : 'Real people. Real stories. Real impact.'}
              </p>
            </div>
            <Link
              to="/shops"
              className="text-xs sm:text-sm font-bold text-[#15803d] hover:text-[#166534] flex items-center gap-1"
            >
              <span>{isMr ? 'सर्व दुकाने' : 'View More'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.values(ARTISAN_PORTRAITS).map((artisan, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#EDE7DD] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#15803d]/30 shadow-xs shrink-0 bg-stone-100">
                      <img
                        src={artisan.image}
                        alt={isMr ? artisan.nameMr : artisan.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1C1917] text-sm sm:text-base leading-snug">
                        {isMr ? artisan.nameMr : artisan.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#15803d] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#b45309] shrink-0" />
                        <span>{isMr ? artisan.locationMr : artisan.location}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed italic border-l-2 border-amber-400 pl-3">
                    &ldquo;{isMr ? artisan.quoteMr : artisan.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-600">
                    ⭐ 4.9 (Artisan)
                  </span>
                  <Link
                    to="/shops"
                    className="text-xs font-bold text-[#15803d] hover:underline flex items-center gap-1"
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

      {/* 5. Value Propositions Banner */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8 relative">
        {/* Decorative corner leaves */}
        <div className="absolute -bottom-6 -left-2 text-3xl opacity-40 select-none pointer-events-none transform -rotate-45">
          🍃
        </div>
        <div className="absolute -bottom-6 -right-2 text-3xl opacity-40 select-none pointer-events-none transform rotate-45">
          🌿
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 sm:p-6 bg-white border border-[#EDE7DD] rounded-2xl flex items-start gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center p-2.5 shrink-0">
              <img
                src="/mockup-assets/icon-authentic-products.png"
                alt="Authentic"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-[#1C1917] mb-1 text-sm sm:text-base">
                {isMr ? '१००% अस्सल गावरान उत्पादने' : '100% Authentic Village Products'}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isMr
                  ? 'कोणतीही भेसळ नाही. ग्रामीण कारागीर व शेतकऱ्यांकडून थेट.'
                  : 'Direct from trusted artisans and farmers. Zero adulteration, pure traditional heritage.'}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white border border-[#EDE7DD] rounded-2xl flex items-start gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F2FA] flex items-center justify-center p-2.5 shrink-0">
              <img
                src="/mockup-assets/icon-rural-economy.png"
                alt="Rural Economy"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-[#1C1917] mb-1 text-sm sm:text-base">
                {isMr ? 'ग्रामीण अर्थव्यवस्थेला बळ' : 'Support Rural Economy'}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isMr
                  ? 'तुमची रक्कम थेट ग्रामीण उत्पादकांपर्यंत पोहोचते व उपजीविका निर्माण करते.'
                  : 'Empower villages and create sustainable livelihoods with every single purchase.'}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white border border-[#EDE7DD] rounded-2xl flex items-start gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#FBF3E6] flex items-center justify-center p-2.5 shrink-0">
              <img
                src="/mockup-assets/icon-secure-shopping.png"
                alt="Secure Shopping"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-[#1C1917] mb-1 text-sm sm:text-base">
                {isMr ? 'सुरक्षित व खात्रीशीर खरेदी' : 'Secure & Hassle-Free Shopping'}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isMr
                  ? 'थेट GPS ट्रॅकिंग, ४-अंकी डिलिव्हरी कोड आणि कॅश ऑन डिलिव्हरी पर्याय.'
                  : 'Shop with confidence and complete peace of mind. Live GPS & 4-digit code.'}
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

      {/* Video Modal Preview */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#1C1917] rounded-3xl overflow-hidden shadow-2xl border border-stone-700">
            <div className="flex items-center justify-between p-4 border-b border-stone-800 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {isMr ? 'आमच्या कारागिरांची गोष्ट' : 'Stories of Rural Artisans'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center">
              <img
                src="/mockup-assets/hero-village-scenery.png"
                alt="Artisan Story"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#15803d] text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
                <h4 className="text-lg font-bold text-white font-serif">
                  {isMr ? 'हस्तनिर्मित मातीची भांडी व पारंपरिक विणकाम' : 'The Hands That Create: Rural Heritage'}
                </h4>
                <p className="text-xs text-stone-300 max-w-md">
                  {isMr
                    ? 'प्रत्येक वस्तूमागे एक परंपरा आहे, एका कुटुंबाची मेहनत आहे.'
                    : 'Behind every product is generations of tradition and artisanal mastery.'}
                </p>
              </div>
            </div>
            <div className="p-4 bg-[#26201B] flex justify-end">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-5 py-2 rounded-full bg-[#15803d] text-white text-xs font-bold hover:bg-[#166534]"
              >
                {isMr ? 'बंद करा' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
