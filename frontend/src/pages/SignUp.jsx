import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import authBg from '../assets/authBg.png';
import Logo from '../components/Logo';

const SignUp = () => {
  const navigate = useNavigate();
  const { serverUrl, setUserData } = useContext(userDataContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name: name.trim(), email: email.trim(), password },
        { withCredentials: true }
      );

      setUserData(result.data);
      setLoading(false);
      toast.success('Account created successfully');
      navigate('/customize');
    } catch (err) {
      setUserData(null);
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] text-[#252525] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative select-none font-sans">
      
      {/* Main Two-Column Card */}
      <div className="relative w-full max-w-4xl bg-white border border-[#E7E3DC] rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 z-10">
        
        {/* Left Column: Full-Bleed authBg Image Showcase */}
        <div className="group relative hidden md:flex flex-col justify-between p-8 sm:p-10 min-h-[600px] overflow-hidden">
          
          {/* Full-bleed background image with subtle hover zoom */}
          <img
            src={authBg}
            alt="Virtual Assistant Platform"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 select-none pointer-events-none"
          />

          {/* Clean legibility gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/80" />

          {/* Top Pill Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/20 backdrop-blur-md shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C96F5A] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                Quick 2-Minute Setup
              </span>
            </div>
          </div>

          {/* Bottom Glassmorphic Card */}
          <div className="relative z-10 space-y-3">
            <div className="p-5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md shadow-lg space-y-1.5">
              <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Personalized AI Workspace
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Choose custom avatars, configure personality names, and command tasks via voice or chat.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 px-1 font-medium">
              <span>Cloud Synchronized</span>
              <span>Always Available</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Registration Form */}
        <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Brand Header */}
          <div className="mb-8 space-y-2">
            <div className="mb-4">
              <Logo size={36} showText={true} textClassName="text-base sm:text-lg font-bold text-[#252525] tracking-tight" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252525] tracking-tight">
              Create an account
            </h1>
            <p className="text-sm sm:text-base text-[#6B6862]">
              Get started with your custom virtual assistant.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-rose-500 hover:text-rose-800 text-sm font-bold cursor-pointer ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#252525] block">
                Full name
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-4 text-[#8C887F] w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#FAF8F5] border border-[#E7E3DC] text-sm sm:text-base text-[#252525] placeholder-[#8C887F] focus:bg-white focus:outline-none focus:border-[#C96F5A] focus:ring-2 focus:ring-[#C96F5A]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#252525] block">
                Email address
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-[#8C887F] w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#FAF8F5] border border-[#E7E3DC] text-sm sm:text-base text-[#252525] placeholder-[#8C887F] focus:bg-white focus:outline-none focus:border-[#C96F5A] focus:ring-2 focus:ring-[#C96F5A]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#252525] block">
                Password
              </label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-[#8C887F] w-5 h-5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full h-12 pl-12 pr-12 rounded-xl bg-[#FAF8F5] border border-[#E7E3DC] text-sm sm:text-base text-[#252525] placeholder-[#8C887F] focus:bg-white focus:outline-none focus:border-[#C96F5A] focus:ring-2 focus:ring-[#C96F5A]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#8C887F] hover:text-[#252525] p-1.5 cursor-pointer focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] active:bg-[#A6513E] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-5 border-t border-[#E7E3DC] text-center">
            <p className="text-sm text-[#6B6862]">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-semibold text-[#C96F5A] hover:text-[#B85E4B] hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;