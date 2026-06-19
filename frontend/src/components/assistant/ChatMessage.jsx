import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatMessage = ({ role, content }) => {
  const isAI = role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`flex max-w-[85%] gap-4 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
          isAI 
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 border border-primary-200 dark:border-primary-800' 
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
        }`}>
          {isAI ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className={`rounded-2xl px-5 py-3.5 shadow-sm text-sm sm:text-base ${
            isAI 
              ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none' 
              : 'bg-primary-600 text-white rounded-tr-none'
          }`}>
            {isAI ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-50 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{content}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
