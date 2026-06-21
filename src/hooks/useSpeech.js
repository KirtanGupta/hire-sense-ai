// ─── useSpeech Hook — Phase 7 ─────────────────────────────────────────────────
// Wraps the Web Speech API (SpeechRecognition / webkitSpeechRecognition)
// Works in: Chrome, Edge, Brave (Chromium-based browsers)

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const onUpdateRef = useRef(null);

  // ── Check browser support on mount ─────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      Promise.resolve().then(() => setIsSupported(true));
    }
  }, []);

  // ── Start recording ─────────────────────────────────────────────────────────
  const startRecording = useCallback((onUpdate) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Brave."
      );
      return;
    }

    setError("");
    onUpdateRef.current = onUpdate || null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    let finalText = "";

    recognition.onstart = () => {
      setIsRecording(true);
      startTimeRef.current = Date.now();
      finalText = "";
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        finalText += final;
        setTranscript(finalText.trim());
        if (onUpdateRef.current) {
          onUpdateRef.current(finalText.trim());
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError(
          "Microphone access denied. Please allow microphone permission and try again."
        );
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else if (event.error === "network") {
        setError("Network error. Check your connection and try again.");
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
      if (startTimeRef.current) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setDurationSeconds(elapsed);
        startTimeRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setError("Failed to start recording. Please try again.");
      setIsRecording(false);
    }
  }, []);

  // ── Stop recording ──────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  // ── Reset transcript ────────────────────────────────────────────────────────
  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setDurationSeconds(0);
    setError("");
  }, []);

  return {
    isRecording,
    transcript,
    interimTranscript,
    durationSeconds,
    isSupported,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  };
}
