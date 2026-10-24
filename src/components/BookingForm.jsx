import React, { useState, useEffect } from 'react';
import { services } from '../data/services';
import { fetchAvailability, submitAppointment } from '../services/api';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  Check, 
  Copy, 
  AlertCircle, 
  RotateCcw,
  Scissors,
  CheckCircle2,
  Lock,
  Search,
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function BookingForm({ 
  selectedServiceId, 
  initialNotes, 
  onClearSelection,
  onOpenTrack
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    service: selectedServiceId || '',
    preferredDate: '',
    preferredTime: '',
    nailLength: '',
    nailShape: '',
    notes: initialNotes || '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState('');
  
  // Dynamic slot availability state
  const [availabilityData, setAvailabilityData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  // Confirmation result from backend
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // Sync external service selection when changed from Services component
  useEffect(() => {
    if (selectedServiceId) {
      setFormData((prev) => ({ ...prev, service: selectedServiceId }));
      setConfirmedBooking(null);
    }
  }, [selectedServiceId]);

  // Sync initial notes if user selected a style in Gallery lightbox
  useEffect(() => {
    if (initialNotes) {
      setFormData((prev) => ({
        ...prev,
        notes: prev.notes ? `${prev.notes}\n${initialNotes}` : initialNotes,
      }));
      setConfirmedBooking(null);
    }
  }, [initialNotes]);

  // Minimum date for picker is today
  const todayString = new Date().toISOString().split('T')[0];

  // Fetch slots whenever preferredDate changes
  useEffect(() => {
    if (!formData.preferredDate) {
      setAvailabilityData(null);
      return;
    }

    let isMounted = true;
    setLoadingSlots(true);
    setSlotsError('');
    setConflictError('');

    fetchAvailability(formData.preferredDate).then((res) => {
      if (!isMounted) return;
      setLoadingSlots(false);
      if (res && res.success) {
        setAvailabilityData(res);
        // If current selected time is no longer available in new slots, clear it
        if (formData.preferredTime) {
          const matched = res.slots?.find((s) => s.time === formData.preferredTime && s.available);
          if (!matched) {
            setFormData((prev) => ({ ...prev, preferredTime: '' }));
          }
        }
      } else {
        setSlotsError(res?.error || 'Unable to load time slots for this date.');
        setAvailabilityData(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [formData.preferredDate]);

  const nailShapes = [
    'Almond',
    'Coffin / Ballerina',
    'Square',
    'Stiletto',
    'Oval',
    'Squoval',
    'Natural Shape',
  ];

  const nailLengths = [
    'Natural / Short',
    'Medium',
    'Long',
    'Extra Long',
  ];

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name.';
    }

    // Phone validation
    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required so the salon can reach you.';
    } else if (phoneClean.length < 10) {
      newErrors.phone = 'Please provide a valid 10-digit phone number.';
    }

    // Email validation (optional, but validate format if entered)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address or leave blank.';
      }
    }

    // Service validation
    if (!formData.service) {
      newErrors.service = 'Please select a preferred nail service.';
    }

    // Date validation
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select a preferred appointment date.';
    } else {
      const selectedDate = new Date(formData.preferredDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.preferredDate = 'Appointment date must be today or a future date.';
      }
    }

    // Time slot validation
    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Please select an available time slot.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (conflictError) setConflictError('');
  };

  const getSelectedServiceName = () => {
    const matched = services.find((s) => s.id === formData.service);
    return matched ? matched.name : formData.service;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');

    if (!validate()) {
      const bookingForm = document.querySelector('#booking');
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      serviceId: formData.service,
      serviceName: getSelectedServiceName(),
      appointmentDate: formData.preferredDate,
      appointmentTime: formData.preferredTime,
      nailLength: formData.nailLength || undefined,
      nailShape: formData.nailShape || undefined,
      notes: formData.notes.trim() || undefined,
    };

    const res = await submitAppointment(payload);
    setSubmitting(false);

    if (res.ok && res.appointment) {
      setConfirmedBooking(res.appointment);
      setCopied(false);
      setTimeout(() => {
        const summaryElem = document.querySelector('#request-summary');
        if (summaryElem) {
          summaryElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    } else if (res.status === 409 || res.conflict) {
      setConflictError(res.error || 'This time slot is no longer available. Please choose another slot.');
      // Refresh available slots
      fetchAvailability(formData.preferredDate).then((slotRes) => {
        if (slotRes.success) setAvailabilityData(slotRes);
      });
    } else {
      setConflictError(res.error || 'Failed to submit appointment. Please try again or message @resplandor.atl.');
    }
  };

  const formattedRequestText = confirmedBooking
    ? `Hello Resplandor ATL! ✨ I submitted an appointment request:

• Booking Reference: ${confirmedBooking.reference}
• Name: ${confirmedBooking.customerName || formData.fullName}
• Phone: ${formData.phone}
${formData.email.trim() ? `• Email: ${formData.email.trim()}\n` : ''}• Service: ${confirmedBooking.serviceName || getSelectedServiceName()}
• Date: ${confirmedBooking.appointmentDate || formData.preferredDate}
• Time: ${confirmedBooking.appointmentTime || formData.preferredTime}
${formData.nailLength ? `• Nail Length: ${formData.nailLength}\n` : ''}${formData.nailShape ? `• Nail Shape: ${formData.nailShape}\n` : ''}${formData.notes.trim() ? `• Notes & Design Ideas: ${formData.notes.trim()}\n` : ''}
Please let me know once availability is approved. Thank you!`
    : '';

  const handleCopyRequest = async () => {
    try {
      await navigator.clipboard.writeText(formattedRequestText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setCopied(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      service: '',
      preferredDate: '',
      preferredTime: '',
      nailLength: '',
      nailShape: '',
      notes: '',
    });
    setAvailabilityData(null);
    setErrors({});
    setConflictError('');
    if (onClearSelection) onClearSelection();
  };

  return (
    <section id="booking" className="py-20 md:py-28 bg-cream-100/60 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-200/60 border border-blush-300 text-burgundy-900 text-xs font-semibold tracking-wide-luxury uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
            <span>Salon Scheduling</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-burgundy-950 tracking-tight mb-4">
            Book Your Appointment
          </h2>
          <p className="text-base text-burgundy-900/75 leading-relaxed">
            Select your preferred enhancement, date, and live time slot below. Every appointment request is securely stored in our salon system.
          </p>

          {/* Quick Track Link */}
          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenTrack}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury text-burgundy-950 hover:text-rosegold-600 font-semibold underline underline-offset-4 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-rosegold-500" />
              <span>Already booked? Track Appointment Status</span>
            </button>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-cream-50 rounded-3xl p-6 sm:p-10 border border-blush-200 shadow-xl relative overflow-hidden">
          
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rosegold-400 via-burgundy-800 to-rosegold-400" />

          {!confirmedBooking ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              
              {/* Conflict Error Notice */}
              {conflictError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-rose-950">Slot Scheduling Notice</h4>
                    <p className="text-xs text-rose-800 mt-0.5">{conflictError}</p>
                  </div>
                </div>
              )}

              {/* Row 1: Contact Details */}
              <div>
                <h3 className="font-serif text-xl font-semibold text-burgundy-950 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-rosegold-500" />
                  <span>1. Your Contact Details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="e.g. Sofia Martinez"
                      className={`w-full px-4 py-3 rounded-xl bg-cream-100/50 border text-burgundy-950 placeholder:text-burgundy-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400 transition-all ${
                        errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-blush-200'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                      Phone Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="e.g. (470) 555-0192"
                      className={`w-full px-4 py-3 rounded-xl bg-cream-100/50 border text-burgundy-950 placeholder:text-burgundy-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400 transition-all ${
                        errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-blush-200'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Email (Optional) */}
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                      Email Address <span className="text-burgundy-900/50 font-normal lowercase">(optional, for confirmation receipts)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="e.g. sofia@example.com"
                      className={`w-full px-4 py-3 rounded-xl bg-cream-100/50 border text-burgundy-950 placeholder:text-burgundy-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400 transition-all ${
                        errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-blush-200'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Service & Schedule with Dynamic Slot Selection */}
              <div className="pt-4 border-t border-blush-200">
                <h3 className="font-serif text-xl font-semibold text-burgundy-950 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-rosegold-500" />
                  <span>2. Desired Service & Real-Time Availability</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* Service Dropdown */}
                  <div className="md:col-span-2">
                    <label htmlFor="service" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                      Preferred Service <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => handleChange('service', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-cream-100/50 border text-burgundy-950 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400 transition-all ${
                        errors.service ? 'border-rose-400 bg-rose-50/20' : 'border-blush-200'
                      }`}
                    >
                      <option value="">-- Choose a Service --</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.priceDisplay})
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.service}</span>
                      </p>
                    )}
                  </div>

                  {/* Preferred Date */}
                  <div className="md:col-span-2 sm:col-span-1">
                    <label htmlFor="preferredDate" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                      Select Date <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      min={todayString}
                      value={formData.preferredDate}
                      onChange={(e) => handleChange('preferredDate', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-cream-100/50 border text-burgundy-950 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400 transition-all ${
                        errors.preferredDate ? 'border-rose-400 bg-rose-50/20' : 'border-blush-200'
                      }`}
                    />
                    {errors.preferredDate && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.preferredDate}</span>
                      </p>
                    )}
                  </div>

                  {/* Working Hours Guidance Pill */}
                  <div className="md:col-span-2 sm:col-span-1 flex items-end">
                    {availabilityData && availabilityData.isAvailableDay ? (
                      <div className="p-3 rounded-xl bg-cream-100 border border-blush-200 text-xs text-burgundy-900/80 w-full flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-burgundy-950">{availabilityData.dayName} Hours:</span>
                          <span className="ml-1">{availabilityData.operatingHours}</span>
                        </div>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          {availabilityData.totalAvailable} slots open
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-cream-100/60 border border-blush-200/60 text-xs text-burgundy-900/60 w-full">
                        Choose a date to view live studio time slots.
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time Time Slots Grid */}
                <div className="mt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-2">
                    Available Time Slot <span className="text-rose-600">*</span>
                  </label>

                  {loadingSlots ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-12 rounded-xl bg-blush-100/60 animate-pulse border border-blush-200" />
                      ))}
                    </div>
                  ) : availabilityData && !availabilityData.isAvailableDay ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{availabilityData.reason || 'Salon is closed on this date. Please select another date.'}</span>
                    </div>
                  ) : availabilityData && availabilityData.slots ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availabilityData.slots.map((slot) => {
                        const isSelected = formData.preferredTime === slot.time;
                        const isAvailable = slot.available;

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleChange('preferredTime', slot.time)}
                            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 border ${
                              !isAvailable
                                ? 'bg-cream-200/60 text-burgundy-900/40 border-blush-200/60 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-burgundy-950 text-cream-50 border-burgundy-950 shadow-md ring-2 ring-rosegold-400'
                                : 'bg-cream-100/80 text-burgundy-950 border-blush-200 hover:border-rosegold-400 hover:bg-cream-50'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-rosegold-300' : 'text-rosegold-500'}`} />
                              <span>{slot.time}</span>
                            </span>

                            {!isAvailable ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-700/80 uppercase">
                                <Lock className="w-3 h-3" />
                                <span>Booked</span>
                              </span>
                            ) : isSelected ? (
                              <Check className="w-3.5 h-3.5 text-rosegold-300" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-burgundy-900/60 italic">
                      Please pick a date first to calculate studio opening slots.
                    </p>
                  )}

                  {errors.preferredTime && (
                    <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.preferredTime}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Styling Preferences (Optional) */}
              <div className="pt-4 border-t border-blush-200">
                <h3 className="font-serif text-xl font-semibold text-burgundy-950 mb-4 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-rosegold-500" />
                  <span>3. Nail Styling Details <span className="text-sm font-sans font-normal text-burgundy-900/60">(Optional)</span></span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* Nail Length */}
                  <div>
                    <label htmlFor="nailLength" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                      Preferred Nail Length
                    </label>
                    <select
                      id="nailLength"
                      value={formData.nailLength}
                      onChange={(e) => handleChange('nailLength', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-cream-100/50 border border-blush-200 text-burgundy-950 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                    >
                      <option value="">Unsure / Need Advice</option>
                      {nailLengths.map((len) => (
                        <option key={len} value={len}>
                          {len}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nail Shape */}
                  <div>
                    <label htmlFor="nailShape" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                      Preferred Nail Shape
                    </label>
                    <select
                      id="nailShape"
                      value={formData.nailShape}
                      onChange={(e) => handleChange('nailShape', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-cream-100/50 border border-blush-200 text-burgundy-950 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                    >
                      <option value="">Unsure / Open to suggestion</option>
                      {nailShapes.map((shape) => (
                        <option key={shape} value={shape}>
                          {shape}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inspiration Notes */}
                <div>
                  <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-burgundy-900 mb-1.5">
                    Design Inspiration or Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Describe your design vision, event theme (wedding, birthday), desired colors, or note any previous enhancements..."
                    className="w-full px-4 py-3 rounded-xl bg-cream-100/50 border border-blush-200 text-burgundy-950 placeholder:text-burgundy-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                  />
                  <p className="text-[11px] text-burgundy-900/60 mt-1">
                    Tip: You can also bring inspiration screenshots to your appointment or message them to @resplandor.atl on Instagram.
                  </p>
                </div>
              </div>

              {/* Privacy Notice Accordion */}
              <div className="pt-2 border-t border-blush-200">
                <button
                  type="button"
                  onClick={() => setShowPrivacyNotice(!showPrivacyNotice)}
                  className="flex items-center gap-1.5 text-xs text-burgundy-900/70 hover:text-burgundy-950 font-medium transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rosegold-500" />
                  <span>Customer Privacy Commitment</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPrivacyNotice ? 'rotate-180' : ''}`} />
                </button>

                {showPrivacyNotice && (
                  <div className="mt-2.5 p-4 rounded-xl bg-cream-100/70 border border-blush-200 text-[11px] text-burgundy-900/80 leading-relaxed space-y-1">
                    <p className="font-semibold text-burgundy-950">How your information is protected:</p>
                    <p>
                      At Resplandor ATL, we respect client privacy. Your name, phone number, and email are stored securely in our salon database solely for booking coordination, appointment status updates, and artist consultations. We never sell, rent, or share client contact information with third parties.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-full text-xs uppercase tracking-luxury font-semibold text-cream-50 bg-burgundy-950 hover:bg-burgundy-800 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting to Salon Schedule...</span>
                    </div>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4 text-rosegold-300" />
                      <span>Request Appointment</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-burgundy-900/60 mt-3">
                  Your appointment will be saved in our real database and assigned a unique reference for salon approval.
                </p>
              </div>

            </form>
          ) : (
            /* =========================================================================
             * REAL SAVED APPOINTMENT: PENDING CONFIRMATION STATUS
             * ========================================================================= */
            <div id="request-summary" className="py-4 space-y-6 animate-in fade-in duration-300">
              
              {/* Status Header */}
              <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 shadow-sm border border-amber-300">
                  <Clock className="w-6 h-6" />
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-200/80 text-amber-950 mb-2">
                  <span>Pending Confirmation</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-burgundy-950 mb-2">
                  Appointment Request Saved
                </h3>
                
                <p className="text-xs sm:text-sm text-burgundy-900/80 max-w-xl mx-auto leading-relaxed">
                  Your appointment has been registered in our database. Because Resplandor ATL is an appointment-focused studio, the salon artist must review and approve the schedule before the booking is finalized.
                </p>
              </div>

              {/* Reference Code Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-cream-100 border border-blush-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-burgundy-900/60 block">
                    Your Unique Booking Reference
                  </span>
                  <span className="font-mono text-2xl font-bold text-burgundy-950 tracking-wider">
                    {confirmedBooking.reference}
                  </span>
                  <span className="block text-[11px] text-burgundy-900/70 mt-0.5">
                    Save this reference to track your status anytime.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyRequest}
                  className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-luxury font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                    copied
                      ? 'bg-emerald-800 text-white'
                      : 'bg-burgundy-950 text-cream-50 hover:bg-burgundy-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-rosegold-300" />
                      <span>Copy Reference</span>
                    </>
                  )}
                </button>
              </div>

              {/* Booking Summary Table */}
              <div className="p-6 rounded-2xl bg-cream-100/70 border border-blush-200 space-y-3 font-sans text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-blush-200">
                  <span className="text-xs uppercase tracking-luxury text-burgundy-900/70 font-semibold">
                    Appointment Details
                  </span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Awaiting Salon Approval
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
                  <div>
                    <span className="text-burgundy-900/60 block text-[11px] uppercase">Client Name</span>
                    <span className="font-medium text-burgundy-950">{confirmedBooking.customerName || formData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-burgundy-900/60 block text-[11px] uppercase">Contact Phone</span>
                    <span className="font-medium text-burgundy-950">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-burgundy-900/60 block text-[11px] uppercase">Service</span>
                    <span className="font-medium text-burgundy-950">{confirmedBooking.serviceName || getSelectedServiceName()}</span>
                  </div>
                  <div>
                    <span className="text-burgundy-900/60 block text-[11px] uppercase">Date & Time</span>
                    <span className="font-medium text-burgundy-950">
                      {confirmedBooking.appointmentDate || formData.preferredDate} at {confirmedBooking.appointmentTime || formData.preferredTime}
                    </span>
                  </div>
                  {formData.nailLength && (
                    <div>
                      <span className="text-burgundy-900/60 block text-[11px] uppercase">Length</span>
                      <span className="font-medium text-burgundy-950">{formData.nailLength}</span>
                    </div>
                  )}
                  {formData.nailShape && (
                    <div>
                      <span className="text-burgundy-900/60 block text-[11px] uppercase">Shape</span>
                      <span className="font-medium text-burgundy-950">{formData.nailShape}</span>
                    </div>
                  )}
                </div>

                {formData.notes && (
                  <div className="pt-2 border-t border-blush-200/60">
                    <span className="text-burgundy-900/60 block text-[11px] uppercase">Inspiration & Notes</span>
                    <p className="text-xs sm:text-sm text-burgundy-950 mt-0.5 whitespace-pre-line">{formData.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Track & Instagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={onOpenTrack}
                  className="w-full py-3.5 px-5 rounded-full text-xs uppercase tracking-luxury font-semibold bg-burgundy-950 text-cream-50 hover:bg-burgundy-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Search className="w-4 h-4 text-rosegold-300" />
                  <span>Check Live Approval Status</span>
                </button>

                <a
                  href="https://www.instagram.com/resplandor.atl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-full text-xs uppercase tracking-luxury font-semibold bg-blush-200/90 text-burgundy-950 hover:bg-blush-300 transition-all flex items-center justify-center gap-2 border border-blush-300 shadow-sm"
                >
                  <InstagramIcon className="w-4 h-4 text-rosegold-600" />
                  <span>Message @resplandor.atl</span>
                </a>
              </div>

              {/* Reset / Make another request */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-burgundy-900/70 hover:text-burgundy-950 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Another Appointment Request</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
