import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useGameStore } from './gameStore';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  players: [],
  cursors: {},
  chatMessages: [],
  typingUsers: [],

  connect: (token) => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5002' : window.location.origin);
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('playerJoined', (player) => {
      set((s) => ({ players: [...s.players.filter(p => p.userId !== player.userId), player] }));
    });
    socket.on('playerLeft', (player) => {
      set((s) => ({ players: s.players.filter(p => p.userId !== player.userId), cursors: { ...s.cursors, [player.userId]: undefined } }));
    });
    socket.on('playerReady', (data) => {
      set((s) => ({ players: s.players.map(p => p.userId === data.userId ? { ...p, ready: data.ready } : p) }));
    });
    socket.on('chatMessage', (msg) => {
      set((s) => ({ chatMessages: [...s.chatMessages.slice(-99), msg] }));
    });
    socket.on('cursorMove', (data) => {
      set((s) => ({ cursors: { ...s.cursors, [data.userId]: { x: data.x, y: data.y, username: data.username } } }));
    });
    socket.on('typingIndicator', (data) => {
      set((s) => {
        const filtered = s.typingUsers.filter(u => u.userId !== data.userId);
        return { typingUsers: data.typing ? [...filtered, data] : filtered };
      });
    });
    socket.on('itemCollected', (data) => {
      set((s) => ({
        chatMessages: [...(s.chatMessages || []).slice(-99), {
          type: 'system', username: 'System',
          message: `${data.username} collected ${data.item?.name || 'an item'}`
        }]
      }));
    });
    socket.on('puzzleSolved', (data) => {
      const game = useGameStore.getState();
      const solved = game.solvedPuzzles || [];
      if (!solved.includes(data.puzzleId)) {
        game.solvePuzzle(data.puzzleId, data.points || 0);
      }
      set((s) => ({
        chatMessages: [...(s.chatMessages || []).slice(-99), {
          type: 'system', username: 'System',
          message: `${data.username} solved ${data.puzzleName || 'a puzzle'}! (+${data.points || 0} pts)`
        }]
      }));
    });
    socket.on('timerUpdated', (data) => { /* handled via game store */ });
    socket.on('gameWon', () => {});
    socket.on('gameLost', () => {});

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) { socket.disconnect(); set({ socket: null, connected: false }); }
  },

  joinRoom: (roomId) => get().socket?.emit('joinRoom', { roomId }),
  leaveRoom: (roomId) => get().socket?.emit('leaveRoom', { roomId }),
  sendReady: (roomId, ready) => get().socket?.emit('playerReady', { roomId, ready }),
  sendChat: (roomId, message) => get().socket?.emit('chatMessage', { roomId, message }),
  sendCursor: (roomId, x, y) => get().socket?.emit('cursorMove', { roomId, x, y }),
  sendTyping: (roomId, typing) => get().socket?.emit(typing ? 'typingStart' : 'typingStop', { roomId }),
  emitItemCollected: (roomId, item) => get().socket?.emit('itemCollected', { roomId, item }),
  emitPuzzleSolved: (roomId, data) => get().socket?.emit('puzzleSolved', { roomId, ...data }),
  emitHintUsed: (roomId, data) => get().socket?.emit('hintUsed', { roomId, ...data }),
  emitDoorUnlocked: (roomId, doorName) => get().socket?.emit('doorUnlocked', { roomId, doorName }),
  startTimer: (roomId, duration, sessionId) => get().socket?.emit('startTimer', { roomId, duration, sessionId }),
  emitGameWon: (roomId, data) => get().socket?.emit('gameWon', { roomId, ...data }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages.slice(-99), msg] })),
  clearChat: () => set({ chatMessages: [] })
}));
