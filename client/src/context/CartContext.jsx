// client/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], seller: null, count: 0 });
  const [loading, setLoading] = useState(false);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingItem: null,
    currentSellerName: '',
    newSellerName: ''
  });

  const isCustomer = isAuthenticated && user?.role === 'customer';

  const fetchCart = useCallback(async () => {
    if (!isCustomer) {
      setCart({ items: [], seller: null, count: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get('/cart');
      if (res?.ok && res.data) {
        const items = res.data.items || [];
        const count = items.reduce((sum, item) => sum + (item.qty || 0), 0);
        setCart({
          items,
          seller: res.data.seller || null,
          count
        });
      }
    } catch (err) {
      // If error or unauthenticated, reset cart
      setCart({ items: [], seller: null, count: 0 });
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

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
    if (res?.ok && res.data) {
      const items = res.data.items || [];
      const count = items.reduce((sum, item) => sum + (item.qty || 0), 0);
      setCart({
        items,
        seller: res.data.seller || null,
        count
      });
      return { success: true };
    }
  };

  const updateQty = async (productId, qty) => {
    if (!isCustomer) return;
    const res = await apiClient.put('/cart/items', { productId, qty });
    if (res?.ok && res.data) {
      const items = res.data.items || [];
      const count = items.reduce((sum, item) => sum + (item.qty || 0), 0);
      setCart({
        items,
        seller: res.data.seller || null,
        count
      });
    }
  };

  const removeItem = async (productId) => {
    if (!isCustomer) return;
    const res = await apiClient.delete(`/cart/items/${productId}`);
    if (res?.ok && res.data) {
      const items = res.data.items || [];
      const count = items.reduce((sum, item) => sum + (item.qty || 0), 0);
      setCart({
        items,
        seller: res.data.seller || null,
        count
      });
    }
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
