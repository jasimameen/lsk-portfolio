'use client';

import React, { useState, useEffect, useRef } from 'react';
import TTA from '../components/TTA';
import { showToast } from '../utils/toast';
import { outputAudioSpeech } from '../services/audio_services';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognition {
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  }

  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    }[];
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }
}

const RecordPage: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Initialize speech recognition and audio context on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true; // Keep listening until manually stopped
        recognitionInstance.interimResults = true; // Display partial results
        recognitionInstance.lang = 'en';

        // Handle speech recognition results
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece;
            } else {
              interimTranscript += transcriptPiece;
            }
          }

          setTranscript( finalTranscript);
        };

        // Handle errors during speech recognition
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          showToast("Speech recognition error");
          setError(`Error occurred in recognition: ${event.error}`);
        };

        setRecognition(recognitionInstance);
        recognitionInstance.start(); // Start speech recognition immediately
      } else {
        showToast("Speech recognition API issue");
        setError('SpeechRecognition API is not supported in this browser.');
      }
    }

    return () => {
      // Clean up audio context on unmount
      audioContextRef.current?.close();
    };
  }, []);

  // Triggered when a new transcript is available
  useEffect(() => {
    if (transcript) {
      outputAudioSpeech(transcript);
    }
  }, [transcript]);

  // Initialize Web Audio API for visualizing audio input
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Start drawing the waveform
        drawWaveform();
      } catch (err) {
        setError('Error accessing microphone: ' + err);
      }
    };

    initializeAudio();
  }, []);

  // Draw the waveform on the canvas
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

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3492eb';

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

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-black text-white">
      <canvas ref={canvasRef} className="w-1/2 h-100 mb-4"></canvas>
      <div className="w-3/4 h-1/3 p-6 text-gray-400 overflow-y-auto bg-gray-800 rounded-xl text-sm">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          transcript || 'Start speaking to see the transcription...'
        )}
      </div>
    </div>
  );
};

export default RecordPage;
