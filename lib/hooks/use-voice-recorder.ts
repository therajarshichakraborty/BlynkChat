import { useEffect, useRef, useState } from "react";

export type VoiceRecording = {
  blob: Blob;
  durationMs: number;
  waveform: number[];
};

type RecorderState = "idle" | "recording";

const barCount = 32;

function downsample(levels: number[]) {
  if (levels.length === 0) return Array.from({ length: barCount }, () => 4);
  const bucket = levels.length / barCount;
  const peak = Math.max(...levels, 0.01);
  return Array.from({ length: barCount }, (_, index) => {
    const slice = levels.slice(Math.floor(index * bucket), Math.max(Math.floor((index + 1) * bucket), Math.floor(index * bucket) + 1));
    const average = slice.reduce((sum, value) => sum + value, 0) / Math.max(1, slice.length);
    return Math.round(3 + (average / peak) * 19);
  });
}

export function voiceRecordingSupported() {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    MediaRecorder.isTypeSupported("audio/webm")
  );
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const levelsRef = useRef<number[]>([]);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  function cleanup() {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void contextRef.current?.close().catch(() => undefined);
    streamRef.current = null;
    contextRef.current = null;
    recorderRef.current = null;
    setState("idle");
    setElapsedMs(0);
  }

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void contextRef.current?.close().catch(() => undefined);
    },
    [],
  );

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);

    streamRef.current = stream;
    contextRef.current = context;
    recorderRef.current = recorder;
    levelsRef.current = [];
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    startedRef.current = Date.now();
    recorder.start(250);
    setState("recording");

    timerRef.current = setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
      levelsRef.current.push(Math.sqrt(sum / samples.length));
      setElapsedMs(Date.now() - startedRef.current);
    }, 100);
  }

  function stop(): Promise<VoiceRecording | null> {
    const recorder = recorderRef.current;
    if (!recorder) return Promise.resolve(null);
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const chunks = chunksRef.current;
        const durationMs = Date.now() - startedRef.current;
        const waveform = downsample(levelsRef.current);
        cleanup();
        resolve(chunks.length > 0 ? { blob: new Blob(chunks, { type: "audio/webm" }), durationMs, waveform } : null);
      };
      recorder.stop();
    });
  }

  function cancel() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    cleanup();
  }

  return { state, elapsedMs, start, stop, cancel };
}
