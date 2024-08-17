'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import ReactMic
const ReactMic = dynamic(() => import('react-mic').then(mod => mod.ReactMic), { ssr: false });

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<{ id: number; text: string; sender: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onstart = () => setRecording(true);
        recognitionInstance.onend = () => setRecording(false);

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript.trim();
          if (event.results[0].isFinal) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { id: prevMessages.length + 1, text: transcript, sender: 'user' },
            ]);
            generateBotResponse(transcript);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error(`Speech recognition error: ${event.error}`);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  useEffect(() => {
    if (recognition && !isListening) {
      recognition.start();
      setIsListening(true);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          drawWaveform();
        })
        .catch(err => console.error('Error accessing microphone: ' + err));
    }
  }, [recognition, isListening]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!canvas || !analyser || !dataArray) return;

    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      if (!ctx || !analyser) return;

      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4CAF50';

      ctx.beginPath();

      const sliceWidth = WIDTH / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * HEIGHT) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const generateBotResponse = (userMessage: string) => {
    const botResponses = [
      "I’m not sure, but I’ll look into it.",
      "That's interesting. Let me think about it.",
      "I’ll handle that for you right away.",
      "Could you clarify that for me?",
      "I'm here to help, what else can I do for you?",
    ];
    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: randomResponse, sender: 'bot' },
      ]);
    }, 1000);
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-900 p-4">
      <div className="w-full max-w-lg h-full bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header with Avatar */}
        <div className="flex items-center p-4 bg-gray-700 border-b border-gray-600">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">JA</span>
          </div>
          <div className="ml-4 text-white font-bold text-lg">Jasim AI</div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs break-words ${
                  message.sender === 'user' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-700 text-gray-300 shadow-md'
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Listening Indicator */}
        <div className="flex justify-center items-center p-4 bg-gray-700 border-t border-gray-600">
          <div className="flex items-center space-x-2">
            {recording && (
              <canvas ref={canvasRef} className="w-24 h-6 bg-gray-900 rounded-lg border border-gray-600" />
            )}
            <span className="text-gray-400">
              {recording ? 'Listening...' : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
