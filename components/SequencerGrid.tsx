import React from 'react';
import { INSTRUMENTS, STEPS_PER_BAR, NUM_INSTRUMENTS } from '../constants';
import type { Instrument } from '../types';

interface SequencerGridProps {
    grid: boolean[][];
    toggleStep: (instrumentIndex: number, stepIndex: number) => void;
    currentStep: number;
    numBars: number;
    instruments: Instrument[];
    onVolumeChange: (instrumentIndex: number, volume: number) => void;
    onMuteToggle: (instrumentIndex: number) => void;
    onPitchChange: (instrumentIndex: number, pitch: number) => void;
    onStartTimeChange: (instrumentIndex: number, startTime: number) => void;
    onEndTimeChange: (instrumentIndex: number, endTime: number) => void;
    onFileChange: (instrumentIndex: number, file: File) => void;
    onExportLoop: () => void;
    isExporting: boolean;
    isRecordingAutomation: boolean;
    onToggleAutomationRecord: () => void;
    onClearAutomation: () => void;
}

const InstrumentControlRow: React.FC<{
    instrument: Instrument;
    instrumentIndex: number;
    onVolumeChange: (instrumentIndex: number, volume: number) => void;
    onMuteToggle: (instrumentIndex: number) => void;
    onPitchChange: (instrumentIndex: number, pitch: number) => void;
    onStartTimeChange: (instrumentIndex: number, startTime: number) => void;
    onEndTimeChange: (instrumentIndex: number, endTime: number) => void;
    onFileChange: (instrumentIndex: number, file: File) => void;
}> = ({ instrument, instrumentIndex, onVolumeChange, onMuteToggle, onPitchChange, onStartTimeChange, onEndTimeChange, onFileChange }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleUploadClick = () => fileInputRef.current?.click();
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onFileChange(instrumentIndex, e.target.files[0]);
        }
    };
    const sliderClass = "w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400";

    return (
        <div className="h-[56px] bg-gray-900/50 rounded-md p-2 flex items-center gap-2">
            <div className="w-28 flex-shrink-0 flex flex-col justify-center">
                 <p className="text-xs font-bold truncate text-white" title={instrument.name}>{instrument.name}</p>
                 <button onClick={handleUploadClick} className="text-cyan-400 text-xs hover:underline text-left">Load WAV</button>
                 <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".wav" hidden />
            </div>

            <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-x-2 gap-y-0.5 text-xs">
                <div className="flex items-center gap-1">
                    <label className="text-gray-400 w-4 font-mono">V</label>
                    <input type="range" min="0" max="1" step="0.01" value={instrument.volume} onChange={e => onVolumeChange(instrumentIndex, +e.target.value)} className={sliderClass} />
                </div>
                 <div className="flex items-center gap-1">
                    <label className="text-gray-400 w-4 font-mono">P</label>
                    <input type="range" min="-12" max="12" step="1" value={instrument.pitch} onChange={e => onPitchChange(instrumentIndex, +e.target.value)} className={sliderClass} />
                    <span className="w-6 text-center text-gray-300 font-mono text-[10px]">{instrument.pitch}</span>
                </div>
                <div className="flex items-center gap-1">
                    <label className="text-gray-400 w-4 font-mono">S</label>
                    <input type="range" min="0" max="1" step="0.01" value={instrument.startTime} onChange={e => onStartTimeChange(instrumentIndex, +e.target.value)} className={sliderClass} />
                </div>
                <div className="flex items-center gap-1">
                    <label className="text-gray-400 w-4 font-mono">E</label>
                    <input type="range" min="0" max="1" step="0.01" value={instrument.endTime} onChange={e => onEndTimeChange(instrumentIndex, +e.target.value)} className={sliderClass} />
                </div>
            </div>

            <button onClick={() => onMuteToggle(instrumentIndex)} className={`w-6 h-6 rounded text-xs font-bold flex-shrink-0 transition-colors ${instrument.isMuted ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}>M</button>
        </div>
    );
};


const SequencerGrid: React.FC<SequencerGridProps> = ({ grid, toggleStep, currentStep, numBars, instruments, onVolumeChange, onMuteToggle, onPitchChange, onStartTimeChange, onEndTimeChange, onFileChange, onExportLoop, isExporting, isRecordingAutomation, onToggleAutomationRecord, onClearAutomation }) => {
    const totalSteps = STEPS_PER_BAR * numBars;

    return (
        <div className="bg-gray-800 p-2 rounded-lg mt-1 shadow-lg flex gap-4">
            <div className="flex flex-col gap-1 w-[320px] flex-shrink-0">
                <div className="h-10 flex items-center justify-start mb-1 gap-2">
                    <button
                        onClick={onExportLoop}
                        disabled={isExporting}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-sm font-bold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isExporting ? 'Rendering...' : 'Export Loop'}
                    </button>
                    <button
                        onClick={onToggleAutomationRecord}
                        className={`px-3 py-2 rounded-md text-sm font-bold transition-all ${
                            isRecordingAutomation
                            ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        }`}
                        title="Record Automation"
                    >
                        REC
                    </button>
                    <button
                        onClick={onClearAutomation}
                        className="p-2 bg-gray-600 hover:bg-red-500 rounded-md text-gray-300 hover:text-white transition-colors"
                        title="Clear All Automation"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                {instruments.map((instrument, instrumentIndex) => (
                    <InstrumentControlRow
                        key={instrumentIndex}
                        instrument={instrument}
                        instrumentIndex={instrumentIndex}
                        onVolumeChange={onVolumeChange}
                        onMuteToggle={onMuteToggle}
                        onPitchChange={onPitchChange}
                        onStartTimeChange={onStartTimeChange}
                        onEndTimeChange={onEndTimeChange}
                        onFileChange={onFileChange}
                    />
                ))}
            </div>

            <div className="flex-grow overflow-x-auto no-scrollbar">
                <div className="flex flex-col gap-1" style={{ minWidth: totalSteps * 24 }}>
                    <div className="h-10 mb-1"></div>
                     {grid.slice(0, NUM_INSTRUMENTS).map((row, instrumentIndex) => (
                         <div key={instrumentIndex} className="grid gap-1 h-[56px]" style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
                            {Array.from({ length: totalSteps }).map((_, stepIndex) => {
                                const isActive = grid[instrumentIndex]?.[stepIndex] ?? false;
                                const isCurrent = currentStep === stepIndex;
                                const isBarBoundary = stepIndex > 0 && stepIndex % STEPS_PER_BAR === 0;
                                const isBeatBoundary = stepIndex > 0 && stepIndex % 4 === 0;

                                let stepClasses = "h-full w-full flex-shrink-0 rounded-sm transition-colors duration-100 ";

                                if (isCurrent) {
                                    stepClasses += isActive ? "bg-yellow-300 ring-2 ring-white " : "bg-gray-500 ";
                                } else if (isActive) {
                                    // defer to inline style for active color
                                } else {
                                    stepClasses += "bg-gray-700 hover:bg-gray-600 ";
                                }
                                
                                if (isBarBoundary) {
                                    stepClasses += "border-l-2 border-gray-600 ";
                                } else if (isBeatBoundary) {
                                    stepClasses += "border-l border-gray-600 opacity-60 ";
                                }

                                const hue = (instrumentIndex / NUM_INSTRUMENTS) * 360;
                                const activeStyle = isActive && !isCurrent ? { backgroundColor: `hsl(${hue}, 70%, 60%)` } : {};
                                
                                return (
                                    <button
                                        key={stepIndex}
                                        onClick={() => toggleStep(instrumentIndex, stepIndex)}
                                        className={stepClasses}
                                        style={activeStyle}
                                        aria-label={`Instrument ${instrumentIndex + 1} Step ${stepIndex + 1}`}
                                    />
                                );
                            })}
                         </div>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default SequencerGrid;