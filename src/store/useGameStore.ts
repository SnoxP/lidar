import { create } from 'zustand';

interface GameState {
  health: number;
  jumpscare: boolean;
  gameStarted: boolean;
  takeDamage: (amount: number) => void;
  triggerJumpscare: () => void;
  startGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  health: 100,
  jumpscare: false,
  gameStarted: false,
  takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
  triggerJumpscare: () => {
    set({ jumpscare: true });
    // Keep it active briefly for visual effect
    setTimeout(() => {
      set({ jumpscare: false });
    }, 200);
  },
  startGame: () => set({ gameStarted: true, health: 100 }),
  resetGame: () => set({ gameStarted: false, health: 100 })
}));
