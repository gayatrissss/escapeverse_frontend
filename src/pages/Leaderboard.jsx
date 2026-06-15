import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiClock, FiAward } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [period, setPeriod] = useState('all-time');
  const [tab, setTab] = useState('global');

  useEffect(() => {
    const endpoint = tab === 'friends' ? '/leaderboard/friends' : `/leaderboard?period=${period}`;
    api.get(endpoint).then(r => setEntries(r.data.leaderboard || [])).catch(() => {});
  }, [tab, period]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Global <span className="text-gradient">Leaderboard</span></h1>

        <div className="flex gap-2 mb-4">
          {[{ k: 'global', label: 'Global', icon: FiTrendingUp }, { k: 'friends', label: 'Friends', icon: FiUsers }].map(({ k, label, icon: Icon }) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 ${tab === k ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'bg-dark-600 text-dark-200 border border-dark-400'}`}><Icon size={14} /> {label}</button>
          ))}
        </div>

        {tab === 'global' && (
          <div className="flex gap-2 mb-6">
            {['all-time', 'weekly', 'monthly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${period === p ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-dark-300 hover:text-white'}`}>{p.replace('-', ' ')}</button>
            ))}
          </div>
        )}

        {/* Top 3 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {top3.map((entry, i) => (
            <motion.div key={entry.userId?._id || i} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
              className={`glass-card text-center ${i === 0 ? '!p-6 sm:translate-y-[-10px]' : '!p-4'} ${entry.userId?._id === user?.id ? 'neon-border' : ''}`}>
              <div className="text-3xl mb-2">{MEDALS[i]}</div>
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-lg font-bold mb-2">
                {entry.userId?.username?.charAt(0).toUpperCase() || entry.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <h3 className="font-display font-bold text-sm truncate">{entry.userId?.username || entry.username}</h3>
              <p className="text-xl font-display font-bold text-yellow-400">{entry.score}</p>
              <p className="text-xs text-dark-300">Lv.{entry.userId?.level || 1}</p>
            </motion.div>
          ))}
        </div>

        {/* Rest */}
        <div className="glass-card !p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/10 text-xs text-dark-300"><th className="p-3 text-left">#</th><th className="p-3 text-left">Player</th><th className="p-3 text-right">Score</th><th className="p-3 text-right hidden sm:table-cell">Time</th></tr></thead>
            <tbody>
              {rest.map((entry, i) => (
                <tr key={entry.userId?._id || i} className={`border-b border-white/5 text-sm ${entry.userId?._id === user?.id ? 'bg-neon-cyan/5' : 'hover:bg-white/5'}`}>
                  <td className="p-3 text-dark-300">{i + 4}</td>
                  <td className="p-3 font-medium">{entry.userId?.username || entry.username}</td>
                  <td className="p-3 text-right text-yellow-400 font-bold">{entry.score}</td>
                  <td className="p-3 text-right text-dark-300 hidden sm:table-cell">{entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && <p className="text-dark-300 text-center py-12">No entries yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );
}
