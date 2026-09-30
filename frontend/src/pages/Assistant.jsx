import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { userDataContext } from '../context/UserContext';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import aiGif from '../assets/ai.gif';
import userGif from '../assets/user.gif';
import {
  FiMic,
  FiMicOff,
  FiVolume2,
  FiVolumeX,
  FiSend,
  FiMessageSquare,
  FiTrash2
} from 'react-icons/fi';

const Assistant = () => {
  const { userData, getGeminiResponse, fetchHistory } = useContext(userDataContext);

  // Assistant states
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(() => localStorage.getItem('va_voice_muted') === 'true');
  const [chatMessages, setChatMessages] = useState([]);

  // Audio coordination refs
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isMicActiveRef = useRef(false);
  const lastSpokenTextRef = useRef('');
  const lastSpokenTimeRef = useRef(0);
  const speechTimeoutRef = useRef(null);
  const currentSpeechRef = useRef('');

  useEffect(() => {
    isMicActiveRef.current = isMicActive;
  }, [isMicActive]);

  // Sync mute setting from storage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsVoiceMuted(localStorage.getItem('va_voice_muted') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, status]);

  // Automatically open target URL in a new tab and bring it to focus
  const openTargetUrl = useCallback((url) => {
    if (!url) return;
    try {
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.warn('Could not open tab:', e);
    }
  }, []);

  // Map assistant response action type to URL & Label
  const resolveAction = useCallback((data) => {
    if (!data) return null;
    const type = (data.type || '').toLowerCase().replace(/[-_]/g, '');
    const rawInput = (data.userInput || '').trim();

    // Check if user is asking to simply open/launch the app/service
    const isOpenCommand = (text) => {
      if (!text) return true;
      const cleaned = text
        .toLowerCase()
        .replace(/^(can you|could you|please|kindly|i want you to|would you)?\s*(open|launch|start|go to|show me|take me to|navigate to)?\s*(the)?\s*/gi, '')
        .replace(/\s*(please|for me|app|website|page|site|web|tab)?$/gi, '')
        .replace(/[.,?!]/g, '')
        .trim();
      return cleaned.length === 0;
    };

    // Extract subject/content when user explicitly asks to play or search something
    const extractQuery = (text, serviceKeywords = []) => {
      let q = (text || '').trim();
      q = q.replace(/^(can you|could you|please|kindly|i want you to|would you)\s*/gi, '');
      q = q.replace(/^(play|search|find|show|listen to|look for|open)\s*/gi, '');
      serviceKeywords.forEach((kw) => {
        q = q.replace(new RegExp(`\\b(on|in|from|at)?\\s*${kw}\\b`, 'gi'), '');
      });
      q = q.replace(/\s*(please|for me|now)$/gi, '');
      return q.replace(/^[":'\s]+|[":'\s]+$/g, '').trim();
    };

    // YouTube Handling
    if (type.includes('youtube') || type.includes('channel') || rawInput.toLowerCase().includes('youtube')) {
      // Check for specific channel requests
      if (type.includes('channel') || rawInput.toLowerCase().includes('channel')) {
        const channelQuery = extractQuery(rawInput, ['youtube', 'channel']);
        if (channelQuery) {
          return {
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(channelQuery + ' channel')}`,
            label: `Open ${channelQuery} Channel ↗`
          };
        }
        return {
          url: 'https://www.youtube.com',
          label: 'Open YouTube ↗'
        };
      }

      // Check for simple "open youtube" intent
      const cleanYouTubeInput = rawInput.toLowerCase().replace(/youtube/gi, '').trim();
      if (isOpenCommand(cleanYouTubeInput) || type === 'openyoutube' || type === 'youtubeopen') {
        return {
          url: 'https://www.youtube.com',
          label: 'Open YouTube ↗'
        };
      }

      // Specific video or song to play/search
      const videoQuery = extractQuery(rawInput, ['youtube', 'yt']);
      if (videoQuery && videoQuery.toLowerCase() !== 'open') {
        return {
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`,
          label: `Play "${videoQuery}" on YouTube ↗`
        };
      }

      return {
        url: 'https://www.youtube.com',
        label: 'Open YouTube ↗'
      };
    }

    // Google Handling
    if (type.includes('google')) {
      const cleanGoogleInput = rawInput.toLowerCase().replace(/google/gi, '').trim();
      if (isOpenCommand(cleanGoogleInput) || type === 'opengoogle') {
        return {
          url: 'https://www.google.com',
          label: 'Open Google ↗'
        };
      }
      const searchQuery = extractQuery(rawInput, ['google']);
      if (searchQuery) {
        return {
          url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
          label: `Google Search: "${searchQuery}" ↗`
        };
      }
      return {
        url: 'https://www.google.com',
        label: 'Open Google ↗'
      };
    }

    // Gmail / Mail
    if (type.includes('mail') || type.includes('gmail')) {
      return {
        url: 'https://mail.google.com',
        label: 'Open Gmail Inbox ↗'
      };
    }

    // LinkedIn
    if (type.includes('linkedin')) {
      const cleanLinkedinInput = rawInput.toLowerCase().replace(/linkedin/gi, '').trim();
      if (isOpenCommand(cleanLinkedinInput)) {
        return {
          url: 'https://www.linkedin.com',
          label: 'Open LinkedIn ↗'
        };
      }
      const searchQuery = extractQuery(rawInput, ['linkedin']);
      if (searchQuery) {
        return {
          url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(searchQuery)}`,
          label: `Search LinkedIn for "${searchQuery}" ↗`
        };
      }
      return {
        url: 'https://www.linkedin.com',
        label: 'Open LinkedIn ↗'
      };
    }

    // Spotify
    if (type.includes('spotify')) {
      const cleanSpotifyInput = rawInput.toLowerCase().replace(/spotify/gi, '').trim();
      if (isOpenCommand(cleanSpotifyInput)) {
        return {
          url: 'https://open.spotify.com',
          label: 'Open Spotify ↗'
        };
      }
      const songQuery = extractQuery(rawInput, ['spotify']);
      if (songQuery) {
        return {
          url: `https://open.spotify.com/search/${encodeURIComponent(songQuery)}`,
          label: `Play "${songQuery}" on Spotify ↗`
        };
      }
      return {
        url: 'https://open.spotify.com',
        label: 'Open Spotify ↗'
      };
    }

    // GitHub
    if (type.includes('github')) {
      const cleanGithubInput = rawInput.toLowerCase().replace(/github/gi, '').trim();
      if (isOpenCommand(cleanGithubInput)) {
        return {
          url: 'https://github.com',
          label: 'Open GitHub ↗'
        };
      }
      const repoQuery = extractQuery(rawInput, ['github']);
      if (repoQuery) {
        return {
          url: `https://github.com/search?q=${encodeURIComponent(repoQuery)}`,
          label: `Search GitHub for "${repoQuery}" ↗`
        };
      }
      return {
        url: 'https://github.com',
        label: 'Open GitHub ↗'
      };
    }

    // WhatsApp
    if (type.includes('whatsapp')) {
      return {
        url: 'https://web.whatsapp.com',
        label: 'Open WhatsApp Web ↗'
      };
    }

    // Calculator
    if (type.includes('calculator')) {
      return {
        url: 'https://www.google.com/search?q=calculator',
        label: 'Open Calculator ↗'
      };
    }

    // Weather
    if (type.includes('weather')) {
      const city = extractQuery(rawInput, ['weather', 'forecast']);
      return {
        url: `https://www.google.com/search?q=weather+${encodeURIComponent(city || 'today')}`,
        label: `Check Weather${city ? ` for "${city}"` : ''} ↗`
      };
    }

    return null;
  }, []);

  // Text-To-Speech (TTS) Voice Engine
  const speak = useCallback((text, targetLang) => {
    const selectedGender = localStorage.getItem('va_voice_gender') || 'female';
    const activeLang = targetLang || localStorage.getItem('va_lang') || 'en-US';
    const muted = localStorage.getItem('va_voice_muted') === 'true';

    if (!window.speechSynthesis || !text || muted) {
      isProcessingRef.current = false;
      isSpeakingRef.current = false;
      if (isMicActiveRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
      setStatus(isMicActiveRef.current ? 'listening' : 'idle');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;
    lastSpokenTextRef.current = text.toLowerCase().trim();
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    let langCode = activeLang;
    if (activeLang === 'auto' || !langCode) {
      if (/[\u0C00-\u0C7F]/.test(text)) langCode = 'te-IN';
      else if (/[\u0900-\u097F]/.test(text)) langCode = 'hi-IN';
      else langCode = 'en-US';
    }

    utterance.lang = langCode;
    const langPrefix = langCode.split('-')[0].toLowerCase();
    const matchingVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

    if (matchingVoices.length > 0) {
      let matchedVoice = null;
      if (selectedGender === 'female') {
        matchedVoice = matchingVoices.find((v) =>
          /female|zira|heera|kalpana|samantha|kavya|veena|victoria/i.test(v.name)
        ) || matchingVoices[0];
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
      } else {
        matchedVoice = matchingVoices.find((v) =>
          /male|david|mark|george|valluvar|ravi|prabhat/i.test(v.name)
        ) || matchingVoices[matchingVoices.length - 1];
        utterance.pitch = 0.90;
        utterance.rate = 0.96;
      }
      if (matchedVoice) utterance.voice = matchedVoice;
    }

    const onFinish = () => {
      lastSpokenTimeRef.current = Date.now();
      setTimeout(() => {
        isSpeakingRef.current = false;
        isProcessingRef.current = false;
        if (isMicActiveRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (e) {}
        }
        setStatus(isMicActiveRef.current ? 'listening' : 'idle');
      }, 700);
    };

    utterance.onend = onFinish;
    utterance.onerror = onFinish;

    const safetyTimeout = Math.max(3000, (text.length / 10) * 1000 + 2000);
    setTimeout(() => {
      if (isSpeakingRef.current) onFinish();
    }, safetyTimeout);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Process text or spoken query
  const processCommand = useCallback(async (commandText) => {
    const trimmed = (commandText || '').trim();
    if (!trimmed) return;

    if (isProcessingRef.current || isSpeakingRef.current) return;
    isProcessingRef.current = true;

    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setLiveTranscript('');
    setStatus('thinking');

    try {
      const data = await getGeminiResponse(trimmed);
      if (data) {
        const reply = data.response || 'Task completed.';
        const action = resolveAction(data);

        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: reply,
            actionLink: action,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        speak(reply, data.lang);
        if (action?.url) {
          openTargetUrl(action.url);
        }
        fetchHistory();
      } else {
        const fallback = 'I was unable to process that request. Please try again.';
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: fallback,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        speak(fallback);
      }
    } catch (err) {
      const fallback = 'An error occurred while connecting to the assistant.';
      speak(fallback);
    }
  }, [getGeminiResponse, speak, resolveAction, openTargetUrl, fetchHistory]);

  // Speech Recognition Initializer
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    const storedLang = localStorage.getItem('va_lang') || 'en-US';
    recognition.lang = storedLang === 'auto' ? 'en-US' : storedLang;
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      if (isSpeakingRef.current || isProcessingRef.current) return;
      if (Date.now() - lastSpokenTimeRef.current < 1200) return;

      let interim = '';
      let final = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += text + ' ';
        else interim += text + ' ';
      }

      const activeText = (final || interim).trim();
      if (!activeText) return;

      // Echo suppression
      const cleanTranscript = activeText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();
      const cleanLastSpoken = (lastSpokenTextRef.current || '').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();

      if (cleanLastSpoken && cleanTranscript) {
        if (cleanLastSpoken.includes(cleanTranscript) || cleanTranscript.includes(cleanLastSpoken)) {
          return;
        }
      }

      setLiveTranscript(activeText);
      currentSpeechRef.current = activeText;

      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

      const triggerCommand = () => {
        const candidate = currentSpeechRef.current.trim();
        if (!candidate) return;
        setLiveTranscript('');
        currentSpeechRef.current = '';
        processCommand(candidate);
      };

      speechTimeoutRef.current = setTimeout(triggerCommand, final.trim().length > 0 ? 500 : 1200);
    };

    recognition.onerror = () => {};
    recognition.onstart = () => {
      if (!isSpeakingRef.current && !isProcessingRef.current) {
        setStatus('listening');
      }
    };
    recognition.onend = () => {
      if (isMicActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
        try { recognition.start(); } catch (e) {}
      } else if (!isSpeakingRef.current && !isProcessingRef.current) {
        setStatus('idle');
      }
    };

    if (isMicActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
      try { recognition.start(); } catch (e) {}
    }

    return () => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      try { recognition.abort(); } catch (e) {}
    };
  }, [processCommand]);

  // Toggle Microphone
  const toggleMic = () => {
    if (isMicActive) {
      setIsMicActive(false);
      isMicActiveRef.current = false;
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      setLiveTranscript('');
      setStatus('idle');
    } else {
      setIsMicActive(true);
      isMicActiveRef.current = true;
      if (!isSpeakingRef.current && !isProcessingRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
      setStatus('listening');
    }
  };

  // Submit typed chat message
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    processCommand(text);
  };

  const currentAvatarSrc =
    status === 'listening'
      ? userGif
      : status === 'thinking' || status === 'speaking'
      ? aiGif
      : userData?.assistantImage || aiGif;

  const assistantName = userData?.assistantName || 'Assistant';

  return (
    <AppShell assistantStatus={status}>
      <div className="h-full flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-[#F7F5F0]">
        
        {/* Middle Column: Visual AI Stage with Elegant Light Orange Shade (5 cols) */}
        <section className="lg:col-span-5 h-auto lg:h-full border-b lg:border-b-0 lg:border-r border-[#E7E3DC] bg-gradient-to-b from-[#FFF7F2] via-[#FDF2EA] to-[#FBF0E6] p-6 sm:p-8 flex flex-col justify-between items-center shrink-0 relative">
          
          {/* Stage Top Bar: Status Badge & Sound Mute Toggle */}
          <div className="w-full flex items-center justify-between">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/85 backdrop-blur-xs text-[#C96F5A] border border-[#F2D7C8] shadow-2xs flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                status === 'speaking' ? 'bg-[#C96F5A] animate-pulse' :
                status === 'thinking' ? 'bg-amber-500 animate-ping' :
                status === 'listening' ? 'bg-emerald-500 animate-pulse' :
                'bg-emerald-500'
              }`} />
              <span>
                {status === 'speaking' ? 'Speaking Response' :
                 status === 'thinking' ? 'Processing...' :
                 status === 'listening' ? 'Listening...' : 'Ready'}
              </span>
            </span>

            <button
              type="button"
              onClick={() => {
                const next = !isVoiceMuted;
                setIsVoiceMuted(next);
                localStorage.setItem('va_voice_muted', String(next));
              }}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isVoiceMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white/90 border-[#F2D7C8] text-[#8C887F] hover:text-[#252525] hover:bg-white shadow-2xs'
              }`}
              title={isVoiceMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isVoiceMuted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Stage: Hologram Avatar & Waveform */}
          <div className="my-auto py-6 flex flex-col items-center">
            
            {/* Avatar Frame with warm aura */}
            <div className="relative">
              <div
                onClick={toggleMic}
                title={isMicActive ? 'Click to deactivate microphone' : 'Click to activate microphone'}
                className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 cursor-pointer transition-all duration-300 bg-white flex items-center justify-center shadow-xl ${
                  status === 'speaking' ? 'border-[#C96F5A] ring-8 ring-[#C96F5A]/25 scale-105 shadow-2xl' :
                  status === 'thinking' ? 'border-amber-400 ring-8 ring-amber-400/25' :
                  status === 'listening' ? 'border-emerald-500 ring-8 ring-emerald-500/25 scale-105' :
                  'border-white ring-8 ring-[#C96F5A]/15 hover:ring-[#C96F5A]/25 hover:scale-[1.02]'
                }`}
              >
                <img
                  src={currentAvatarSrc}
                  alt={assistantName}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Audio Waveform Graphic */}
            <div className="flex items-center justify-center gap-1.5 mt-6 h-6">
              {[30, 70, 45, 85, 60, 95, 50, 75, 40].map((h, i) => (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    status === 'speaking' ? 'bg-[#C96F5A] animate-pulse' :
                    status === 'listening' ? 'bg-emerald-500 animate-bounce' :
                    'bg-[#E5D2C5]'
                  }`}
                  style={{
                    height: status === 'speaking' || status === 'listening' ? `${h}%` : '25%',
                    animationDelay: `${i * 80}ms`
                  }}
                />
              ))}
            </div>

            {/* Status Caption */}
            <div className="mt-4 min-h-[36px] flex items-center justify-center px-4 max-w-sm text-center">
              {status === 'speaking' ? (
                <p className="text-sm text-[#C96F5A] font-semibold">Speaking response...</p>
              ) : status === 'thinking' ? (
                <p className="text-sm text-amber-600 font-semibold">Processing query...</p>
              ) : status === 'listening' ? (
                <p className="text-sm text-emerald-600 font-semibold truncate">
                  {liveTranscript ? `"${liveTranscript}"` : 'Listening... speak now'}
                </p>
              ) : (
                <p className="text-sm text-[#7C6C63] font-medium">
                  Tap microphone below or ask in chat
                </p>
              )}
            </div>
          </div>

          {/* Master Voice Trigger Button */}
          <div className="w-full flex justify-center pt-2">
            <button
              type="button"
              onClick={toggleMic}
              className={`h-12 px-7 rounded-xl flex items-center gap-2.5 text-sm sm:text-base font-semibold tracking-wide transition-all shadow-md cursor-pointer ${
                isMicActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                  : 'bg-[#C96F5A] hover:bg-[#B85E4B] text-white shadow-[#C96F5A]/25'
              }`}
            >
              {isMicActive ? (
                <>
                  <FiMic className="w-5 h-5 animate-pulse" />
                  <span>Microphone Active</span>
                </>
              ) : (
                <>
                  <FiMicOff className="w-5 h-5" />
                  <span>Activate Voice</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Conversational Workspace (7 cols) */}
        <section className="lg:col-span-7 h-full min-h-0 flex flex-col justify-between overflow-hidden bg-[#F7F5F0]">
          
          {/* Conversation Header */}
          <div className="h-14 px-6 sm:px-8 border-b border-[#E7E3DC] bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <FiMessageSquare className="w-4 h-4 text-[#C96F5A]" />
              <h2 className="text-xs sm:text-sm font-bold text-[#252525] uppercase tracking-wider">
                Interactive Session
              </h2>
            </div>

            {chatMessages.length > 0 && (
              <button
                type="button"
                onClick={() => setChatMessages([])}
                className="text-xs font-semibold text-[#8C887F] hover:text-[#C96F5A] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-8 space-y-5">
            {chatMessages.length === 0 ? (
              <EmptyState
                icon={FiMessageSquare}
                title={`How can ${assistantName} assist you today?`}
                description=""
              />
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm sm:text-base leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#C96F5A] text-white rounded-tr-none shadow-xs'
                        : 'bg-white border border-[#E7E3DC] text-[#252525] rounded-tl-none shadow-xs'
                    }`}
                  >
                    {/* Header inside bubble */}
                    <div className="flex items-center justify-between gap-5 mb-1.5">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          msg.sender === 'user' ? 'text-white/80' : 'text-[#C96F5A]'
                        }`}
                      >
                        {msg.sender === 'user' ? 'You' : assistantName}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#8C887F]">
                        <span>{msg.time}</span>
                        {msg.sender === 'assistant' && (
                          <button
                            type="button"
                            onClick={() => speak(msg.text)}
                            className="text-[#8C887F] hover:text-[#C96F5A] transition-colors cursor-pointer"
                            title="Replay Voice"
                          >
                            <FiVolume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                  </div>
                </div>
              ))
            )}

            {/* Thinking indicator bubble */}
            {status === 'thinking' && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Composer Form */}
          <div className="p-4 sm:p-5 border-t border-[#E7E3DC] bg-white shrink-0">
            <form onSubmit={handleChatSubmit} className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E7E3DC] focus-within:border-[#C96F5A] focus-within:bg-white rounded-2xl px-4 py-2 transition-all">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask ${assistantName} anything...`}
                className="flex-1 bg-transparent text-sm sm:text-base text-[#252525] placeholder-[#8C887F] focus:outline-none py-1.5"
              />

              <button
                type="button"
                onClick={toggleMic}
                className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                  isMicActive
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-[#8C887F] hover:text-[#252525] hover:bg-[#F2ECE6]'
                }`}
                title={isMicActive ? 'Deactivate Microphone' : 'Activate Microphone'}
              >
                {isMicActive ? <FiMic className="w-5 h-5 animate-pulse" /> : <FiMicOff className="w-5 h-5" />}
              </button>

              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="w-10 h-10 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs"
                title="Send message"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Assistant;
