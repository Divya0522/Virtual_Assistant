import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userDataContext } from '../../context/UserContext';
import Logo from '../Logo';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
  FiMessageSquare,
  FiClock,
  FiSliders,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiGlobe,
  FiUser,
  FiVolume2,
  FiVolumeX,
  FiCheck
} from 'react-icons/fi';
import aiGif from '../../assets/ai.gif';

const AppShell = ({ children, assistantStatus = 'idle' }) => {
  const { userData, handleLogout, fetchHistory } = useContext(userDataContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [historyCount, setHistoryCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Assistant preferences
  const [voiceGender, setVoiceGender] = useState(() => localStorage.getItem('va_voice_gender') || 'female');
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('va_lang') || 'en-US');
  const [isVoiceMuted, setIsVoiceMuted] = useState(() => localStorage.getItem('va_voice_muted') === 'true');

  useEffect(() => {
    localStorage.setItem('va_voice_gender', voiceGender);
  }, [voiceGender]);

  useEffect(() => {
    localStorage.setItem('va_lang', selectedLang);
  }, [selectedLang]);

  useEffect(() => {
    localStorage.setItem('va_voice_muted', String(isVoiceMuted));
  }, [isVoiceMuted]);

  useEffect(() => {
    let isMounted = true;
    fetchHistory().then((data) => {
      if (isMounted && data) {
        setHistoryCount(data.length);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchHistory, location.pathname]);

  const navItems = [
    {
      label: 'Assistant',
      path: '/',
      icon: FiMessageSquare
    },
    {
      label: 'History',
      path: '/history',
      icon: FiClock,
      badge: historyCount > 0 ? historyCount : null
    },
    {
      label: 'Customize',
      path: '/customize',
      icon: FiSliders
    }
  ];

  const onConfirmLogout = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setLogoutModalOpen(false);
    await handleLogout();
    navigate('/signin');
  };

  const currentAvatar = userData?.assistantImage || aiGif;
  const assistantName = userData?.assistantName || 'Assistant';
  const langDisplay = selectedLang === 'te-IN' ? 'Telugu' : selectedLang === 'hi-IN' ? 'Hindi' : 'English';
  const langLabel = langDisplay;
  const genderDisplay = voiceGender === 'male' ? 'Male' : 'Female';

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden bg-[#F7F5F0] text-[#252525] flex flex-col lg:flex-row select-none">
      
      {/* Mobile Header Bar */}
      <header className="lg:hidden h-16 shrink-0 px-5 bg-white border-b border-[#E7E3DC] flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-[#6B6862] hover:text-[#252525] hover:bg-[#F7F5F0] cursor-pointer"
            aria-label="Open menu"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <Logo size={28} showText={true} textClassName="text-base font-bold text-[#252525] tracking-tight" />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl text-[#6B6862] hover:text-[#252525] hover:bg-[#F7F5F0] cursor-pointer"
            title="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="p-2 rounded-xl text-[#C96F5A] hover:bg-rose-50 cursor-pointer"
            title="Sign Out"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white border-r border-[#E7E3DC] flex flex-col justify-between p-5 z-10 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#E7E3DC] mb-5">
                <Logo size={30} showText={true} textClassName="text-base font-bold text-[#252525] tracking-tight" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#6B6862] hover:text-[#252525]"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation items */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/assistant');
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#F2ECE6] text-[#252525]'
                          : 'text-[#6B6862] hover:text-[#252525] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#C96F5A]' : 'text-[#8C887F]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#E7E3DC] text-[#252525]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Bottom User & Logout */}
            <div className="pt-4 border-t border-[#E7E3DC] space-y-3">
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F7F5F0] border border-[#E7E3DC] shrink-0">
                  <img src={currentAvatar} alt={assistantName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#252525] truncate">{userData?.name || 'User'}</p>
                  <p className="text-xs text-[#6B6862] truncate">{userData?.email || ''}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLogoutModalOpen(true);
                }}
                className="w-full h-10 rounded-xl border border-[#E7E3DC] text-[#6B6862] hover:text-[#C96F5A] hover:bg-rose-50 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar (240px, Comfortable Typography & Icons) */}
      <aside className="hidden lg:flex w-[240px] shrink-0 h-full bg-white border-r border-[#E7E3DC] flex-col justify-between p-5 z-20">
        
        {/* Top: Identity & Navigation */}
        <div className="space-y-7">
          {/* Brand Header */}
          <div className="px-1 pt-1">
            <Logo size={32} showText={true} textClassName="text-base font-bold text-[#252525] tracking-tight" />
          </div>

          {/* Primary Navigation List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/assistant');
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F2ECE6] text-[#252525] font-bold shadow-2xs'
                      : 'text-[#6B6862] hover:text-[#252525] hover:bg-[#F7F5F0] font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#C96F5A]' : 'text-[#8C887F]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#E7E3DC] text-[#252525]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Assistant Summary + User Profile */}
        <div className="space-y-4 pt-4 border-t border-[#E7E3DC]">
          
          {/* Assistant Info Widget */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7E3DC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#E7E3DC] shrink-0 shadow-2xs">
              <img src={currentAvatar} alt={assistantName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#252525] truncate">
                  {assistantName}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  assistantStatus === 'speaking' ? 'bg-[#C96F5A] animate-pulse' :
                  assistantStatus === 'thinking' ? 'bg-amber-500 animate-ping' :
                  assistantStatus === 'listening' ? 'bg-emerald-500 animate-pulse' :
                  'bg-emerald-500'
                }`} />
              </div>
              <span className="text-xs text-[#6B6862] block truncate mt-0.5">
                {langLabel} · {genderDisplay}
              </span>
            </div>
          </div>

          {/* User Account Row */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#F2ECE6] border border-[#E7E3DC] text-[#C96F5A] flex items-center justify-center text-xs font-bold shrink-0">
                {(userData?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#252525] truncate leading-tight">
                  {userData?.name || 'User'}
                </p>
                <p className="text-xs text-[#6B6862] truncate leading-tight mt-0.5">
                  {userData?.email || ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-xl text-[#8C887F] hover:text-[#252525] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                title="Preferences"
              >
                <FiSettings className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="p-2 rounded-xl text-[#8C887F] hover:text-[#C96F5A] hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <FiLogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 h-full overflow-hidden flex flex-col relative z-10 bg-[#F7F5F0]">
        {children}
      </main>

      {/* Preferences Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Assistant Preferences"
        description="Configure voice output, language, and behavior"
      >
        <div className="space-y-5 pt-1 text-[#252525]">
          {/* Primary Language */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#252525] flex items-center gap-2">
              <FiGlobe className="w-4 h-4 text-[#C96F5A]" />
              <span>Speech Recognition & Output Language</span>
            </label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-white border border-[#E7E3DC] text-sm text-[#252525] focus:outline-none focus:border-[#C96F5A] transition-colors cursor-pointer"
            >
              <option value="en-US">English (United States)</option>
              <option value="te-IN">Telugu (తెలుగు)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
              <option value="auto">Auto-Detect</option>
            </select>
          </div>

          {/* Voice Gender */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#252525] flex items-center gap-2">
              <FiUser className="w-4 h-4 text-[#C96F5A]" />
              <span>Voice Gender</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVoiceGender('female')}
                className={`h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  voiceGender === 'female'
                    ? 'bg-[#C96F5A] text-white shadow-xs'
                    : 'bg-white text-[#6B6862] hover:text-[#252525] border border-[#E7E3DC]'
                }`}
              >
                {voiceGender === 'female' && <FiCheck className="w-4 h-4 stroke-[3]" />}
                <span>Female Voice</span>
              </button>
              <button
                type="button"
                onClick={() => setVoiceGender('male')}
                className={`h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  voiceGender === 'male'
                    ? 'bg-[#C96F5A] text-white shadow-xs'
                    : 'bg-white text-[#6B6862] hover:text-[#252525] border border-[#E7E3DC]'
                }`}
              >
                {voiceGender === 'male' && <FiCheck className="w-4 h-4 stroke-[3]" />}
                <span>Male Voice</span>
              </button>
            </div>
          </div>

          {/* Voice Mute Toggle */}
          <div className="pt-3 border-t border-[#E7E3DC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isVoiceMuted ? (
                <FiVolumeX className="w-5 h-5 text-rose-500" />
              ) : (
                <FiVolume2 className="w-5 h-5 text-[#C96F5A]" />
              )}
              <div>
                <p className="text-sm font-semibold text-[#252525]">Mute Audio Responses</p>
                <p className="text-xs text-[#6B6862]">Only display text in chat without speaking aloud</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsVoiceMuted(!isVoiceMuted)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                isVoiceMuted ? 'bg-[#C96F5A]' : 'bg-[#E7E3DC]'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  isVoiceMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="w-full h-11 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Sign Out"
        description="Are you sure you want to end your current session?"
      >
        <div className="space-y-4 pt-1 text-[#252525]">
          <p className="text-sm text-[#6B6862]">
            You will need to sign in again to interact with your assistant and access past conversation history.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E7E3DC] text-sm font-semibold text-[#6B6862] hover:text-[#252525] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmLogout}
              className="px-4 py-2 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppShell;
