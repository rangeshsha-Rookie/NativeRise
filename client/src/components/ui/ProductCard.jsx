// client/src/components/ui/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Star, Check, Heart, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductPhoto, assetUrl } from '../../utils/productImages';
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
  const reviewCount = product.ratingCount ?? 24;

  return (
    <div
      className={clsx(
        'group flex flex-col bg-white border border-[#EDE7DD] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative shadow-xs',
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
            e.currentTarget.src = assetUrl('mockup-assets/prod-village-honey.png');
          }}
        />

        {/* Organic / Quality Badge (top-left) in soft green like GrameenBazaar */}
        <span className="absolute top-3 left-3 bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs tracking-wide">
          {i18n.language === 'mr' ? 'सेंद्रिय' : 'Organic'}
        </span>

        {/* Wishlist Icon (top-right) */}
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWished((w) => !w);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200 text-stone-400 hover:text-red-500 shadow-xs transition-colors cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart className={clsx('w-3.5 h-3.5', isWished && 'text-red-500 fill-red-500')} />
        </span>

        {/* Stock status overlay */}
        {isOutOfStock ? (
          <span className="absolute bottom-3 left-3 bg-stone-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {t('product.outOfStock', 'Out of stock')}
          </span>
        ) : isLowStock ? (
          <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {t('product.onlyLeft', 'Only {{count}} left', { count: product.stock })}
          </span>
        ) : null}
      </Link>

      {/* Product Info */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between space-y-2 bg-white">
        <div>
          {/* Seller / Village Info */}
          {seller && (
            <div className="mb-1 text-[11px] font-medium text-stone-500 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">
                <span>{shopName}</span>
                {village && <span> · {village}</span>}
              </span>
            </div>
          )}

          {/* Product Name */}
          <Link
            to={`/products/${product._id || product.id}`}
            className="block text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
          >
            {name}
          </Link>

          {/* Ratings (⭐ 4.8 (24)) */}
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-stone-900">{ratingAvg.toFixed(1)}</span>
            <span className="text-stone-500 text-[11px]">({reviewCount})</span>
          </div>
        </div>

        {/* Price and Add to Cart CTA */}
        <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-stone-900">
              ₹{priceRupees}
            </span>
            {product.quantityUnit && (
              <span className="text-[11px] text-stone-500">
                /{product.quantityValue ? `${product.quantityValue}` : ''}{product.quantityUnit}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className={clsx(
              'h-8 sm:h-9 px-3 sm:px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs select-none',
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-800 text-white'
                : 'bg-[#15803d] text-white hover:bg-[#166534] active:scale-95'
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
                <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
                <span>{adding ? '...' : (i18n.language === 'mr' ? 'खरेदी करा' : 'Add to Cart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
