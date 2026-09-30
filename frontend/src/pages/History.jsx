import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { userDataContext } from '../context/UserContext';
import AppShell from '../components/layout/AppShell';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { toast } from 'react-toastify';
import {
  FiSearch,
  FiTrash2,
  FiVolume2,
  FiMessageSquare,
  FiExternalLink,
  FiChevronRight,
  FiX
} from 'react-icons/fi';

const History = () => {
  const { userData, fetchHistory, clearHistory } = useContext(userDataContext);

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchHistory();
    setHistoryList(data || []);
    setLoading(false);
  }, [fetchHistory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const speakText = (text, e) => {
    if (e) e.stopPropagation();
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (/[\u0C00-\u0C7F]/.test(text)) utterance.lang = 'te-IN';
    else if (/[\u0900-\u097F]/.test(text)) utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    const success = await clearHistory();
    if (success) {
      setHistoryList([]);
      setSelectedExchange(null);
      toast.success('Conversation history cleared');
    } else {
      toast.error('Failed to clear history');
    }
    setIsClearing(false);
    setClearModalOpen(false);
  };

  // Group items by relative date like ChatGPT
  const groupedItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = historyList.filter((item) => {
      if (!query) return true;
      return (
        (item.command || '').toLowerCase().includes(query) ||
        (item.response || '').toLowerCase().includes(query)
      );
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: []
    };

    filtered.forEach((item) => {
      const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      if (itemTime >= today) {
        groups.Today.push(item);
      } else if (itemTime >= yesterday) {
        groups.Yesterday.push(item);
      } else if (itemTime >= sevenDaysAgo) {
        groups['Previous 7 Days'].push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [historyList, searchQuery]);

  const assistantName = userData?.assistantName || 'Assistant';

  return (
    <AppShell>
      <div className="w-full h-full flex flex-col overflow-hidden bg-[#F7F5F0]">
        
        {/* Top Header Bar (100% Full Width) */}
        <header className="shrink-0 w-full px-6 sm:px-10 py-5 border-b border-[#E7E3DC] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#252525] tracking-tight">
              Conversation History
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F2ECE6] text-[#C96F5A] border border-[#E7E3DC]">
              {historyList.length} interactions
            </span>
          </div>

          <div className="flex items-center gap-3">
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={() => setClearModalOpen(true)}
                className="h-10 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </header>

        {/* Search Toolbar (No Filter Pills, Search-Only, 100% Full Width) */}
        <div className="shrink-0 w-full px-6 sm:px-10 py-3.5 border-b border-[#E7E3DC] bg-white flex items-center">
          <div className="relative w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C887F] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-12 pl-12 pr-10 rounded-xl bg-[#FAF8F5] border border-[#E7E3DC] text-sm sm:text-base text-[#252525] placeholder-[#8C887F] focus:bg-white focus:outline-none focus:border-[#C96F5A] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C887F] hover:text-[#252525] p-1 cursor-pointer"
                title="Clear search"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Full-Width ChatGPT-Style History Stream (100% Width, No Cards) */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-[#6B6862] space-y-3">
              <div className="w-8 h-8 border-2 border-[#C96F5A] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading conversations...</p>
            </div>
          ) : groupedItems.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <EmptyState
                icon={FiMessageSquare}
                title={searchQuery ? 'No matching conversations' : 'No conversation history yet'}
                description={
                  searchQuery
                    ? 'Try searching with different keywords.'
                    : 'Your questions and assistant responses will automatically be saved here.'
                }
              />
            </div>
          ) : (
            <div className="w-full divide-y divide-[#E7E3DC]">
              {groupedItems.map(([groupTitle, items]) => (
                <div key={groupTitle} className="w-full">
                  
                  {/* Date Group Heading like ChatGPT */}
                  <div className="w-full px-6 sm:px-10 py-3 bg-[#FAF8F5] border-b border-[#E7E3DC] sticky top-0 z-10">
                    <span className="text-xs sm:text-sm font-bold text-[#6B6862] uppercase tracking-wider">
                      {groupTitle}
                    </span>
                  </div>

                  {/* Clean Full-Width Row List (No Card Wrappers) */}
                  <div className="w-full divide-y divide-[#E7E3DC]/70">
                    {items.map((item, idx) => {
                      const timeStr = item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Recent';

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedExchange(item)}
                          className="w-full px-6 sm:px-10 py-4.5 bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center justify-between gap-6 group"
                        >
                          {/* Left: Icon + Question Title + Response Snippet */}
                          <div className="min-w-0 flex items-start gap-4 flex-1">
                            <div className="w-9 h-9 rounded-xl bg-[#F7F5F0] text-[#8C887F] group-hover:text-[#C96F5A] group-hover:bg-[#F2ECE6] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                              <FiMessageSquare className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-semibold text-[#252525] group-hover:text-[#C96F5A] transition-colors truncate">
                                {item.command || 'User Query'}
                              </p>
                              <p className="text-xs sm:text-sm text-[#6B6862] truncate mt-1 leading-relaxed">
                                {item.response || ''}
                              </p>
                            </div>
                          </div>

                          {/* Right: Timestamp & Action Controls */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs sm:text-sm text-[#8C887F] font-medium hidden sm:inline">
                              {timeStr}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => speakText(item.response, e)}
                              className="p-2 rounded-lg text-[#8C887F] hover:text-[#C96F5A] hover:bg-[#F2ECE6] transition-colors cursor-pointer"
                              title="Replay Audio"
                            >
                              <FiVolume2 className="w-5 h-5" />
                            </button>

                            <FiChevronRight className="w-4 h-4 text-[#8C887F] group-hover:text-[#252525] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exchange Detail Modal (When user clicks a row) */}
      <Modal
        isOpen={Boolean(selectedExchange)}
        onClose={() => setSelectedExchange(null)}
        title="Conversation Detail"
        description={
          selectedExchange?.createdAt
            ? new Date(selectedExchange.createdAt).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            : 'Conversation'
        }
        maxWidth="max-w-2xl"
      >
        {selectedExchange && (
          <div className="space-y-5 text-[#252525] pt-1">
            {/* User Prompt */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#8C887F] uppercase tracking-wider">
                You asked
              </span>
              <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#E7E3DC] text-sm sm:text-base font-semibold text-[#252525]">
                "{selectedExchange.command}"
              </div>
            </div>

            {/* Assistant Answer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C96F5A] uppercase tracking-wider">
                  {assistantName} replied
                </span>
                <button
                  type="button"
                  onClick={() => speakText(selectedExchange.response)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96F5A] hover:underline cursor-pointer"
                >
                  <FiVolume2 className="w-4 h-4" />
                  <span>Replay Voice</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E7E3DC] text-sm sm:text-base text-[#252525] leading-relaxed whitespace-pre-wrap">
                {selectedExchange.response}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedExchange(null)}
                className="px-5 py-2.5 rounded-xl bg-[#C96F5A] hover:bg-[#B85E4B] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal to Clear History */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Conversation History"
        description="Are you sure you want to permanently delete all recorded conversations?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-[#6B6862]">
            This action cannot be undone. All your past interaction logs and voice query history will be removed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setClearModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E7E3DC] text-sm font-semibold text-[#6B6862] hover:text-[#252525] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isClearing}
              onClick={handleConfirmClear}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isClearing ? 'Clearing...' : 'Confirm Clear'}
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
};

export default History;
