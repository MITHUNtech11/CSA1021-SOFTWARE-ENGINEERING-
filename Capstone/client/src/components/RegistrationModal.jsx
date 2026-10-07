import React, { useState } from 'react';
import { X, User, Mail, Phone, Building, BookOpen, GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering',
  'Mechatronics & Robotics',
  'Civil & Structural Engineering',
  'Biotechnology / Biomedical',
  'Management & Business Studies',
  'Media, Arts & Humanities'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate / PhD'];

export default function RegistrationModal({ event, isOpen, onClose, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    participant_name: '',
    email: '',
    phone: '',
    college: 'Campus University of Technology',
    department: 'Computer Science & Engineering',
    year_of_study: '3rd Year'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.participant_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const ticket = await api.registerForEvent(event.id, formData);
      onRegistrationSuccess(ticket);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please check capacity or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/80 my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-navy-900 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-heading font-bold uppercase tracking-wider bg-brand-500/30 text-brand-300 border border-brand-500/40 mb-2">
            Attendee Registration
          </span>

          <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
            {event.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
            <span>📅 {event.date}</span>
            <span>📍 {event.venue}</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.participant_name}
                onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
                placeholder="e.g. Aditya Nair"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                College Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* College / Institution */}
          <div>
            <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
              College / University *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. Campus University of Technology"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Department & Year Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Department *
              </label>
              <div className="relative">
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                Year of Study *
              </label>
              <div className="relative">
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notice info */}
          <p className="text-[11px] text-slate-500 pt-1">
            By registering, a unique digital QR pass will be issued immediately for access at the venue entrance.
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing Pass...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Get Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
