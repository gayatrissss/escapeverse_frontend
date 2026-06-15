import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, guestLogin, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGuest = async () => {
    try {
      await guestLogin();
      toast.success('Welcome, explorer!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Guest login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-dark-200">Sign in to continue your adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input type="email" placeholder="Email" className="input-field !pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input type="password" placeholder="Password" className="input-field !pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-neon-cyan hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-dark-400" />
            <span className="text-xs text-dark-300">OR</span>
            <div className="flex-1 h-px bg-dark-400" />
          </div>

          <button className="btn-secondary w-full flex items-center justify-center gap-2 mb-3">
            <FcGoogle size={20} /> Continue with Google
          </button>

          <button onClick={handleGuest} className="btn-secondary w-full !border-dashed">
            <FiUser className="inline mr-2" /> Continue as Guest
          </button>
        </div>

        <p className="text-center text-sm text-dark-300 mt-6">
          Don't have an account? <Link to="/register" className="text-neon-cyan hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
