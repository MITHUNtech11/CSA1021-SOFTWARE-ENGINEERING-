import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  GraduationCap, 
  Building, 
  Phone, 
  KeyRound,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { MOCK_USERS } from '../../data/mockUsers.js';

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

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate / PhD', 'Faculty / Staff'];

export default function AuthModal({ isOpen, onClose, initialTab = 'student', onSuccess }) {
  const { login, loginAsDemo, signup, user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'student' | 'admin' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form states
  const [studentForm, setStudentForm] = useState({
    email: 'aditya.nair@college.edu',
    password: 'password123'
  });

  const [adminForm, setAdminForm] = useState({
    email: 'aarav.sharma@college.edu',
    password: 'password123'
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    roll: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'student' // 'student' | 'admin'
  });

  // Sync tab with initialTab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleDemoClick = (mockUser) => {
    try {
      setLoading(true);
      setError(null);
      loginAsDemo(mockUser.id);
      setSuccessMessage(`Signed in as ${mockUser.name} (${mockUser.role === 'admin' ? 'Organizer' : 'Student'})`);
      setTimeout(() => {
        if (onSuccess) onSuccess(mockUser);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!studentForm.email.trim()) {
      setError('Please provide your college email.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(studentForm.email, studentForm.password, 'student');
      setSuccessMessage(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!adminForm.email.trim()) {
      setError('Please provide your organizer / faculty email.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(adminForm.email, adminForm.password, 'admin');
      setSuccessMessage(`Organizer access granted. Welcome, ${res.user.name}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Access verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!signupForm.name.trim() || !signupForm.email.trim()) {
      setError('Full name and college email are required.');
      return;
    }

    if (signupForm.password && signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match. Please check and retry.');
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        name: signupForm.name,
        email: signupForm.email,
        role: signupForm.accountType,
        department: signupForm.department,
        year: signupForm.year,
        roll: signupForm.roll || `STU${Math.floor(1000 + Math.random() * 9000)}`,
        phone: signupForm.phone || '+91 98765 00000'
      });
      setSuccessMessage(`Account created! Welcome to EventFlow, ${res.user.name}.`);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.user);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check form values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200/90 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with vibrant dark gradient and Poppins ExtraBold hierarchy */}
        <div className="p-6 bg-gradient-to-r from-navy-900 via-indigo-950 to-navy-900 text-white relative shrink-0 border-b border-indigo-900/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/25 border border-indigo-400/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Campus Identity & Access
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-light tracking-wide">
            Access your student passes, team registrations, or organizer command console.
          </p>

          {/* Navigation Tabs */}
          <div className="flex bg-navy-950/70 p-1.5 rounded-2xl border border-white/10 mt-5 gap-1">
            <button
              onClick={() => { setActiveTab('student'); setError(null); }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-heading font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              onClick={() => { setActiveTab('admin'); setError(null); }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-heading font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Organizer / Faculty</span>
            </button>

            <button
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-heading font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* Quick 1-Click Demo Personas Strip */}
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-brand-900">
                  Quick 1-Click Demo Personas
                </span>
              </div>
              <span className="text-xs font-medium text-brand-700 bg-brand-100/80 px-2.5 py-0.5 rounded-full">
                Instant Sign-In
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MOCK_USERS.map((mockUser) => {
                const isSelected = currentUser?.id === mockUser.id;
                return (
                  <button
                    key={mockUser.id}
                    onClick={() => handleDemoClick(mockUser)}
                    disabled={loading}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all duration-200 group ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                        : 'bg-white hover:bg-brand-100/50 border-slate-200/90 text-slate-800 hover:border-brand-300'
                    }`}
                  >
                    <img
                      src={mockUser.avatar}
                      alt={mockUser.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white/60 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-heading font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {mockUser.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : mockUser.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {mockUser.role === 'admin' ? 'Admin' : 'Student'}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${isSelected ? 'text-brand-100' : 'text-slate-500'}`}>
                        {mockUser.roleTitle} • {mockUser.department.split('&')[0].trim()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback states */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 font-medium">
                {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 font-medium">
                {successMessage}
              </div>
            </div>
          )}

          {/* TAB 1: Student Login */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                  Student Campus Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="aditya.nair@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs text-slate-800 transition-all shadow-sm"
                  />
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Tip: Use your college-issued domain email (@college.edu)
                </span>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs text-slate-800 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>Remember this device</span>
                </label>
                <span className="text-brand-600 hover:underline cursor-pointer">Forgot password?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-heading font-semibold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 transition-all duration-200 shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: Organizer / Faculty Access */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Restricted to verified Club Leads, Society Presidents, and Faculty Deans for managing campus events and attendee check-ins.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                  Organizer / Faculty Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    placeholder="aarav.sharma@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs text-slate-800 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                  Administrative Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs text-slate-800 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-heading font-semibold text-xs text-white bg-gradient-to-r from-navy-900 via-indigo-900 to-navy-950 hover:from-navy-800 hover:to-indigo-900 transition-all duration-200 shadow-md shadow-navy-950/25 flex items-center justify-center gap-2 border border-indigo-700/40 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating OS Access...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verify & Enter Organizer OS</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: Create Account */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupForm({ ...signupForm, accountType: 'student' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-heading font-semibold flex items-center justify-center gap-2 transition-all ${
                      signupForm.accountType === 'student'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student Attendee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupForm({ ...signupForm, accountType: 'admin' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-heading font-semibold flex items-center justify-center gap-2 transition-all ${
                      signupForm.accountType === 'admin'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Club / Faculty Lead</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    Academic Department
                  </label>
                  <select
                    value={signupForm.department}
                    onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm bg-white"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    Year of Study
                  </label>
                  <select
                    value={signupForm.year}
                    onChange={(e) => setSignupForm({ ...signupForm, year: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm bg-white"
                  >
                    {YEARS.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    Roll / Faculty ID
                  </label>
                  <input
                    type="text"
                    value={signupForm.roll}
                    onChange={(e) => setSignupForm({ ...signupForm, roll: e.target.value })}
                    placeholder="e.g. CS25B2031"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-heading font-semibold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 transition-all duration-200 shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Verified Account</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
