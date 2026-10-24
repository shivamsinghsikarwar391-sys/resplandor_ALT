import React from 'react';
import { Palette, Layers, Sparkles, Clock } from 'lucide-react';

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Palette,
      title: 'Personalized Nail Designs',
      description: 'Every nail set is tailored specifically to your taste, whether you adore minimal clean lines or intricate custom art.',
    },
    {
      icon: Layers,
      title: 'Multiple Enhancement Options',
      description: 'Choose between acrylic, polygel, and soft gel techniques to find the enhancement that suits your nails and routine.',
    },
    {
      icon: Sparkles,
      title: 'Attention to Detail',
      description: 'Meticulous cuticle preparation, balanced apex sculpting, and crisp finishing touches on every single finger.',
    },
    {
      icon: Clock,
      title: 'Appointment-Focused Experience',
      description: 'Dedicated one-on-one time without the rush, so you can unwind and enjoy a focused beauty session in Snellville.',
    },
  ];

  return (
    <section id="why-us" className="py-20 md:py-28 bg-cream-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-200/60 border border-blush-300 text-burgundy-900 text-xs font-semibold tracking-wide-luxury uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
            <span>The Resplandor Standard</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-burgundy-950 tracking-tight mb-4">
            Why Choose Us
          </h2>
          <p className="text-base text-burgundy-900/75 leading-relaxed">
            Craftsmanship, personal care, and thoughtful service designed around your individual beauty routine.
          </p>
        </div>

        {/* 4 Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-cream-100/70 border border-blush-200/80 hover:bg-cream-50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blush-200/80 flex items-center justify-center text-burgundy-950 mb-6 group-hover:bg-burgundy-950 group-hover:text-cream-50 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-burgundy-950 mb-3 group-hover:text-rosegold-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-burgundy-900/75 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-blush-200/50 flex items-center justify-between text-xs font-medium text-burgundy-900/40">
                  <span>0{index + 1}</span>
                  <span className="w-4 h-[1px] bg-rosegold-300" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
