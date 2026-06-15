import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiStar, FiZap, FiMessageSquare, FiX, FiSend, FiHelpCircle, FiPackage, FiChevronRight, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../api/client';

// Fallback puzzles - used when backend is unavailable or DB not seeded
const FALLBACK_PUZZLES = [
  // ===== FOYER =====
  {
    _id: 'local-foyer-door', chapterId: 'abandoned-mansion', roomId: 'foyer', name: 'The Riddle Door',
    type: 'riddle', objectName: 'door',
    description: 'The door has a carved face that speaks in riddles.',
    question: 'I have cities but no houses, forests but no trees, water but no fish. What am I?',
    answer: 'map', options: ['map', 'globe', 'painting', 'dream'],
    hint1: 'Think of something that represents places without being the actual place...',
    hint2: 'You might unfold me on a table to plan a trip.',
    hint3: 'A MAP shows cities, forests, and water but has none of them.',
    points: 100, difficulty: 'easy', order: 1,
    rewards: { coins: 30, xp: 20, item: 'old-key' }
  },
  {
    _id: 'local-foyer-clock', chapterId: 'abandoned-mansion', roomId: 'foyer', name: 'The Stopped Clock',
    type: 'logic', objectName: 'clock',
    description: 'A grandfather clock with a cryptic message carved underneath.',
    question: 'If you have me, you want to share me. If you share me, you don\'t have me. What am I?',
    answer: 'secret', options: [],
    hint1: 'Think of something valuable that loses value when shared...',
    hint2: 'People whisper these to trusted friends.',
    hint3: 'A SECRET - once shared, it\'s no longer just yours.',
    points: 120, difficulty: 'medium', order: 2,
    rewards: { coins: 40, xp: 25 }
  },
  {
    _id: 'local-foyer-painting', chapterId: 'abandoned-mansion', roomId: 'foyer', name: 'Portrait\'s Secret',
    type: 'math', objectName: 'painting',
    description: 'A portrait with numbers hidden in the brushstrokes.',
    question: 'I am an odd number. Take away one letter and I become even. What number am I?',
    answer: 'seven', options: ['seven', 'three', 'five', 'nine'],
    hint1: 'Think about the word, not just the number...',
    hint2: 'Remove the letter "s" from the word.',
    hint3: 'SEVEN without S = EVEN.',
    points: 80, difficulty: 'easy', order: 3,
    rewards: { coins: 25, xp: 15, item: 'painting-shard' }
  },

  // ===== LIBRARY =====
  {
    _id: 'local-library-bookshelf', chapterId: 'abandoned-mansion', roomId: 'library', name: 'Ancient Tome',
    type: 'riddle', objectName: 'bookshelf',
    description: 'An open book displays a riddle on yellowed pages.',
    question: 'What has many keys but can\'t open a single lock?',
    answer: 'piano', options: ['piano', 'keyboard', 'map', 'book'],
    hint1: 'Think of something musical...',
    hint2: 'It has 88 keys and makes beautiful sounds.',
    hint3: 'A PIANO has keys but opens no locks.',
    points: 100, difficulty: 'easy', order: 4,
    rewards: { coins: 30, xp: 20, item: 'torn-page' }
  },
  {
    _id: 'local-library-painting', chapterId: 'abandoned-mansion', roomId: 'library', name: 'Hidden Masterpiece',
    type: 'observation', objectName: 'painting',
    description: 'A painting with barely visible details.',
    question: 'What can travel around the world while staying in a corner?',
    answer: 'stamp', options: ['stamp', 'moon', 'internet', 'thought'],
    hint1: 'Think of something you put on mail...',
    hint2: 'It sits in the corner of an envelope.',
    hint3: 'A STAMP travels the world in corners of envelopes.',
    points: 90, difficulty: 'easy', order: 5,
    rewards: { coins: 25, xp: 15, item: 'magnifying-glass' }
  },
  {
    _id: 'local-library-table', chapterId: 'abandoned-mansion', roomId: 'library', name: 'Scholar\'s Desk',
    type: 'word', objectName: 'table',
    description: 'Scattered letters on the desk form a puzzle.',
    question: 'What 5-letter word becomes shorter when you add two letters to it?',
    answer: 'short', options: [],
    hint1: 'The answer describes length...',
    hint2: 'Add "er" to the end.',
    hint3: 'SHORT + ER = SHORTER (the word literally becomes "shorter").',
    points: 130, difficulty: 'medium', order: 6,
    rewards: { coins: 45, xp: 30, item: 'library-key' }
  },

  // ===== STUDY =====
  {
    _id: 'local-study-safe', chapterId: 'abandoned-mansion', roomId: 'study', name: 'The Safe Code',
    type: 'sequence', objectName: 'safe',
    description: 'A safe with a number sequence puzzle.',
    question: 'What comes next: 1, 11, 21, 1211, 111221, ?',
    answer: '312211', options: [],
    hint1: 'Each number describes the previous one...',
    hint2: '1 = "one 1" = 11. 11 = "two 1s" = 21.',
    hint3: '111221 = "three 1s, two 2s, one 1" = 312211.',
    points: 200, difficulty: 'hard', order: 7,
    rewards: { coins: 75, xp: 50, item: 'safe-contents' }
  },
  {
    _id: 'local-study-computer', chapterId: 'abandoned-mansion', roomId: 'study', name: 'Terminal Access',
    type: 'cipher', objectName: 'computer',
    description: 'An old terminal requires a password.',
    question: 'The password is the reverse of "desserts". What is it?',
    answer: 'stressed', options: [],
    hint1: 'Read the word backwards...',
    hint2: 'It\'s a feeling you get after a long day.',
    hint3: 'DESSERTS reversed = STRESSED.',
    points: 150, difficulty: 'medium', order: 8,
    rewards: { coins: 50, xp: 35, item: 'rusty-key' }
  },
  {
    _id: 'local-study-table', chapterId: 'abandoned-mansion', roomId: 'study', name: 'Detective\'s Notes',
    type: 'logic', objectName: 'table',
    description: 'Case notes with a logic puzzle.',
    question: '3 switches control 3 bulbs in another room. You can only enter once. How do you know which switch controls which bulb?',
    answer: 'heat', options: ['heat', 'color', 'sound', 'smell'],
    hint1: 'Turn on switch 1 for a while, then turn it off...',
    hint2: 'One bulb will be ON, one will be warm, one will be cold.',
    hint3: 'The warm (but off) bulb = switch 1. Use HEAT to tell.',
    points: 180, difficulty: 'hard', order: 9,
    rewards: { coins: 60, xp: 40, item: 'desk-drawer-key' }
  },

  // ===== BEDROOM =====
  {
    _id: 'local-bedroom-mirror', chapterId: 'abandoned-mansion', roomId: 'bedroom', name: 'Cursed Mirror',
    type: 'riddle', objectName: 'mirror',
    description: 'The mirror shows riddles instead of reflections.',
    question: 'What has a head and a tail but no body?',
    answer: 'coin', options: ['coin', 'snake', 'comet', 'story'],
    hint1: 'Think of something you flip...',
    hint2: 'You might use it to make a decision.',
    hint3: 'A COIN has heads and tails but no body.',
    points: 100, difficulty: 'easy', order: 10,
    rewards: { coins: 30, xp: 20, item: 'mirror-shard' }
  },
  {
    _id: 'local-bedroom-table', chapterId: 'abandoned-mansion', roomId: 'bedroom', name: 'Card Game',
    type: 'logic', objectName: 'table',
    description: 'Playing cards arranged in a pattern.',
    question: 'In a race, you overtake the 2nd place runner. What position are you now?',
    answer: 'second', options: ['first', 'second', 'third', 'last'],
    hint1: 'Think carefully - you took someone\'s place...',
    hint2: 'You replaced the person in 2nd.',
    hint3: 'You are now SECOND (you took 2nd place, not 1st!).',
    points: 120, difficulty: 'medium', order: 11,
    rewards: { coins: 40, xp: 25, item: 'matching-card' }
  },
  {
    _id: 'local-bedroom-clock', chapterId: 'abandoned-mansion', roomId: 'bedroom', name: 'Alarm Code',
    type: 'math', objectName: 'clock',
    description: 'An alarm clock with a math lock.',
    question: 'What is 1/2 of 2/3 of 3/4 of 4/5 of 5/6 of 6/7 of 7/8 of 8/9 of 9/10 of 1000?',
    answer: '100', options: [],
    hint1: 'Notice how numerators cancel with denominators...',
    hint2: 'Most fractions cancel out.',
    hint3: 'Everything cancels except 1/10, so answer is 1000/10 = 100.',
    points: 150, difficulty: 'hard', order: 12,
    rewards: { coins: 50, xp: 35, item: 'clock-hand' }
  },

  // ===== BASEMENT =====
  {
    _id: 'local-basement-door', chapterId: 'abandoned-mansion', roomId: 'basement', name: 'Final Door',
    type: 'riddle', objectName: 'door',
    description: 'The exit door has one final riddle.',
    question: 'The more you take, the more you leave behind. What am I?',
    answer: 'footsteps', options: ['footsteps', 'photos', 'memories', 'breaths'],
    hint1: 'Think about walking...',
    hint2: 'They show where you\'ve been.',
    hint3: 'FOOTSTEPS - the more you take, the more you leave behind.',
    points: 100, difficulty: 'easy', order: 13,
    rewards: { coins: 30, xp: 20, item: 'basement-key' }
  },
  {
    _id: 'local-basement-safe', chapterId: 'abandoned-mansion', roomId: 'basement', name: 'Vault Logic',
    type: 'logic', objectName: 'safe',
    description: 'A vault with a classic logic puzzle.',
    question: 'A farmer has 17 sheep. All but 9 die. How many sheep are left?',
    answer: '9', options: ['8', '9', '17', '0'],
    hint1: 'Read carefully - "all but 9"...',
    hint2: '"All but 9 die" means 9 don\'t die.',
    hint3: '9 sheep are left alive.',
    points: 120, difficulty: 'easy', order: 14,
    rewards: { coins: 40, xp: 25, item: 'vault-contents' }
  },
  {
    _id: 'local-basement-computer', chapterId: 'abandoned-mansion', roomId: 'basement', name: 'Escape Terminal',
    type: 'cipher', objectName: 'computer',
    description: 'The final terminal to unlock freedom.',
    question: 'What word is always spelled wrong in the dictionary?',
    answer: 'wrong', options: [],
    hint1: 'Think about the literal meaning...',
    hint2: 'The word itself is the answer.',
    hint3: 'WRONG - it\'s always spelled W-R-O-N-G in the dictionary!',
    points: 250, difficulty: 'medium', order: 15,
    rewards: { coins: 100, xp: 75, item: 'freedom' }
  }
];

