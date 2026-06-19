import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Sparkles, Bot, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatMessage from '../components/assistant/ChatMessage';
import VoiceInput from '../components/assistant/VoiceInput';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AIAssistant = () => {
  const { t, language, setLanguage } = useLanguage();
  const { token } = useAuth();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your PlotCRM AI Assistant. I can help you search plots, compare properties, or analyze your customers. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/assistant/chat`,
        {
          message: text,
          history: messages.slice(-10), // Send last 10 messages for context
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Handle TTS if Telugu or configured
      const reply = response.data.reply;
      
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      
      // Optional TTS implementation:
      // if (reply) {
      //   const utterance = new SpeechSynthesisUtterance(reply);
      //   utterance.lang = language === 'te' ? 'te-IN' : 'en-US';
      //   window.speechSynthesis.speak(utterance);
      // }

    } catch (error) {
      console.error(error);
      toast.error('Failed to get a response from the AI.');
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! How can I assist you today?"
      }
    ]);
  };

  const suggestedPrompts = [
    "Show plots below ₹30 Lakhs",
    "Compare Plot 1 and Plot 2",
    "Who are my hottest leads?",
    "Show east facing plots in Nizamabad",
    "అందుబాటులో ఉన్న ప్లాట్లు చూపించు"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[850px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">RAG AI Assistant</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Llama 3 & LangChain</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-300"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
          </select>
          <button 
            onClick={clearChat}
            className="text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        
        {isLoading && (
          <div className="flex w-full justify-start mb-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-3">
          <div className="flex-1 relative bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about your plots, customers, or leads..."
              className="w-full bg-transparent border-none outline-none resize-none px-4 py-3.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 max-h-32 min-h-[52px]"
              rows={1}
              style={{ minHeight: '52px' }}
            />
          </div>
          
          <VoiceInput onTranscription={(text) => setInput(prev => prev + ' ' + text)} />
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-sm shadow-primary-600/20"
          >
            <Send size={20} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
