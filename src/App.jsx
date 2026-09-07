import React from 'react';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Collection from './components/Collection';
import Shop from './components/Shop';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased overflow-x-hidden">
      <Navbar />
      <div id="home"><Hero /></div>
      <div id="collection"><Collection /></div>
      <div id="shop"><Shop /></div>
      <div id="faq"><FAQ /></div>
      <div id="contact"><Contact /></div>
      <Footer />
    </div>
  );
};

export default App;
