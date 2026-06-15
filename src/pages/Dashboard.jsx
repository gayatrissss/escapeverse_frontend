import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiUsers, FiStar, FiZap, FiClock, FiTrendingUp, FiGift, FiBookOpen, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../api/client';

const chapters = [
  { id: 'abandoned-mansion', name: 'Abandoned Mansion', desc: 'A haunted estate full of dark secrets and hidden passages.', available: true, color: 'from-amber-500/20 to-red-500/20', border: 'border-amber-500/30' },
  { id: 'secret-laboratory', name: 'Secret Laboratory', desc: 'Forbidden experiments lurk in every corner.', available: false, color: 'from-green-500/10 to-emerald-500/10', border: 'border-dark-400' },
  { id: 'ancient-temple', name: 'Ancient Temple', desc: 'Uncover the mysteries of a lost civilization.', available: false, color: 'from-yellow-500/10 to-orange-500/10', border: 'border-dark-400' },
  { id: 'cyber-prison', name: 'Cyber Prison', desc: 'Break free from digital chains.', available: false, color: 'from-cyan-500/10 to-blue-500/10', border: 'border-dark-400' },
  { id: 'space-station', name: 'Space Station', desc: 'Survive the void of deep space.', available: false, color: 'from-purple-500/10 to-pink-500/10', border: 'border-dark-400' }
];

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const { connect } = useSocketStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [daily, setDaily] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    if (token) connect(token);
    api.get('/user/profile').then(r => {
      setProfile(r.data.profile);
      if (r.data.user?.gameLevel) setSelectedLevel(r.data.user.gameLevel);
    }).catch(() => {});
    api.get('/daily/status').then(r => setDaily(r.data)).catch(() => {});
  }, [token]);

  const startGame = async (mode = 'normal', level) => {
    try {
      const { data } = await api.post('/game/start', { chapter: 'abandoned-mansion', mode, level: level || selectedLevel });
      navigate(`/game/${data.session._id}`);
    } catch (err) {
      toast.error('Failed to start game');
    }
  };

  const claimDaily = async () => {
    try {
      const { data } = await api.post('/daily/claim');
      toast.success(data.message);
      setDaily(prev => ({ ...prev, canClaim: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot claim');
    }
  };

  const echoGreeting = user?.isFirstLogin
    ? `Welcome, Explorer! I'm Echo, your AI companion. Let me show you around...`
    : `Welcome back, ${user?.username}! Ready for another escape?`;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Echo Greeting */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center flex-shrink-0 animate-glow">
            <span className="text-xl">E</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-neon-cyan mb-1">Echo</h3>
            <p className="text-dark-100 text-sm">{echoGreeting}</p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Coins', value: user?.coins || 0, icon: FiStar, color: 'text-yellow-400' },
            { label: 'XP', value: user?.xp || 0, icon: FiZap, color: 'text-neon-cyan' },
            { label: 'Level', value: user?.level || 1, icon: FiTrendingUp, color: 'text-neon-green' },
            { label: 'Win Rate', value: profile?.winRate ? `${profile.winRate.toFixed(0)}%` : 'N/A', icon: FiClock, color: 'text-neon-magenta' }
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card !p-4 text-center">
              <Icon className={`mx-auto mb-2 ${color}`} size={22} />
              <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
              <div className="text-xs text-dark-300">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => startGame('normal')} className="glass-card text-center !p-6 cursor-pointer hover:border-neon-cyan/30">
            <FiPlay className="mx-auto mb-2 text-neon-cyan" size={28} />
            <h3 className="font-display font-bold">Quick Play</h3>
            <p className="text-xs text-dark-300 mt-1">Level {selectedLevel} · 10 min timer</p>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => startGame('practice')} className="glass-card text-center !p-6 cursor-pointer hover:border-neon-green/30">
            <FiBookOpen className="mx-auto mb-2 text-neon-green" size={28} />
            <h3 className="font-display font-bold">Practice</h3>
            <p className="text-xs text-dark-300 mt-1">Level {selectedLevel} · No timer</p>
          </motion.button>
          <Link to="/lobby" className="glass-card text-center !p-6 cursor-pointer hover:border-neon-magenta/30">
            <FiUsers className="mx-auto mb-2 text-neon-magenta" size={28} />
            <h3 className="font-display font-bold">Multiplayer</h3>
            <p className="text-xs text-dark-300 mt-1">Create or join rooms</p>
          </Link>
        </div>

        {/* Level Selector */}
        <div className="glass-card mb-6">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><FiTrendingUp className="text-neon-cyan" /> Select Difficulty</h3>
          <p className="text-xs text-dark-300 mb-3">Click a level to start playing with harder puzzles!</p>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map(lvl => {
              const unlocked = lvl <= (user?.gameLevel || 1);
              const labels = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Master'];
              return (
                <motion.button
                  key={lvl}
                  whileHover={unlocked ? { scale: 1.05 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (unlocked) {
                      setSelectedLevel(lvl);
                      startGame('normal', lvl);
                    }
                  }}
                  disabled={!unlocked}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    unlocked
                      ? selectedLevel === lvl
                        ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-[0_0_12px_rgba(0,255,255,0.15)]'
                        : 'bg-dark-600 border border-dark-400 text-dark-100 hover:border-neon-cyan/40 cursor-pointer'
                      : 'bg-dark-700 border border-dark-500 text-dark-400 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {!unlocked && <FiLock size={12} />}
                  <span>Level {lvl}</span>
                  <span className="text-xs opacity-70">({labels[lvl]})</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Daily Reward + Chapters */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Daily Reward Widget */}
          <div className="glass-card">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2"><FiGift className="text-yellow-400" /> Daily Reward</h3>
            {daily && (
              <div>
                <p className="text-sm text-dark-200 mb-3">Streak: <span className="text-yellow-400 font-bold">{daily.streak}/7</span></p>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5,6,7].map(d => (
                    <div key={d} className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-bold ${d <= daily.streak ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-dark-600 text-dark-300'}`}>{d}</div>
                  ))}
                </div>
                <button onClick={claimDaily} disabled={!daily.canClaim} className="btn-primary w-full text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  {daily.canClaim ? 'Claim Reward' : 'Come Back Tomorrow'}
                </button>
              </div>
            )}
          </div>

          {/* Chapters */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-bold mb-4">Chapters</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {chapters.map(({ id, name, desc, available, color, border }) => (
                <div key={id} className={`glass-card !p-4 bg-gradient-to-br ${color} border ${border} ${!available && 'opacity-50'}`}>
                  <h4 className="font-display font-bold text-sm">{name}</h4>
                  <p className="text-xs text-dark-200 mt-1">{desc}</p>
                  <span className={`text-xs mt-2 inline-block ${available ? 'text-green-400' : 'text-dark-300'}`}>{available ? 'Available' : 'Coming Soon'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/shop', label: 'Shop', icon: FiStar },
            { to: '/leaderboard', label: 'Leaderboard', icon: FiTrendingUp },
            { to: '/achievements', label: 'Achievements', icon: FiStar },
            { to: '/friends', label: 'Friends', icon: FiUsers }
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="glass-card !p-3 text-center hover:border-neon-cyan/20">
              <Icon className="mx-auto mb-1 text-dark-200" size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
