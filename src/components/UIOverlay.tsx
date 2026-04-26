import React from 'react';
import { useGameStore } from '../store/useGameStore';

export function UIOverlay() {
  const health = useGameStore(s => s.health);
  const jumpscare = useGameStore(s => s.jumpscare);

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
       {/* Health */}
       <div className="absolute top-6 right-8 text-[#00ffaa] font-mono text-xl tracking-widest pointer-events-none flex items-center gap-4">
          <div className="w-32 h-2 bg-neutral-900 overflow-hidden outline outline-1 outline-[#00ffaa]/30">
            <div 
               className="h-full bg-[#00ffaa] transition-all duration-300 ease-out"
               style={{ width: `${health}%`, backgroundColor: health < 30 ? '#ff0000' : '#00ffaa' }}
            />
          </div>
          <span style={{ color: health < 30 ? '#ff0000' : '#00ffaa' }}>
             {health}%
          </span>
       </div>

       {/* Crosshair */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#00ffaa]/50 rounded-full" />

       {/* Jumpscare overlay */}
       {jumpscare && (
          <div className="absolute inset-0 bg-red-900 invert mix-blend-difference pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")', opacity: 0.8 }} />
       )}

       {/* Game Over */}
       {health <= 0 && (
         <div className="absolute inset-0 bg-black flex flex-col items-center justify-center font-mono group pointer-events-auto">
            <h1 className="text-red-600 text-6xl tracking-widest mb-8">SIGNAL LOST</h1>
            <button 
              className="px-6 py-2 border border-red-900 text-red-500 hover:bg-red-900/20 z-50 cursor-pointer pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
              onClick={() => useGameStore.getState().resetGame()}
            >
              REBOOT SYSTEM
            </button>
         </div>
       )}
    </div>
  );
}
