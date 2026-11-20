// client/src/__tests__/cart-and-components.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductCard from '../components/ui/ProductCard';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { LangProvider } from '../context/LangContext';
import '../i18n';

// In-memory cart store for mocking API responses
let mockCartData = {
  items: [],
  seller: null
};

vi.mock('../api/client', () => {
  const mockApi = {
    get: vi.fn((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          user: { _id: 'cust-1', role: 'customer', name: 'Ramesh Patil' },
          profile: { addresses: [] }
        });
      }
      if (url === '/cart') {
        return Promise.resolve({
          items: mockCartData.items,
          seller: mockCartData.seller
        });
      }
      return Promise.resolve({});
    }),
    put: vi.fn((url, body) => {
      if (url === '/cart/items') {
        const targetSeller =
          body.productId === 'prod-1'
            ? { _id: 'seller-1', shopName: { en: 'Gaon Swad' } }
            : { _id: 'seller-2', shopName: { en: 'Vanashree Farm' } };

        if (body.replace) {
          mockCartData = {
            items: [{ product: body.productId, qty: body.qty || 1 }],
            seller: targetSeller
          };
        } else {
          mockCartData = {
            items: [...mockCartData.items, { product: body.productId, qty: body.qty || 1 }],
            seller: targetSeller
          };
        }

        return Promise.resolve({
          ok: true,
          data: {
            items: mockCartData.items,
            seller: mockCartData.seller
          }
        });
      }
      return Promise.resolve({ ok: true, data: {} });
    }),
    delete: vi.fn(() => {
      mockCartData = { items: [], seller: null };
      return Promise.resolve({ ok: true, data: { items: [], seller: null } });
    }),
    post: vi.fn(() => Promise.resolve({ ok: true, data: {} })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };

  return {
    default: mockApi,
    apiClient: mockApi,
    ApiError: class ApiError extends Error {}
  };
});

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
});

function AllTheProviders({ children }) {
  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <LangProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </LangProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function CartTestConsumer() {
  const { cart, addToCart, conflictModal, handleConfirmConflict, handleCancelConflict } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cart.count || cart.items.length}</div>
      <div data-testid="cart-seller">{cart.seller?._id || 'none'}</div>
      {conflictModal?.isOpen && (
        <div data-testid="conflict-modal">
          <span>Conflict detected with {conflictModal.currentSellerName}</span>
          <button
            onClick={() => handleConfirmConflict()}
            data-testid="resolve-replace"
          >
            Replace
          </button>
          <button
            onClick={() => handleCancelConflict()}
            data-testid="resolve-keep"
          >
            Keep
          </button>
        </div>
      )}
      <button
        onClick={() =>
          addToCart(
            { _id: 'prod-1', name: 'Fresh Jaggery', pricePaise: 12000, stock: 10, seller: { _id: 'seller-1', shopName: { en: 'Gaon Swad' } } },
            1
          )
        }
        data-testid="add-seller-1"
      >
        Add Seller 1
      </button>
      <button
        onClick={() =>
          addToCart(
            { _id: 'prod-2', name: 'Raw Honey', pricePaise: 25000, stock: 5, seller: { _id: 'seller-2', shopName: { en: 'Vanashree Farm' } } },
            1
          )
        }
        data-testid="add-seller-2"
      >
        Add Seller 2
      </button>
    </div>
  );
}

describe('ProductCard Component', () => {
  const sampleProduct = {
    _id: 'prod-101',
    name: {
      en: 'Gir Cow A2 Ghee',
      mr: 'गीर गायीचे ए२ तूप'
    },
    pricePaise: 95000, // 950 INR
    stock: 8,
    unit: '500 ml',
    ratingAverage: 4.8,
    ratingCount: 24,
    images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600'],
    seller: {
      _id: 'seller-1',
      shopName: {
        en: 'Shree Krishna Dairy',
        mr: 'श्री कृष्ण डेअरी'
      },
      location: {
        village: 'Sangli'
      }
    }
  };

  it('renders product details accurately', () => {
    render(
      <AllTheProviders>
        <ProductCard product={sampleProduct} />
      </AllTheProviders>
    );

    expect(screen.getByText('Gir Cow A2 Ghee')).toBeInTheDocument();
    expect(screen.getByText('₹950')).toBeInTheDocument();
    expect(screen.getByText('Shree Krishna Dairy')).toBeInTheDocument();
    expect(screen.getByText(/Sangli/)).toBeInTheDocument();
    expect(screen.getByText('(24)')).toBeInTheDocument();
  });

  it('disables add button when out of stock', () => {
    const outOfStockProduct = { ...sampleProduct, stock: 0 };
    render(
      <AllTheProviders>
        <ProductCard product={outOfStockProduct} />
      </AllTheProviders>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });
});

describe('CartContext Single-Seller Cart Enforcement', () => {
  beforeEach(() => {
    mockCartData = { items: [], seller: null };
    localStorage.setItem('nr_token', 'mock-valid-token');
  });

  it('allows adding products from the same seller and prevents mixed seller carts', async () => {
    render(
      <AllTheProviders>
        <CartTestConsumer />
      </AllTheProviders>
    );

    // Initial state
    await waitFor(() => {
      expect(screen.getByTestId('cart-count').textContent).toBe('0');
      expect(screen.getByTestId('cart-seller').textContent).toBe('none');
    });

    // Add item from Seller 1
    fireEvent.click(screen.getByTestId('add-seller-1'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-count').textContent).toBe('1');
      expect(screen.getByTestId('cart-seller').textContent).toBe('seller-1');
    });

    // Attempt to add item from Seller 2 -> triggers single seller conflict modal
    fireEvent.click(screen.getByTestId('add-seller-2'));

    await waitFor(() => {
      expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
      expect(screen.getByText(/Conflict detected with Gaon Swad/)).toBeInTheDocument();
    });

    // Reject replacement (keep existing cart)
    fireEvent.click(screen.getByTestId('resolve-keep'));

    await waitFor(() => {
      expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('cart-seller').textContent).toBe('seller-1');
      expect(screen.getByTestId('cart-count').textContent).toBe('1');
    });

    // Attempt to add item from Seller 2 again and accept replacement
    fireEvent.click(screen.getByTestId('add-seller-2'));
    await waitFor(() => {
      expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('resolve-replace'));

    await waitFor(() => {
      expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('cart-seller').textContent).toBe('seller-2');
      expect(screen.getByTestId('cart-count').textContent).toBe('1');
    });
  });
});
