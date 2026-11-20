// client/src/pages/seller/SellerProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Package, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

export function SellerProductsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockUpdatingId, setStockUpdatingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/seller/products');
      const list = res?.items || res?.products || res?.data?.items || res?.data?.products || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    setStockUpdatingId(productId);
    try {
      const res = await apiClient.patch(`/seller/products/${productId}/stock`, {
        stock: newStock
      });
      if (res?.ok) {
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === productId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setStockUpdatingId(null);
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await apiClient.patch(`/seller/products/${productId}/status`, {
        status: nextStatus
      });
      if (res?.ok) {
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === productId ? { ...p, status: nextStatus } : p))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to change status');
    }
  };

  const handleArchive = async (productId) => {
    if (!window.confirm(isMr ? 'हे उत्पादन हटवायचे आहे का?' : 'Archive this product?')) return;
    try {
      await apiClient.delete(`/seller/products/${productId}`);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    } catch (err) {
      alert(err.message || 'Failed to archive');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {isMr ? 'तुमची उत्पादने' : 'My Products'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 mt-1">
            {isMr
              ? 'किंमत, स्टॉक आणि उत्पादन माहिती व्यवस्थापित करा.'
              : 'Manage stock levels, pricing, descriptions, and catalog visibility.'}
          </p>
        </div>

        <Link
          to="/seller/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-ink text-xs sm:text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? 'नवीन उत्पादन जोडा' : 'Add New Product'}</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="bg-surface border border-line rounded-card divide-y divide-line overflow-hidden">
          {products.map((p) => {
            const pId = p._id || p.id;
            const name = p.name?.[isMr ? 'mr' : 'en'] || p.name?.mr || p.name?.en || 'Product';
            const priceRs = Math.round((p.pricePaise || 0) / 100);
            const isUpdatingStock = stockUpdatingId === pId;
            const isPaused = p.status === 'PAUSED';

            return (
              <div
                key={pId}
                className={clsx(
                  'p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors',
                  isPaused && 'opacity-60 bg-cream/40'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cream-2 border border-line overflow-hidden shrink-0">
                    <img
                      src={p.images?.[0] || '/placeholder-product.jpg'}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-ink">{name}</span>
                      {isPaused && (
                        <span className="px-2 py-0.5 rounded-full bg-cream-2 text-ink-2 text-[10px] font-bold">
                          {isMr ? 'थांबवले' : 'Paused'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-2 flex items-center gap-3">
                      <span>₹{priceRs} {p.unit && `/ ${p.unit}`}</span>
                      <span>·</span>
                      <span className="capitalize">{p.category}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Controls & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  {/* Inline Stock editor */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-2 font-medium">{isMr ? 'स्टॉक:' : 'Stock:'}</span>
                    <div className="flex items-center border border-line rounded-full bg-cream h-8 px-1">
                      <button
                        type="button"
                        disabled={isUpdatingStock || p.stock <= 0}
                        onClick={() => handleUpdateStock(pId, p.stock, -1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-ink disabled:opacity-40 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-ink">
                        {isUpdatingStock ? '...' : p.stock}
                      </span>
                      <button
                        type="button"
                        disabled={isUpdatingStock}
                        onClick={() => handleUpdateStock(pId, p.stock, 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-ink disabled:opacity-40 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pId, p.status)}
                      className="p-2 text-ink-2 hover:text-ink rounded-full transition-colors"
                      title={isPaused ? 'Resume selling' : 'Pause selling'}
                    >
                      {isPaused ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <Link
                      to={`/seller/products/${pId}`}
                      className="p-2 text-ink-2 hover:text-clay rounded-full transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleArchive(pId)}
                      className="p-2 text-ink-2 hover:text-danger rounded-full transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-surface border border-line rounded-card space-y-4">
          <Package className="w-12 h-12 mx-auto text-ink-2" />
          <p className="text-base font-semibold text-ink">
            {isMr ? 'तुम्ही अद्याप कोणतेही उत्पादन जोडलेले नाही.' : 'No products listed in your shop yet.'}
          </p>
          <Link
            to="/seller/products/new"
            className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink text-xs sm:text-sm font-semibold hover:bg-primary-600"
          >
            {isMr ? 'उत्पादन जोडा (AI सहाय्यासह)' : 'Add Your First Product'}
          </Link>
        </div>
      )}
    </div>
  );
}

export default SellerProductsPage;
