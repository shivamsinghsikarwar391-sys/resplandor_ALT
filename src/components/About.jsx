import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import LuxuryImage from './common/LuxuryImage';

export default function About({ onCtaClick }) {
  const handleScroll = (e) => {
    e.preventDefault();
    if (onCtaClick) {
      onCtaClick();
    } else {
      const target = document.querySelector('#booking');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="about" className="py-20 md:py-28 bg-cream-100/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Column */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Frame */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-full h-full border border-rosegold-400/40 rounded-2xl -z-10 pointer-events-none" />

              <div className="rounded-2xl overflow-hidden shadow-xl bg-cream-200 border border-blush-200/80 h-[460px] sm:h-[520px]">
                <LuxuryImage
                  src="/gallery/polygel-long-natural-nails.jpg"
                  alt="Precision nail artistry and beauty care at Resplandor ATL in Snellville, Georgia"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  fallbackTitle="Resplandor ATL Studio"
                />
              </div>

              {/* Floating Testimonial/Philosophy Callout */}
              <div className="absolute -bottom-6 right-4 sm:-right-4 p-5 max-w-xs rounded-xl bg-cream-50/95 backdrop-blur-md border border-blush-200 shadow-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-rosegold-500" />
                  <span className="text-[11px] font-sans font-semibold tracking-wide-luxury text-burgundy-950 uppercase">
                    Our Philosophy
                  </span>
                </div>
                <p className="text-xs text-burgundy-900/80 font-serif italic leading-snug">
                  "Every set is sculpted as wearable art that complements your lifestyle."
                </p>
              </div>

            </div>
          </div>

          {/* Text Content Column */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-200/60 border border-blush-300 text-burgundy-900 text-xs font-semibold tracking-wide-luxury uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
              <span>About Resplandor ATL</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-burgundy-950 tracking-tight mb-6 leading-tight">
              Beauty in Every Detail
            </h2>

            <div className="prose prose-burgundy max-w-none text-base sm:text-lg text-burgundy-900/85 leading-relaxed space-y-4 mb-8">
              <p>
                At Resplandor ATL, nail care is an opportunity to express your personal style. From timeless elegance to creative nail art, every design should reflect your individuality. Discover a personalized beauty experience in Snellville, Georgia.
              </p>
              <p className="text-sm sm:text-base text-burgundy-900/75">
                Whether you prefer the enduring resilience of acrylic sets, the lightweight flexibility of polygel, or clean, minimalist soft gel manicures, our focus is always on gentle preparation, refined shaping, and meticulous artistry.
              </p>
            </div>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pt-4 border-t border-blush-200/80">
              <div className="p-4 rounded-xl bg-cream-50 border border-blush-200/70">
                <h4 className="font-serif text-lg font-semibold text-burgundy-950 mb-1">
                  Individual Expression
                </h4>
                <p className="text-xs text-burgundy-900/75 leading-relaxed">
                  Tailoring nail length, apex balance, and art to fit your daily routine and personal flair.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-blush-200/70">
                <h4 className="font-serif text-lg font-semibold text-burgundy-950 mb-1">
                  Dedicated Attention
                </h4>
                <p className="text-xs text-burgundy-900/75 leading-relaxed">
                  Calm, unhurried appointment-based service where your comfort and design vision come first.
                </p>
              </div>
            </div>

            {/* Call to Action Button */}
            <button
              type="button"
              onClick={handleScroll}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <span>Let's Create Your Look</span>
              <ArrowRight className="w-4 h-4 text-rosegold-300 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}
