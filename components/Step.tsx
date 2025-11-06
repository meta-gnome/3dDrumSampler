
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NUM_INSTRUMENTS } from '../constants';

interface StepProps {
    position: [number, number, number];
    isActive: boolean;
    isCurrentStep: boolean;
    instrumentIndex: number;
}

const INACTIVE_COLOR = new THREE.Color('#374151');
const CURRENT_STEP_COLOR = new THREE.Color('#ffffff');

const Step: React.FC<StepProps> = ({ position, isActive, isCurrentStep, instrumentIndex }) => {
    const meshRef = useRef<THREE.Mesh>(null!);

    const activeColor = useMemo(() => {
        const hue = instrumentIndex / NUM_INSTRUMENTS;
        return new THREE.Color().setHSL(hue, 0.7, 0.6);
    }, [instrumentIndex]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.MeshStandardMaterial;

        let targetColor;
        let targetEmissiveColor = new THREE.Color('#000000');
        let targetEmissiveIntensity = 0;
        const targetScale = new THREE.Vector3(1, 1, 1);
        
        if (isActive) {
            targetColor = activeColor;
            targetEmissiveColor = activeColor;
            targetEmissiveIntensity = 2.0;
        } else {
            targetColor = INACTIVE_COLOR;
        }

        if (isCurrentStep) {
            targetColor = CURRENT_STEP_COLOR;
            const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5;
            targetScale.set(1 + pulse * 0.2, 1 + pulse * 0.2, 1 + pulse * 0.2);
            if (isActive) {
                 const pulseIntensity = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
                 targetEmissiveIntensity = 4.0 * pulseIntensity;
            }
        }
        
        material.color.lerp(targetColor, 0.1);
        meshRef.current.scale.lerp(targetScale, 0.1);
        material.emissive.lerp(targetEmissiveColor, 0.1);
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissiveIntensity, 0.1);
    });

    return (
        <mesh ref={meshRef} position={position} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial 
                color={INACTIVE_COLOR} 
                roughness={0.5} 
                metalness={0.1}
                emissive={new THREE.Color('#000000')}
                emissiveIntensity={0}
            />
        </mesh>
    );
};

export default Step;