import menImg from '../assets/collection/men.png';
import womenImg from '../assets/collection/women.png';
import kidsImg from '../assets/collection/kids.png';
import { useStore } from '../context/StoreContext';

const Collection = () => {
  const { setShopCategory } = useStore();

  const collections = [
    { title: 'Men', image: menImg, tag: 'Tailored & Timeless' },
    { title: 'Women', image: womenImg, tag: 'Bold & Fluid' },
    { title: 'Kids', image: kidsImg, tag: 'Playful & Premium' },
  ];

  const view = (title) => {
    setShopCategory(title);
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-screen max-w-[100vw] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-0">
        {collections.map((item, index) => (
          <div
            key={index}
            onClick={() => view(item.title)}
            className="w-full h-[70vh] md:h-screen overflow-hidden relative group cursor-pointer"
          >
            <img
              src={item.image}
              alt={`${item.title}'s Collection`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Default overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-0 transition-opacity duration-500" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-center group-hover:opacity-0 transition-opacity duration-500">
              <p className="text-[#e2c78e] text-[11px] uppercase tracking-[0.3em] mb-2">{item.tag}</p>
              <h3 className="font-display text-4xl uppercase tracking-widest">{item.title}</h3>
            </div>

            {/* Hover state */}
            <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-6 transition-all duration-500 backdrop-blur-sm">
              <p className="text-[#c6a15b] text-xs uppercase tracking-[0.3em]">{item.tag}</p>
              <h3 className="font-display text-white text-5xl uppercase tracking-widest">{item.title}</h3>
              <span className="text-white font-semibold uppercase tracking-[0.2em] text-sm border border-[#c6a15b] text-[#c6a15b] px-8 py-3 hover:bg-[#c6a15b] hover:text-black transition-colors duration-300">
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
