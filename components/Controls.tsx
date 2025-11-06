import React from 'react';
import { BAR_OPTIONS } from '../constants';

interface ControlsProps {
    isPlaying: boolean;
    togglePlay: () => void;
    bpm: number;
    setBpm: (bpm: number) => void;
    masterVolume: number;
    onMasterVolumeChange: (volume: number) => void;
    numBars: number;
    onNumBarsChange: (bars: number) => void;
}

const PlayIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" />
    </svg>
);

const Controls: React.FC<ControlsProps> = ({ isPlaying, togglePlay, bpm, setBpm, masterVolume, onMasterVolumeChange, numBars, onNumBarsChange }) => {
    return (
        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-2 mb-3 px-2">
            <div className="flex items-center gap-4">
                <h1 className="text-lg md:text-3xl font-bold text-white tracking-wider hidden sm:block">3D DRUM MACHINE</h1>
                 <button
                    onClick={togglePlay}
                    className="p-3 bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-200"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
            </div>
            <div className="flex items-center gap-x-6 gap-y-2 flex-wrap flex-grow justify-center md:justify-end">
                 <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-400 text-sm">BARS</span>
                    {BAR_OPTIONS.map(bars => (
                        <button
                        key={bars}
                        onClick={() => onNumBarsChange(bars)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                            numBars === bars
                            ? 'bg-cyan-500 text-gray-900'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        >
                        {bars}
                        </button>
                    ))}
                </div>
                 <div className="flex items-center gap-3 w-full max-w-xs min-w-[200px]">
                    <span className="font-mono text-gray-400">BPM</span>
                    <input
                        type="range"
                        min="60"
                        max="240"
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-sm md:text-base font-mono bg-gray-800 text-cyan-300 px-3 py-1 rounded-md w-16 text-center">{bpm}</span>
                </div>
                 <div className="flex items-center gap-3 w-full max-w-xs min-w-[200px]">
                    <span className="font-mono text-gray-400">VOL</span>
                    <input
                        id="master-volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={masterVolume}
                        onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        aria-label="Master Volume"
                    />
                </div>
            </div>
        </div>
    );
};

export default Controls;