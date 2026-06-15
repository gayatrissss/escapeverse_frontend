import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiGift, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';

const REWARDS = [
  { day: 1, type: 'coins', amount: 100, icon: '💰', color: 'bg-yellow-500/20' },
  { day: 2, type: 'xp', amount: 50, icon: '⚡', color: 'bg-neon-cyan/20' },
  { day: 3, type: 'coins', amount: 200, icon: '💰', color: 'bg-yellow-500/20' },
  { day: 4, type: 'badge', amount: 1, icon: '🏅', color: 'bg-purple-500/20' },
  { day: 5, type: 'coins', amount: 300, icon: '💰', color: 'bg-yellow-500/20' },
  { day: 6, type: 'xp', amount: 150, icon: '⚡', color: 'bg-neon-cyan/20' },
  { day: 7, type: 'coins', amount: 500, icon: '🎁', color: 'bg-gradient-to-r from-yellow-500/20 to-purple-500/20' }
];

export default function Daily() {
  const { user, updateUser } = useAuthStore();
  const [status, setStatus] = useState(null);
  const [segments, setSegments] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  useEffect(() => {
    api.get('/daily/status').then(r => setStatus(r.data)).catch(() => {});
    api.get('/daily/wheel/segments').then(r => setSegments(r.data.segments || [])).catch(() => {});
  }, []);

  const claimReward = async () => {
    try {
      const { data } = await api.post('/daily/claim');
      toast.success(data.message);
      setStatus(prev => ({ ...prev, canClaim: false, streak: data.streak }));
      if (data.coins !== undefined) updateUser({ coins: data.coins });
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot claim'); }
  };

  const spinWheel = async () => {
    if (spinning) return;
    setSpinning(true);
    setWheelResult(null);
    try {
      const { data } = await api.post('/daily/wheel/spin');
      const angle = (360 / segments.length) * data.rewardIndex;
      setRotation(prev => prev + 1440 + (360 - angle));
      setTimeout(() => {
        setWheelResult(data);
        setSpinning(false);
        toast.success(data.message);
        if (data.coins !== undefined) updateUser({ coins: data.coins });
        setStatus(prev => ({ ...prev, canSpin: false }));
      }, 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot spin');
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Daily <span className="text-gradient">Rewards</span></h1>

        {/* 7-Day Streak */}
        <div className="glass-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold flex items-center gap-2"><FiGift className="text-yellow-400" /> 7-Day Login Streak</h2>
            {status && <span className="text-sm text-dark-200">Streak: <span className="text-yellow-400 font-bold">{status.streak}/7</span></span>}
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {REWARDS.map(({ day, type, amount, icon, color }) => {
              const claimed = status?.streak >= day;
              const isToday = status?.streak + 1 === day;
              return (
                <motion.div key={day} whileHover={{ y: -3 }}
                  className={`${color} rounded-xl p-3 text-center border ${claimed ? 'border-green-500/50' : isToday ? 'border-neon-cyan/50 animate-pulse-slow' : 'border-dark-400 opacity-60'}`}>
                  <div className="text-xs text-dark-300 mb-1">Day {day}</div>
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xs font-bold">{amount}</div>
                  {claimed && <span className="text-xs text-green-400">Claimed</span>}
                </motion.div>
              );
            })}
          </div>

          <button onClick={claimReward} disabled={!status?.canClaim} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">
            {status?.canClaim ? 'Claim Today\'s Reward' : 'Come Back Tomorrow'}
          </button>
        </div>

        {/* Lucky Wheel */}
        <div className="glass-card text-center">
          <h2 className="font-display font-bold mb-6 flex items-center justify-center gap-2"><FiRefreshCw className="text-neon-magenta" /> Lucky Wheel</h2>

          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Wheel */}
            <motion.div ref={wheelRef} animate={{ rotate: rotation }} transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
              className="w-full h-full rounded-full border-4 border-neon-cyan/50 relative overflow-hidden" style={{ boxShadow: '0 0 30px rgba(0,255,245,0.2)' }}>
              {segments.map((seg, i) => {
                const angle = (360 / segments.length) * i;
                return (
                  <div key={i} className="absolute inset-0 flex items-start justify-center" style={{ transform: `rotate(${angle}deg)` }}>
                    <div className="text-xs font-bold mt-4 px-2 py-1 rounded" style={{ color: seg.color, textShadow: `0 0 5px ${seg.color}` }}>
                      {seg.label}
                    </div>
                  </div>
                );
              })}
              {/* Segment lines */}
              {segments.map((_, i) => (
                <div key={i} className="absolute inset-0" style={{ transform: `rotate(${(360 / segments.length) * i}deg)` }}>
                  <div className="w-px h-1/2 bg-white/10 mx-auto" />
                </div>
              ))}
            </motion.div>

            {/* Pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-neon-cyan z-10" />
            {/* Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-700 border-2 border-neon-cyan/50 flex items-center justify-center">
              <span className="text-xs font-display font-bold text-neon-cyan">SPIN</span>
            </div>
          </div>

          {wheelResult && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card !p-4 mb-4 inline-block">
              <p className="text-lg font-bold text-yellow-400">{wheelResult.message}</p>
            </motion.div>
          )}

          <button onClick={spinWheel} disabled={spinning || !status?.canSpin} className="btn-primary text-lg !px-10 disabled:opacity-40 disabled:cursor-not-allowed">
            {spinning ? 'Spinning...' : status?.canSpin ? 'Spin the Wheel!' : 'Come Back Tomorrow'}
          </button>
        </div>
      </div>
    </div>
  );
}
