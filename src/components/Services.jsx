import React from 'react';
import { services } from '../data/services';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import LuxuryImage from './common/LuxuryImage';

export default function Services({ onSelectService }) {
  const handleBook = (serviceId) => {
    if (onSelectService) {
      onSelectService(serviceId);
    } else {
      const form = document.querySelector('#booking');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="services" className="py-20 md:py-28 bg-cream-100/70 relative">
      {/* Decorative subtle border line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-200/60 border border-blush-300 text-burgundy-900 text-xs font-semibold tracking-wide-luxury uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
            <span>Salon Offerings</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-burgundy-950 tracking-tight mb-4">
            Services & Enhancements
          </h2>
          <p className="text-base text-burgundy-900/75 leading-relaxed">
            Acrylic, polygel, and soft gel sets, with custom designs inspired by the work shared on Instagram.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-cream-50 rounded-2xl overflow-hidden border border-blush-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Service Card Image */}
                <div className="relative h-56 sm:h-60 overflow-hidden bg-blush-100">
                  <LuxuryImage
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                    fallbackTitle={service.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-cream-50/90 text-burgundy-950 backdrop-blur-sm border border-white/60 shadow-sm">
                      {service.category}
                    </span>
                  </div>

                  {/* Current prices are provided by the salon via Instagram DM. */}
                  <div className="absolute bottom-3 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-burgundy-950/85 text-cream-50 backdrop-blur-sm border border-burgundy-800">
                      {service.priceDisplay}
                    </span>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-semibold text-burgundy-950 mb-2 group-hover:text-rosegold-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-burgundy-900/80 leading-relaxed mb-5">
                    {service.shortDescription}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-3 border-t border-blush-200/60">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-burgundy-900/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rosegold-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="px-6 pb-6 pt-2">
                <button
                  type="button"
                  onClick={() => handleBook(service.id)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs uppercase tracking-luxury font-semibold text-burgundy-950 bg-blush-100 hover:bg-burgundy-950 hover:text-cream-50 border border-blush-300 transition-all duration-300 group-hover:border-burgundy-950"
                >
                  <span>Book This Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram does not publish current service prices. */}
        <div className="mt-12 text-center">
          <p className="text-xs text-burgundy-900/60 max-w-xl mx-auto">
            Current prices are not listed on Instagram. Message <a href="https://www.instagram.com/resplandor.atl/" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">@resplandor.atl</a> for a quote based on your length and design.
          </p>
        </div>

      </div>
    </section>
  );
}
