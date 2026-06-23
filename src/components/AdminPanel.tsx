import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Shield, Crown, User, RefreshCw, Plus, Clock, Minus, Users, Activity, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store';

interface UserData {
  id: string;
  email: string;
  role: string;
  vipExpiresAt: number | null;
  createdAt: number;
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { isAdmin, user } = useAuth();
  const { language } = useAppStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isOwner = user?.email === 'aungyelin36943@gmail.com';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, 'users'));
      const list = qs.docs.map(d => ({ id: d.id, ...d.data() } as UserData));
      // Sort by creation desc
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setUsers(list);
    } catch (e: any) {
      toast.error('Failed to load users: ' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const updateVip = async (userId: string, currentExpire: number | null, amount: number, unit: 'days' | 'months') => {
    const oneDay = 24 * 60 * 60 * 1000;
    const increment = unit === 'months' ? 30 * oneDay : oneDay;
    
    let newExpire = currentExpire || 0;

    if (amount > 0) {
      const baseDate = Math.max(Date.now(), currentExpire || 0);
      newExpire = baseDate + (amount * increment);
    } else {
      if (!currentExpire || currentExpire < Date.now()) {
        toast.error("User does not have active VIP or it's already expired.");
        return;
      }
      newExpire = currentExpire + (amount * increment);
      if (newExpire < Date.now()) {
        newExpire = 0; // Expired
      }
    }

    try {
      const finalExpire = newExpire > 0 ? newExpire : null;
      await setDoc(doc(db, 'users', userId), { vipExpiresAt: finalExpire }, { merge: true });
      const unitStr = unit === 'months' ? 'လ' : 'ရက်';
      toast.success(amount > 0 ? `${amount} ${unitStr} တိုးပေးလိုက်ပါပြီ!` : `${Math.abs(amount)} ${unitStr} ပြန်နုတ်လိုက်ပါပြီ!`);
      setUsers(users.map(u => u.id === userId ? { ...u, vipExpiresAt: finalExpire } : u));
    } catch (e: any) {
      toast.error('Error updating VIP: ' + e.message);
    }
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    if (!isOwner) {
      toast.error('Only the main owner can change roles.');
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      toast.success(newRole === 'admin' ? 'Admin အဖြစ် ခန့်အပ်လိုက်ပါပြီ!' : 'Admin အဖြစ်မှ ဖြုတ်ချလိုက်ပါပြီ!');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e: any) {
      toast.error('Error updating role: ' + e.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex bg-slate-950 items-center justify-center min-h-[50vh] rounded-3xl">
        <p className="text-red-400 font-bold flex items-center gap-2">
          <Shield /> Access Denied
        </p>
      </div>
    );
  }

  // Placeholder for future global DB counters
  const totalEvents = 0; 
  const totalGenerations = 0;

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="text-blue-500" />
          စီမံခန့်ခွဲသူ နေရာ (Admin Dashboard)
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={fetchUsers} className="p-2 bg-[#1e293b] rounded-lg hover:bg-[#334155] transition text-slate-400 hover:text-white">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium transition">
            ပိတ်မည်
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#172033] border border-[#27354f] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="text-emerald-400" size={20} />
            </div>
            <span className="text-[#94a3b8] font-medium text-sm tracking-wide">Total Events</span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{totalEvents.toLocaleString()}</div>
        </div>

        <div className="bg-[#172033] border border-[#27354f] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Zap className="text-rose-400" size={20} />
            </div>
            <span className="text-[#94a3b8] font-medium text-sm tracking-wide">Total Generations</span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{totalGenerations.toLocaleString()}</div>
        </div>

        <div className="bg-[#172033] border border-[#27354f] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="text-blue-400" size={20} />
            </div>
            <span className="text-[#94a3b8] font-medium text-sm tracking-wide">Active Users</span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{users.length}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27354f]">
              <th className="py-3 px-4 font-semibold text-[#64748b]">အသုံးပြုသူ အီးမေးလ်</th>
              <th className="py-3 px-4 font-semibold text-[#64748b]">ရာထူး / အခြေအနေ</th>
              <th className="py-3 px-4 font-semibold text-[#64748b]">VIP သက်တမ်းကုန်ဆုံးမည့်ရက်</th>
              <th className="py-3 px-4 font-semibold text-[#64748b]">လုပ်ဆောင်ချက်များ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isVip = u.role === 'admin' || (u.vipExpiresAt && u.vipExpiresAt > Date.now());
              return (
                <tr key={u.id} className="border-b border-[#27354f]/50 hover:bg-[#1e293b]/50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{u.email || 'အီးမေးလ်မရှိပါ'}</span>
                      <span className="text-xs text-[#64748b]">{u.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded w-fit">
                          <Crown size={12} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded w-fit">
                          <User size={12} /> User
                        </span>
                      )}
                      
                      {isVip && u.role !== 'admin' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                           <Clock size={12} /> Active VIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {u.role === 'admin' ? (
                      <span className="text-[#94a3b8] italic font-medium">အကန့်အသတ်မရှိ (Unlimited)</span>
                    ) : (
                      <span className="text-slate-300">{u.vipExpiresAt ? new Date(u.vipExpiresAt).toLocaleDateString() : '-'}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 min-w-[250px]">
                    <div className="flex flex-col gap-2">
                      {isOwner && u.email !== 'aungyelin36943@gmail.com' && (
                        <button
                          onClick={() => toggleAdmin(u.id, u.role)}
                          className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition w-fit ${
                            u.role === 'admin' 
                              ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20' 
                              : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20'
                          }`}
                        >
                          <Shield size={12} />
                          {u.role === 'admin' ? 'Admin အဖြစ်မှ ဖြုတ်မည်' : 'Admin အဖြစ် ခန့်မည်'}
                        </button>
                      )}
                      
                      {u.role !== 'admin' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => updateVip(u.id, u.vipExpiresAt, 1, 'days')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                          >
                            <Plus size={12} /> ၁ ရက်
                          </button>
                          <button
                            onClick={() => updateVip(u.id, u.vipExpiresAt, -1, 'days')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition disabled:bg-rose-500/30 disabled:text-white/50 disabled:cursor-not-allowed"
                            disabled={!u.vipExpiresAt || u.vipExpiresAt < Date.now()}
                          >
                            <Minus size={12} /> ၁ ရက်
                          </button>
                          <button
                            onClick={() => updateVip(u.id, u.vipExpiresAt, 1, 'months')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                          >
                            <Plus size={12} /> ၁ လ
                          </button>
                          <button
                            onClick={() => updateVip(u.id, u.vipExpiresAt, -1, 'months')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition disabled:bg-rose-500/30 disabled:text-white/50 disabled:cursor-not-allowed"
                            disabled={!u.vipExpiresAt || u.vipExpiresAt < Date.now()}
                          >
                            <Minus size={12} /> ၁ လ
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <p className="text-center py-8 text-[#64748b]">No users found.</p>
        )}
      </div>
    </div>
  );
}
