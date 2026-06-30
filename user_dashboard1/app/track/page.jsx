"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Calendar, MapPin, CheckCircle2, Clock, XCircle, ChevronRight, AlertCircle, Music } from 'lucide-react';
import Navbar from '../components/layout/Nav';
import Footer from '../components/layout/Footer';

export default function TrackRequestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/track?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch tracking data');
      }

      setBookings(data.bookings || []);
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Archived / Cancelled', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: XCircle };
      case 'completed':
        return { label: 'Completed', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20', icon: CheckCircle2 };
      default:
        return { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock };
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-amber-500/30">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-12 max-w-5xl mx-auto relative z-10 min-h-[80vh]">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Request</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Enter the email address you used to book an artist or submit an inquiry to check its current status.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto mb-16 relative z-10"
        >
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-16 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl pl-12 pr-32 text-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-xl"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Track'}
            </button>
          </form>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-200">{error}</p>
            </motion.div>
          )}
        </motion.div>

        <div className="max-w-3xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {hasSearched && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {bookings.length === 0 ? (
                  <div className="text-center p-12 bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Requests Found</h3>
                    <p className="text-slate-400">We couldn&apos;t find any booking requests associated with <strong className="text-slate-300">{email}</strong>.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                      <h3 className="text-lg font-bold text-slate-200">Recent Requests</h3>
                      <span className="text-sm font-medium text-slate-500">{bookings.length} found</span>
                    </div>
                    
                    {bookings.map((booking, i) => {
                      const status = getStatusDisplay(booking.status);
                      const Icon = status.icon;
                      
                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.1 }}
                          key={booking.id}
                          className="p-6 md:p-8 bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-3xl transition-all shadow-xl group relative overflow-hidden"
                        >
                          {/* Status line indicator */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.color.split(' ')[0].replace('/10', '')}`} />
                          
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-4 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                                  <Icon className="h-3.5 w-3.5" />
                                  {status.label}
                                </span>
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Submitted on {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              
                              <div>
                                <h4 className="text-xl font-black text-white mb-1 tracking-tight flex items-center gap-2">
                                  {booking.event_type || 'General Inquiry'}
                                </h4>
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                  <Music className="h-4 w-4 text-amber-500" />
                                  Artist: <strong className="text-slate-200">{booking.artists?.name || 'Any Available'}</strong>
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 md:items-end min-w-[200px] p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                              <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">{booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-300">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                <span className="font-medium truncate max-w-[160px]">{booking.venue || 'TBD'}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  );
}
