export const preloadImages = (urls, onProgress) => {
  return new Promise(async (resolve) => {
    const images = new Array(urls.length);
    let loadedCount = 0;

    if (urls.length === 0) {
      resolve(images);
      return;
    }

    const checkDone = () => {
      loadedCount++;
      if (onProgress) {
        onProgress(loadedCount, urls.length);
      }
      if (loadedCount === urls.length) {
        resolve(images);
      }
    };

    // Process images in batches to prevent network/CPU choking
    const batchSize = 10;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(batch.map((url, idx) => {
        const absoluteIndex = i + idx;
        return new Promise((res) => {
          const img = new Image();
          img.src = url;
          // Use decode() to force background thread decoding before resolving
          img.decode()
            .then(() => {
              images[absoluteIndex] = img;
              checkDone();
              res();
            })
            .catch((e) => {
              console.warn(`Failed to decode frame ${absoluteIndex}: ${url}`, e);
              // Fallback to storing the image anyway, or null
              images[absoluteIndex] = img; 
              checkDone();
              res();
            });
        });
      }));
    }
  });
};
