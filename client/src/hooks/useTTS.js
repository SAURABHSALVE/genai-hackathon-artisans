// import { useState, useEffect } from 'react';

// export const useTTS = () => {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [voices, setVoices] = useState([]);

//   useEffect(() => {
//     const synth = window.speechSynthesis;
//     const loadVoices = () => setVoices([...synth.getVoices()]);
//     loadVoices();
//     if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
//   }, []);

//   const speak = (text, options = {}) => {
//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = options.rate || 1;
//     utterance.pitch = options.pitch || 1;
//     utterance.voice = options.voice || voices[0];
//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = () => setIsSpeaking(false);
//     synth.speak(utterance);
//     setIsSpeaking(true);
//   };

//   const stop = () => {
//     window.speechSynthesis.cancel();
//     setIsSpeaking(false);
//   };

//   return { speak, stop, isSpeaking, voices };
// };


import { useState, useCallback, useRef, useEffect } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = useRef(window.speechSynthesis);
  const utterance = useRef(null);

  const speak = useCallback((text, options = {}) => {
    if (synth.current && text) {
      // If speaking, stop first
      if (synth.current.speaking) {
        synth.current.cancel();
      }
      
      utterance.current = new SpeechSynthesisUtterance(text);
      utterance.current.rate = options.rate || 1;
      utterance.current.pitch = options.pitch || 1;
      
      utterance.current.onstart = () => setIsSpeaking(true);
      utterance.current.onend = () => setIsSpeaking(false);
      utterance.current.onerror = () => setIsSpeaking(false);

      synth.current.speak(utterance.current);
    }
  }, []);

  const stop = useCallback(() => {
    if (synth.current) {
      synth.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synth.current && synth.current.speaking) {
        synth.current.cancel();
      }
    };
  }, []);

  return { speak, stop, isSpeaking };
};