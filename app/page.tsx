'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SpeechChat() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        
        // Check if recognitionRef.current is not null before accessing its properties
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            setTranscript(transcript);
            processTranscript(transcript);
          };

          recognitionRef.current.onerror = (event) => {
            setError('Error occurred in recognition: ' + event.error);
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };
        }
      } else {
        setError('Speech recognition not supported in this browser.');
      }

      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const processTranscript = (text: string) => {
    setResponse(text);
    speak(text);
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setResponse('');
    setError('');
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Cancel ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        setError('Error during speech synthesis: ' + event.error);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  return (
    <Card className="card">
      <CardHeader className="card-header">
        <CardTitle className="card-title">Speech Echo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && <p className="text-error">{error}</p>}
          <div>
            <h3 className="font-medium">You said:</h3>
            <p>{transcript || "Nothing yet"}</p>
          </div>
          <div>
            <h3 className="font-medium">Echo:</h3>
            <p>{response || "Waiting for you to speak..."}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          className="button" // Apply button class
          onClick={isListening ? stopListening : startListening}
          disabled={isSpeaking}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </Button>
        {isSpeaking && <p>Speaking...</p>}
      </CardFooter>
    </Card>
  );
}
