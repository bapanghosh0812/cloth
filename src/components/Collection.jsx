import React from 'react';
import menImg from '../assets/collection/men.png';
import womenImg from '../assets/collection/women.png';
import kidsImg from '../assets/collection/kids.png';

const Collection = () => {
  const collections = [
    { title: 'Men', image: menImg },
    { title: 'Women', image: womenImg },
    { title: 'Kids', image: kidsImg },
  ];

  return (
    <section className="w-screen max-w-[100vw] overflow-hidden">
      <div className="grid grid-cols-3 w-full gap-0">
        {collections.map((item, index) => (
          <div key={index} className="w-full h-screen overflow-hidden relative group cursor-pointer">
            <img 
              src={item.image} 
              alt={`${item.title}'s Collection`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            
            {/* Default State: Dark Overlay & Title (fades out on hover) */}
            <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-500"></div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center group-hover:opacity-0 transition-opacity duration-500">
               <h3 className="text-3xl font-bold uppercase tracking-widest">{item.title}</h3>
            </div>
            
            {/* Hover State: White Background & 'View Collection' Button */}
            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 backdrop-blur-sm">
              <span className="text-black font-bold uppercase tracking-[0.2em] text-lg border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300">
                View Collection
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Collection;
