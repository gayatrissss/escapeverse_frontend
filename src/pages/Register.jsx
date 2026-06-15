import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.username.length < 3) return toast.error('Username must be at least 3 characters');
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome to EscapeVerse!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Join EscapeVerse</h1>
          <p className="text-dark-200">Create your explorer account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input type="text" placeholder="Username" className="input-field !pl-10" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} maxLength={20} />
          </div>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input type="email" placeholder="Email" className="input-field !pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input type="password" placeholder="Password (min 6 chars)" className="input-field !pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input type="password" placeholder="Confirm Password" className="input-field !pl-10" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-dark-400" />
            <span className="text-xs text-dark-300">OR</span>
            <div className="flex-1 h-px bg-dark-400" />
          </div>
          <button className="btn-secondary w-full flex items-center justify-center gap-2">
            <FcGoogle size={20} /> Sign up with Google
          </button>
        </div>

        <p className="text-center text-sm text-dark-300 mt-6">
          Already have an account? <Link to="/login" className="text-neon-cyan hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
