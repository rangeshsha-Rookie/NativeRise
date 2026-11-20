// client/src/pages/public/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Truck,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  ShoppingBag,
  ArrowRight,
  Store,
  ChevronRight
} from 'lucide-react';
import apiClient from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { RatingStars } from '../../components/ui/RatingStars';
import ProductCard from '../../components/ui/ProductCard';
import LocationPicker from '../../components/map/LocationPicker';
import clsx from 'clsx';

export function ProductDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isMr = i18n.language === 'mr';

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Delivery feasibility state
  const [customerCoords, setCustomerCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [feasibility, setFeasibility] = useState(null);
  const [feasibilityLoading, setFeasibilityLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('description');

  // Load customer coordinates
  useEffect(() => {
    // Priority: Default user address > guest location
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defaultAddr?.location?.coordinates) {
        setCustomerCoords({
          lat: defaultAddr.location.coordinates[1],
          lng: defaultAddr.location.coordinates[0]
        });
        setLocationLabel(defaultAddr.label || defaultAddr.village || defaultAddr.city || 'Saved Address');
        return;
      }
    }
    const guestLoc = localStorage.getItem('nr_guest_loc');
    if (guestLoc) {
      try {
        const parsed = JSON.parse(guestLoc);
        if (parsed.lat && parsed.lng) {
          setCustomerCoords({ lat: parsed.lat, lng: parsed.lng });
          setLocationLabel(parsed.label || parsed.line || 'Selected Location');
        }
      } catch (e) {
        // Ignore
      }
    }
  }, [user]);

  // Load Product & Reviews
  useEffect(() => {
    let mounted = true;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          apiClient.get(`/catalog/products/${id}`),
          apiClient.get(`/catalog/products/${id}/reviews`)
        ]);

        if (mounted && prodRes?.ok && prodRes.data) {
          const prodData = prodRes.data.product || prodRes.data;
          setProduct(prodData);
          if (prodData.category) {
            // Load similar products
            apiClient
              .get(`/catalog/products?category=${prodData.category}&limit=4`)
              .then((simRes) => {
                if (mounted && simRes?.ok && simRes.data) {
                  const list = simRes.data.products || simRes.data || [];
                  setSimilarProducts(list.filter((p) => (p._id || p.id) !== id));
                }
              })
              .catch(() => {});
          }
        }

        if (mounted && revRes?.ok && revRes.data) {
          setReviews(revRes.data.reviews || revRes.data || []);
        }
      } catch (err) {
        // Handled
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Check Feasibility when product and coordinates are available
  useEffect(() => {
    let mounted = true;
    if (!product || !customerCoords) {
      setFeasibility(null);
      return;
    }

    const check = async () => {
      setFeasibilityLoading(true);
      try {
        const sellerId = product.seller?._id || product.seller?.id || product.seller;
        const res = await apiClient.get(
          `/geo/feasibility?lat=${customerCoords.lat}&lng=${customerCoords.lng}&sellerId=${sellerId}`
        );
        if (mounted && res?.feasible !== undefined) {
          setFeasibility(res);
        }
      } catch (err) {
        if (mounted) setFeasibility(null);
      } finally {
        if (mounted) setFeasibilityLoading(false);
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, [product, customerCoords]);

  const handleLocationSelected = (loc) => {
    setCustomerCoords({ lat: loc.lat, lng: loc.lng });
    setLocationLabel(loc.label || loc.line || 'Selected Location');
    localStorage.setItem('nr_guest_loc', JSON.stringify(loc));
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || adding) return;
    setAdding(true);
    try {
      const res = await addToCart(product, qty);
      if (res?.success) {
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2000);
      }
    } catch (err) {
      // Handled
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock === 0) return;
    try {
      const res = await addToCart(product, qty);
      if (res?.success) {
        navigate('/cart');
      }
    } catch (err) {
      // Handled
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="h-6 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-cream-2 rounded-card animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-cream-2 rounded animate-pulse" />
            <div className="h-6 w-32 bg-cream-2 rounded animate-pulse" />
            <div className="h-20 bg-cream-2 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'उत्पादन सापडले नाही' : 'Product Not Found'}
        </h2>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink font-semibold">
          {isMr ? 'सर्व उत्पादने पहा' : 'Back to Catalog'}
        </Link>
      </div>
    );
  }

  const name = product.name?.[isMr ? 'mr' : 'en'] || product.name?.mr || product.name?.en || 'Product';
  const desc =
    product.description?.[isMr ? 'mr' : 'en'] ||
    product.description?.mr ||
    product.description?.en ||
    '';
  const priceRupees = Math.round((product.pricePaise || 0) / 100);
  const seller = product.seller;
  const shopName = seller?.shopName?.[isMr ? 'mr' : 'en'] || seller?.shopName?.mr || seller?.shopName?.en || 'Shop';
  const sellerId = seller?._id || seller?.id || seller;
  const village = seller?.location?.village || '';
  const district = seller?.location?.district || '';

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const maxAllowedQty = Math.min(10, product.stock || 1);

  const images = product.images?.length > 0 ? product.images : ['/placeholder-product.jpg'];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">
          {t('nav.home', 'Home')}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-ink">
          {t('nav.products', 'Products')}
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/products?category=${product.category}`} className="capitalize hover:text-ink">
              {t(`categories.${product.category}`, product.category)}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-ink font-semibold truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-cream-2 border border-line rounded-card overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={clsx(
                    'w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all',
                    selectedImage === idx ? 'border-primary-600 scale-105' : 'border-line opacity-70'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="space-y-6">
          <div>
            {/* Category & Badge */}
            {product.category && (
              <span className="inline-block bg-clay/10 text-clay text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
                {t(`categories.${product.category}`, product.category)}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink leading-tight">
              {name}
            </h1>

            {/* Seller attribution */}
            {seller && (
              <div className="mt-2 flex items-center gap-2 text-sm text-ink-2">
                <Store className="w-4 h-4 text-clay" />
                <span>{isMr ? 'उत्पादक:' : 'Seller:'}</span>
                <Link
                  to={`/shops/${sellerId}`}
                  className="font-semibold text-ink hover:text-clay underline underline-offset-2"
                >
                  {shopName}
                </Link>
                {village && <span>· {village}, {district}</span>}
              </div>
            )}

            {/* Rating Stars */}
            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={product.ratingAverage || 0} size={18} />
              <span className="text-sm font-semibold text-ink">
                {product.ratingAverage ? product.ratingAverage.toFixed(1) : '5.0'}
              </span>
              <span className="text-sm text-ink-2">
                ({product.ratingCount || 0} {t('product.reviews', 'reviews')})
              </span>
            </div>
          </div>

          {/* Price & Unit */}
          <div className="p-4 bg-surface border border-line rounded-card flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif text-ink">₹{priceRupees}</span>
              {product.unit && (
                <span className="text-sm text-ink-2 font-medium">/ {product.unit}</span>
              )}
            </div>

            <div>
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full bg-danger/10 text-danger text-xs font-bold">
                  {t('product.outOfStock', 'Out of Stock')}
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {t('product.onlyLeft', 'Only {{count}} left', { count: product.stock })}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {t('product.inStock', 'In Stock')}
                </span>
              )}
            </div>
          </div>

          {/* Delivery Feasibility Estimator Box (Feature F5) */}
          <div className="p-4 bg-cream-2 border border-line rounded-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-2">
                <Truck className="w-4 h-4 text-clay" />
                <span>{isMr ? 'डिलिव्हरी तपासणी' : 'Delivery Feasibility'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="text-xs font-semibold text-clay hover:underline"
              >
                {customerCoords ? (isMr ? 'स्थान बदला' : 'Change Location') : (isMr ? 'स्थान निवडा' : 'Set Location')}
              </button>
            </div>

            {customerCoords ? (
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-ink-2">
                  <MapPin className="w-3.5 h-3.5 text-clay shrink-0" />
                  <span className="truncate">{locationLabel}</span>
                </div>

                {feasibilityLoading ? (
                  <p className="text-xs text-ink-2 animate-pulse">
                    {isMr ? 'डिलिव्हरी वेळ तपासत आहे...' : 'Calculating delivery route & ETA...'}
                  </p>
                ) : feasibility ? (
                  feasibility.feasible ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{isMr ? 'तुमच्या पत्त्यावर डिलिव्हरी उपलब्ध आहे!' : 'Delivery available to your location!'}</span>
                      </div>
                      <div className="text-xs text-emerald-700 flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          {isMr ? 'अंदाजे वेळ:' : 'Estimated ETA:'}{' '}
                          <strong>~{feasibility.etaMins} {isMr ? 'मि' : 'mins'}</strong> ({feasibility.distanceKm?.toFixed(1)} km)
                        </span>
                        <span>
                          {isMr ? 'डिलिव्हरी शुल्क:' : 'Delivery fee:'}{' '}
                          <strong>
                            {feasibility.deliveryChargePaise === 0
                              ? isMr
                                ? 'मोफत डिलिव्हरी'
                                : 'Free Delivery'
                              : `₹${Math.round(feasibility.deliveryChargePaise / 100)}`}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertCircle className="w-4 h-4 text-danger" />
                        <span>{isMr ? 'या ठिकाणी थेट डिलिव्हरी उपलब्ध नाही' : 'Delivery outside service area'}</span>
                      </div>
                      <p className="text-xs text-red-700">
                        {isMr
                          ? `हे दुकान तुमच्या स्थानापासून ${feasibility.distanceKm?.toFixed(1)} किमी अंतरावर आहे (मर्यादा ओलांडली).`
                          : `Distance (${feasibility.distanceKm?.toFixed(1)} km) exceeds seller's maximum delivery radius.`}
                      </p>
                    </div>
                  )
                ) : null}
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-ink-2">
                <span>{isMr ? 'डिलिव्हरी वेळ व शुल्क पाहण्यासाठी स्थान सेट करा.' : 'Set your location to see delivery fee and ETA.'}</span>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="px-3 py-1 bg-surface border border-line rounded-full font-semibold text-ink hover:bg-white"
                >
                  {isMr ? 'सेट करा' : 'Select'}
                </button>
              </div>
            )}
          </div>

          {/* Quantity Stepper & Add to Cart Action */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-ink">{isMr ? 'प्रमाण:' : 'Quantity:'}</span>
                <div className="flex items-center border border-line rounded-full bg-surface h-10 px-2">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-ink disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-ink">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxAllowedQty, q + 1))}
                    disabled={qty >= maxAllowedQty}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-ink disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={clsx(
                    'h-12 rounded-full font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm',
                    addedSuccess
                      ? 'bg-success text-cream'
                      : 'bg-primary text-ink hover:bg-primary-600'
                  )}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{t('cart.added', 'Added to Cart')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>{adding ? '...' : isMr ? 'कार्टमध्ये जोडा' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="h-12 rounded-full font-semibold flex items-center justify-center gap-2 bg-clay text-cream hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <span>{isMr ? 'आत्ताच खरेदी करा' : 'Buy Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Highlights & Transparency Guarantee */}
          <div className="pt-4 border-t border-line space-y-2.5 text-xs text-ink-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{isMr ? '१००% अस्सल गावरान आणि नैसर्गिक साहित्य' : '100% Authentic, traditionally crafted rural recipe'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-clay shrink-0" />
              <span>{isMr ? 'थेट डिलिव्हरी पार्टनरद्वारे जलद व सुरक्षित पोहोच' : 'Handpicked and dispatched directly by village maker'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Story / Reviews */}
      <div className="border-t border-line pt-8">
        <div className="flex items-center gap-6 border-b border-line pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={clsx(
              'pb-3 -mb-3 text-sm sm:text-base font-bold transition-colors border-b-2',
              activeTab === 'description'
                ? 'border-clay text-clay'
                : 'border-transparent text-ink-2 hover:text-ink'
            )}
          >
            {isMr ? 'उत्पादन तपशील' : 'Description'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seller')}
            className={clsx(
              'pb-3 -mb-3 text-sm sm:text-base font-bold transition-colors border-b-2',
              activeTab === 'seller'
                ? 'border-clay text-clay'
                : 'border-transparent text-ink-2 hover:text-ink'
            )}
          >
            {isMr ? 'उत्पादकाची गोष्ट' : 'Maker Story'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={clsx(
              'pb-3 -mb-3 text-sm sm:text-base font-bold transition-colors border-b-2',
              activeTab === 'reviews'
                ? 'border-clay text-clay'
                : 'border-transparent text-ink-2 hover:text-ink'
            )}
          >
            {isMr ? `ग्राहक प्रतिक्रिया (${reviews.length})` : `Reviews (${reviews.length})`}
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none text-ink leading-relaxed space-y-4">
              <p className="whitespace-pre-line text-sm sm:text-base text-ink-2">{desc}</p>
              {product.unit && (
                <div className="p-4 bg-surface border border-line rounded-card max-w-sm mt-4">
                  <h4 className="text-xs font-bold uppercase text-ink-2 mb-2">{isMr ? 'तपशील' : 'Specifications'}</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between py-1 border-b border-line">
                      <span className="text-ink-2">{isMr ? 'प्रमाण / पॅक' : 'Net Weight / Unit'}</span>
                      <span className="font-semibold text-ink">{product.unit}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-ink-2">{isMr ? 'उत्पत्ती' : 'Origin'}</span>
                      <span className="font-semibold text-ink">{village || 'Maharashtra Village'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'seller' && (
            <div className="space-y-4 max-w-2xl">
              <div className="p-6 bg-surface border border-line rounded-card space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-clay text-cream flex items-center justify-center font-bold text-xl">
                    {shopName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-ink">{shopName}</h3>
                    <p className="text-xs text-ink-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-clay" />
                      <span>{village}, {district}</span>
                    </p>
                  </div>
                </div>

                {seller?.story && (
                  <p className="text-sm text-ink-2 leading-relaxed">
                    {seller.story[isMr ? 'mr' : 'en'] || seller.story.mr || seller.story.en}
                  </p>
                )}

                <Link
                  to={`/shops/${sellerId}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-clay hover:underline pt-2"
                >
                  <span>{isMr ? 'या दुकानाची इतर सर्व उत्पादने पहा' : 'Visit Shop Page & Products'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-3xl">
              {/* Reviews Summary */}
              <div className="p-6 bg-surface border border-line rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="text-4xl font-bold font-serif text-ink">
                    {product.ratingAverage ? product.ratingAverage.toFixed(1) : '5.0'}
                  </div>
                  <div className="mt-1">
                    <RatingStars rating={product.ratingAverage || 0} size={20} />
                  </div>
                  <p className="text-xs text-ink-2 mt-1">
                    {t('product.verifiedReviewsCount', 'Based on {{count}} verified orders', {
                      count: product.ratingCount || reviews.length
                    })}
                  </p>
                </div>

                <div className="text-xs text-ink-2 max-w-sm bg-cream-2 p-3.5 rounded-xl border border-line">
                  <p>
                    {isMr
                      ? 'फक्त सत्यापित ग्राहकच ऑर्डर मिळाल्यानंतर पुनरावलोकन लिहू शकतात. आपल्या ऑर्डर पाहा आणि अभिप्राय नोंदवा.'
                      : 'Only customers who received this item can write a verified review from their Order details page.'}
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id || rev.id} className="p-4 bg-surface border border-line rounded-card space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-cream-2 text-ink font-bold text-xs flex items-center justify-center">
                            {(rev.customerName || 'Customer')[0]}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-ink block leading-tight">
                              {rev.customerName || 'Verified Customer'}
                            </span>
                            <span className="text-[11px] text-ink-2">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} size={14} />
                      </div>
                      <p className="text-sm text-ink-2 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-2 italic">
                  {isMr ? 'या उत्पादनासाठी अद्याप कोणतीही पुनरावलोकने नाहीत.' : 'No reviews yet for this product.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-line">
          <h2 className="text-2xl font-serif font-bold text-ink">
            {isMr ? 'याच प्रकारची इतर उत्पादने' : 'Similar Village Products'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleLocationSelected}
        />
      )}
    </div>
  );
}

export default ProductDetailPage;
