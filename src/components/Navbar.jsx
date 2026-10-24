import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Calendar, ArrowRight, Search, Shield } from 'lucide-react';

export default function Navbar({ onBookClick, onOpenTrack, onOpenAdmin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'About', href: '#about' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'FAQs', href: '#faqs' },
    { name: 'Book', href: '#booking' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingCTA = () => {
    setMobileMenuOpen(false);
    if (onBookClick) {
      onBookClick();
    } else {
      const element = document.querySelector('#booking');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-blush-200/60 py-3.5'
          : 'bg-transparent py-5 md:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo / Wordmark */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="group flex flex-col items-start focus:outline-none"
            aria-label="Resplandor ATL - Home"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.22em] font-semibold text-burgundy-950 uppercase group-hover:text-rosegold-600 transition-colors">
                RESPLANDOR
              </span>
              <span className="text-xs font-sans font-semibold tracking-widest px-1.5 py-0.5 rounded bg-blush-200 text-burgundy-900 uppercase">
                ATL
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-burgundy-900/60 font-sans font-medium pl-0.5">
              Snellville, Georgia
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-7" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-xs uppercase tracking-luxury font-medium text-burgundy-900/80 hover:text-burgundy-950 transition-colors relative py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-rosegold-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {/* Track Appointment Status Link */}
            <button
              type="button"
              onClick={onOpenTrack}
              className="text-xs uppercase tracking-luxury font-semibold text-burgundy-950 hover:text-rosegold-600 transition-colors flex items-center gap-1 py-1"
            >
              <Search className="w-3.5 h-3.5 text-rosegold-500" />
              <span>Track Status</span>
            </button>
          </nav>

          {/* Prominent CTA Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBookingCTA}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 shadow-sm hover:shadow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rosegold-400 focus:ring-offset-2"
            >
              <Calendar className="w-3.5 h-3.5 text-rosegold-300" />
              <span>Book Appointment</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-burgundy-950 hover:bg-blush-100 transition-colors focus:outline-none focus:ring-2 focus:ring-rosegold-400"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden border-b border-blush-200/80 bg-cream-50/98 backdrop-blur-xl ${
          mobileMenuOpen ? 'max-h-[520px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pt-4 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2 rounded-md text-sm uppercase tracking-luxury font-medium text-burgundy-900/90 hover:text-burgundy-950 hover:bg-blush-100/70 transition-colors"
              >
                {link.name}
              </a>
            ))}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="px-3 py-2 rounded-md text-sm uppercase tracking-luxury font-semibold text-burgundy-950 hover:bg-blush-100/70 transition-colors text-left flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-rosegold-500" />
              <span>Track Appointment Status</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="px-3 py-2 rounded-md text-xs uppercase tracking-luxury font-semibold text-burgundy-900/60 hover:text-burgundy-950 transition-colors text-left flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-rosegold-500" />
              <span>Salon Owner Portal</span>
            </button>
          </div>

          <div className="pt-3 border-t border-blush-200">
            <button
              type="button"
              onClick={handleBookingCTA}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 transition-colors"
            >
              <Calendar className="w-4 h-4 text-rosegold-300" />
              <span>Book an Appointment</span>
            </button>
            <p className="text-center text-[11px] text-burgundy-900/60 mt-3 font-sans tracking-wide">
              Snellville, Georgia • By Appointment
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
