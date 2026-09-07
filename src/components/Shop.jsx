import React from 'react';
import img1 from '../assets/shop/image.png';
import img2 from '../assets/shop/image copy.png';
import img3 from '../assets/shop/image copy 2.png';
import img4 from '../assets/shop/image copy 3.png';
import img5 from '../assets/shop/image copy 4.png';
import img6 from '../assets/shop/image copy 5.png';

const ShopCard = ({ image, title, subtitle, desc, price }) => {
  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-xl max-w-[340px] mx-auto w-full group hover:shadow-2xl transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative h-[340px] w-full rounded-[1.5rem] overflow-hidden mb-5 bg-gray-200">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4">
          <span className="bg-black/30 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-full font-medium">
            Best Seller
          </span>
        </div>
        
        <div className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white/50"></div>
          <div className="w-2 h-2 rounded-full bg-white/50"></div>
          <div className="w-2 h-2 rounded-full bg-white/50"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2">
        <h3 className="text-black text-[22px] font-bold tracking-tight leading-tight">{title}</h3>
        <p className="text-[#a1a1aa] text-[17px] font-medium mt-0.5">{subtitle}</p>
        <p className="text-[#a1a1aa] text-[15px] mt-2.5 leading-[1.4] pr-2">
          {desc}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between px-2 mb-2">
        <div className="bg-[#f4f4f5] text-black font-semibold text-[17px] px-5 py-2 rounded-full">
          {price}
        </div>
        <button className="bg-[#09090b] text-white hover:bg-black/80 transition-colors flex items-center gap-2.5 pl-5 pr-1.5 py-1.5 rounded-full font-medium text-[15px]">
          Buy Now
          <div className="bg-white rounded-full w-[26px] h-[26px] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

const Shop = () => {
  const products = [
    {
      image: img1,
      title: "Nike NK Court Vision",
      subtitle: "Own the Court",
      desc: "Step back into classic hoops style with a durable leather.",
      price: "$156"
    },
    {
      image: img2,
      title: "Nike Air Max Pulse",
      subtitle: "Max Energy",
      desc: "Push past your limits with responsive Air cushioning.",
      price: "$180"
    },
    {
      image: img3,
      title: "Nike Dunk Low Retro",
      subtitle: "Street Classic",
      desc: "Created for the hardwood but taken to the streets.",
      price: "$130"
    },
    {
      image: img4,
      title: "Nike Blazer Mid '77",
      subtitle: "Vintage Vibe",
      desc: "Old-school look of Nike b-ball with a vintage midsole.",
      price: "$105"
    },
    {
      image: img5,
      title: "Nike Air Force 1 '07",
      subtitle: "Iconic Style",
      desc: "The radiance lives on in the b-ball original.",
      price: "$115"
    },
    {
      image: img6,
      title: "Nike Zoom Vomero 5",
      subtitle: "Retro Runner",
      desc: "Carve a new lane for yourself in this complex design.",
      price: "$160"
    }
  ];

  return (
    <section className="w-full bg-[#f3f4f6] py-24 px-8">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black text-center mb-16 uppercase">
          Featured Apparel
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 place-items-center">
          {products.map((product, index) => (
            <ShopCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;
