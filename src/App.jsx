import { StoreProvider } from './context/StoreContext';

import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Collection from './components/Collection';
import Values from './components/Values';
import Shop from './components/Shop';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Overlays
import Toasts from './components/ui/Toasts';
import AuthModal from './components/ui/AuthModal';
import CartDrawer from './components/ui/CartDrawer';
import CheckoutModal from './components/ui/CheckoutModal';
import SearchOverlay from './components/ui/SearchOverlay';
import WishlistDrawer from './components/ui/WishlistDrawer';
import OrdersModal from './components/ui/OrdersModal';
import ProductQuickView from './components/ui/ProductQuickView';

const App = () => {
  return (
    <StoreProvider>
      <div className="bg-black min-h-screen text-white font-sans antialiased overflow-x-hidden">
        <AnnouncementBar />
        <Navbar />

        <div id="home"><Hero /></div>
        <Marquee words={['WEARSUPER', 'BUILT DIFFERENT', 'MADE TO STAND OUT']} />
        <div id="collection"><Collection /></div>
        <Values />
        <div id="shop"><Shop /></div>
        <div id="faq"><FAQ /></div>
        <div id="contact"><Contact /></div>
        <Footer />

        {/* Global overlays */}
        <Toasts />
        <AuthModal />
        <CartDrawer />
        <CheckoutModal />
        <SearchOverlay />
        <WishlistDrawer />
        <OrdersModal />
        <ProductQuickView />
      </div>
    </StoreProvider>
  );
};

export default App;
