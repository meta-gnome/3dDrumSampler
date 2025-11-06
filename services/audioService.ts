import { Instrument, AutomationGrid, AutomationData } from '../types';
import { STEPS_PER_BAR } from '../constants';

class AudioService {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private audioBuffers: Map<number, AudioBuffer> = new Map();

    private initializeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
        }
    }

    public async loadSamples(instruments: Instrument[]): Promise<void> {
        this.initializeAudioContext();
        if (!this.audioContext) return;

        const promises = instruments.map(async (instrument, index) => {
            if (!instrument.url) return; // Don't try to load empty URLs
            try {
                const response = await fetch(instrument.url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
                this.audioBuffers.set(index, audioBuffer);
            } catch (error) {
                console.error(`Failed to load default sample for instrument ${instrument.name}:`, error);
            }
        });
        await Promise.all(promises);
    }
    
    public async loadUserSample(file: File, instrumentIndex: number): Promise<void> {
        if (!this.audioContext) return;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(instrumentIndex, audioBuffer);
        } catch (error) {
            console.error(`Failed to load user sample for instrument ${instrumentIndex}:`, error);
            alert(`Could not load audio file: ${file.name}. Please check the file format.`);
        }
    }

    public playSound(instrument: Instrument, instrumentIndex: number, time: number, automation?: AutomationData) {
        if (!this.audioContext || !this.masterGain) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const buffer = this.audioBuffers.get(instrumentIndex);
        if (!buffer || instrument.isMuted) {
            return;
        }

        const finalInstrument = { ...instrument, ...automation };

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = finalInstrument.volume;

        source.connect(gainNode).connect(this.masterGain);

        const semitones = finalInstrument.pitch;
        source.playbackRate.value = Math.pow(2, semitones / 12);

        const offset = buffer.duration * finalInstrument.startTime;
        const duration = buffer.duration * (finalInstrument.endTime - finalInstrument.startTime);

        source.start(time, offset, Math.max(0, duration));
    }

    public setMasterVolume(volume: number) {
        if (!this.masterGain || !this.audioContext) return;
        this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }

    public get currentTime(): number {
        return this.audioContext?.currentTime ?? 0;
    }

    public async exportLoopAsWav(
        grid: boolean[][],
        instruments: Instrument[],
        bpm: number,
        numBars: number,
        automationData: AutomationGrid
    ): Promise<void> {
        if (!this.audioContext) return;
    
        const totalSteps = STEPS_PER_BAR * numBars;
        const noteDuration = 60 / bpm / 4; // 16th note duration
        const loopDuration = totalSteps * noteDuration;
    
        const offlineContext = new OfflineAudioContext(
            this.audioContext.destination.channelCount,
            Math.ceil(loopDuration * this.audioContext.sampleRate),
            this.audioContext.sampleRate
        );
    
        const masterGain = offlineContext.createGain();
        masterGain.connect(offlineContext.destination);
        masterGain.gain.value = 1; 
    
        for (let step = 0; step < totalSteps; step++) {
            const time = step * noteDuration;
            const stepAutomation = automationData[step];
            for (let i = 0; i < instruments.length; i++) {
                if (grid[i][step]) {
                    const instrument = instruments[i];
                    const automationForInstrument = stepAutomation ? stepAutomation[i] : undefined;
                    const finalInstrument = { ...instrument, ...automationForInstrument };
                    
                    const buffer = this.audioBuffers.get(i);
                    if (!buffer || finalInstrument.isMuted) continue;
    
                    const source = offlineContext.createBufferSource();
                    source.buffer = buffer;
    
                    const gainNode = offlineContext.createGain();
                    gainNode.gain.value = finalInstrument.volume;
    
                    source.connect(gainNode).connect(masterGain);
    
                    source.playbackRate.value = Math.pow(2, finalInstrument.pitch / 12);
    
                    const offset = buffer.duration * finalInstrument.startTime;
                    const duration = buffer.duration * (finalInstrument.endTime - finalInstrument.startTime);
    
                    source.start(time, offset, Math.max(0, duration));
                }
            }
        }
    
        const renderedBuffer = await offlineContext.startRendering();
        this.downloadBufferAsWav(renderedBuffer);
    }
    
    private downloadBufferAsWav(buffer: AudioBuffer): void {
        const wavBlob = this.bufferToWave(buffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `drum-loop-${Date.now()}.wav`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
    
    private bufferToWave(abuffer: AudioBuffer): Blob {
        const numOfChan = abuffer.numberOfChannels;
        const length = abuffer.length * numOfChan * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let i;
        let sample;
        let pos = 0;
    
        const setUint16 = (data: number) => {
            view.setUint16(pos, data, true);
            pos += 2;
        }
        const setUint32 = (data: number) => {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    
        // write WAVE header
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length of fmt data
        setUint16(1); // PCM - integer samples
        setUint16(numOfChan); // number of channels
        setUint32(abuffer.sampleRate); // sample rate
        setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
        setUint16(numOfChan * 2); // block align
        setUint16(16); // bits per sample
        setUint32(0x61746164); // "data" chunk
        setUint32(length - pos - 4); // data length
    
        for (i = 0; i < abuffer.numberOfChannels; i++) {
            channels.push(abuffer.getChannelData(i));
        }
    
        let offset = 0;
        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                setUint16(sample);
            }
            offset++;
        }
    
        return new Blob([view], { type: "audio/wav" });
    }
}

export const audioService = new AudioService();