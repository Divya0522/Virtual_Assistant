import React, { useRef, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import AppShell from '../components/layout/AppShell';
import Card from '../components/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import axios from 'axios';
import { toast } from 'react-toastify';
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/authBg.png';
import image4 from '../assets/image4.png';
import image5 from '../assets/image5.png';
import image6 from '../assets/image6.jpeg';
import image7 from '../assets/image7.jpeg';
import aiGif from '../assets/ai.gif';
import {
  FiCheck,
  FiUploadCloud,
  FiSliders,
  FiUser,
  FiGlobe,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi';

const Customize = () => {
  const inputImageRef = useRef(null);
  const navigate = useNavigate();
  const {
    userData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    serverUrl,
    setUserData
  } = useContext(userDataContext);

  const [activeStep, setActiveStep] = useState(1); // 1 = Avatar, 2 = Identity & Preferences
  const [assistantName, setAssistantName] = useState(userData?.assistantName || 'Assistant');
  const [voiceGender, setVoiceGender] = useState(() => localStorage.getItem('va_voice_gender') || 'female');
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('va_lang') || 'en-US');
  const [isVoiceMuted, setIsVoiceMuted] = useState(() => localStorage.getItem('va_voice_muted') === 'true');
  const [loading, setLoading] = useState(false);

  // Auto-select current image or default image1
  useEffect(() => {
    if (!selectedImage) {
      if (userData?.assistantImage) {
        setSelectedImage(userData.assistantImage);
      } else {
        setSelectedImage(image1);
      }
    }
  }, [selectedImage, userData, setSelectedImage]);

  useEffect(() => {
    if (userData?.assistantName) {
      setAssistantName(userData.assistantName);
    }
  }, [userData]);

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
    setSelectedImage('input');
  };

  const nameSuggestions = ['Siri', 'Jarvis', 'Friday', 'Nova', 'Aria', 'Atlas', 'Cortana'];

  const previewAvatarSrc =
    frontendImage ||
    (selectedImage && selectedImage !== 'input' ? selectedImage : userData?.assistantImage || image1);

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    if (!assistantName.trim() || loading) return;

    setLoading(true);

    try {
      // Save local preferences
      localStorage.setItem('va_voice_gender', voiceGender);
      localStorage.setItem('va_lang', selectedLang);
      localStorage.setItem('va_voice_muted', String(isVoiceMuted));

      // Save to backend
      const formData = new FormData();
      formData.append('assistantName', assistantName.trim());

      if (backendImage) {
        formData.append('assistantImage', backendImage);
      } else if (selectedImage && selectedImage !== 'input') {
        formData.append('imageUrl', selectedImage);
      }

      const result = await axios.post(`${serverUrl}/api/user/update`, formData, {
        withCredentials: true
      });

      setUserData(result.data);
      toast.success('Assistant updated successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to update assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col overflow-hidden bg-[#F7F5F0]">
        
        {/* Page Top Header */}
        <header className="shrink-0 px-6 sm:px-8 py-5 border-b border-[#E7E3DC] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252525] tracking-tight">
              Assistant Customization
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6862] mt-0.5">
              Personalize your assistant's visual avatar, display name, and voice preferences.
            </p>
          </div>

          {/* Step Pill Navigation */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F7F5F0] border border-[#E7E3DC] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeStep === 1
                  ? 'bg-[#C96F5A] text-white shadow-xs'
                  : 'text-[#6B6862] hover:text-[#252525]'
              }`}
            >
              1. Visual Persona
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeStep === 2
                  ? 'bg-[#C96F5A] text-white shadow-xs'
                  : 'text-[#6B6862] hover:text-[#252525]'
              }`}
            >
              2. Name & Voice
            </button>
          </div>
        </header>

        {/* Content Body: Seamless Studio Sections (No Disjointed Floating Cards) */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
          
          {/* Left Section: Customization Options Section (7 cols) */}
          <section className="lg:col-span-7 h-auto lg:h-full overflow-y-auto bg-white border-b lg:border-b-0 lg:border-r border-[#E7E3DC] p-5 sm:p-6 lg:p-8 flex flex-col">
            <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-start">
              
              {/* Step 1: Avatar Persona Options */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Preset Avatar Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5 sm:gap-4">
                    <Card image={image1} />
                    <Card image={image2} />
                    <Card image={image3} />
                    <Card image={image4} />
                    <Card image={image5} />
                    <Card image={image6} />
                    <Card image={image7} />

                    {/* Upload Tile */}
                    <div
                      onClick={() => inputImageRef.current?.click()}
                      className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-3 border-2 ${
                        selectedImage === 'input' && frontendImage
                          ? 'border-[#C96F5A] ring-4 ring-[#C96F5A]/20 bg-white'
                          : 'border-dashed border-[#E7E3DC] hover:border-[#C96F5A] bg-[#FAF8F5]'
                      }`}
                    >
                      {frontendImage ? (
                        <>
                          <img
                            src={frontendImage}
                            alt="Custom uploaded avatar"
                            className="w-full h-full object-cover select-none pointer-events-none"
                          />
                          {selectedImage === 'input' && (
                            <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#C96F5A] text-white flex items-center justify-center shadow-xs">
                              <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-[#8C887F] group-hover:text-[#C96F5A] text-center">
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#E7E3DC] flex items-center justify-center shadow-xs">
                            <FiUploadCloud className="w-5 h-5 text-[#C96F5A]" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-[#252525]">Custom</span>
                          <span className="text-[11px] text-[#6B6862]">Upload File</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={inputImageRef}
                    hidden
                    onChange={handleCustomUpload}
                  />

                  {/* Step 1 Actions directly underneath */}
                  <div className="pt-5 mt-5 border-t border-[#E7E3DC] flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="h-11 sm:h-12 px-6 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] text-white text-sm sm:text-base font-semibold flex items-center gap-2.5 shadow-md shadow-[#C96F5A]/20 transition-all cursor-pointer"
                    >
                      <span>Next: Name & Voice</span>
                      <FiArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Identity & Voice Preferences */}
              {activeStep === 2 && (
                <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#252525] flex items-center justify-between">
                      <span>Assistant Name</span>
                      <span className="text-xs text-[#8C887F] font-normal">Display name for your assistant</span>
                    </label>
                    
                    <div className="relative flex items-center">
                      <div className="absolute left-4 pointer-events-none text-[#8C887F]">
                        <FiUser className="w-5 h-5 text-[#C96F5A]" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Siri, Jarvis, Friday, Nova"
                        value={assistantName}
                        onChange={(e) => setAssistantName(e.target.value)}
                        className="w-full h-11 sm:h-12 pl-12 pr-4 rounded-xl bg-white border border-[#E7E3DC] hover:border-[#D5D0C7] focus:border-[#C96F5A] focus:ring-2 focus:ring-[#C96F5A]/20 text-sm sm:text-base text-[#252525] placeholder-[#8C887F] transition-all focus:outline-none"
                      />
                    </div>

                    {/* Quick suggestion pills */}
                    <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                      <span className="text-xs text-[#8C887F] mr-1">Suggestions:</span>
                      {nameSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setAssistantName(sug)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            assistantName === sug
                              ? 'bg-[#C96F5A] text-white shadow-2xs'
                              : 'bg-[#FAF8F5] text-[#6B6862] hover:text-[#252525] hover:bg-[#F2ECE6] border border-[#E7E3DC]'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Gender */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#252525] flex items-center justify-between">
                      <span>Synthesized Voice Gender</span>
                      <span className="text-xs text-[#8C887F] font-normal">Speech output timbre</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVoiceGender('female')}
                        className={`h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                          voiceGender === 'female'
                            ? 'bg-[#C96F5A] text-white border-[#C96F5A] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#252525] hover:bg-[#F2ECE6] border-[#E7E3DC]'
                        }`}
                      >
                        {voiceGender === 'female' && <FiCheck className="w-4 h-4 stroke-[3]" />}
                        <span>Female Voice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceGender('male')}
                        className={`h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                          voiceGender === 'male'
                            ? 'bg-[#C96F5A] text-white border-[#C96F5A] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#252525] hover:bg-[#F2ECE6] border-[#E7E3DC]'
                        }`}
                      >
                        {voiceGender === 'male' && <FiCheck className="w-4 h-4 stroke-[3]" />}
                        <span>Male Voice</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Language */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#252525] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FiGlobe className="w-4 h-4 text-[#C96F5A]" />
                        <span>Speech & Conversation Language</span>
                      </span>
                      <span className="text-xs text-[#8C887F] font-normal">Recognition & synthesis</span>
                    </label>
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="w-full h-11 sm:h-12 px-4 rounded-xl bg-white border border-[#E7E3DC] hover:border-[#D5D0C7] text-sm sm:text-base text-[#252525] focus:outline-none focus:border-[#C96F5A] focus:ring-2 focus:ring-[#C96F5A]/20 transition-all cursor-pointer"
                    >
                      <option value="en-US">English (United States)</option>
                      <option value="te-IN">Telugu (తెలుగు)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="auto">Auto-Detect</option>
                    </select>
                  </div>

                  {/* Voice Output Audio Mode */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#252525] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FiVolume2 className="w-4 h-4 text-[#C96F5A]" />
                        <span>Audio Output Mode</span>
                      </span>
                      <span className="text-xs text-[#8C887F] font-normal">Voice responses</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsVoiceMuted(false)}
                        className={`h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                          !isVoiceMuted
                            ? 'bg-[#C96F5A] text-white border-[#C96F5A] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#252525] hover:bg-[#F2ECE6] border-[#E7E3DC]'
                        }`}
                      >
                        <FiVolume2 className="w-4 h-4" />
                        <span>Speak Responses</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVoiceMuted(true)}
                        className={`h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                          isVoiceMuted
                            ? 'bg-[#C96F5A] text-white border-[#C96F5A] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#252525] hover:bg-[#F2ECE6] border-[#E7E3DC]'
                        }`}
                      >
                        <FiVolumeX className="w-4 h-4" />
                        <span>Silent (Text Only)</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2 Actions directly underneath */}
                  <div className="pt-5 mt-5 border-t border-[#E7E3DC] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="h-11 sm:h-12 px-5 rounded-xl border border-[#E7E3DC] text-sm sm:text-base font-semibold text-[#252525] hover:bg-[#FAF8F5] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      <span>Back to Avatars</span>
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSaveAll}
                      className="h-11 sm:h-12 px-6 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] text-white text-sm sm:text-base font-semibold flex items-center gap-2.5 shadow-md shadow-[#C96F5A]/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiCheckCircle className="w-5 h-5" />
                          <span>Save & Launch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Section: Live Persona Preview Stage (5 cols, Rich Warm Light Orange Tone) */}
          <section className="lg:col-span-5 h-auto lg:h-full overflow-y-auto bg-gradient-to-b from-[#FFF5ED] via-[#FDEEE3] to-[#FCE7D8] p-5 sm:p-6 lg:p-8 flex flex-col justify-between items-center text-center shrink-0">
            {/* Top Badge */}
            <div>
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-[#C96F5A] border border-[#F2D7C8] shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C96F5A] animate-pulse" />
                <span>Live Persona Preview</span>
              </span>
            </div>

            {/* Center Avatar & Info */}
            <div className="my-auto py-6 flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white ring-8 ring-[#C96F5A]/15 shadow-xl bg-white flex items-center justify-center">
                  <img
                    src={previewAvatarSrc}
                    alt="Assistant Avatar Preview"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-w-xs text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-[#252525] tracking-tight truncate">
                  {assistantName.trim() || 'My Assistant'}
                </h3>
                <p className="text-sm font-medium text-[#7C6C63]">
                  {voiceGender === 'female' ? 'Female Voice' : 'Male Voice'} ·{' '}
                  {selectedLang === 'te-IN'
                    ? 'Telugu'
                    : selectedLang === 'hi-IN'
                    ? 'Hindi'
                    : 'English'}
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 text-[#C96F5A] border border-[#F0D6C8]">
                  {isVoiceMuted ? 'Muted (Text Only)' : 'Voice Responses Active'}
                </span>
              </div>
            </div>

            {/* Bottom Quick Save CTA */}
            <div className="w-full max-w-sm pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveAll}
                className="w-full h-12 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 shadow-md shadow-[#C96F5A]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default Customize;