const ROOMS = {
  foyer: { name: 'Foyer', objects: ['door', 'clock', 'painting'], exits: ['library', 'study'], bg: 'from-amber-900/20 to-stone-900/20' },
  library: { name: 'Library', objects: ['bookshelf', 'painting', 'table'], exits: ['foyer', 'bedroom'], bg: 'from-emerald-900/20 to-stone-900/20' },
  study: { name: 'Study', objects: ['safe', 'computer', 'table'], exits: ['foyer', 'basement'], bg: 'from-blue-900/20 to-stone-900/20' },
  bedroom: { name: 'Bedroom', objects: ['mirror', 'table', 'clock'], exits: ['library', 'basement'], bg: 'from-purple-900/20 to-stone-900/20' },
  basement: { name: 'Basement', objects: ['door', 'safe', 'computer'], exits: ['study', 'bedroom'], bg: 'from-red-900/20 to-stone-900/20' }
};

const OBJECT_ICONS = {
  door: '🚪', clock: '🕰️', painting: '🖼️', bookshelf: '📚',
  table: '🪑', safe: '🔒', computer: '💻', mirror: '🪞'
};

export default function Game() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const game = useGameStore();
  const { cursors, chatMessages, sendChat, addChatMessage, joinRoom } = useSocketStore();
  const [puzzles, setPuzzles] = useState([]);
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [answer, setAnswer] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [currentHint, setCurrentHint] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [useLocalMode, setUseLocalMode] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [levelInfo, setLevelInfo] = useState({ old: 1, new: 1 });
  const chatRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Try to load session from backend, then load puzzles with correct level
    api.get(`/game/${sessionId}`).then(r => {
      const sessionData = r.data.session;
      game.setSession(sessionData);
      const level = sessionData.gameLevel || 1;
      game.setGameLevel(level);

      // Fetch random puzzles based on session level
      api.get(`/puzzle/random?chapter=abandoned-mansion&level=${level}`)
        .then(pRes => {
          if (pRes.data.puzzles && pRes.data.puzzles.length > 0) {
            setPuzzles(pRes.data.puzzles);
          } else {
            setPuzzles(FALLBACK_PUZZLES);
            setUseLocalMode(true);
            toast('Playing in offline mode - puzzles loaded locally', { icon: '🎮' });
          }
        })
        .catch(() => {
          setPuzzles(FALLBACK_PUZZLES);
          setUseLocalMode(true);
          toast('Playing in offline mode - puzzles loaded locally', { icon: '🎮' });
        });
    }).catch(() => {
      // If backend unavailable, create a local session object
      game.setSession({ _id: sessionId, mode: 'practice', status: 'active', timer: 600, gameLevel: 1 });
      game.setGameLevel(1);
      setUseLocalMode(true);
      setPuzzles(FALLBACK_PUZZLES);
      toast('Playing in offline mode - puzzles loaded locally', { icon: '🎮' });
    });

    api.get(`/inventory/session/${sessionId}`).then(r => game.setInventory(r.data.items)).catch(() => {});
    joinRoom(sessionId);

    timerRef.current = setInterval(() => {
      if (game.timerActive && game.timer > 0) {
        game.setTimer(game.timer - 1);
      } else if (game.timer <= 0 && game.timerActive) {
        endGame(false);
      }
    }, 1000);

    game.setTimerActive(true);
    game.setGameStatus('active');
    game.addEchoMessage({ text: "I'm here to help! Click on objects to investigate. Good luck!", type: 'tip' });

    return () => { clearInterval(timerRef.current); };
  }, [sessionId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const endGame = useCallback(async (won) => {
    clearInterval(timerRef.current);
    game.setTimerActive(false);

    // Local mode - just show results without API call
    if (useLocalMode) {
      const coinsEarned = won ? Math.floor(game.score / 10) : 0;
      const xpEarned = won ? Math.floor(game.score / 5) : 0;
      setGameOver({ won, score: game.score, coinsEarned, xpEarned });
      if (won) setShowConfetti(true);
      game.setGameStatus(won ? 'completed' : 'failed');
      return;
    }

    // API mode
    try {
      const { data } = await api.post(`/game/${sessionId}/end`, { won });
      setGameOver(data);
      if (won) {
        setShowConfetti(true);
        updateUser({ coins: data.coinsEarned ? (user.coins || 0) + data.coinsEarned : user.coins });
        if (data.leveledUp) {
          setLeveledUp(true);
          setLevelInfo({ old: data.oldLevel, new: data.newLevel });
        }
      }
      game.setGameStatus(won ? 'completed' : 'failed');
    } catch (err) {
      // Fallback if API fails
      setGameOver({ won, score: game.score, coinsEarned: won ? Math.floor(game.score / 10) : 0 });
      if (won) setShowConfetti(true);
      game.setGameStatus(won ? 'completed' : 'failed');
    }
  }, [sessionId, game, user, useLocalMode]);

  const handleObjectClick = (objectName) => {
    const puzzle = puzzles.find(p => p.objectName === objectName && p.roomId === game.currentRoom && !game.solvedPuzzles.includes(p._id));
    if (puzzle) {
      setActivePuzzle(puzzle);
      setAnswer('');
      setHintLevel(0);
      setCurrentHint('');
    } else {
      const solved = puzzles.find(p => p.objectName === objectName && p.roomId === game.currentRoom && game.solvedPuzzles.includes(p._id));
      if (solved) toast.success('Already solved!');
      else toast('Nothing interesting here...');
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    // Local mode - validate answer client-side
    if (useLocalMode || activePuzzle._id.startsWith('local-')) {
      const correct = activePuzzle.answer.toLowerCase() === answer.trim().toLowerCase();
      if (correct) {
        toast.success('Puzzle solved!');
        game.solvePuzzle(activePuzzle._id, activePuzzle.points);
        if (activePuzzle.rewards?.item && activePuzzle.rewards.item !== 'freedom') {
          game.addItem({ _id: `item-${Date.now()}`, name: activePuzzle.rewards.item, type: 'clue', description: `Found while solving ${activePuzzle.name}` });
        }
        game.addEchoMessage({ text: `Great job solving ${activePuzzle.name}! Keep going!`, type: 'praise' });
        setActivePuzzle(null);
        // Check if all puzzles solved
        const remaining = puzzles.filter(p => !game.solvedPuzzles.includes(p._id) && p._id !== activePuzzle._id);
        if (remaining.length === 0) {
          endGame(true);
        }
      } else {
        toast.error('Wrong answer! -20 points');
        game.setScore(Math.max(0, game.score - 20));
      }
      return;
    }

    // API mode - validate via backend
    try {
      const { data } = await api.post(`/game/${sessionId}/solve`, { puzzleId: activePuzzle._id, answer: answer.trim() });
      if (data.correct) {
        toast.success(data.message);
        game.solvePuzzle(activePuzzle._id, activePuzzle.points);
        if (activePuzzle.rewards?.item && activePuzzle.rewards.item !== 'freedom') {
          try {
            const itemRes = await api.post(`/game/${sessionId}/collect`, {
              itemName: activePuzzle.rewards.item, itemType: 'clue',
              description: `Found while solving ${activePuzzle.name}`
            });
            game.addItem(itemRes.data.item);
          } catch {}
        }
        game.addEchoMessage({ text: `Great job solving ${activePuzzle.name}! Keep going!`, type: 'praise' });
        setActivePuzzle(null);
        // Check if all puzzles solved
        const remaining = puzzles.filter(p => p.roomId === game.currentRoom && !game.solvedPuzzles.includes(p._id) && p._id !== activePuzzle._id);
        if (remaining.length === 0 && puzzles.filter(p => !game.solvedPuzzles.includes(p._id) && p._id !== activePuzzle._id).length === 0) {
          endGame(true);
        }
      } else {
        toast.error(data.message);
        game.setScore(data.score);
      }
    } catch (err) {
      toast.error('Error submitting answer');
    }
  };

  const getHint = async () => {
    const nextLevel = Math.min(hintLevel + 1, 3);

    // Local mode - get hint from puzzle data directly
    if (useLocalMode || activePuzzle._id.startsWith('local-')) {
      const hints = { 1: activePuzzle.hint1, 2: activePuzzle.hint2, 3: activePuzzle.hint3 };
      setCurrentHint(hints[nextLevel] || activePuzzle.hint1);
      setHintLevel(nextLevel);
      if (game.session?.mode !== 'practice') {
        game.setScore(Math.max(0, game.score - 50));
        game.addHint();
      }
      return;
    }

    // API mode
    try {
      const { data } = await api.post(`/game/${sessionId}/hint`, { puzzleId: activePuzzle._id, hintLevel: nextLevel });
      setCurrentHint(data.hint);
      setHintLevel(nextLevel);
      if (data.score !== undefined) { game.setScore(data.score); game.addHint(); }
    } catch (err) {
      toast.error('Failed to get hint');
    }
  };

  const moveToRoom = (roomName) => {
    game.setCurrentRoom(roomName);
    game.addEchoMessage({ text: `Entering the ${ROOMS[roomName]?.name}. Look around carefully!`, type: 'tip' });
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    sendChat(sessionId, chatInput.trim());
    setChatInput('');
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const currentRoom = ROOMS[game.currentRoom];
  const roomPuzzles = puzzles.filter(p => p.roomId === game.currentRoom);

  return (
    <div className="fixed inset-0 bg-dark-900 flex flex-col z-50">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} onConfettiComplete={() => setShowConfetti(false)} />}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 glass border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="font-display font-bold text-sm text-gradient">EscapeVerse</span>
          <span className="text-sm text-dark-200">{currentRoom?.name}</span>
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
            <FiAward size={12} /> Lv.{game.gameLevel || 1}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-1 font-display font-bold ${game.timer < 60 ? 'text-red-400 animate-pulse' : game.timer < 180 ? 'text-yellow-400' : 'text-neon-cyan'}`}>
            <FiClock /> {formatTime(game.timer)}
          </div>
          <div className="flex items-center gap-1 text-yellow-400 font-bold"><FiStar /> {game.score}</div>
          <div className="flex items-center gap-1 text-dark-200"><FiZap /> {game.solvedPuzzles.length}/{puzzles.length}</div>
          <button onClick={() => setShowChat(!showChat)} className="p-1 hover:bg-white/5 rounded"><FiMessageSquare /></button>
          <button onClick={() => setShowInventory(!showInventory)} className="p-1 hover:bg-white/5 rounded"><FiPackage /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Room */}
          <div className={`absolute inset-0 bg-gradient-to-b ${currentRoom?.bg || 'from-dark-800 to-dark-900'}`}>
            {/* Objects */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 sm:gap-16 p-8">
                {currentRoom?.objects.map((obj, i) => {
                  const isSolved = roomPuzzles.some(p => p.objectName === obj && game.solvedPuzzles.includes(p._id));
                  return (
                    <motion.button
                      key={obj}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleObjectClick(obj)}
                      className={`flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl transition-all ${isSolved ? 'bg-green-500/10 border border-green-500/30' : 'glass-card cursor-pointer hover:border-neon-cyan/40'}`}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className="text-4xl sm:text-5xl">{OBJECT_ICONS[obj] || '🔍'}</span>
                      <span className="text-xs sm:text-sm font-medium capitalize">{obj}</span>
                      {isSolved && <span className="text-xs text-green-400">Solved</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Player cursors */}
            {Object.entries(cursors).map(([userId, cursor]) => cursor && (
              <div key={userId} className="absolute pointer-events-none z-20" style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}>
                <div className="w-3 h-3 bg-neon-magenta rounded-full shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
                <span className="text-xs text-neon-magenta ml-4 whitespace-nowrap">{cursor.username}</span>
              </div>
            ))}
          </div>

          {/* Room Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {currentRoom?.exits.map(exit => (
              <motion.button key={exit} whileHover={{ scale: 1.05 }} onClick={() => moveToRoom(exit)} className="btn-secondary text-sm !py-2 flex items-center gap-1">
                <FiChevronRight /> {ROOMS[exit]?.name}
              </motion.button>
            ))}
          </div>

          {/* Echo Messages */}
          <div className="absolute top-4 left-4 max-w-xs">
            <AnimatePresence>
              {game.echoMessages.slice(-2).map((msg, i) => (
                <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="glass-card !p-3 mb-2 flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center flex-shrink-0 text-xs font-bold">E</div>
                  <p className="text-xs text-dark-100">{msg.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Inventory Panel */}
        <AnimatePresence>
          {showInventory && (
            <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="w-64 glass border-l border-white/10 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm">Inventory</h3>
                <button onClick={() => setShowInventory(false)}><FiX /></button>
              </div>
              {game.inventory.length === 0 ? (
                <p className="text-xs text-dark-300 text-center mt-8">No items collected yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {game.inventory.map(item => (
                    <div key={item._id} className="glass-card !p-3 text-center">
                      <span className="text-2xl">{item.type === 'key' ? '🔑' : item.type === 'tool' ? '🔧' : '📜'}</span>
                      <p className="text-xs mt-1 truncate">{item.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="w-72 glass border-l border-white/10 flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <h3 className="font-display font-bold text-sm">Chat</h3>
                <button onClick={() => setShowChat(false)}><FiX /></button>
              </div>
              <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`text-xs ${msg.type === 'system' ? 'text-dark-300 italic' : ''}`}>
                    <span className="font-semibold text-neon-cyan">{msg.username || msg.userId?.username}: </span>
                    <span className="text-dark-100">{msg.message}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10 flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} placeholder="Type..." className="input-field text-xs !py-2" />
                <button onClick={handleChatSend} className="btn-primary !p-2 !px-3"><FiSend size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Puzzle Modal */}
      <AnimatePresence>
        {activePuzzle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg">{activePuzzle.name}</h2>
                <button onClick={() => setActivePuzzle(null)} className="p-1 hover:bg-white/5 rounded"><FiX /></button>
              </div>

              <p className="text-sm text-dark-200 mb-2">{activePuzzle.description}</p>
              <div className="glass !p-4 mb-4 rounded-xl">
                <p className="text-sm font-medium">{activePuzzle.question}</p>
              </div>

              {activePuzzle.options?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {activePuzzle.options.map(opt => (
                    <button key={opt} onClick={() => { setAnswer(opt); }} className={`glass-card !p-3 text-sm text-center ${answer === opt ? 'border-neon-cyan bg-neon-cyan/10' : ''}`}>{opt}</button>
                  ))}
                </div>
              ) : (
                <input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitAnswer()} placeholder="Type your answer..." className="input-field mb-4" />
              )}

              {currentHint && (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass !p-3 mb-4 rounded-xl border-l-4 border-yellow-400">
                  <p className="text-xs text-yellow-300"><FiHelpCircle className="inline mr-1" /> {currentHint}</p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <button onClick={submitAnswer} className="btn-primary flex-1">Submit Answer</button>
                {hintLevel < 3 && (
                  <button onClick={getHint} className="btn-secondary flex items-center gap-1">
                    <FiHelpCircle /> Hint {hintLevel + 1} {game.session?.mode !== 'practice' && '(-50pts)'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-card w-full max-w-md text-center">
              <div className="text-6xl mb-4">{gameOver.won ? '🎉' : '⏰'}</div>
              <h2 className="font-display text-3xl font-bold mb-2">{gameOver.won ? 'ESCAPED!' : 'TIME IS UP'}</h2>
              <p className="text-dark-200 mb-4">{gameOver.won ? 'Congratulations! You solved all puzzles!' : 'Better luck next time!'}</p>

              {/* Level Up Animation */}
              {leveledUp && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="mb-4 p-4 rounded-xl bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/40"
                >
                  <div className="text-3xl mb-1">🚀</div>
                  <h3 className="font-display font-bold text-neon-cyan text-lg">LEVEL UP!</h3>
                  <p className="text-sm text-dark-100 mt-1">Level {levelInfo.old} → Level {levelInfo.new}</p>
                  <p className="text-xs text-dark-300 mt-1">New harder puzzles unlocked!</p>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="glass-card !p-3"><div className="text-xl font-bold font-display text-yellow-400">{game.score}</div><div className="text-xs text-dark-300">Final Score</div></div>
                <div className="glass-card !p-3"><div className="text-xl font-bold font-display text-neon-cyan">{game.solvedPuzzles.length}/{puzzles.length}</div><div className="text-xs text-dark-300">Puzzles</div></div>
                {gameOver.won && <>
                  <div className="glass-card !p-3"><div className="text-xl font-bold font-display text-green-400">+{gameOver.coinsEarned || 0}</div><div className="text-xs text-dark-300">Coins</div></div>
                  <div className="glass-card !p-3"><div className="text-xl font-bold font-display text-neon-magenta">+{gameOver.xpEarned || 0}</div><div className="text-xs text-dark-300">XP</div></div>
                </>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">Back to Dashboard</button>
                <button onClick={() => { game.resetGame(); navigate('/dashboard'); }} className="btn-secondary">Play Again</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
