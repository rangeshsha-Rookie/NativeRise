// client/src/pages/public/ShopDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Store, Star, Truck, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import apiClient from '../../api/client';
import ProductCard from '../../components/ui/ProductCard';

export function ShopDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchShopData = async () => {
      setLoading(true);
      try {
        const [shopRes, prodRes] = await Promise.all([
          apiClient.get(`/catalog/sellers/${id}`),
          apiClient.get(`/catalog/sellers/${id}/products`)
        ]);

        if (mounted && shopRes?.ok && shopRes.data) {
          setSeller(shopRes.data.seller || shopRes.data);
        }
        if (mounted && prodRes) {
          const list = prodRes.items || prodRes.products || prodRes.data?.items || prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : (Array.isArray(prodRes) ? prodRes : []));
          setProducts(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        // Handled
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchShopData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="h-48 bg-cream-2 rounded-card animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'दुकान सापडले नाही' : 'Shop Not Found'}
        </h2>
        <Link to="/shops" className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink font-semibold">
          {isMr ? 'सर्व दुकाने पहा' : 'Back to Village Shops'}
        </Link>
      </div>
    );
  }

  const shopName = seller.shopName?.[isMr ? 'mr' : 'en'] || seller.shopName?.mr || seller.shopName?.en || 'Shop';
  const story = seller.story?.[isMr ? 'mr' : 'en'] || seller.story?.mr || seller.story?.en || '';
  const village = seller.location?.village || '';
  const district = seller.location?.district || '';

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">
          {t('nav.home', 'Home')}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shops" className="hover:text-ink">
          {isMr ? 'गावची दुकाने' : 'Village Shops'}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-ink font-semibold truncate max-w-[200px]">{shopName}</span>
      </nav>

      {/* Shop Profile Banner */}
      <div className="bg-surface border border-line rounded-card overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-clay text-cream flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0 shadow-md">
              {seller.shopPhoto ? (
                <img src={seller.shopPhoto} alt={shopName} className="w-full h-full object-cover" />
              ) : (
                shopName[0]
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-clay/10 text-clay text-xs font-bold uppercase tracking-wider">
                  {isMr ? 'सत्यापित ग्रामीण उत्पादक' : 'Verified Village Maker'}
                </span>
                <span className="text-xs text-ink-2 font-medium">
                  ⭐ {seller.ratingAverage ? seller.ratingAverage.toFixed(1) : '5.0'} ({seller.ratingCount || 0} {t('product.reviews', 'reviews')})
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                {shopName}
              </h1>
              <p className="text-xs sm:text-sm text-ink-2 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-clay shrink-0" />
                <span>{village ? `${village}, ${district}` : district}</span>
              </p>
            </div>
          </div>

          {/* Story */}
          {story && (
            <div className="p-4 sm:p-5 bg-cream rounded-2xl border border-line">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2 mb-2">
                {isMr ? 'आमची गोष्ट' : 'Our Story & Heritage'}
              </h3>
              <p className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
                {story}
              </p>
            </div>
          )}

          {/* Delivery & Order Policies */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-cream-2 rounded-xl flex items-center gap-3">
              <Truck className="w-5 h-5 text-clay shrink-0" />
              <div>
                <span className="font-semibold text-ink block">{isMr ? 'डिलिव्हरी मॉडेल' : 'Delivery Model'}</span>
                <span className="text-ink-2">
                  {seller.deliveryMode === 'SELLER_PAYS'
                    ? isMr
                      ? 'मोफत डिलिव्हरी (विक्रेत्याकडून)'
                      : 'Free delivery included'
                    : isMr
                    ? 'ग्राहकाद्वारे देय'
                    : 'Customer pays standard fee'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-cream-2 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-semibold text-ink block">{isMr ? 'कमाल डिलिव्हरी अंतर' : 'Max Delivery Radius'}</span>
                <span className="text-ink-2">{seller.maxDeliveryKm || 30} km</span>
              </div>
            </div>

            <div className="p-3 bg-cream-2 rounded-xl flex items-center gap-3">
              <Store className="w-5 h-5 text-primary-800 shrink-0" />
              <div>
                <span className="font-semibold text-ink block">{isMr ? 'किमान ऑर्डर' : 'Min Order Value'}</span>
                <span className="text-ink-2">
                  ₹{Math.round((seller.minOrderValuePaise || 0) / 100)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink">
            {isMr ? `या दुकानातील उत्पादने (${products.length})` : `Products by ${shopName} (${products.length})`}
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-2 italic">
            {isMr ? 'या दुकानात सध्या कोणतीही उत्पादने उपलब्ध नाहीत.' : 'No active products listed currently.'}
          </p>
        )}
      </div>
    </div>
  );
}

export default ShopDetailPage;
