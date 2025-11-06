export interface Instrument {
  name: string;
  url: string; // for default sample
  volume: number;
  isMuted: boolean;
  startTime: number; // 0 to 1
  endTime: number;   // 0 to 1
  pitch: number; // In semitones, e.g., -12 to 12
}

export type AutomationData = Partial<Pick<Instrument, 'volume' | 'pitch' | 'startTime' | 'endTime'>>;

export type AutomationGrid = Record<number, Record<number, AutomationData>>;
