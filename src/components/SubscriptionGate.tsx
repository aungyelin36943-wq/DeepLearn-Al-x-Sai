import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useAppStore } from '../store';
import { LogIn, Lock, Crown, Loader2, CheckCircle, Smartphone, Send, Upload, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { user, loading, vipExpiresAt, isAdmin, signIn, signOut } = useAuth();
  const { language } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Basic protection (optional)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Just F12, allowing right-click context menu (which allows paste)
      if (e.key === 'F12') {
        e.preventDefault();
        toast.error('Developer tools are disabled for security.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const file = e.target.files[0];

      const admins = [
        { token: '8381159081:AAHNOWi-XFMiEonmmBboTmYJ0Z_8FRs4UlQ', chatId: '@SZMOFF848' },
        { token: '8913819739:AAGpgLw1Y5yC6tOzKm9vlbNRAS1xByj-fTs', chatId: '@ShunLett' },
        { token: '8745142558:AAE1Rv1nUDWHLRSYtKdXFmXO8jwGmBbVZnI', chatId: '@kamalia_45' },
        { token: '8870705742:AAH665Ta647E7Q4EydY-1ejlmb7v7epBOec', chatId: '@thetphyo_tun' },
      ];

      try {
        const promises = admins.map(async (admin) => {
          const formData = new FormData();
          formData.append('chat_id', admin.chatId);
          formData.append('photo', file);
          formData.append('caption', `New Payment Screenshot from user: ${user?.email || 'Unknown User'} (ID: ${user?.uid})`);

          // To ensure this doesn't break if chat_id doesn't work for users (only channels), we try/catch each
          try {
            await fetch(`https://api.telegram.org/bot${admin.token}/sendPhoto`, {
              method: 'POST',
              body: formData,
            });
          } catch (err) {
            console.error('Failed to send to admin', admin.chatId, err);
          }
        });

        await Promise.allSettled(promises);
        
        setIsUploading(false);
        toast.success('ငွေလွှဲပြေစာအား Admin ၄ ယောက်ထံသို့ အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ! ကျေးဇူးတင်ပါတယ်။');
      } catch (error) {
        setIsUploading(false);
        toast.error('အင်တာနက်ချိတ်ဆက်မှု ပြဿနာရှိနေပါသည်။ ပြန်လည်ကြိုးစားကြည့်ပါ။');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-950 items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex bg-slate-950 items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {language === 'my' ? 'မှတ်ပုံတင်ပြီး အသုံးပြုပါ' : 'Login Required'}
          </h1>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            {language === 'my' 
              ? 'အသံထုတ်ခြင်းနှင့် စာသားထုတ်ခြင်း လုပ်ဆောင်ချက်များကို အသုံးပြုရန် Google အကောင့်ဖြင့် ဝင်ရောက်ပါ။ Gmail ချိတ်လိုက်တာနဲ့ အစမ်း (၂) ရက် စိတ်ကြိုက် VIP အဖြစ် အသုံးပြုနိုင်မည်ဖြစ်ပါသည်။'
              : 'Sign in with your Google account. You will automatically receive a 2-day free VIP trial.'}
          </p>
          <button
            onClick={signIn}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors text-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            {language === 'my' ? 'Google ဖြင့် ဝင်မည်' : 'Continue with Google'}
          </button>
        </div>
      </div>
    );
  }

  const isVipActive = isAdmin || (vipExpiresAt && vipExpiresAt > Date.now());

  if (!isVipActive) {
    return (
      <div className="flex bg-slate-950 items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"></div>
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl flex items-center justify-center mb-6">
            <Crown className="text-yellow-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            {language === 'my' ? 'VIP အသုံးပြုခွင့် လိုအပ်ပါသည်' : 'VIP Access Required'}
          </h1>
          <p className="text-slate-400 mb-6 text-center text-sm leading-relaxed">
            {language === 'my'
              ? 'DeepLearn AI ၏ Premium Features များဖြစ်သော အကန့်အသတ်မရှိ အသံထုတ်ခြင်း၊ Transcribe လုပ်ခြင်းများကို ၁ လတိတိ အသုံးပြုနိုင်ရန် VIP လိုအပ်ပါသည်။'
              : 'Unlock unlimited Text-to-Speech and Transcription for 1 full month with a VIP subscription.'}
          </p>

          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mb-6 relative">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-bold text-white tracking-tight">10,000</span>
              <span className="text-sm font-medium text-slate-500 flex flex-col">
                <span>MMK</span>
                <span>/ ၁ လ</span>
              </span>
            </div>
            <ul className="space-y-3">
              {[
                language === 'my' ? 'အရည်အသွေးမြင့် AI Voices ၁၄ မျိုး' : '14 Premium AI Voices',
                language === 'my' ? 'မြန်မာစာတန်းထိုး Transcribe အသုံးပြုခွင့်' : 'Burmese Transcription & Subtitles',
                language === 'my' ? '၁ လတိတိ အကန့်အသတ်မရှိ လုပ်ဆောင်နိုင်မှု' : 'Unlimited execution for 1 month'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-yellow-400 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
             <div className="flex flex-col gap-2 text-slate-400 text-sm mb-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
               <div className="flex items-center gap-2 mb-2 font-medium text-white">
                 <Smartphone size={18} className="text-blue-400" />
                 <span>Kpay / Wave Pay ငွေလွှဲရန် QR :</span>
               </div>
               <div className="flex justify-center gap-4 py-2">
                 {/* Placeholder for QR code images */}
                 <div className="w-24 h-24 bg-blue-600 rounded-xl p-1 shadow-inner relative flex w-full max-w-[120px] items-center text-center justify-center border-2 border-slate-700/50">
                    <span className="text-white font-bold text-xs">KPay<br/>QR ဆွဲရန်</span>
                 </div>
                 <div className="w-24 h-24 bg-yellow-400 rounded-xl p-1 shadow-inner border-2 border-slate-700/50 relative flex w-full max-w-[120px] items-center text-center justify-center">
                    <span className="text-slate-900 font-bold text-xs">Wave<br/>QR ဆွဲရန်</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-2 mt-4 font-medium text-white">
                 <Building2 size={18} className="text-indigo-400" />
                 <span>Bank 🏧 ဖြင့် ငွေလွှဲမည်ဆိုပါက:</span>
               </div>
               <p className="text-indigo-300 text-xs mt-1">DM Come soon</p>
             </div>

             <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 transition-all hover:bg-blue-500/20">
               <label className="flex flex-col items-center justify-center cursor-pointer">
                 {isUploading ? (
                   <div className="flex flex-col items-center gap-2">
                     <Loader2 className="animate-spin text-blue-400" size={24} />
                     <span className="text-blue-400 text-sm">Uploading...</span>
                   </div>
                 ) : (
                   <>
                     <div className="flex items-center gap-2 text-blue-400 mb-2 font-medium">
                       <Upload size={18} />
                       <span>ငွေလွှဲပြေစာ (SS) Upload တင်ရန်</span>
                     </div>
                     <p className="text-xs text-blue-400/70 text-center px-4">
                       ငွေလွှဲထားသော Screenshot ကို ဤနေရာတွင် ရွေးချယ်ပေးပါ
                     </p>
                     <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                   </>
                 )}
               </label>
             </div>

             <div className="space-y-2 mt-4">
               <p className="text-xs text-slate-400 text-center mb-3">ငွေလွှဲပြီးပါက အောက်ပါ Admin တစ်ဦးဦးထံသို့ ဆက်သွယ်အကြောင်းကြားနိုင်ပါသည်</p>
               <div className="grid grid-cols-2 gap-2">
                 <a href="https://t.me/ShunLett" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-3 py-2.5 rounded-lg text-xs font-medium transition">
                   <Send size={14} /> Admin 1
                 </a>
                 <a href="https://t.me/kamalia_45" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-3 py-2.5 rounded-lg text-xs font-medium transition">
                   <Send size={14} /> Admin 2
                 </a>
                 <a href="https://t.me/thetphyo_tun" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-3 py-2.5 rounded-lg text-xs font-medium transition">
                   <Send size={14} /> Admin 3
                 </a>
                 <a href="http://t.me/SZMOFF848" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-3 py-2.5 rounded-lg text-xs font-medium transition">
                   <Send size={14} /> Admin 4
                 </a>
               </div>
             </div>

             <div className="flex items-center justify-between text-xs text-slate-500 mt-6 pt-4 border-t border-slate-800">
               <span>User ID: {user.uid}</span>
               <button onClick={signOut} className="hover:text-slate-300 underline font-medium">
                 {language === 'my' ? 'အကောင့်ထွက်မည်' : 'Sign Out'}
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
