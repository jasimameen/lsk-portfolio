'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

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

          setTranscript(prev => prev + finalTranscript);
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(`Error occurred in recognition: ${event.error}`);
        };

        setRecognition(recognitionInstance);
      } else {
        setError('SpeechRecognition API is not supported in this browser.');
      }
    }

    return () => {
      // Clean up audio context on unmount
      audioContextRef.current?.close();
    };
  }, []);

  const handleRecord = async () => {
    if (!recognition) {
      setError('SpeechRecognition is not initialized or supported.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      audioContextRef.current?.close();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognition.start();

      // Initialize the Web Audio API
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Start animating the waveform
        drawWaveform();
      } catch (err) {
        setError('Error accessing microphone: ' + err);
      }

      setIsRecording(true);
    }
  };

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
    <div className="flex flex-col h-screen justify-center items-center bg-gray-900 text-white">
      <div className="relative w-full max-w-md bg-gray-800 p-4 rounded-xl shadow-lg">
        <canvas ref={canvasRef} className="w-full h-32 bg-gray-700 rounded-t-xl"></canvas>
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={handleRecord}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full ${
                isRecording ? 'bg-red-400' : 'bg-gray-400'
              }`}
            />
          </button>
        </div>
        <div className="mt-16 text-center text-lg font-medium">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div>{transcript || 'Start speaking to see the transcription...'}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordPage;
