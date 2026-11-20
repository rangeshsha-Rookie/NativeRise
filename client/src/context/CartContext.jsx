// client/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

function extractCartData(res) {
  if (!res) return { items: [], seller: null, count: 0 };
  const payload = res.data && (res.data.lines || res.data.items)
    ? res.data
    : (res.lines || res.items ? res : (res.data || res));

  const rawLines = payload?.lines || payload?.items || (Array.isArray(payload) ? payload : []);
  const items = Array.isArray(rawLines)
    ? rawLines.map((line) => {
        const prodId = line.productId || line.product?._id || line.product?.id || (typeof line.product === 'string' ? line.product : '');
        const pricePaise = line.unitPricePaise || line.pricePaise || line.product?.pricePaise || 0;
        const nameVal = typeof line.name === 'string'
          ? { en: line.name, mr: line.name }
          : (line.name || line.product?.name || { en: 'Product', mr: 'उत्पादन' });

        return {
          ...line,
          productId: prodId,
          pricePaise,
          qty: line.qty || 1,
          product: line.product && typeof line.product === 'object'
            ? line.product
            : {
                _id: prodId,
                id: prodId,
                name: nameVal,
                images: line.image ? [line.image] : (line.images || []),
                pricePaise,
                stock: line.stock || 0
              }
        };
      })
    : [];

  const count = typeof payload?.count === 'number'
    ? payload.count
    : items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const seller = payload?.seller || null;
  return { items, seller, count };
}

export function CartProvider({ children }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], seller: null, count: 0 });
  const [loading, setLoading] = useState(true);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingItem: null,
    currentSellerName: '',
    newSellerName: ''
  });

  const isCustomer = isAuthenticated && user?.role === 'customer';

  const fetchCart = useCallback(async () => {
    if (authLoading) return;
    if (!isCustomer) {
      setCart({ items: [], seller: null, count: 0 });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get('/cart');
      const cartData = extractCartData(res);
      setCart(cartData);
    } catch {
      // If error or unauthenticated, reset cart
      setCart({ items: [], seller: null, count: 0 });
    } finally {
      setLoading(false);
    }
  }, [authLoading, isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, qty = 1, replace = false) => {
    if (!isCustomer) {
      // Store redirect and go to login
      try {
        const currentPath = window.location.pathname + window.location.search;
        window.location.assign?.(`/login?next=${encodeURIComponent(currentPath)}`);
      } catch {
        // Safe fallback in test environments
      }
      return;
    }

    const targetSellerId = product.seller?._id || product.seller?.id || product.seller;
    const currentSellerId = cart.seller?._id || cart.seller?.id || cart.seller;

    // Single seller cart check: if cart already has items from another seller and replace is false
    if (!replace && cart.items.length > 0 && currentSellerId && targetSellerId && currentSellerId.toString() !== targetSellerId.toString()) {
      const currentShop = cart.seller?.shopName?.en || cart.seller?.shopName?.mr || 'current seller';
      const newShop = product.seller?.shopName?.en || product.seller?.shopName?.mr || 'new seller';
      setConflictModal({
        isOpen: true,
        pendingItem: { product, qty },
        currentSellerName: currentShop,
        newSellerName: newShop
      });
      return { conflict: true };
    }

    const res = await apiClient.put('/cart/items', {
      productId: product._id || product.id,
      qty,
      replace
    });
    const cartData = extractCartData(res);
    setCart(cartData);
    return { success: true };
  };

  const updateQty = async (productId, qty) => {
    if (!isCustomer) return;
    const res = await apiClient.put('/cart/items', { productId, qty });
    const cartData = extractCartData(res);
    setCart(cartData);
  };

  const removeItem = async (productId) => {
    if (!isCustomer) return;
    const res = await apiClient.delete(`/cart/items/${productId}`);
    const cartData = extractCartData(res);
    setCart(cartData);
  };

  const clearCart = async () => {
    if (!isCustomer) return;
    await apiClient.delete('/cart');
    setCart({ items: [], seller: null, count: 0 });
  };

  const handleConfirmConflict = async () => {
    if (conflictModal.pendingItem) {
      const { product, qty } = conflictModal.pendingItem;
      setConflictModal({ isOpen: false, pendingItem: null, currentSellerName: '', newSellerName: '' });
      await addToCart(product, qty, true);
    }
  };

  const handleCancelConflict = () => {
    setConflictModal({ isOpen: false, pendingItem: null, currentSellerName: '', newSellerName: '' });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        count: cart.count,
        items: cart.items,
        seller: cart.seller,
        loading,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
        conflictModal,
        handleConfirmConflict,
        handleCancelConflict
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}

export default CartContext;
