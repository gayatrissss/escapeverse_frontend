import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { FiLogOut, FiUser, FiShoppingBag, FiAward, FiUsers, FiCalendar, FiBarChart2, FiBox } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiBox },
  { to: '/lobby', label: 'Lobby', icon: FiUsers },
  { to: '/shop', label: 'Shop', icon: FiShoppingBag },
  { to: '/leaderboard', label: 'Leaderboard', icon: FiBarChart2 },
  { to: '/achievements', label: 'Achievements', icon: FiAward },
  { to: '/daily', label: 'Daily', icon: FiCalendar },
  { to: '/friends', label: 'Friends', icon: FiUsers },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  if (location.pathname === '/game') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-sm font-bold font-display">E</div>
            <span className="font-display font-bold text-lg text-gradient hidden sm:block">EscapeVerse</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === to ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-dark-100 hover:text-white hover:bg-white/5'}`}>
                  {label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <span className="text-yellow-400 font-semibold">{user?.coins || 0} coins</span>
                  <span className="text-neon-cyan">Lv.{user?.level || 1}</span>
                </div>
                <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-dark-200 hover:text-white transition-all" title="Logout">
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm !py-2 !px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-white/10 overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${location.pathname === to ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-dark-100 hover:bg-white/5'}`}>
                  <Icon size={18} /> {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
