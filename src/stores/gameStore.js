import { create } from 'zustand';

export const useGameStore = create((set) => ({
  session: null,
  puzzles: [],
  inventory: [],
  currentRoom: 'foyer',
  score: 1000,
  timer: 600,
  timerActive: false,
  hintsUsed: 0,
  solvedPuzzles: [],
  unlockedDoors: [],
  gameStatus: 'idle',
  echoMessages: [],
  gameLevel: 1,

  setSession: (session) => set({ session, score: session?.score || 1000, timer: session?.timer || 600 }),
  setGameLevel: (level) => set({ gameLevel: level }),
  setPuzzles: (puzzles) => set({ puzzles }),
  setInventory: (inventory) => set({ inventory }),
  addItem: (item) => set((s) => ({ inventory: [...s.inventory, item] })),
  removeItem: (itemId) => set((s) => ({ inventory: s.inventory.filter(i => i._id !== itemId) })),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setScore: (score) => set({ score }),
  setTimer: (timer) => set({ timer }),
  setTimerActive: (active) => set({ timerActive: active }),
  addHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1, score: Math.max(0, s.score - 50) })),
  solvePuzzle: (puzzleId, points) => set((s) => ({
    solvedPuzzles: [...s.solvedPuzzles, puzzleId],
    score: s.score + (points || 0)
  })),
  unlockDoor: (door) => set((s) => ({ unlockedDoors: [...s.unlockedDoors, door] })),
  setGameStatus: (status) => set({ gameStatus: status }),
  addEchoMessage: (msg) => set((s) => ({ echoMessages: [...s.echoMessages.slice(-9), msg] })),
  resetGame: () => set({
    session: null, puzzles: [], inventory: [], currentRoom: 'foyer',
    score: 1000, timer: 600, timerActive: false, hintsUsed: 0,
    solvedPuzzles: [], unlockedDoors: [], gameStatus: 'idle', echoMessages: [], gameLevel: 1
  })
}));
