import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiUsers, FiLock, FiPlay, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function Lobby() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'public', chapter: 'abandoned-mansion', maxPlayers: 4, mode: 'normal' });
  const [search, setSearch] = useState('');

  const fetchRooms = () => {
    api.get('/room/public').then(r => setRooms(r.data.rooms)).catch(() => {});
  };

  useEffect(() => { fetchRooms(); const i = setInterval(fetchRooms, 5000); return () => clearInterval(i); }, []);

  const createRoom = async () => {
    if (!form.name.trim()) return toast.error('Room name required');
    try {
      const { data } = await api.post('/room/create', form);
      toast.success('Room created!');
      navigate(`/game/${data.room._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const joinRoom = async (roomId) => {
    try {
      const { data } = await api.post(`/room/${roomId}/join`);
      toast.success('Joined room!');
      navigate(`/game/${roomId}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
  };

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Multiplayer <span className="text-gradient">Lobby</span></h1>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><FiPlus /> Create Room</button>
        </div>

        {/* Create Room Form */}
        {showCreate && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card mb-6">
            <h3 className="font-display font-bold mb-4">Create Room</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Room Name" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="public">Public</option><option value="private">Private</option>
              </select>
              <select className="input-field" value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}>
                <option value="normal">Normal</option><option value="practice">Practice</option><option value="ranked">Ranked</option><option value="speedrun">Speed Run</option>
              </select>
              <select className="input-field" value={form.maxPlayers} onChange={e => setForm({...form, maxPlayers: parseInt(e.target.value)})}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n} Players</option>)}
              </select>
            </div>
            <button onClick={createRoom} className="btn-primary mt-4">Create</button>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input placeholder="Search rooms..." className="input-field !pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Rooms List */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, i) => (
            <motion.div key={room._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-sm truncate">{room.name}</h3>
                {room.type === 'private' && <FiLock className="text-dark-300" size={14} />}
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-300 mb-3">
                <span className="capitalize">{room.settings?.mode}</span>
                <span>|</span>
                <span className="capitalize">{room.chapter?.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-dark-200"><FiUsers size={14} /> {room.players?.length}/{room.maxPlayers}</div>
                <button onClick={() => joinRoom(room._id)} disabled={room.players?.length >= room.maxPlayers} className="btn-primary text-xs !py-1.5 !px-4 disabled:opacity-40">
                  <FiPlay className="inline mr-1" size={12} /> Join
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-dark-300 text-center col-span-full py-12">No rooms available. Create one!</p>}
        </div>
      </div>
    </div>
  );
}
