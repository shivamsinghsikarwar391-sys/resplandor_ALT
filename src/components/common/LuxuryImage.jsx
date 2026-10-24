import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function LuxuryImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fallbackTitle = 'Resplandor ATL',
  aspectRatio = 'aspect-[3/4]',
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br from-cream-100 via-blush-100/60 to-cream-200 ${className}`}>
      {/* Editorial Artistic Placeholder while loading or on error */}
      {(!isLoaded || hasError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-cream-100 via-blush-100 to-cream-200">
          {/* Subtle decorative geometric ring */}
          <div className="relative w-16 h-16 rounded-full border border-rosegold-400/40 flex items-center justify-center mb-3 bg-cream-50/80 shadow-sm">
            <Sparkles className="w-6 h-6 text-rosegold-500 animate-pulse" />
          </div>
          <p className="font-serif text-base sm:text-lg font-medium tracking-wide text-burgundy-950 px-2 line-clamp-2">
            {fallbackTitle}
          </p>
          <span className="text-[10px] uppercase tracking-wide-luxury text-burgundy-900/60 mt-1 font-sans">
            Resplandor ATL • Snellville, GA
          </span>
        </div>
      )}

      {/* Main Image */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${className} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-500`}
          {...props}
        />
      )}
    </div>
  );
}
