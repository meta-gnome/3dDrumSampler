import type { Instrument } from './types';

export const STEPS_PER_BAR = 16;

export const INSTRUMENTS: Instrument[] = [
  { name: 'Kick', url: '', volume: 1, isMuted: false, startTime: 0, endTime: 1, pitch: 0 },
  { name: 'Snare', url: '', volume: 1, isMuted: false, startTime: 0, endTime: 1, pitch: 0 },
  { name: 'Closed Hat', url: '', volume: 1, isMuted: false, startTime: 0, endTime: 1, pitch: 0 },
  { name: 'Clap', url: '', volume: 1, isMuted: false, startTime: 0, endTime: 1, pitch: 0 },
  { name: 'High Tom', url: '', volume: 1, isMuted: false, startTime: 0, endTime: 1, pitch: 0 },
];

export const NUM_INSTRUMENTS = INSTRUMENTS.length;
export const DEFAULT_BPM = 120;
export const BAR_OPTIONS = [1, 2, 4, 8];