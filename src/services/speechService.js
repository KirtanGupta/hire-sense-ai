// ─── Speech Analysis Service — Phase 7 ───────────────────────────────────────
// Pure client-side NLP. No API costs. No backend processing.
// Works entirely in the browser with zero dependencies.

// ── Filler Word Patterns ──────────────────────────────────────────────────────
const FILLER_PATTERNS = [
  { word: "um", regex: /\bum\b/gi },
  { word: "uh", regex: /\buh\b/gi },
  { word: "like", regex: /\blike\b/gi },
  { word: "basically", regex: /\bbasically\b/gi },
  { word: "actually", regex: /\bactually\b/gi },
  { word: "you know", regex: /\byou know\b/gi },
  { word: "kind of", regex: /\bkind of\b/gi },
  { word: "sort of", regex: /\bsort of\b/gi },
  { word: "I mean", regex: /\bi mean\b/gi },
  { word: "I guess", regex: /\bi guess\b/gi },
  { word: "right?", regex: /\bright\??/gi },
  { word: "so yeah", regex: /\bso yeah\b/gi },
];

// ── Detect Filler Words ───────────────────────────────────────────────────────
export function detectFillerWords(transcript) {
  if (!transcript || typeof transcript !== "string") {
    return { count: 0, foundWords: [], details: [] };
  }

  const text = transcript.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const foundWords = [];
  const details = [];

  FILLER_PATTERNS.forEach(({ word, regex }) => {
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      foundWords.push(word);
      details.push({ word, count: matches.length });
    }
  });

  const count = details.reduce((sum, d) => sum + d.count, 0);

  return { count, foundWords, details, totalWords };
}

// ── Confidence Score ──────────────────────────────────────────────────────────
// 0 fillers     → 100%
// 1-2 fillers   → 90%
// 3-4 fillers   → 80%
// 5-6 fillers   → 75%
// 7+            → 70%
// Also adjusts for filler rate relative to total words
export function calculateConfidenceScore(fillerCount, totalWords) {
  if (!totalWords || totalWords < 5) return 80; // Not enough data — neutral

  const fillerRate = fillerCount / totalWords;

  // Base score by filler count
  let baseScore;
  if (fillerCount === 0) baseScore = 100;
  else if (fillerCount <= 2) baseScore = 90;
  else if (fillerCount <= 4) baseScore = 80;
  else if (fillerCount <= 6) baseScore = 75;
  else baseScore = 70;

  // Adjust down if filler rate is very high (> 10%)
  if (fillerRate > 0.1) {
    baseScore = Math.max(50, baseScore - Math.round(fillerRate * 100));
  }

  return Math.max(40, Math.min(100, baseScore));
}

// ── Speaking Speed ────────────────────────────────────────────────────────────
// Returns words-per-minute and a classification
export function calculateSpeakingSpeed(transcript, durationSeconds) {
  if (!transcript || !durationSeconds || durationSeconds < 3) {
    return { wpm: 0, classification: "N/A", durationSeconds: durationSeconds || 0 };
  }

  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = durationSeconds / 60;
  const wpm = Math.round(wordCount / minutes);

  let classification;
  if (wpm < 80) classification = "Slow";
  else if (wpm <= 150) classification = "Normal";
  else if (wpm <= 200) classification = "Fast";
  else classification = "Very Fast";

  return { wpm, classification, durationSeconds, wordCount };
}

// ── Pause Detection ───────────────────────────────────────────────────────────
// Infers frequent pauses if word density is low relative to duration
export function detectPauses(transcript, durationSeconds) {
  if (!transcript || !durationSeconds || durationSeconds < 3) {
    return { pauseObservation: "Insufficient data for pause analysis." };
  }

  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const expectedWords = (durationSeconds / 60) * 120; // expected at 120 wpm baseline

  const ratio = wordCount / expectedWords;
  let pauseObservation;

  if (ratio >= 0.8) {
    pauseObservation = "Smooth delivery with minimal pauses detected.";
  } else if (ratio >= 0.55) {
    pauseObservation = "Moderate pauses detected — generally acceptable.";
  } else {
    pauseObservation = "Frequent pauses detected — try to maintain a steadier flow.";
  }

  return { pauseObservation, wordCount, durationSeconds };
}

// ── Voice Quality Score ───────────────────────────────────────────────────────
// Combines confidence + speaking speed into a single voice quality score
export function calculateVoiceQualityScore(confidenceScore, wpm) {
  if (!wpm || wpm === 0) return confidenceScore;

  // Speed score: ideal is 100-150 wpm → 100 points, degrades outside range
  let speedScore;
  if (wpm >= 100 && wpm <= 150) speedScore = 100;
  else if (wpm >= 80 && wpm < 100) speedScore = 90;
  else if (wpm > 150 && wpm <= 180) speedScore = 88;
  else if (wpm >= 60 && wpm < 80) speedScore = 75;
  else if (wpm > 180 && wpm <= 200) speedScore = 75;
  else speedScore = 60;

  // Voice Quality = 60% confidence + 40% speed
  return Math.round(confidenceScore * 0.6 + speedScore * 0.4);
}

// ── Master Analyzer ───────────────────────────────────────────────────────────
// Call this after a voice recording to get the full analysis
export function analyzeSpeech(transcript, durationSeconds) {
  const fillerData = detectFillerWords(transcript);
  const speedData = calculateSpeakingSpeed(transcript, durationSeconds);
  const pauseData = detectPauses(transcript, durationSeconds);
  const confidenceScore = calculateConfidenceScore(
    fillerData.count,
    fillerData.totalWords
  );
  const voiceQualityScore = calculateVoiceQualityScore(
    confidenceScore,
    speedData.wpm
  );

  return {
    fillerCount: fillerData.count,
    fillerWords: fillerData.foundWords,
    fillerDetails: fillerData.details,
    totalWords: fillerData.totalWords,
    wpm: speedData.wpm,
    speedClassification: speedData.classification,
    durationSeconds,
    confidenceScore,
    voiceQualityScore,
    pauseObservation: pauseData.pauseObservation,
  };
}
