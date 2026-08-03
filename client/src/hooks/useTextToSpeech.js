// Text-to-speech engine for the blog reader ("Listen to this blog").
//
// Uses the browser's built-in SpeechSynthesis API — no API key, no per-call
// cost, works offline. Content is read from a ref to the rendered article body
// (the same `contentRef` shared with ReadingProgress / TableOfContents) so it
// always speaks the sanitized HTML the reader sees.
//
// The big gotcha this handles: Chrome stops long utterances after ~15s and
// silently drops onend. We therefore split the text into short sentence-level
// chunks (capped at ~200 chars) and chain them with onend → next chunk, so a
// single "utterance" is short enough to never hit the cutoff. Each chunk
// reports back its index so the player bar can show progress and the page can
// auto-scroll/highlight the paragraph being read.

import { useState, useEffect, useRef, useCallback } from "react";

// Pull plain text out of the article's HTML without a DOM parser dependency:
// drop the tags, collapse whitespace. A temp element is the reliable way to
// honor entity decoding the browser already did.
const stripHtml = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
};

// Split plain text into speakable chunks. Sentence boundaries are kept intact
// where possible (so the voice pauses naturally); short sentences are merged
// until they would exceed `max`. A sentence with NO punctuation that's longer
// than `max` (a long URL, a run-on) is hard-split by words so the resulting
// chunk never blows past Chrome's ~15s utterance cutoff.
const splitIntoChunks = (text, max = 200) => {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*|\S[^.!?]*$/g) || [text];
  const chunks = [];
  let buf = "";
  const flush = () => { if (buf.trim()) { chunks.push(buf.trim()); } buf = ""; };
  for (const s of sentences) {
    const t = s.trim();
    if (!t) continue;
    if (t.length > max) {
      // Oversized single sentence — flush any pending merge, then break on words.
      flush();
      const words = t.split(/\s+/);
      let line = "";
      for (const w of words) {
        if (line && (line + " " + w).length > max) { chunks.push(line); line = w; }
        else { line = line ? `${line} ${w}` : w; }
      }
      if (line) chunks.push(line);
      continue;
    }
    if (buf && (buf + " " + t).length > max) { flush(); buf = t; }
    else { buf = buf ? `${buf} ${t}` : t; }
  }
  flush();
  return chunks;
};

export const useTextToSpeech = ({ contentRef }) => {
  const [supported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRateState] = useState(1);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [currentText, setCurrentText] = useState("");

  const chunksRef = useRef([]);
  const indexRef = useRef(0);
  const rateRef = useRef(1);
  // "stopped" distinguishes a user-initiated stop (clear state) from the final
  // chunk's onend firing (advance to done). Without it, stop()'s cancel() would
  // race the in-flight onend and flip state back to speaking.
  const stoppedRef = useRef(true);

  useEffect(() => { rateRef.current = rate; }, [rate]);

  // Speak chunk `i`. Chains itself forward via onend until the list is done.
  // Recursion is safe here — depth == chunk count, and each call yields to the
  // event loop before the next (onend is async).
  const speakIndex = useCallback((i) => {
    if (!supported) return;
    const list = chunksRef.current;
    if (stoppedRef.current || i < 0 || i >= list.length) {
      // Reached the end (or stopped): reset to the top so a replay starts fresh.
      setSpeaking(false);
      setPaused(false);
      setCurrentChunk(0);
      setCurrentText("");
      indexRef.current = 0;
      return;
    }
    indexRef.current = i;
    setCurrentChunk(i);
    setCurrentText(list[i]);
    const u = new SpeechSynthesisUtterance(list[i]);
    u.rate = rateRef.current;
    u.onend = () => { if (!stoppedRef.current) speakIndex(i + 1); };
    u.onerror = () => { if (!stoppedRef.current) speakIndex(i + 1); };
    window.speechSynthesis.speak(u);
  }, [supported]);

  const play = useCallback(() => {
    if (!supported || !contentRef?.current) return;
    // Resume in place if we were paused on the same content (no re-parse).
    if (paused && chunksRef.current.length) {
      window.speechSynthesis.resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }
    const list = splitIntoChunks(stripHtml(contentRef.current.innerHTML));
    if (!list.length) return;
    chunksRef.current = list;
    setTotalChunks(list.length);
    stoppedRef.current = false;
    window.speechSynthesis.cancel();
    setSpeaking(true);
    setPaused(false);
    setCurrentChunk(0);
    speakIndex(0);
  }, [supported, contentRef, paused, speakIndex]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setCurrentChunk(0);
    setCurrentText("");
    indexRef.current = 0;
  }, [supported]);

  // Jump to an arbitrary chunk (used by skip-back / skip-forward). cancel() is
  // async on Chrome, so we defer the next speak slightly to avoid the new
  // utterance being dropped.
  const jumpTo = useCallback((idx) => {
    if (!supported || !chunksRef.current.length) return;
    const clamped = Math.max(0, Math.min(idx, chunksRef.current.length - 1));
    stoppedRef.current = false;
    setPaused(false);
    setSpeaking(true);
    window.speechSynthesis.cancel();
    setTimeout(() => speakIndex(clamped), 60);
  }, [supported, speakIndex]);

  const next = useCallback(() => jumpTo(indexRef.current + 1), [jumpTo]);
  const prev = useCallback(() => jumpTo(indexRef.current - 1), [jumpTo]);

  // The action-row "Listen" button: start if idle, resume if paused, pause if
  // playing — so a single icon does the right thing.
  const toggle = useCallback(() => {
    if (!speaking && !paused) return play();
    if (paused) return resume();
    return pause();
  }, [speaking, paused, play, resume, pause]);

  const setRate = useCallback((r) => setRateState(r), []);

  // Always release the synth when leaving the page so audio doesn't bleed into
  // the next route.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        stoppedRef.current = true;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    supported, speaking, paused, rate, setRate,
    currentChunk, totalChunks, currentText,
    play, pause, resume, stop, next, prev, toggle,
  };
};

export default useTextToSpeech;