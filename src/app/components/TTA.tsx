'use client'
import React, { useState, useEffect } from 'react';

interface TTAProps {
  text: string;
}

const TTA: React.FC<TTAProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [permission, setpermission] = useState<boolean>(false);
  const [stream, setstream] = useState<MediaStream | null>(null);   

  useEffect(() => {
    getMicPermission()
  }, [])
  

  const getMicPermission =  async () => {
    if ("MediaRecorder" in window) {
      try {
        const steamdata = await navigator.mediaDevices.getUserMedia({
          audio: true, video: false, 
        })
        setpermission(true);
        setstream(steamdata);
      } catch (error:any) {
        alert(error.message)
      }
    } else {
      alert("Media Recorder permission not availabel: hmmm")
    }
  }

  useEffect(() => {
    if (text) {
      if (isSpeaking) {
      const newUtterance = new SpeechSynthesisUtterance(text);
      setUtterance(newUtterance);
     
        speechSynthesis.speak(newUtterance);
      }
    } 
  }, [text, isSpeaking]);

  const handlePlayPause = () => {
    if (isSpeaking) {
      speechSynthesis.pause();
      setIsSpeaking(true);
    } else {
      if (utterance) {
        speechSynthesis.speak(utterance);
      }
      setIsSpeaking(true);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handlePlayPause}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
      </button>
    </div>
  );
};

export default TTA;
