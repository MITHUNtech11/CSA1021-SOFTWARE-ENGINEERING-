import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, BookOpen, GraduationCap, ArrowRight, Loader2, AlertCircle, Sparkles, UserCheck, Users, RotateCcw } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/useAuth.js';

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
  const { user } = useAuth();
  const [isPeerRegistration, setIsPeerRegistration] = useState(false);
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

  const populateUserData = () => {
    if (user) {
      setFormData({
        participant_name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+91 98765 43210',
        college: user.college || 'Campus University of Technology',
        department: user.department || 'Computer Science & Engineering',
        year_of_study: user.year && YEARS.includes(user.year) ? user.year : '3rd Year'
      });
      setIsPeerRegistration(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (user) {
        populateUserData();
      } else {
        setFormData({
          participant_name: '',
          email: '',
          phone: '+91 ',
          college: 'Campus University of Technology',
          department: 'Computer Science & Engineering',
          year_of_study: '1st Year'
        });
        setIsPeerRegistration(false);
      }
    }
  }, [isOpen, user]);

  if (!isOpen || !event) return null;

  const handleSwitchToPeer = () => {
    setIsPeerRegistration(true);
    setFormData({
      participant_name: '',
      email: '',
      phone: '+91 ',
      college: user?.college || 'Campus University of Technology',
      department: user?.department || 'Computer Science & Engineering',
      year_of_study: user?.year || '3rd Year'
    });
  };

  const handleResetToSelf = () => {
    populateUserData();
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/90 my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-navy-900 via-navy-950 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/30 text-brand-300 border border-brand-500/40 shadow-sm">
              Attendee Registration
            </span>
            {user && !isPeerRegistration && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Auto-Filled</span>
              </span>
            )}
          </div>

          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
            {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mt-2 font-normal">
            <span>📅 {event.date}</span>
            <span>📍 {event.venue}</span>
          </div>
        </div>

        {/* Personalized Student Context Pill or Peer Switcher */}
        {user && (
          <div className="bg-brand-50/70 border-b border-brand-100 p-4 px-6 flex items-center justify-between gap-3 text-xs sm:text-sm">
            {!isPeerRegistration ? (
              <>
                <div className="flex items-center gap-2 text-brand-900 font-medium truncate">
                  <UserCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="truncate">
                    Registering for <strong className="font-bold text-slate-900">{user.name}</strong> ({user.roll || user.department})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchToPeer}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-900 underline shrink-0 transition-colors flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Register for a peer</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-indigo-900 font-medium truncate">
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">Registering for a Classmate / Peer</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetToSelf}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline shrink-0 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Use my details</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Attendee Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.participant_name}
                onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
                placeholder="e.g. Aditya Nair"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                College Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* College / Institution */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              College / University *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. Campus University of Technology"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Department & Year Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Department *
              </label>
              <div className="relative">
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 cursor-pointer shadow-2xs"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Year of Study *
              </label>
              <div className="relative">
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 cursor-pointer shadow-2xs"
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notice info */}
          <p className="text-xs sm:text-sm text-slate-500 pt-1 font-normal leading-relaxed">
            Upon confirmation, an official digital QR boarding pass will be issued immediately.
          </p>

          {/* Action buttons with prominent Confirm & Issue Pass */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-heading font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-lg shadow-brand-600/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing Pass...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Issue Pass</span>
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
