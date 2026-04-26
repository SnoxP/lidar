import React from 'react';
import { MainGame } from './components/MainGame';
import { UIOverlay } from './components/UIOverlay';

export default function App() {
  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative selection:bg-teal-900 selection:text-teal-50">
      <UIOverlay />
      <MainGame />
    </div>
  );
}
