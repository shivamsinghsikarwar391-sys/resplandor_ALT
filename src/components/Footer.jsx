import React from 'react';
import { MapPin, Sparkles, Heart, Search, Shield } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function Footer({ onOpenTrack, onOpenAdmin }) {
  const currentYear = new Date().getFullYear();

  const handleScroll = (e, href) => {
    e.preventDefault();
    const elem = document.querySelector(href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-burgundy-950 text-cream-100 pt-16 pb-12 border-t border-burgundy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-burgundy-800/80">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.24em] font-semibold text-cream-50 uppercase">
                RESPLANDOR
              </span>
              <span className="text-xs font-sans font-bold tracking-widest px-2 py-0.5 rounded bg-rosegold-500/30 text-rosegold-300 border border-rosegold-500/40 uppercase">
                ATL
              </span>
            </div>

            <p className="text-xs sm:text-sm text-cream-300/80 font-sans leading-relaxed max-w-sm">
              Elevated nail enhancements, polygel sculpting, and bespoke nail artistry tailored to your unique style. Dedicated to quality, comfort, and precision in every set.
            </p>

            <div className="flex items-center gap-2 text-xs text-rosegold-300 font-medium pt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Snellville, Georgia • Metro Atlanta</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-luxury text-rosegold-300 font-sans">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-cream-200/80">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleScroll(e, '#home')}
                  className="hover:text-cream-50 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleScroll(e, '#services')}
                  className="hover:text-cream-50 transition-colors"
                >
                  Services & Enhancements
                </a>
              </li>
              <li>
                <a
                  href="#gallery"
                  onClick={(e) => handleScroll(e, '#gallery')}
                  className="hover:text-cream-50 transition-colors"
                >
                  Nail Art Gallery
                </a>
              </li>
              <li>
                <a
                  href="#booking"
                  onClick={(e) => handleScroll(e, '#booking')}
                  className="hover:text-cream-50 transition-colors"
                >
                  Book an Appointment
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTrack}
                  className="hover:text-cream-50 transition-colors flex items-center gap-1.5 text-left"
                >
                  <Search className="w-3 h-3 text-rosegold-400" />
                  <span>Track Appointment Status</span>
                </button>
              </li>
              <li>
                <a
                  href="#faqs"
                  onClick={(e) => handleScroll(e, '#faqs')}
                  className="hover:text-cream-50 transition-colors"
                >
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Official Connect & Booking Inquiry */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-luxury text-rosegold-300 font-sans">
              Connect With Us
            </h4>
            <p className="text-xs text-cream-300/80 leading-relaxed">
              Have an idea for a set or want to check current schedule openings? Connect directly through our official Instagram profile:
            </p>

            <a
              href="https://www.instagram.com/resplandor.atl/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-burgundy-900/90 hover:bg-burgundy-800 text-cream-50 border border-burgundy-700 text-xs font-medium tracking-wide transition-colors group"
            >
              <InstagramIcon className="w-4 h-4 text-rosegold-400 group-hover:scale-110 transition-transform" />
              <span>instagram.com/resplandor.atl</span>
            </a>

            <div className="pt-2">
              <a
                href="#booking"
                onClick={(e) => handleScroll(e, '#booking')}
                className="inline-block text-xs uppercase tracking-luxury text-rosegold-300 hover:text-rosegold-200 underline underline-offset-4 font-semibold"
              >
                Send Appointment Inquiry &rarr;
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-300/60 gap-4">
          <p>
            &copy; {currentYear} Resplandor ATL. All rights reserved. Snellville, Georgia.
          </p>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-cream-300/60 hover:text-rosegold-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-rosegold-400" />
              <span>Salon Owner Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
