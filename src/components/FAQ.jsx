import React, { useState } from 'react';
import img1 from '../assets/shop/image.png';
import img2 from '../assets/shop/image copy.png';
import img3 from '../assets/shop/image copy 2.png';
import img4 from '../assets/shop/image copy 3.png';
import img5 from '../assets/shop/image copy 4.png';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of purchase. Items must be unworn, unwashed, and have original tags attached. We offer free returns for store credit or an exchange.",
      image: img1
    },
    {
      question: "How long does shipping take?",
      answer: "Domestic orders typically arrive within 3-5 business days. International shipping can take anywhere from 7-14 business days depending on the destination.",
      image: img2
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 100 countries worldwide. Shipping costs and delivery times vary by location and will be calculated at checkout.",
      image: img3
    },
    {
      question: "How can I track my order?",
      answer: "Once your order has shipped, you will receive an email with your tracking information. You can also log into your account to check your order status.",
      image: img4
    },
    {
      question: "Are your products ethically made?",
      answer: "Absolutely. WEARSUPER is committed to sustainable and ethical manufacturing. We partner only with factories that ensure fair wages and safe working conditions.",
      image: img5
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-screen max-w-[100vw] bg-white pt-24 pb-32 overflow-hidden">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black text-center mb-24 uppercase">
        Frequently Asked Questions
      </h2>
      
      <div className="w-full flex flex-col border-t border-gray-200">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="group relative border-b border-gray-200 w-full"
          >
            {/* Hover Image (Right Side) */}
            <div className="absolute right-12 md:right-32 lg:right-48 top-1/2 -translate-y-1/2 w-[220px] h-[280px] rounded-[1.5rem] overflow-hidden opacity-0 scale-95 rotate-0 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-45 transition-all duration-700 pointer-events-none z-10 shadow-2xl">
              <img 
                src={faq.image} 
                alt="FAQ Context" 
                className="w-full h-full object-cover" 
              />
            </div>

            <button 
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left py-12 px-8 md:px-24 focus:outline-none relative z-20 bg-transparent"
            >
              {/* Question Text (Slight left nudge on hover) */}
              <span 
                className={`text-3xl md:text-5xl font-medium tracking-tighter transition-all duration-700 ease-in-out ${
                  openIndex === index 
                    ? 'text-black md:-translate-x-4' 
                    : 'text-gray-400 group-hover:text-black md:group-hover:-translate-x-4'
                }`}
              >
                {faq.question}
              </span>
              
              <span className={`ml-8 flex-shrink-0 transition-transform duration-500 ease-out ${openIndex === index ? 'rotate-180 text-black' : 'text-gray-500 group-hover:text-black'}`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </span>
            </button>
            
            {/* Answer Panel */}
            <div 
              className={`overflow-hidden transition-all duration-700 ease-in-out px-8 md:px-24 ${
                openIndex === index ? 'max-h-64 opacity-100 pb-12' : 'max-h-0 opacity-0'
              }`}
            >
              <div className={`transition-all duration-700 ease-in-out ${openIndex === index ? 'md:-translate-x-4' : ''}`}>
                <p className="text-gray-600 text-xl leading-relaxed max-w-3xl">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
