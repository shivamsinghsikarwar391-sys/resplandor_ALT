import React, { useState, useEffect, useCallback } from 'react';
import { galleryItems, galleryCategories } from '../data/gallery';
import { Eye, X, ChevronLeft, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import LuxuryImage from './common/LuxuryImage';

export default function Gallery({ onSelectStyle }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === selectedCategory);

  const openLightbox = (index) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const prevLightboxItem = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
  }, [activeLightboxIndex, filteredItems.length]);

  const nextLightboxItem = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
  }, [activeLightboxIndex, filteredItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxItem();
      if (e.key === 'ArrowRight') nextLightboxItem();
    };

    if (activeLightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLightboxIndex, prevLightboxItem, nextLightboxItem]);

  const currentItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <section id="gallery" className="py-20 md:py-28 bg-cream-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-200/60 border border-blush-300 text-burgundy-900 text-xs font-semibold tracking-wide-luxury uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
            <span>Nail Art Showcase</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-burgundy-950 tracking-tight mb-4">
            Curated Nail Artistry
          </h2>
          <p className="text-base text-burgundy-900/75 leading-relaxed">
            From subtle glazed chrome to intricate hand-painted artwork, explore our recent designs for inspiration on your next visit.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-12">
          {galleryCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-luxury uppercase transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-burgundy-950 text-cream-50 shadow-sm'
                  : 'bg-cream-100/90 text-burgundy-900/75 hover:bg-blush-200/60 hover:text-burgundy-950 border border-blush-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Editorial Masonry / Pinterest-style Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`break-inside-avoid group relative rounded-2xl overflow-hidden bg-cream-200 border border-blush-200/80 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer ${item.aspect} min-h-[320px]`}
              onClick={() => openLightbox(index)}
            >
              {/* Image */}
              <div className="relative overflow-hidden w-full h-full">
                <LuxuryImage
                  src={item.imageUrl}
                  alt={item.alt}
                  className="w-full h-full object-cover transform group-hover:scale-104 transition-transform duration-700 ease-out"
                  loading="lazy"
                  fallbackTitle={item.title}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/80 via-burgundy-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-sans font-semibold tracking-wider bg-rosegold-400 text-burgundy-950 uppercase mb-2">
                      {item.tag}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-cream-50 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-cream-200/90 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-rosegold-300 font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Click to view details</span>
                    </div>
                  </div>
                </div>

                {/* Permanent subtle tag pill */}
                <div className="absolute top-3 left-3 group-hover:opacity-0 transition-opacity duration-200">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide bg-cream-50/90 text-burgundy-950 backdrop-blur-sm border border-white/50 shadow-sm">
                    {item.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA: See More on Instagram */}
        <div className="mt-16 text-center">
          <a
            href="https://www.instagram.com/resplandor.atl/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <InstagramIcon className="w-4 h-4 text-rosegold-300 group-hover:rotate-6 transition-transform" />
            <span>See More on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 text-cream-300" />
          </a>
          <p className="text-xs text-burgundy-900/60 mt-3">
            Follow <span className="font-semibold text-burgundy-950">@resplandor.atl</span> for daily reels, client stories & seasonal drops.
          </p>
        </div>

      </div>

      {/* Lightbox Modal */}
      {currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-burgundy-950/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={currentItem.title}
          onClick={closeLightbox}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-4xl w-full bg-cream-50 rounded-2xl overflow-hidden shadow-2xl border border-blush-200 flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-cream-50/80 hover:bg-cream-100 text-burgundy-950 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous Image Button */}
            <button
              type="button"
              onClick={prevLightboxItem}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-cream-50/80 hover:bg-cream-100 text-burgundy-950 shadow-md transition-colors"
              aria-label="Previous nail design"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Image Button */}
            <button
              type="button"
              onClick={nextLightboxItem}
              className="absolute right-3 md:right-auto md:left-[55%] top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-cream-50/80 hover:bg-cream-100 text-burgundy-950 shadow-md transition-colors"
              aria-label="Next nail design"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Left: Full Image */}
            <div className="md:w-3/5 bg-burgundy-950 flex items-center justify-center overflow-hidden min-h-[340px] md:h-[560px]">
              <LuxuryImage
                src={currentItem.imageUrl}
                alt={currentItem.alt}
                className="w-full h-full object-cover"
                loading="eager"
                fallbackTitle={currentItem.title}
              />
            </div>

            {/* Right: Design Details & Action */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wide uppercase bg-blush-200 text-burgundy-950">
                    {currentItem.category}
                  </span>
                  <span className="text-[11px] text-burgundy-900/60">
                    Design #{currentItem.id} of {filteredItems.length}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-burgundy-950 mb-3">
                  {currentItem.title}
                </h3>

                <p className="text-sm text-burgundy-900/80 leading-relaxed mb-6">
                  {currentItem.description}
                </p>

                <div className="p-4 rounded-xl bg-blush-100/70 border border-blush-200/80 text-xs text-burgundy-900/80 space-y-1 mb-6">
                  <p className="font-semibold text-burgundy-950">Styling Tip:</p>
                  <p>Mention this design name or share the screenshot during your appointment request or Instagram DM to recreate this aesthetic.</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-blush-200">
                <button
                  type="button"
                  onClick={() => {
                    closeLightbox();
                    if (onSelectStyle) {
                      onSelectStyle(currentItem);
                    } else {
                      const booking = document.querySelector('#booking');
                      if (booking) booking.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 transition-colors shadow-sm"
                >
                  Request Similar Design
                </button>

                <a
                  href={currentItem.sourceUrl || "https://www.instagram.com/resplandor.atl/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-burgundy-950 bg-blush-100 hover:bg-blush-200/80 border border-blush-300 transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-rosegold-600" />
                  <span>View Original Instagram Post</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
