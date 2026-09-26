/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { api, getToken, setToken } from '../lib/api';
import { FALLBACK_PRODUCTS, hydrateOrder, hydrateProduct, imageFor } from '../data/products';

const StoreContext = createContext(null);

// Safe localStorage helpers (private windows / disabled storage won't crash the app).
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

// Saved lines keep an imageKey; re-resolve it so image URLs survive redeploys.
const withImages = (lines) => lines.map((l) => ({ ...l, image: imageFor(l.imageKey, l.image) }));

const uid = () => Math.random().toString(36).slice(2, 10);

export const StoreProvider = ({ children }) => {
  // ---- Persistent (this device) ----
  const [rawCart, setCart] = useState(() => withImages(load('ws_cart', [])));
  const [wishlist, setWishlist] = useState(() => withImages(load('ws_wishlist', [])));
  const [userReviews, setUserReviews] = useState(() => load('ws_reviews', {}));
  const [helpfulVotes, setHelpfulVotes] = useState(() => load('ws_helpful', {}));
  // Cached profile for an instant UI; verified against the API on load.
  const [user, setUser] = useState(() => (getToken() ? load('ws_user', null) : null));

  // ---- From the API ----
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [ordersFor, setOrdersFor] = useState(null); // user id the orders were loaded for

  // ---- Ephemeral UI state ----
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'auth' | 'cart' | 'checkout' | 'search' | 'wishlist' | 'orders' | 'order' | 'receipt' | 'quickview'
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [afterAuth, setAfterAuth] = useState(null); // modal to continue to once signed in
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [shopCategory, setShopCategory] = useState('All');

  useEffect(() => save('ws_cart', rawCart), [rawCart]);
  useEffect(() => save('ws_wishlist', wishlist), [wishlist]);
  useEffect(() => save('ws_user', user), [user]);
  useEffect(() => save('ws_reviews', userReviews), [userReviews]);
  useEffect(() => save('ws_helpful', helpfulVotes), [helpfulVotes]);

  // ---- Toasts ----
  const toast = useCallback((message, type = 'success') => {
    const id = uid();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // ---- Modals ----
  const openModal = useCallback((name) => setActiveModal(name), []);
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setAfterAuth(null);
  }, []);
  // Opens `next` straight away when signed in, otherwise asks to sign in first and continues after.
  const requireAuth = useCallback(
    (next) => {
      if (user) {
        setActiveModal(next);
      } else {
        setAfterAuth(next);
        setActiveModal('auth');
      }
    },
    [user]
  );
  const finishAuth = useCallback(() => {
    setActiveModal(afterAuth);
    setAfterAuth(null);
  }, [afterAuth]);

  // Lock body scroll while any overlay is open.
  useEffect(() => {
    if (activeModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [activeModal]);

  const openQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setActiveModal('quickview');
  }, []);

  // ---- Products ----
  // Also wakes a sleeping free-tier server early, before the visitor tries to sign in.
  useEffect(() => {
    let alive = true;
    api('/products')
      .then(({ products: list }) => {
        if (alive && list?.length) setProducts(list.map(hydrateProduct));
      })
      .catch(() => {
        /* API unreachable — keep showing the bundled catalogue */
      });
    return () => {
      alive = false;
    };
  }, []);

  const getProduct = useCallback((id) => products.find((p) => p.id === id), [products]);

  // ---- Session ----
  const endSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setOrders([]);
    setOrdersFor(null);
  }, []);

  // A 401 means the token expired or was revoked: sign out and ask to sign in again.
  const handleApiError = useCallback(
    (err, next = null) => {
      if (err.status === 401) {
        endSession();
        setAfterAuth(next);
        setActiveModal('auth');
        toast('Your session has expired — please sign in again', 'info');
      } else {
        toast(err.message, 'error');
      }
    },
    [endSession, toast]
  );

  // Verify a saved session once on load.
  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    api('/auth/me')
      .then(({ user: profile }) => alive && setUser(profile))
      .catch((err) => {
        if (alive && err.status === 401) endSession();
      });
    return () => {
      alive = false;
    };
  }, [endSession]);

  const startSession = useCallback(
    (token, profile, message) => {
      setToken(token);
      setUser(profile);
      setOrders([]);
      setOrdersFor(null);
      toast(message);
    },
    [toast]
  );

  const login = useCallback(
    async (email, password) => {
      try {
        const { token, user: profile } = await api('/auth/login', { method: 'POST', body: { email, password } });
        startSession(token, profile, `Welcome back, ${profile.name.split(' ')[0]}`);
        return true;
      } catch (err) {
        toast(err.message, 'error');
        return false;
      }
    },
    [startSession, toast]
  );

  const signup = useCallback(
    async (name, email, password) => {
      try {
        const { token, user: profile } = await api('/auth/signup', { method: 'POST', body: { name, email, password } });
        startSession(token, profile, `Welcome to WEARSUPER, ${profile.name.split(' ')[0]}`);
        return true;
      } catch (err) {
        toast(err.message, 'error');
        return false;
      }
    },
    [startSession, toast]
  );

  const logout = useCallback(() => {
    endSession();
    toast('Signed out', 'info');
  }, [endSession, toast]);

  // ---- Cart ----
  // Prices and names always follow the live catalogue (the server charges catalogue prices too).
  const cart = useMemo(
    () =>
      rawCart.map((l) => {
        const p = products.find((x) => x.id === l.id);
        return p ? { ...l, price: p.price, name: p.name, image: p.image } : l;
      }),
    [rawCart, products]
  );

  const addToCart = useCallback(
    (product, { size, color, qty = 1 } = {}) => {
      const chosenSize = size || product.sizes?.[0] || 'One Size';
      const chosenColor = color || product.colors?.[0]?.name || 'Default';
      const lineKey = `${product.id}__${chosenSize}__${chosenColor}`;

      setCart((prev) => {
        const existing = prev.find((l) => l.lineKey === lineKey);
        if (existing) {
          return prev.map((l) => (l.lineKey === lineKey ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
        }
        return [
          ...prev,
          {
            lineKey,
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            imageKey: product.imageKey,
            image: product.image,
            size: chosenSize,
            color: chosenColor,
            qty: Math.min(10, qty),
          },
        ];
      });
      toast(`${product.name} added to bag`);
    },
    [toast]
  );

  const removeFromCart = useCallback((lineKey) => {
    setCart((prev) => prev.filter((l) => l.lineKey !== lineKey));
  }, []);

  const updateQty = useCallback((lineKey, qty) => {
    setCart((prev) =>
      prev
        .map((l) => (l.lineKey === lineKey ? { ...l, qty: Math.min(10, Math.max(0, qty)) } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((sum, l) => sum + l.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((sum, l) => sum + l.price * l.qty, 0), [cart]);

  // ---- Wishlist ----
  const toggleWishlist = useCallback(
    (product) => {
      setWishlist((prev) => {
        if (prev.some((p) => p.id === product.id)) {
          toast(`${product.name} removed from wishlist`, 'info');
          return prev.filter((p) => p.id !== product.id);
        }
        toast(`${product.name} saved to wishlist`);
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            imageKey: product.imageKey,
            image: product.image,
          },
        ];
      });
    },
    [toast]
  );
  const isWished = useCallback((id) => wishlist.some((p) => p.id === id), [wishlist]);

  // ---- Orders (stored in MongoDB) ----
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    api('/orders')
      .then(({ orders: list }) => {
        if (!alive) return;
        setOrders(list.map(hydrateOrder));
        setOrdersFor(userId);
      })
      .catch((err) => {
        if (!alive) return;
        setOrdersFor(userId);
        if (err.status === 401) endSession();
      });
    return () => {
      alive = false;
    };
  }, [userId, endSession]);
  const ordersLoading = Boolean(userId) && ordersFor !== userId;

  const placeOrder = useCallback(
    async ({ items, address, payment }) => {
      try {
        const { order } = await api('/orders', {
          method: 'POST',
          body: {
            items: items.map((l) => ({ productId: l.id, size: l.size, color: l.color, qty: l.qty })),
            address,
            payment, // brand + last four digits only — the full card number never leaves the browser
          },
        });
        const placed = hydrateOrder(order);
        setOrders((prev) => [placed, ...prev]);
        setCart([]);
        return placed;
      } catch (err) {
        handleApiError(err, 'checkout');
        return null;
      }
    },
    [handleApiError]
  );

  const cancelOrder = useCallback(
    async (id) => {
      try {
        const { order } = await api(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' });
        setOrders((prev) => prev.map((o) => (o.id === id ? hydrateOrder(order) : o)));
        toast(`Order ${id} cancelled — refund issued`, 'info');
      } catch (err) {
        handleApiError(err);
      }
    },
    [handleApiError, toast]
  );

  const openOrder = useCallback((id) => {
    setActiveOrderId(id);
    setActiveModal('order');
  }, []);
  const openReceipt = useCallback((id) => {
    setActiveOrderId(id);
    setActiveModal('receipt');
  }, []);
  const activeOrder = useMemo(() => orders.find((o) => o.id === activeOrderId) || null, [orders, activeOrderId]);

  // ---- Reviews (this device) ----
  const addReview = useCallback(
    (productId, review) => {
      const entry = { ...review, id: `${productId}-u-${uid()}`, date: new Date().toISOString(), helpful: 0, verified: false, mine: true };
      setUserReviews((prev) => ({ ...prev, [productId]: [entry, ...(prev[productId] || [])] }));
      toast('Thank you — your review is live');
    },
    [toast]
  );
  const toggleHelpful = useCallback((reviewId) => {
    setHelpfulVotes((prev) => {
      const next = { ...prev };
      if (next[reviewId]) delete next[reviewId];
      else next[reviewId] = true;
      return next;
    });
  }, []);

  const value = {
    // catalogue
    products,
    getProduct,
    // cart
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    // wishlist
    wishlist,
    toggleWishlist,
    isWished,
    // orders
    orders,
    ordersLoading,
    placeOrder,
    cancelOrder,
    activeOrder,
    openOrder,
    openReceipt,
    // reviews
    userReviews,
    addReview,
    helpfulVotes,
    toggleHelpful,
    // auth
    user,
    login,
    signup,
    logout,
    // toasts
    toasts,
    toast,
    dismissToast,
    // modals + ui
    activeModal,
    openModal,
    closeModal,
    requireAuth,
    finishAuth,
    afterAuth,
    quickViewProduct,
    openQuickView,
    shopCategory,
    setShopCategory,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
