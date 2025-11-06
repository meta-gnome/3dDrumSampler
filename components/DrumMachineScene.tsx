import React from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import Step from './Step';
import { NUM_INSTRUMENTS } from '../constants';

interface DrumMachineSceneProps {
    grid: boolean[][];
    currentStep: number;
    isPlaying: boolean;
    totalSteps: number;
}

const DrumMachineScene: React.FC<DrumMachineSceneProps> = ({ grid, currentStep, isPlaying, totalSteps }) => {
    return (
        <>
            <color attach="background" args={['#111827']} />
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 10, 5]} intensity={1} castShadow />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {grid.map((row, instrumentIndex) => 
                row.map((isActive, stepIndex) => {
                    const radius = 2.5 + instrumentIndex * 1.5;
                    const angle = (stepIndex / totalSteps) * Math.PI * 2;
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);

                    return (
                        <Step
                            key={`${instrumentIndex}-${stepIndex}`}
                            position={[x, 0, z]}
                            isActive={isActive}
                            isCurrentStep={isPlaying && currentStep === stepIndex}
                            instrumentIndex={instrumentIndex}
                        />
                    );
                })
            )}

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <circleGeometry args={[12, 64]} />
                <meshStandardMaterial color="#080d19" roughness={0.7} metalness={0.2} />
            </mesh>

            <OrbitControls enablePan={false} enableZoom={true} minDistance={5} maxDistance={30} />
        </>
    );
};

export default DrumMachineScene;