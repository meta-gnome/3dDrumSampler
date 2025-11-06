import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Controls from './components/Controls';
import SequencerGrid from './components/SequencerGrid';
import DrumMachineScene from './components/DrumMachineScene';
import { audioService } from './services/audioService';
import { useInterval } from './hooks/useInterval';
import { INSTRUMENTS, NUM_INSTRUMENTS, STEPS_PER_BAR, DEFAULT_BPM, BAR_OPTIONS } from './constants';
import { Instrument, AutomationGrid, AutomationData } from './types';

const App: React.FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [numBars, setNumBars] = useState(4);
    
    const maxSteps = STEPS_PER_BAR * Math.max(...BAR_OPTIONS);
    const [grid, setGrid] = useState<boolean[][]>(() =>
        Array(NUM_INSTRUMENTS).fill(null).map(() => Array(maxSteps).fill(false))
    );

    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [currentStep, setCurrentStep] = useState(-1);
    const [masterVolume, setMasterVolume] = useState(1);
    const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
    const [isExporting, setIsExporting] = useState(false);
    
    const [automationData, setAutomationData] = useState<AutomationGrid>({});
    const [isRecordingAutomation, setIsRecordingAutomation] = useState(false);


    const totalSteps = useMemo(() => STEPS_PER_BAR * numBars, [numBars]);

    useEffect(() => {
        const init = async () => {
            await audioService.loadSamples(INSTRUMENTS);
            setIsInitialized(true);
        };
        init();
    }, []);

    const toggleStep = useCallback((instrumentIndex: number, stepIndex: number) => {
        setGrid(currentGrid => {
            const newGrid = currentGrid.map(row => [...row]);
            newGrid[instrumentIndex][stepIndex] = !newGrid[instrumentIndex][stepIndex];
            return newGrid;
        });
    }, []);

    const playSounds = useCallback((step: number) => {
        const time = audioService.currentTime;
        const stepAutomation = automationData[step];
        for (let i = 0; i < NUM_INSTRUMENTS; i++) {
            if (grid[i][step]) {
                const automationForInstrument = stepAutomation ? stepAutomation[i] : undefined;
                audioService.playSound(instruments[i], i, time, automationForInstrument);
            }
        }
    }, [grid, instruments, automationData]);

    const advanceStep = useCallback(() => {
        const nextStep = (currentStep + 1) % totalSteps;
        playSounds(nextStep);
        setCurrentStep(nextStep);
    }, [currentStep, totalSteps, playSounds]);

    useInterval(
        advanceStep,
        isPlaying ? (60 * 1000) / bpm / (STEPS_PER_BAR / 4) : null
    );

    const togglePlay = useCallback(() => {
        if (!isInitialized) return;
        
        setIsPlaying(prev => !prev);
        if (!isPlaying) {
            setCurrentStep(-1);
        }
    }, [isPlaying, isInitialized]);


    const onNumBarsChange = (bars: number) => {
        setNumBars(bars);
        if(currentStep >= STEPS_PER_BAR * bars) {
            setCurrentStep(-1);
        }
    }

    useEffect(() => {
        audioService.setMasterVolume(masterVolume);
    }, [masterVolume]);

    const createInstrumentUpdater = <K extends keyof AutomationData>(key: K) => {
        return (instrumentIndex: number, value: Instrument[K]) => {
            if (isRecordingAutomation) {
                if (isPlaying && currentStep >= 0) {
                    setAutomationData(prevData => {
                        const newData = { ...prevData };
                        const stepData = newData[currentStep] ? { ...newData[currentStep] } : {};
                        const instrumentData = stepData[instrumentIndex] ? { ...stepData[instrumentIndex] } : {};
                        
                        instrumentData[key] = value as any;
                        
                        stepData[instrumentIndex] = instrumentData;
                        newData[currentStep] = stepData;
                        
                        return newData;
                    });
                }
            } else {
                 setInstruments(currentInstruments =>
                    currentInstruments.map((inst, idx) =>
                        idx === instrumentIndex ? { ...inst, [key]: value } : inst
                    )
                );
            }
        };
    };

    const handleVolumeChange = createInstrumentUpdater('volume');
    const handlePitchChange = createInstrumentUpdater('pitch');
    const handleStartTimeChange = createInstrumentUpdater('startTime');
    const handleEndTimeChange = createInstrumentUpdater('endTime');

    const handleMuteToggle = (instrumentIndex: number) => {
        setInstruments(currentInstruments =>
            currentInstruments.map((inst, idx) =>
                idx === instrumentIndex ? { ...inst, isMuted: !inst.isMuted } : inst
            )
        );
    };

    const handleFileChange = async (instrumentIndex: number, file: File) => {
        const newName = file.name.replace(/\.[^/.]+$/, "");
        setInstruments(currentInstruments =>
            currentInstruments.map((inst, idx) =>
                idx === instrumentIndex ? {
                    ...inst,
                    name: newName,
                    startTime: 0,
                    endTime: 1,
                    pitch: 0
                } : inst
            )
        );
        await audioService.loadUserSample(file, instrumentIndex);
    };

    const handleExportLoop = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            await audioService.exportLoopAsWav(grid, instruments, bpm, numBars, automationData);
        // FIX: Corrected the `catch` block syntax from `catch (error) => {` to `catch (error) {`.
        // The invalid syntax was causing a parsing error, leading to a cascade of incorrect "Cannot find name" errors.
        } catch (error) {
            console.error("Export failed:", error);
            alert("Sorry, there was an error exporting the loop.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const toggleAutomationRecord = () => {
        setIsRecordingAutomation(prev => !prev);
    };

    const clearAutomation = () => {
        if (window.confirm("Are you sure you want to clear all automation data? This cannot be undone.")) {
            setAutomationData({});
        }
    };
    
    const displayInstruments = useMemo(() => {
        if (isPlaying && currentStep >= 0 && automationData[currentStep]) {
            const stepAutomation = automationData[currentStep];
            return instruments.map((inst, idx) => {
                if (stepAutomation[idx]) {
                    return { ...inst, ...stepAutomation[idx] };
                }
                return inst;
            });
        }
        return instruments;
    }, [instruments, isPlaying, currentStep, automationData]);


    if (!isInitialized) {
        return <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white font-mono">Loading Drum Machine...</div>;
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 p-2 shadow-lg">
               <Controls
                    isPlaying={isPlaying}
                    togglePlay={togglePlay}
                    bpm={bpm}
                    setBpm={setBpm}
                    masterVolume={masterVolume}
                    onMasterVolumeChange={setMasterVolume}
                    numBars={numBars}
                    onNumBarsChange={onNumBarsChange}
                />
            </header>
            <main className="flex-grow flex flex-col px-2 md:px-4 pb-2 md:pb-4">
                <div className="flex-grow w-full h-[50vh] md:h-auto rounded-lg overflow-hidden bg-gray-900 relative shadow-inner">
                     <Canvas shadows camera={{ position: [0, 10, 20], fov: 50 }}>
                        <DrumMachineScene 
                            grid={grid} 
                            currentStep={currentStep} 
                            isPlaying={isPlaying} 
                            totalSteps={totalSteps} 
                        />
                    </Canvas>
                </div>
                <SequencerGrid
                    grid={grid}
                    toggleStep={toggleStep}
                    currentStep={currentStep}
                    numBars={numBars}
                    instruments={displayInstruments}
                    onVolumeChange={handleVolumeChange}
                    onMuteToggle={handleMuteToggle}
                    onPitchChange={handlePitchChange}
                    onStartTimeChange={handleStartTimeChange}
                    onEndTimeChange={handleEndTimeChange}
                    onFileChange={handleFileChange}
                    onExportLoop={handleExportLoop}
                    isExporting={isExporting}
                    isRecordingAutomation={isRecordingAutomation}
                    onToggleAutomationRecord={toggleAutomationRecord}
                    onClearAutomation={clearAutomation}
                />
            </main>
        </div>
    );
};

export default App;