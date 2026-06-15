import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiLock } from 'react-icons/fi';
import api from '../api/client';

const RARITY_BG = { common: 'from-gray-500/10 to-gray-600/10', rare: 'from-blue-500/10 to-blue-600/10', epic: 'from-purple-500/10 to-purple-600/10', legendary: 'from-yellow-500/10 to-yellow-600/10' };
const RARITY_BORDER = { common: 'border-gray-500/30', rare: 'border-blue-500/30', epic: 'border-purple-500/30', legendary: 'border-yellow-500/30' };
const RARITY_ICON = { common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡' };

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api.get('/achievement').then(r => setAchievements(r.data.achievements || [])).catch(() => {});
  }, []);

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Achievements <span className="text-gradient">Collection</span></h1>
          <span className="text-sm text-dark-200">{unlocked.length}/{achievements.length} Unlocked</span>
        </div>

        {/* Progress Bar */}
        <div className="glass-card mb-6 !p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-200">Progress</span>
            <span className="text-neon-cyan">{achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0}%</span>
          </div>
          <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full" />
          </div>
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><FiAward className="text-green-400" /> Unlocked</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {unlocked.map((a, i) => (
                <motion.div key={a.type} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className={`glass-card bg-gradient-to-br ${RARITY_BG[a.rarity]} border ${RARITY_BORDER[a.rarity]} text-center`}>
                  <div className="text-3xl mb-2">{RARITY_ICON[a.rarity]}</div>
                  <h3 className="font-display font-bold text-sm">{a.name}</h3>
                  <p className="text-xs text-dark-300 mt-1">{a.description}</p>
                  <span className="text-xs text-green-400 mt-2 inline-block">Unlocked</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><FiLock className="text-dark-300" /> Locked</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {locked.map((a, i) => (
                <motion.div key={a.type} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="glass-card text-center opacity-60">
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-display font-bold text-sm">{a.name}</h3>
                  <p className="text-xs text-dark-300 mt-1">{a.description}</p>
                  <div className="w-full h-1.5 bg-dark-600 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-neon-cyan/50 rounded-full" style={{ width: `${a.maxProgress > 0 ? (a.progress / a.maxProgress) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-dark-400 mt-1 inline-block">{a.progress}/{a.maxProgress}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
