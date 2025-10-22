

import { useState, useEffect, useRef } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = useRef(window.speechSynthesis); // Use a ref to hold the synth object

  const speak = (text) => {
    const currentSynth = synth.current;
    if (currentSynth.speaking) {
      currentSynth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    currentSynth.speak(utterance);
  };

  const stop = () => {
    synth.current.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    // Store the current synth instance in a variable
    const currentSynth = synth.current;
    
    // Cleanup on unmount
    return () => {
      // Use the variable in the cleanup function
      if (currentSynth.speaking) {
        currentSynth.cancel();
      }
    };
  }, []); // Empty dependency array is correct here

  return { speak, stop, isSpeaking };
};