import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiBarChart2, FiHelpCircle, FiCalendar, FiUsers, FiStar, FiZap, FiShield } from 'react-icons/fi';

const Rain = () => (
  <div className="rain-container">
    {Array.from({ length: 50 }).map((_, i) => (
      <div key={i} className="raindrop" style={{
        left: `${Math.random() * 100}%`, height: `${Math.random() * 80 + 20}px`,
        animationDuration: `${Math.random() * 1 + 0.5}s`, animationDelay: `${Math.random() * 2}s`
      }} />
    ))}
  </div>
);

const stats = [
  { label: 'Players', value: '50K+', icon: FiUsers },
  { label: 'Escapes', value: '120K+', icon: FiZap },
  { label: 'Puzzles', value: '500+', icon: FiStar },
  { label: 'Chapters', value: '5', icon: FiShield }
];

const features = [
  { title: 'Multiplayer Co-op', desc: 'Team up with friends to solve puzzles together in real-time.', icon: FiUsers },
  { title: 'AI Companion Echo', desc: 'Your personal AI guide that remembers your journey and provides context-aware hints.', icon: FiStar },
  { title: 'Competitive Ranked', desc: 'Climb global leaderboards and prove your escape room mastery.', icon: FiBarChart2 },
  { title: 'Daily Challenges', desc: 'New puzzles every day with exclusive rewards and streak bonuses.', icon: FiCalendar },
  { title: 'Epic Chapters', desc: 'Explore 5 unique worlds from abandoned mansions to space stations.', icon: FiPlay },
  { title: 'Rewards & Shop', desc: 'Earn coins, unlock themes, avatars, pets, and customize your experience.', icon: FiShield }
];

const chapters = [
  { name: 'Abandoned Mansion', desc: 'A haunted estate full of secrets', status: 'Available', color: 'from-amber-500/20 to-red-500/20' },
  { name: 'Secret Laboratory', desc: 'Forbidden experiments await', status: 'Coming Soon', color: 'from-green-500/20 to-emerald-500/20' },
  { name: 'Ancient Temple', desc: 'Uncover lost civilizations', status: 'Coming Soon', color: 'from-yellow-500/20 to-orange-500/20' },
  { name: 'Cyber Prison', desc: 'Break free from digital chains', status: 'Coming Soon', color: 'from-cyan-500/20 to-blue-500/20' },
  { name: 'Space Station', desc: 'Survive the void of space', status: 'Coming Soon', color: 'from-purple-500/20 to-pink-500/20' }
];

export default function Landing() {
  const [doorOpen, setDoorOpen] = useState(false);

  useEffect(() => { setTimeout(() => setDoorOpen(true), 1500); }, []);

  return (
    <div className="relative overflow-hidden">
      <Rain />

      {/* Lightning */}
      <div className="fixed inset-0 bg-white/5 lightning pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Door animation */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} className="mb-8 flex justify-center">
            <div className="relative w-48 h-64 sm:w-64 sm:h-80">
              <div className="absolute inset-0 rounded-t-full bg-gradient-to-b from-dark-600 to-dark-800 border-2 border-dark-400" />
              <motion.div
                animate={{ rotateY: doorOpen ? -75 : 0 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-t-full bg-gradient-to-br from-dark-500 to-dark-700 border-2 border-dark-400 origin-left"
                style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
              >
                <div className="absolute top-1/2 right-4 w-3 h-3 rounded-full bg-yellow-600" />
              </motion.div>
              {doorOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-neon-cyan/30 blur-xl animate-pulse-slow" />
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="font-display text-5xl sm:text-7xl lg:text-8xl font-black mb-4">
            <span className="text-gradient">ESCAPE</span>VERSE
          </motion.h1>

          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="text-lg sm:text-xl text-dark-100 mb-8 max-w-2xl mx-auto">
            The ultimate multiplayer escape room platform. Solve puzzles, unlock mysteries, and compete globally with friends.
          </motion.p>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }} className="flex flex-wrap justify-center gap-3 mb-12">
            <Link to="/dashboard" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2"><FiPlay /> Play Now</Link>
            <Link to="/leaderboard" className="btn-secondary flex items-center gap-2"><FiBarChart2 /> Leaderboard</Link>
            <a href="#how-to-play" className="btn-secondary flex items-center gap-2"><FiHelpCircle /> How To Play</a>
            <Link to="/daily" className="btn-secondary flex items-center gap-2"><FiCalendar /> Daily Challenge</Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass-card !p-4 text-center">
                <Icon className="mx-auto mb-2 text-neon-cyan" size={24} />
                <div className="text-2xl font-bold font-display neon-text">{value}</div>
                <div className="text-sm text-dark-200">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">Why <span className="text-gradient">EscapeVerse</span>?</h2>
          <p className="text-dark-200 text-center mb-12 max-w-xl mx-auto">Built for gamers who love puzzles, teamwork, and competition.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ title, desc, icon: Icon }, i) => (
              <motion.div key={title} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="text-neon-cyan" size={24} />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
                <p className="text-dark-200 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">Story <span className="text-gradient">Chapters</span></h2>
          <p className="text-dark-200 text-center mb-12">5 unique worlds to explore and escape from.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map(({ name, desc, status, color }, i) => (
              <motion.div key={name} initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`glass-card bg-gradient-to-br ${color}`}>
                <h3 className="font-display text-lg font-bold mb-1">{name}</h3>
                <p className="text-dark-200 text-sm mb-3">{desc}</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-dark-500/50 text-dark-200'}`}>{status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Play */}
      <section id="how-to-play" className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-12">How To <span className="text-gradient">Play</span></h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up and customize your explorer profile.' },
              { step: '02', title: 'Choose Chapter', desc: 'Pick a story chapter and difficulty level.' },
              { step: '03', title: 'Escape!', desc: 'Solve puzzles, collect items, and escape before time runs out.' }
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card">
                <div className="text-4xl font-display font-black text-gradient mb-3">{step}</div>
                <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
                <p className="text-dark-200 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card !p-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Ready to <span className="text-gradient">Escape</span>?</h2>
          <p className="text-dark-200 mb-8">Join thousands of players already exploring EscapeVerse.</p>
          <Link to="/register" className="btn-primary text-lg !px-10 !py-4">Get Started Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-dark-300">
          <span className="font-display font-bold text-gradient">EscapeVerse</span>
          <span>&copy; 2026 EscapeVerse. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
