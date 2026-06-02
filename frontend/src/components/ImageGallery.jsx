import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { uploadImageUrl } from '../utils/format';

const ImageGallery = ({ images = [], altPrefix = 'Plot' }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-12 text-center">
        <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-700" />
        <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">No Images Uploaded Yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Upload JPG, PNG, or WEBP files</p>
      </div>
    );
  }

  const goPrev = () =>
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () =>
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <img
              src={uploadImageUrl(img)}
              alt={`${altPrefix} ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
              {i + 1}/{images.length}
            </span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 sm:left-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 sm:right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
          <img
            src={uploadImageUrl(images[lightboxIndex])}
            alt={`${altPrefix} full view`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-sm font-medium text-white/80">
            {lightboxIndex + 1} of {images.length}
          </p>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
