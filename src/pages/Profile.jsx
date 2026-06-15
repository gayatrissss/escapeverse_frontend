import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiZap, FiClock, FiAward, FiTrendingUp, FiEdit3 } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';

const THEMES = ['dark', 'cyberpunk', 'mystic', 'neon', 'horror', 'space', 'royal'];

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const [data, setData] = useState({ user: null, profile: null });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api.get(`/user/${id}`).then(r => setData(r.data)).catch(() => {});
  }, [id]);

  const isOwn = currentUser?.id === id;
  const u = data.user;
  const p = data.profile;

  const saveTheme = async (theme) => {
    try {
      const { data: res } = await api.put('/user/settings', { theme });
      updateUser(res.user);
      setEditing(false);
    } catch {}
  };

  if (!u) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-dark-300">Loading...</p></div>;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-3xl font-bold font-display flex-shrink-0">
            {u.username.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display text-2xl font-bold">{u.username}</h1>
            <p className="text-dark-200 text-sm">Level {u.level} Explorer</p>
            <div className="flex gap-4 mt-2 justify-center sm:justify-start text-sm">
              <span className="text-yellow-400"><FiStar className="inline mr-1" />{u.coins} coins</span>
              <span className="text-neon-cyan"><FiZap className="inline mr-1" />{u.xp} XP</span>
            </div>
          </div>
          {isOwn && <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm flex items-center gap-1"><FiEdit3 /> Edit</button>}
        </motion.div>

        {/* Edit Theme */}
        {editing && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card mb-6">
            <h3 className="font-display font-bold mb-3">Theme</h3>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(t => (
                <button key={t} onClick={() => saveTheme(t)} className={`px-4 py-2 rounded-xl text-sm capitalize ${u.theme === t ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'bg-dark-600 border border-dark-400'}`}>{t}</button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Games Played', value: p?.gamesPlayed || 0, icon: FiClock, color: 'text-neon-cyan' },
            { label: 'Games Won', value: p?.gamesWon || 0, icon: FiAward, color: 'text-green-400' },
            { label: 'Win Rate', value: p?.winRate ? `${p.winRate.toFixed(0)}%` : '0%', icon: FiTrendingUp, color: 'text-neon-magenta' },
            { label: 'Puzzles Solved', value: p?.totalPuzzlesSolved || 0, icon: FiZap, color: 'text-yellow-400' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card !p-4 text-center">
              <Icon className={`mx-auto mb-1 ${color}`} size={20} />
              <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
              <div className="text-xs text-dark-300">{label}</div>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        <div className="glass-card mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-200">Level {u.level}</span>
            <span className="text-neon-cyan">{u.xp % 100}/100 XP</span>
          </div>
          <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full transition-all duration-500" style={{ width: `${u.xp % 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
