'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
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
      const response = await fetch('http://localhost:5000/api/ai/chat', {
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
          className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 group border border-emerald-400/40"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </div>
          <span className="font-semibold text-sm tracking-wide">Franchise AI Advisor</span>
          <span className="bg-emerald-800/80 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30">
            Live
          </span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 backdrop-blur-xl ${
            isMinimized ? 'w-80 h-16' : 'w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6rem)]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">FranchiseBridge AI</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Readiness, FDD, SOP & Valuation Advisor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {/* Advisory Disclaimer Notice */}
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Knowledge-grounded in Indian Contract & IP law, US FTC 23-item FDD disclosure standards, and commercial unit economics.
                  </span>
                </div>

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md shadow-emerald-900/30'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed text-[13px]">{m.text}</p>
                      <span className="block text-[10px] mt-1 text-slate-400/80 text-right">{m.time}</span>
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl rounded-bl-none px-4 py-3 text-slate-400 text-xs flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Synthesizing franchise intelligence...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 border-t border-slate-800 bg-slate-950/60 overflow-x-auto flex gap-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-2.5 py-1 text-[11px] rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80 transition flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-slate-900 border-t border-slate-800 rounded-b-2xl flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about FDD, SOP, capex, legal..."
                  className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition shadow-md shadow-emerald-700/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
