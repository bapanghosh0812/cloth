import { useState, useEffect } from 'react';
import { preloadImages } from '../utils/preloadImages';

export const useImageSequence = () => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [images, setImages] = useState([]);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const [firstImage, setFirstImage] = useState(null);

  useEffect(() => {
    // Import all image files dynamically
    const imageModules = import.meta.glob('../assets/hero-frame/*.{jpg,jpeg,png,webp}', {
      eager: true,
      query: '?url',
      import: 'default'
    });

    const imageUrls = Object.keys(imageModules)
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      })
      .map(key => typeof imageModules[key] === 'object' ? imageModules[key].default : imageModules[key]);

    if (imageUrls.length === 0) {
      console.warn('No images found for sequence');
      setIsLoaded(true);
      return;
    }

    // Load first image immediately to serve as the initial frame
    const firstImg = new Image();
    firstImg.onload = () => {
      setFirstImage(firstImg);
      setFirstImageLoaded(true);
    };
    firstImg.onerror = () => {
      console.error("Failed to load first image placeholder.");
    };
    firstImg.src = imageUrls[0];

    // Begin concurrent preloading for the entire sequence
    preloadImages(imageUrls, (loaded, total) => {
      setProgress(Math.round((loaded / total) * 100));
    }).then((loadedImages) => {
      setImages(loadedImages);
      setIsLoaded(true);
    });
    
  }, []);

  return { progress, isLoaded, images, firstImage, firstImageLoaded };
};
