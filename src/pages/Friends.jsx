import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiUsers, FiCheck, FiX, FiSearch, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';

export default function Friends() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState({ incoming: [], outgoing: [] });
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const fetch = () => {
    api.get('/friends/list').then(r => setFriends(r.data.friends)).catch(() => {});
    api.get('/friends/pending').then(r => setPending(r.data)).catch(() => {});
  };

  useEffect(() => { fetch(); }, []);

  const searchUsers = async (q) => {
    setSearch(q);
    if (q.length < 2) return setResults([]);
    try { const { data } = await api.get(`/friends/search?q=${q}`); setResults(data.users || []); } catch {}
  };

  const sendRequest = async (username) => {
    try { await api.post('/friends/request', { username }); toast.success('Request sent!'); fetch(); setSearch(''); setResults([]); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const respond = async (requestId, status) => {
    try { await api.put(`/friends/request/${requestId}`, { status }); toast.success(`Request ${status}`); fetch(); }
    catch { toast.error('Failed'); }
  };

  const removeFriend = async (friendId) => {
    try { await api.delete(`/friends/${friendId}`); toast.success('Friend removed'); fetch(); } catch {}
  };

  const isOnline = (lastLogin) => {
    if (!lastLogin) return false;
    return (new Date() - new Date(lastLogin)) < 5 * 60 * 1000;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Friends <span className="text-gradient">System</span></h1>

        {/* Search */}
        <div className="glass-card mb-6">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><FiUserPlus /> Add Friends</h3>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input placeholder="Search by username..." className="input-field !pl-10" value={search} onChange={e => searchUsers(e.target.value)} />
          </div>
          {results.length > 0 && (
            <div className="mt-3 space-y-2">
              {results.map(u => (
                <div key={u._id} className="flex items-center justify-between glass-card !p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-xs font-bold">{u.username.charAt(0).toUpperCase()}</div>
                    <span className="text-sm font-medium">{u.username}</span>
                  </div>
                  <button onClick={() => sendRequest(u.username)} className="btn-primary text-xs !py-1 !px-3"><FiSend size={12} className="inline mr-1" /> Add</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {pending.incoming?.length > 0 && (
          <div className="glass-card mb-6">
            <h3 className="font-display font-bold mb-3">Pending Requests</h3>
            <div className="space-y-2">
              {pending.incoming.map(req => (
                <div key={req._id} className="flex items-center justify-between glass-card !p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-500 flex items-center justify-center text-xs font-bold">{req.from?.username?.charAt(0).toUpperCase()}</div>
                    <span className="text-sm">{req.from?.username}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respond(req._id, 'accepted')} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"><FiCheck size={14} /></button>
                    <button onClick={() => respond(req._id, 'rejected')} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"><FiX size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="glass-card">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><FiUsers /> Friends ({friends.length})</h3>
          {friends.length === 0 ? (
            <p className="text-dark-300 text-center py-8 text-sm">No friends yet. Search and add people!</p>
          ) : (
            <div className="space-y-2">
              {friends.map(f => (
                <div key={f._id} className="flex items-center justify-between glass-card !p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-sm font-bold">{f.username.charAt(0).toUpperCase()}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-700 ${isOnline(f.lastLogin) ? 'bg-green-400' : 'bg-dark-400'}`} />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{f.username}</span>
                      <span className="block text-xs text-dark-300">Lv.{f.level}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFriend(f._id)} className="text-xs text-dark-300 hover:text-red-400 transition-colors">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
