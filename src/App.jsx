import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import About from './components/About';
import WhyChooseUs from './components/WhyChooseUs';
import BookingForm from './components/BookingForm';
import FAQ from './components/FAQ';
import InstagramCTA from './components/InstagramCTA';
import Footer from './components/Footer';
import TrackModal from './components/TrackModal';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [adminViewOpen, setAdminViewOpen] = useState(false);

  // Check URL hash for direct admin routing (#admin)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setAdminViewOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectService = (serviceId) => {
    setSelectedServiceId(serviceId);
    const bookingSection = document.querySelector('#booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectStyle = (galleryItem) => {
    setInitialNotes(`Inspiration: "${galleryItem.title}" (${galleryItem.category})`);
    const catLower = galleryItem.category.toLowerCase();
    if (catLower.includes('acrylic')) {
      setSelectedServiceId('acrylic-sets');
    } else if (catLower.includes('polygel')) {
      setSelectedServiceId('polygel-nails');
    } else if (catLower.includes('soft gel')) {
      setSelectedServiceId('soft-gel-nails');
    } else if (catLower.includes('art')) {
      setSelectedServiceId('custom-nail-art');
    }
    const bookingSection = document.querySelector('#booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBooking = () => {
    const bookingSection = document.querySelector('#booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToGallery = () => {
    const gallerySection = document.querySelector('#gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in Admin Dashboard view
  if (adminViewOpen) {
    return (
      <AdminDashboard
        onExit={() => {
          setAdminViewOpen(false);
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 text-burgundy-950 font-sans selection:bg-rosegold-300 selection:text-burgundy-950 flex flex-col">
      {/* Navigation Bar */}
      <Navbar 
        onBookClick={scrollToBooking} 
        onOpenTrack={() => setTrackModalOpen(true)}
        onOpenAdmin={() => {
          setAdminViewOpen(true);
          window.location.hash = '#admin';
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero 
          onBookClick={scrollToBooking} 
          onExploreClick={scrollToGallery} 
        />

        {/* Services Section */}
        <Services onSelectService={handleSelectService} />

        {/* Nail Art Gallery & Lightbox */}
        <Gallery onSelectStyle={handleSelectStyle} />

        {/* About Section */}
        <About onCtaClick={scrollToBooking} />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Appointment Booking Request Form with Database & Dynamic Slots */}
        <BookingForm
          selectedServiceId={selectedServiceId}
          initialNotes={initialNotes}
          onOpenTrack={() => setTrackModalOpen(true)}
          onClearSelection={() => {
            setSelectedServiceId('');
            setInitialNotes('');
          }}
        />

        {/* FAQ Accordion */}
        <FAQ />

        {/* Instagram Call-to-Action */}
        <InstagramCTA />
      </main>

      {/* Footer */}
      <Footer 
        onOpenTrack={() => setTrackModalOpen(true)}
        onOpenAdmin={() => {
          setAdminViewOpen(true);
          window.location.hash = '#admin';
        }}
      />

      {/* Track Appointment Status Modal */}
      <TrackModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />
    </div>
  );
}

export default App;
