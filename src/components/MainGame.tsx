import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, PointerLockControls } from '@react-three/drei';
import { keyboardMap } from '../utils/keyboardMap';
import { Player } from './game/Player';
import { Environment } from './game/Environment';
import { Monster } from './game/Monster';
import { useGameStore } from '../store/useGameStore';

export function MainGame() {
  const [locked, setLocked] = useState(false);
  const health = useGameStore(s => s.health);

  if (health <= 0) return null;

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas camera={{ fov: 75, position: [0, 2, 0] }}>
         <color attach="background" args={['#000000']} />
         
         {/* Only physics running, no lighting/meshes visible */}
         <Physics gravity={[0, -9.81, 0]}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 10, 0]} intensity={0.5} />
            <Player />
            <Environment />
            <Monster />
         </Physics>

         <PointerLockControls 
            onLock={() => setLocked(true)} 
            onUnlock={() => setLocked(false)} 
         />
      </Canvas>
      
      {!locked && health > 0 && (
         <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
            <div className="text-[#00ffaa] font-mono text-center max-w-lg p-8 border border-[#00ffaa]/20 bg-black/50 backdrop-blur-sm shadow-[0_0_50px_rgba(0,255,170,0.1)]">
               <h2 className="text-2xl mb-6 tracking-[0.2em] uppercase">System Ready</h2>
               <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
                 You are entirely blind. Use the scanner to map the environment. <br/><br/>
                 Hold click or Space to scan.<br/>
                 WASD to move.<br/>
                 <br/>
                 <span className="text-red-500 font-bold tracking-widest">DO NOT SCAN THE ANOMALY.</span>
               </p>
               
               <p className="text-xs text-neutral-500 mb-8 italic">
                 Note: If the game doesn't capture your mouse, please open this app in a new tab.
               </p>
               
               <div className="px-8 py-3 bg-[#00ffaa]/10 border border-[#00ffaa]/50 uppercase tracking-widest text-[#00ffaa] animate-pulse pointer-events-none">
                  Click anywhere to Initialize
               </div>
            </div>
         </div>
      )}
    </KeyboardControls>
  );
}
