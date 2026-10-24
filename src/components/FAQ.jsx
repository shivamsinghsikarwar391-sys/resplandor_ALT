import React, { useState } from 'react';
import { faqs } from '../data/faqs';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function FAQ() {
  const [openId, setOpenId] = useState('faq-1');

  const toggleAccordion = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className="py-20 md:py-28 bg-cream-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-200/60 border border-blush-300 text-burgundy-900 text-xs font-semibold tracking-wide-luxury uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-rosegold-500" />
            <span>Common Inquiries</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-burgundy-950 tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-burgundy-900/75 leading-relaxed">
            Everything you need to know about preparing for your session, requesting custom nail art, and visiting Resplandor ATL.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-cream-100/90 border-blush-300 shadow-sm'
                    : 'bg-cream-50 border-blush-200/80 hover:border-blush-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rosegold-400"
                  aria-expanded={isOpen}
                  aria-controls={`answer-${faq.id}`}
                >
                  <span className="font-serif text-lg sm:text-xl font-medium text-burgundy-950 pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'rotate-180 bg-burgundy-950 text-cream-50'
                        : 'bg-blush-100 text-burgundy-900'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <div
                  id={`answer-${faq.id}`}
                  className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${
                    isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
                  }`}
                >
                  <p className="text-sm sm:text-base text-burgundy-900/80 leading-relaxed font-sans pt-1">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra Help Callout */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-blush-100/60 border border-blush-200 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-serif text-base font-semibold text-burgundy-950">
              Have a specific question not listed here?
            </h4>
            <p className="text-xs text-burgundy-900/70">
              Direct message us anytime on Instagram for quick assistance.
            </p>
          </div>
          <a
            href="https://www.instagram.com/resplandor.atl/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-luxury text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 transition-colors shrink-0"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-rosegold-300" />
            <span>Message @resplandor.atl</span>
          </a>
        </div>

      </div>
    </section>
  );
}
