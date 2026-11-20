'use client';

import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  Minimize2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'Explain FDD 23 Disclosure Items',
  'How is Franchise Capex calculated?',
  'What are essential Kitchen/Store SOPs?',
  'Indian franchise laws & trademark protection',
  'How does the Digital Deal Room work?',
];

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Hello! I am your FranchiseBridge AI Advisor. Ask me anything about franchise readiness benchmarking, FDD legal disclosures, SOP manuals, capex estimation, or deal room workflows.',
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      const aiReply = data.success
        ? data.reply
        : 'Thank you for your question. Our franchise advisory algorithms recommend consulting the Franchise Disclosure Document (FDD) and scheduling a brokerage diligence call.';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'The FranchiseBridge AI engine is processing high volume. Franchise capex typically spans Franchise Fees, Security Deposits, Architectural Fitout, Equipment, Initial Inventory, and Working Capital Buffer. Use our Cost Estimator for specific projections.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#14243A] dark:bg-[#101010] hover:bg-[#3563FF] dark:hover:bg-[#3563FF] text-white rounded-full shadow-elevated border border-transparent dark:border-[#262626] transition-all duration-200 group"
        >
          <div className="w-6 h-6 rounded-full bg-[#3563FF] flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#3563FF] transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">AI Franchise Assistant</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="surface-card w-[380px] sm:w-[420px] shadow-dropdown flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-[#14243A] dark:bg-[#090909] p-4 text-white flex items-center justify-between border-b border-transparent dark:border-[#262626]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3563FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">FranchiseBridge AI Advisor</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Franchise Intelligence</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white rounded"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] dark:bg-[#000000] text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 ${
                      m.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-[#14243A] dark:bg-[#171717] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-transparent dark:border-[#262626]">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#3563FF] text-white'
                          : 'bg-white dark:bg-[#101010] text-[#14243A] dark:text-[#FFFFFF] border border-[#E7ECF2] dark:border-[#262626] shadow-sm'
                      }`}
                    >
                      <p>{m.text}</p>
                      <span
                        className={`text-[9px] block mt-1 ${
                          m.sender === 'user' ? 'text-blue-100' : 'text-[#64748B] dark:text-[#A3A3A3]'
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#A3A3A3] p-2 bg-white dark:bg-[#101010] rounded-lg border border-[#E7ECF2] dark:border-[#262626] w-fit">
                    <span className="w-2 h-2 rounded-full bg-[#3563FF] animate-ping" />
                    <span>Analyzing franchise regulations...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2 bg-white dark:bg-[#090909] border-t border-[#E7ECF2] dark:border-[#222222] overflow-x-auto flex gap-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 rounded-md bg-[#F8FAFC] dark:bg-[#171717] hover:bg-[#EFF4FF] dark:hover:bg-[#202020] border border-[#E7ECF2] dark:border-[#262626] text-[10px] text-[#14243A] dark:text-[#D4D4D4] font-medium whitespace-nowrap transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white dark:bg-[#090909] border-t border-[#E7ECF2] dark:border-[#222222] flex gap-2">
                <input
                  type="text"
                  placeholder="Ask regarding FDD, SOPs, capex, or agreements..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] focus:outline-none focus:border-[#3563FF] text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3]"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="btn-primary py-2 px-3 text-xs disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
