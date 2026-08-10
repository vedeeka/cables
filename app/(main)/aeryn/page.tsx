"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, Calendar, Mail, CheckCircle2, XCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type MessageNode = {
  id: string;
  type: "text" | "tool_status" | "action_card";
  content: string;
  sender?: "user" | "aeryn";
  status?: "pending" | "success" | "error"; // for tool_status
  cardData?: any; // for action_card
};

export default function AerynChat() {
  const [messages, setMessages] = useState<MessageNode[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: MessageNode = { id: Date.now().toString(), type: "text", sender: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.content }),
        credentials: "include"
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        
        const lines = chunkValue.split('\n\n').filter(Boolean);
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'tool_status') {
                        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), type: 'tool_status', content: data.content, status: data.status }]);
                    } else if (data.type === 'action_card') {
                        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), type: 'action_card', content: data.content, cardData: data.cardData }]);
                    } else if (data.type === 'text') {
                        setMessages(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.type === 'text' && last.sender === 'aeryn') {
                                return [...prev.slice(0, -1), { ...last, content: last.content + data.content }];
                            } else {
                                return [...prev, { id: Date.now().toString() + Math.random(), type: 'text', sender: 'aeryn', content: data.content }];
                            }
                        });
                    }
                } catch(e) {}
            }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <header className="px-8 py-6 flex items-center gap-3 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md z-10 sticky top-0">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
        </div>
        <div>
            <h1 className="text-lg font-bold tracking-tight">Aeryn</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enterprise Intelligence Layer</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 z-10">
        <div className="max-w-3xl mx-auto space-y-6">
            
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center mt-20 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                    <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                        <Sparkles size={32} className="text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                        I can prepare you for meetings, draft emails, organize your schedule, and execute workflows across your workspace.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-lg">
                        <button onClick={() => setInput("Prepare me for my next meeting")} className="p-3 text-left rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-sm font-medium">
                            📅 Prepare me for my next meeting
                        </button>
                        <button onClick={() => setInput("What should I focus on today?")} className="p-3 text-left rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-sm font-medium">
                            ⚡️ What should I focus on today?
                        </button>
                        <button onClick={() => setInput("Summarize my urgent emails")} className="p-3 text-left rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-sm font-medium">
                            ✉️ Summarize my urgent emails
                        </button>
                        <button onClick={() => setInput("Plan my week")} className="p-3 text-left rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-sm font-medium">
                            🎯 Plan my week
                        </button>
                    </div>
                </div>
            )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.type === 'text' && msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'text' && (
                    <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[14.5px] leading-relaxed shadow-sm ${
                        msg.sender === 'user' 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black rounded-tr-sm font-medium' 
                        : 'bg-white border border-slate-200 dark:bg-[#18181b] dark:border-white/10 rounded-tl-sm'
                    }`}>
                        {msg.content}
                    </div>
                )}

                {msg.type === 'tool_status' && (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                        {msg.status === 'pending' ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                        {msg.content}
                    </div>
                )}

                {msg.type === 'action_card' && (
                    <div className="w-full max-w-sm bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 shadow-lg rounded-2xl overflow-hidden my-2">
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                {msg.cardData?.icon === 'calendar' ? <Calendar size={12}/> : <Mail size={12}/>}
                                {msg.cardData?.title}
                            </span>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-base mb-1">{msg.cardData?.headline}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{msg.content}</p>
                            
                            <div className="flex gap-2">
                                <button className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold transition-colors">
                                    {msg.cardData?.primaryAction}
                                </button>
                                <button className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-colors">
                                    Edit
                                </button>
                                <button className="px-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 py-2 rounded-lg text-xs font-bold transition-colors">
                                    <XCircle size={14}/>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-4 md:px-12 md:pb-8 bg-gradient-to-t from-white via-white to-transparent dark:from-[#09090b] dark:via-[#09090b] dark:to-transparent z-10 pt-10">
        <div className="max-w-3xl mx-auto relative group">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aeryn to handle a task..."
              className="w-full bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-5 pr-14 shadow-lg focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500/50 transition-all text-sm font-medium group-hover:border-slate-300 dark:group-hover:border-white/20 placeholder:text-slate-400"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2.5 p-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="text-center mt-3">
              <span className="text-[10px] font-medium text-slate-400">Aeryn can execute actions on your behalf across Enterprise OS.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
