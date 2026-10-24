import React from 'react';
import { Calendar, Compass, MapPin, Sparkles } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import LuxuryImage from './common/LuxuryImage';

export default function Hero({ onBookClick, onExploreClick }) {
  const handleScrollTo = (e, selector) => {
    e.preventDefault();
    const elem = document.querySelector(selector);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-28 overflow-hidden">
      {/* Background ambient aesthetic glows */}
      <div className="absolute top-12 left-1/4 -z-10 w-96 h-96 rounded-full bg-blush-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-8 right-10 -z-10 w-80 h-80 rounded-full bg-rosegold-300/25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & Editorial Typography */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            
            {/* Location Tag */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-blush-100/90 border border-blush-300/70 text-burgundy-900 text-xs font-medium tracking-wide mb-6">
              <MapPin className="w-3.5 h-3.5 text-rosegold-500 shrink-0" />
              <span>Snellville, Georgia</span>
              <span className="w-1 h-1 rounded-full bg-rosegold-400" />
              <span className="text-burgundy-900/70">Metro Atlanta</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-normal tracking-tight text-burgundy-950 leading-[1.08] mb-6">
              Your Nails.<br />
              <span className="italic font-light text-rosegold-600">Your Art.</span><br />
              Your Moment.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-burgundy-900/80 font-normal leading-relaxed max-w-xl mb-9">
              Elevate your everyday look with beautiful nail designs, personalized service, and a touch of luxury at Resplandor ATL.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <button
                type="button"
                onClick={onBookClick || ((e) => handleScrollTo(e, '#booking'))}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Calendar className="w-4 h-4 text-rosegold-300" />
                <span>Book Your Appointment</span>
              </button>

              <button
                type="button"
                onClick={onExploreClick || ((e) => handleScrollTo(e, '#gallery'))}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-xs uppercase tracking-luxury font-semibold text-burgundy-950 bg-transparent hover:bg-blush-200/50 border border-burgundy-950/20 transition-all duration-300"
              >
                <Compass className="w-4 h-4 text-burgundy-800" />
                <span>Explore Our Designs</span>
              </button>
            </div>

            {/* Value Highlights Bar */}
            <div className="pt-6 border-t border-blush-200/80 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="font-serif text-xl sm:text-2xl font-semibold text-burgundy-950">Custom</p>
                <p className="text-[11px] sm:text-xs text-burgundy-900/70 tracking-wide">Handcrafted Art</p>
              </div>
              <div className="border-l border-blush-200/80 pl-4">
                <p className="font-serif text-xl sm:text-2xl font-semibold text-burgundy-950">1-on-1</p>
                <p className="text-[11px] sm:text-xs text-burgundy-900/70 tracking-wide">Focused Attention</p>
              </div>
              <div className="border-l border-blush-200/80 pl-4">
                <p className="font-serif text-xl sm:text-2xl font-semibold text-burgundy-950">Premium</p>
                <p className="text-[11px] sm:text-xs text-burgundy-900/70 tracking-wide">Gel & Acrylic Care</p>
              </div>
            </div>

          </div>

          {/* Right Column: Editorial Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative border frame */}
              <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 w-full h-full border border-rosegold-400/50 rounded-2xl -z-10 pointer-events-none" />
              
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-cream-200 border border-blush-200/80 group h-[450px] sm:h-[530px]">
                <LuxuryImage
                  src="/gallery/acrylic-xl-set.jpg"
                  alt="Elegant luxury manicure and bespoke nail art at Resplandor ATL"
                  className="w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-700 ease-out"
                  loading="eager"
                  fallbackTitle="Resplandor ATL Hero Art"
                />

                {/* Subtle vignette gradient at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-cream-50/90 backdrop-blur-md border border-white/60 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-semibold tracking-wide-luxury text-burgundy-900/70 uppercase">
                        Client Experience
                      </span>
                      <h4 className="font-serif text-lg font-semibold text-burgundy-950 leading-tight">
                        Precision & Artistry
                      </h4>
                    </div>
                    <a
                      href="https://www.instagram.com/resplandor.atl/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-burgundy-950 text-cream-50 hover:bg-rosegold-600 transition-colors shadow-sm"
                      title="Follow @resplandor.atl on Instagram"
                    >
                      <InstagramIcon className="w-3 h-3 text-rosegold-300" />
                      <span>@resplandor.atl</span>
                    </a>
                  </div>
                </div>

                {/* Floating Top Badge */}
                <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-50/95 backdrop-blur-md border border-blush-200 text-burgundy-950 text-xs font-medium shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
                  <span>Snellville, GA</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
