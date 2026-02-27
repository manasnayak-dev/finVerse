import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { bookAppointment } from '../services/api';

const AdvisorProfile = ({ advisor, user, onBack }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mock available slots for the UI
  const availableSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM'];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Please select a valid date and time slot.');
      return;
    }
    
    setIsBooking(true);
    setError('');
    
    try {
      await bookAppointment(advisor._id, selectedDate, selectedTime, notes);
      setSuccess(true);
    } catch (err) {
      setError(err.error || err.message || 'Failed to book appointment.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-5xl mx-auto pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-semibold transition-colors w-max">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Advisor Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-700/50 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-800 shadow-xl overflow-hidden mb-4">
              {advisor.avatarUrl ? (
                <img src={advisor.avatarUrl} alt={advisor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-cyan-500 bg-cyan-500/10">
                  {advisor.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">{advisor.name}</h2>
            <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
              Verified Partner
            </div>
            
            <div className="w-full pt-4 border-t border-slate-800 flex justify-between text-sm">
              <div className="text-slate-400">Rate</div>
              <div className="text-white font-mono font-bold">${advisor.hourlyRate}/hour</div>
            </div>
            <div className="w-full pt-3 flex justify-between text-sm">
              <div className="text-slate-400">Rating</div>
              <div className="text-amber-400 font-bold">{advisor.rating.toFixed(1)} ⭐</div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-slate-700/50">
            <h3 className="font-bold text-white mb-3">About</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{advisor.bio}</p>
            
            <h3 className="font-bold text-white mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {advisor.expertise.map(exp => (
                <span key={exp} className="px-2 py-1 bg-slate-800/80 text-slate-300 text-xs rounded border border-slate-700">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking System */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl p-8 border border-slate-700/50">
            <h2 className="text-2xl font-extrabold text-white mb-6">Schedule a Session</h2>
            
            {success ? (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/30">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Your appointment with {advisor.name} on {selectedDate} at {selectedTime} has been successfully scheduled.
                </p>
                <button onClick={onBack} className="mt-8 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold transition-colors">
                  Return to Directory
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-6">
                {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> Select Date
                    </label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Available Slots
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
                            selectedTime === slot 
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Meeting Notes (Optional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe what you'd like to discuss..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors h-32 resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isBooking || !selectedDate || !selectedTime}
                    className="px-8 py-3.5 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
                  >
                    {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvisorProfile;
