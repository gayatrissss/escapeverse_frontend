import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';

const CATEGORIES = ['themes', 'avatars', 'pets', 'music', 'frames', 'effects', 'companions', 'inventory-skins'];
const RARITY_COLORS = { common: 'border-gray-500', rare: 'border-blue-500', epic: 'border-purple-500', legendary: 'border-yellow-500' };
const RARITY_TEXT = { common: 'text-gray-400', rare: 'text-blue-400', epic: 'text-purple-400', legendary: 'text-yellow-400' };

export default function Shop() {
  const { user, updateUser } = useAuthStore();
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState([]);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    api.get('/shop/items').then(r => setItems(r.data.items)).catch(() => {});
    api.get('/shop/owned').then(r => setOwned(r.data.ownedIds || [])).catch(() => {});
  }, []);

  const purchase = async (item) => {
    if (owned.includes(item._id)) return toast('Already owned!');
    if ((user?.coins || 0) < item.price) return toast.error('Not enough coins!');
    try {
      const { data } = await api.post(`/shop/purchase/${item._id}`);
      toast.success(data.message);
      setOwned([...owned, item._id]);
      updateUser({ coins: data.coins });
    } catch (err) { toast.error(err.response?.data?.message || 'Purchase failed'); }
  };

  const filtered = category === 'all' ? items : items.filter(i => i.category === category);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Marketplace <span className="text-gradient">Shop</span></h1>
          <span className="text-yellow-400 font-bold">{user?.coins || 0} coins</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
          <button onClick={() => setCategory('all')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === 'all' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'bg-dark-600 text-dark-200 border border-dark-400'}`}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${category === c ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'bg-dark-600 text-dark-200 border border-dark-400 hover:bg-dark-500'}`}>{c.replace('-', ' ')}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => {
            const isOwned = owned.includes(item._id);
            return (
              <motion.div key={item._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`glass-card !p-4 border ${RARITY_COLORS[item.rarity] || 'border-dark-400'} relative overflow-hidden`}>
                <div className="absolute top-2 right-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-dark-700 ${RARITY_TEXT[item.rarity]}`}>{item.rarity}</span>
                </div>
                <div className="w-full h-20 flex items-center justify-center mb-3">
                  <span className="text-4xl">{item.category === 'pets' ? '🐾' : item.category === 'themes' ? '🎨' : item.category === 'avatars' ? '👤' : item.category === 'music' ? '🎵' : item.category === 'companions' ? '🤖' : '✨'}</span>
                </div>
                <h3 className="font-display font-bold text-sm truncate">{item.name}</h3>
                <p className="text-xs text-dark-300 truncate">{item.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-yellow-400 font-bold text-sm">{item.price} coins</span>
                  {isOwned ? (
                    <span className="text-green-400 text-xs flex items-center gap-1"><FiCheck /> Owned</span>
                  ) : (
                    <button onClick={() => purchase(item)} className="btn-primary text-xs !py-1 !px-3"><FiShoppingBag className="inline mr-1" size={12} /> Buy</button>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && <p className="text-dark-300 text-center col-span-full py-12">No items in this category</p>}
        </div>
      </div>
    </div>
  );
}
