// client/src/components/ui/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Star, Check, Heart, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductPhoto } from '../../utils/productImages';
import clsx from 'clsx';

export function ProductCard({ product, className = '' }) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isWished, setIsWished] = useState(false);

  if (!product) return null;

  const currentLang = i18n.language === 'mr' ? 'mr' : 'en';
  const name = typeof product.name === 'string'
    ? product.name
    : (product.name?.[currentLang] || product.name?.en || product.name?.mr || 'Product');

  const priceRupees = Math.round((product.pricePaise ?? (product.price ? product.price : 0)) / 100);
  const seller = product.seller || product.sellerId;
  const shopName = typeof seller?.shopName === 'string'
    ? seller.shopName
    : (seller?.shopName?.[currentLang] || seller?.shopName?.en || seller?.shopName?.mr || '');
  const village = seller?.location?.village || seller?.village || '';
  const sellerId = seller?._id || seller?.id || seller;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      const res = await addToCart(product, 1);
      if (res?.success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      }
    } catch {
      // Handled in CartContext
    } finally {
      setAdding(false);
    }
  };

  const photoUrl = getProductPhoto(product);
  const ratingAvg = product.ratingAverage || 4.8;
  const reviewCount = product.ratingCount || 128;

  // Extract clean category name (avoiding [object Object])
  let categoryLabel = '';
  if (product.category) {
    if (typeof product.category === 'object') {
      categoryLabel = product.category.name?.[currentLang] || product.category.name?.en || product.category.slug || '';
    } else {
      categoryLabel = t(`categories.${product.category}`, product.category);
    }
  }

  return (
    <div
      className={clsx(
        'group flex flex-col bg-surface border border-line/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative',
        className
      )}
    >
      {/* Product Image & Badges */}
      <Link
        to={`/products/${product._id || product.id}`}
        className="relative aspect-square overflow-hidden bg-[#FAF7F2] p-4 flex items-center justify-center block"
      >
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Organic / Quality Badge (top-left) */}
        <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
          {categoryLabel || (i18n.language === 'mr' ? 'सेंद्रिय' : 'Organic')}
        </span>

        {/* Wishlist Button (top-right) */}
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWished((w) => !w);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-surface/90 backdrop-blur-sm border border-line/60 text-ink-2 hover:text-red-500 shadow-sm transition-colors cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart className={clsx('w-4 h-4', isWished && 'text-red-500 fill-red-500')} />
        </span>

        {/* Stock status overlay */}
        {isOutOfStock ? (
          <span className="absolute bottom-3 left-3 bg-bark/90 text-cream text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
            {t('product.outOfStock', 'Out of stock')}
          </span>
        ) : isLowStock ? (
          <span className="absolute bottom-3 left-3 bg-danger text-cream text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
            {t('product.onlyLeft', 'Only {{count}} left', { count: product.stock })}
          </span>
        ) : null}
      </Link>

      {/* Product Info */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-2 bg-surface">
        <div>
          {/* Seller / Village Info */}
          {seller && (
            <div className="mb-1 text-[11px] font-medium text-ink-2 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-clay shrink-0" />
              <span className="truncate">
                <span>{shopName}</span>
                {village && <span> · {village}</span>}
              </span>
            </div>
          )}

          {/* Product Name */}
          <Link
            to={`/products/${product._id || product.id}`}
            className="block text-sm sm:text-base font-bold text-ink group-hover:text-emerald-700 transition-colors line-clamp-1"
          >
            {name}
          </Link>

          {/* Ratings (★ 4.8 (245 reviews)) */}
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-ink">{ratingAvg.toFixed(1)}</span>
            <span className="text-ink-2 text-[11px]">({reviewCount})</span>
          </div>
        </div>

        {/* Price and Add to Cart CTA */}
        <div className="pt-2 border-t border-line/70 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-ink">
              ₹{priceRupees}
            </span>
            {product.quantityUnit && (
              <span className="text-[11px] text-ink-2">
                /{product.quantityValue ? `${product.quantityValue}` : ''}{product.quantityUnit}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className={clsx(
              'h-9 px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm select-none',
              isOutOfStock
                ? 'bg-cream-2 text-ink-2 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95'
            )}
            aria-label={`Add ${name} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('cart.added', 'Added')}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{adding ? '...' : t('cart.add', 'Add to Cart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
