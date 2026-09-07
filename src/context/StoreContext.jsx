/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

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

const uid = () => Math.random().toString(36).slice(2, 10);

export const StoreProvider = ({ children }) => {
  // ---- Persistent state ----
  const [cart, setCart] = useState(() => load('ws_cart', []));
  const [wishlist, setWishlist] = useState(() => load('ws_wishlist', []));
  const [orders, setOrders] = useState(() => load('ws_orders', []));
  const [user, setUser] = useState(() => load('ws_user', null));

  // ---- Ephemeral UI state ----
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'auth' | 'cart' | 'checkout' | 'search' | 'wishlist' | 'orders' | 'quickview'
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [shopCategory, setShopCategory] = useState('All');

  useEffect(() => save('ws_cart', cart), [cart]);
  useEffect(() => save('ws_wishlist', wishlist), [wishlist]);
  useEffect(() => save('ws_orders', orders), [orders]);
  useEffect(() => save('ws_user', user), [user]);

  // ---- Toasts ----
  const toast = useCallback((message, type = 'success') => {
    const id = uid();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // ---- Modals ----
  const openModal = useCallback((name) => setActiveModal(name), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

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

  // ---- Cart ----
  const addToCart = useCallback(
    (product, { size, color, qty = 1 } = {}) => {
      const chosenSize = size || product.sizes?.[0] || 'One Size';
      const chosenColor = color || product.colors?.[0]?.name || 'Default';
      const lineKey = `${product.id}__${chosenSize}__${chosenColor}`;

      setCart((prev) => {
        const existing = prev.find((l) => l.lineKey === lineKey);
        if (existing) {
          return prev.map((l) =>
            l.lineKey === lineKey ? { ...l, qty: l.qty + qty } : l
          );
        }
        return [
          ...prev,
          {
            lineKey,
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            size: chosenSize,
            color: chosenColor,
            qty,
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
        .map((l) => (l.lineKey === lineKey ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(
    () => cart.reduce((sum, l) => sum + l.qty, 0),
    [cart]
  );
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.price * l.qty, 0),
    [cart]
  );

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
            image: product.image,
          },
        ];
      });
    },
    [toast]
  );
  const isWished = useCallback(
    (id) => wishlist.some((p) => p.id === id),
    [wishlist]
  );

  // ---- Auth (demo only) ----
  const login = useCallback(
    (email, password) => {
      if (!email || !password) {
        toast('Please enter email and password', 'error');
        return false;
      }
      const name = email.split('@')[0].replace(/[._-]/g, ' ');
      const nice = name.charAt(0).toUpperCase() + name.slice(1);
      setUser({ name: nice || 'Member', email });
      toast(`Welcome back, ${nice || 'Member'}`);
      return true;
    },
    [toast]
  );

  const signup = useCallback(
    (name, email, password) => {
      if (!name || !email || !password) {
        toast('Please fill in all fields', 'error');
        return false;
      }
      setUser({ name, email });
      toast(`Welcome to WEARSUPER, ${name}`);
      return true;
    },
    [toast]
  );

  const loginAsGuest = useCallback(() => {
    setUser({ name: 'Guest', email: 'guest@wearsuper.com', guest: true });
    toast('Signed in as Guest');
    return true;
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    toast('Signed out', 'info');
  }, [toast]);

  // ---- Orders ----
  const placeOrder = useCallback(
    ({ items, subtotal, shipping, total, address, payment }) => {
      const order = {
        id: 'WS-' + Date.now().toString().slice(-8),
        date: new Date().toISOString(),
        items,
        subtotal,
        shipping,
        total,
        address,
        payment, // only the safe last-4 + brand, never full card data
        status: 'Confirmed',
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    []
  );

  const value = {
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
    placeOrder,
    // auth
    user,
    login,
    signup,
    loginAsGuest,
    logout,
    // toasts
    toasts,
    toast,
    dismissToast,
    // modals + ui
    activeModal,
    openModal,
    closeModal,
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
