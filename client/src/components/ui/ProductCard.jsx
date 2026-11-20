// client/src/components/ui/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { RatingStars } from './RatingStars';
import clsx from 'clsx';

export function ProductCard({ product, className = '' }) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

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
    } catch (err) {
      // Handled
    } finally {
      setAdding(false);
    }
  };

  const imageSrc = product.images?.[0] || '/placeholder-product.jpg';

  return (
    <div
      className={clsx(
        'group flex flex-col bg-surface border border-line rounded-card overflow-hidden hover:shadow-md transition-all duration-200',
        className
      )}
    >
      {/* Product Image & Badges */}
      <Link to={`/products/${product._id || product.id}`} className="relative aspect-square overflow-hidden bg-cream-2 block">
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60';
          }}
        />

        {/* Stock status overlay */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 bg-bark/85 text-cream text-xs font-semibold px-2.5 py-1 rounded-full">
            {t('product.outOfStock', 'Out of stock')}
          </span>
        ) : isLowStock ? (
          <span className="absolute top-2.5 left-2.5 bg-danger text-cream text-xs font-semibold px-2.5 py-1 rounded-full">
            {t('product.onlyLeft', 'Only {{count}} left', { count: product.stock })}
          </span>
        ) : null}

        {product.category && (
          <span className="absolute bottom-2.5 left-2.5 bg-surface/90 backdrop-blur-sm text-ink text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize">
            {t(`categories.${product.category}`, product.category)}
          </span>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
        <div>
          {/* Seller / Village Info */}
          {seller && (
            <div className="mb-1 text-xs text-ink-2 truncate">
              {sellerId ? (
                <Link
                  to={`/shops/${sellerId}`}
                  className="hover:text-primary-800 hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {shopName}
                </Link>
              ) : (
                <span>{shopName}</span>
              )}
              {village && <span className="ml-1 text-ink-2">· {village}</span>}
            </div>
          )}

          {/* Product Name */}
          <Link
            to={`/products/${product._id || product.id}`}
            className="block text-sm sm:text-base font-semibold text-ink group-hover:text-primary-700 transition-colors line-clamp-2"
          >
            {name}
          </Link>

          {/* Ratings */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <RatingStars rating={product.ratingAverage || 0} size={14} />
            <span className="text-xs text-ink-2">
              ({product.ratingCount || 0})
            </span>
          </div>
        </div>

        {/* Price and Add CTA */}
        <div className="mt-3.5 pt-2.5 border-t border-line flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold text-ink">
                ₹{priceRupees}
              </span>
              {product.unit && (
                <span className="text-xs text-ink-2">
                  / {product.unit}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className={clsx(
              'h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all select-none',
              isOutOfStock
                ? 'bg-cream-2 text-ink-2 cursor-not-allowed'
                : justAdded
                ? 'bg-success text-cream'
                : 'bg-primary text-ink hover:bg-primary-600 active:scale-95'
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
                <span>{adding ? '...' : t('cart.add', 'Add')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
