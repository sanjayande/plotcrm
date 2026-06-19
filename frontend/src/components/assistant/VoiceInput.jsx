import React, { useState, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceInput = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        setIsRecording(false);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast.error('Voice recognition failed. Please try again.');
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }, [onTranscription]);

  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Voice input is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
        isRecording 
          ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse' 
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
      title={isRecording ? "Stop recording" : "Voice input"}
    >
      {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceInput;
