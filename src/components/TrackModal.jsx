import React, { useState } from 'react';
import { trackAppointment } from '../services/api';
import { 
  Search, 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Clock3, 
  AlertCircle, 
  XCircle, 
  Sparkles,
  Scissors,
  MapPin,
  ExternalLink
} from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function TrackModal({ isOpen, onClose, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter your booking reference (e.g. RATL-XXXXXX) or phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const res = await trackAppointment(query.trim());
    setLoading(false);

    if (res.ok && res.appointment) {
      setResult(res.appointment);
    } else {
      setError(res.error || 'No appointment found matching that reference or phone number.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Confirmed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock3 className="w-3.5 h-3.5 text-amber-700" />
            <span>Pending Salon Confirmation</span>
          </span>
        );
      case 'Rescheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            <span>Rescheduled</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Could Not Accommodate</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            <XCircle className="w-3.5 h-3.5 text-gray-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-cream-200 text-burgundy-950">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-burgundy-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full bg-cream-50 rounded-3xl overflow-hidden shadow-2xl border border-blush-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-cream-100 hover:bg-blush-200 text-burgundy-950 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-200/70 text-burgundy-950 text-xs font-semibold tracking-wide-luxury uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
            <span>Status Lookup</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-burgundy-950">
            Track Your Appointment
          </h3>
          <p className="text-xs sm:text-sm text-burgundy-900/75 mt-1">
            Enter your booking reference code (e.g. <span className="font-mono font-medium">RATL-ABC123</span>) or phone number.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-burgundy-900/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter Reference (RATL-XXXXXX) or Phone"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-100/70 border border-blush-300 text-sm text-burgundy-950 placeholder:text-burgundy-900/40 focus:outline-none focus:ring-2 focus:ring-rosegold-400 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-burgundy-950 hover:bg-burgundy-800 text-cream-50 text-xs uppercase tracking-luxury font-semibold transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Look Up</span>
              )}
            </button>
          </div>
          {error && (
            <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </form>

        {/* Results Card */}
        {result && (
          <div className="p-6 rounded-2xl bg-cream-100/80 border border-blush-200/90 space-y-4 animate-in fade-in duration-300">
            
            {/* Status Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-blush-200">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-burgundy-900/60 block">
                  Reference Code
                </span>
                <span className="font-mono text-base font-bold text-burgundy-950">
                  {result.reference}
                </span>
              </div>
              <div>{getStatusBadge(result.status)}</div>
            </div>

            {/* Status Guidance Message */}
            <div className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
              result.status === 'Confirmed'
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                : result.status === 'Pending'
                ? 'bg-amber-50 text-amber-950 border border-amber-200'
                : result.status === 'Rescheduled'
                ? 'bg-blue-50 text-blue-950 border border-blue-200'
                : 'bg-cream-50 text-burgundy-900 border border-blush-200'
            }`}>
              <p className="font-medium">{result.statusMessage}</p>
            </div>

            {/* Appointment Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-burgundy-900/60 block text-[10px] uppercase">Client Name</span>
                <span className="font-medium text-burgundy-950 text-sm">{result.customerName}</span>
              </div>
              <div>
                <span className="text-burgundy-900/60 block text-[10px] uppercase">Service</span>
                <span className="font-medium text-burgundy-950 text-sm">{result.serviceName}</span>
              </div>
              <div>
                <span className="text-burgundy-900/60 block text-[10px] uppercase">Date</span>
                <span className="font-medium text-burgundy-950 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-rosegold-500" />
                  <span>{result.appointmentDate}</span>
                </span>
              </div>
              <div>
                <span className="text-burgundy-900/60 block text-[10px] uppercase">Time Window</span>
                <span className="font-medium text-burgundy-950 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-rosegold-500" />
                  <span>{result.appointmentTime}</span>
                </span>
              </div>
              {result.nailLength && (
                <div>
                  <span className="text-burgundy-900/60 block text-[10px] uppercase">Length</span>
                  <span className="font-medium text-burgundy-950">{result.nailLength}</span>
                </div>
              )}
              {result.nailShape && (
                <div>
                  <span className="text-burgundy-900/60 block text-[10px] uppercase">Shape</span>
                  <span className="font-medium text-burgundy-950">{result.nailShape}</span>
                </div>
              )}
            </div>

            {/* Confirmed Studio Guidelines */}
            {result.status === 'Confirmed' && (
              <div className="pt-3 border-t border-blush-200 text-xs text-burgundy-900/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-burgundy-950 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rosegold-600 shrink-0" />
                  <span>Studio Location: Snellville, Georgia</span>
                </div>
                <p className="text-[11px] text-burgundy-900/70">
                  Please arrive 5 minutes before your scheduled appointment time. If you have custom reference images, message them to @resplandor.atl on Instagram with reference #{result.reference}.
                </p>
              </div>
            )}

            {/* Quick Instagram Action */}
            <div className="pt-2 flex justify-end">
              <a
                href="https://www.instagram.com/resplandor.atl/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy-950 hover:text-rosegold-600 transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-rosegold-500" />
                <span>Message Salon on Instagram &rarr;</span>
              </a>
            </div>

          </div>
        )}

        {/* Footer Note */}
        <p className="text-[11px] text-center text-burgundy-900/60 mt-6">
          Resplandor ATL • Snellville, GA • Appointment-Focused Nail Care
        </p>

      </div>
    </div>
  );
}
