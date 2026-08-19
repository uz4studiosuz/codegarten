"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "codegarten_speech_v1";

interface SpeechSettings {
  /** Master switch — off means the read-aloud controls are inert. */
  enabled: boolean;
  /** Narrate each lesson step as it opens, without being asked. */
  autoplay: boolean;
  /** 0.5 – 1.5; slower helps beginners follow along. */
  rate: number;
}

const DEFAULTS: SpeechSettings = { enabled: true, autoplay: true, rate: 0.95 };

interface SpeechContextValue {
  hydrated: boolean;
  /** False in browsers without the Web Speech API. */
  supported: boolean;
  settings: SpeechSettings;
  speaking: boolean;
  setEnabled: (value: boolean) => void;
  setAutoplay: (value: boolean) => void;
  setRate: (value: number) => void;
  /** Reads the text aloud, cancelling anything already playing. */
  speak: (text: string) => void;
  stop: () => void;
  /** Speak only when autoplay is on — used when a lesson step opens. */
  speakAuto: (text: string) => void;
  /** Play if idle, stop if already reading — for the read-aloud button. */
  toggle: (text: string) => void;
}

const SpeechContext = createContext<SpeechContextValue | undefined>(undefined);

/**
 * Picks the closest available voice. Uzbek voices are rare, so fall back through
 * languages that pronounce Latin-script Uzbek acceptably before giving up.
 */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const preferences = ["uz", "tr", "az", "ru", "en"];
  for (const prefix of preferences) {
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;
  }
  return voices[0];
}

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SpeechSettings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const hydratedRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined);
  /** Guards against narrating the same step twice on re-render. */
  const lastSpokenRef = useRef<string>("");

  useEffect(() => {
    const available =
      typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(available);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      // Corrupt storage — fall back to defaults.
    }
    hydratedRef.current = true;
    setHydrated(true);

    if (!available) return;

    // Voices load asynchronously in most browsers.
    const loadVoices = () => {
      voiceRef.current = pickVoice(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const persist = useCallback((next: SpeechSettings) => {
    setSettings(next);
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable; the choice still applies for this session.
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    lastSpokenRef.current = "";
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !settings.enabled) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current?.lang ?? "uz-UZ";
      utterance.rate = settings.rate;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      // Record it here too: a manual read must not be repeated by autoplay.
      lastSpokenRef.current = trimmed;
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported, settings.enabled, settings.rate]
  );

  const speakAuto = useCallback(
    (text: string) => {
      if (!settings.autoplay || !settings.enabled) return;
      // Same text arriving again means a re-render, not a new step.
      if (lastSpokenRef.current === text) return;
      lastSpokenRef.current = text;
      speak(text);
    },
    [settings.autoplay, settings.enabled, speak]
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking) stop();
      else speak(text);
    },
    [speaking, speak, stop]
  );

  const setEnabled = useCallback(
    (value: boolean) => {
      if (!value) stop();
      persist({ ...settings, enabled: value });
    },
    [persist, settings, stop]
  );

  const setAutoplay = useCallback(
    (value: boolean) => persist({ ...settings, autoplay: value }),
    [persist, settings]
  );

  const setRate = useCallback(
    (value: number) => persist({ ...settings, rate: value }),
    [persist, settings]
  );

  const value = useMemo<SpeechContextValue>(
    () => ({
      hydrated,
      supported,
      settings,
      speaking,
      setEnabled,
      setAutoplay,
      setRate,
      speak,
      stop,
      speakAuto,
      toggle,
    }),
    [
      hydrated,
      supported,
      settings,
      speaking,
      setEnabled,
      setAutoplay,
      setRate,
      speak,
      stop,
      speakAuto,
      toggle,
    ]
  );

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
};

export const useSpeech = (): SpeechContextValue => {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error("useSpeech must be used within a SpeechProvider");
  return ctx;
};
