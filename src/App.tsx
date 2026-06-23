import { useState, useEffect } from 'react';
import Header from './components/Header';
import VoiceoverView from './components/VoiceoverView';
import TranscriptionView from './components/TranscriptionView';
import SettingsModal from './components/SettingsModal';
import AudioHistory from './components/AudioHistory';
import AdminPanel from './components/AdminPanel';
import { useAppStore } from './store';
import { Toaster } from 'react-hot-toast';
import { Mic, FileAudio, Info, MessageCircle } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const { theme, language, adminPanelOpen, setAdminPanelOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<'voiceover' | 'transcription'>('transcription');

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle system color background based on theme
  const bgClass = "bg-[#0B1120] text-slate-200 selection:bg-cyan-500/30 text-slate-300";

  return (
    <div className={cn("min-h-screen font-sans transition-colors duration-300", 
      theme === 'dark' ? "bg-[#0B1120] text-slate-200" : "bg-slate-50 text-slate-800"
    )}>
      {theme === 'dark' && (
        <div className="fixed inset-0 z-[-1] bg-[#0B1120] pointer-events-none"></div>
      )}

      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1e293b' : '#fff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }
        }}
      />
      
      <Header />
      <SettingsModal />

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {adminPanelOpen ? (
          <AdminPanel onClose={() => setAdminPanelOpen(false)} />
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-10">
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('transcription')}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                activeTab === 'transcription' 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <FileAudio size={18} />
              {language === 'my' ? 'အသံမှ စာသားပြောင်းရန်' : 'Transcribe'}
            </button>
            <button
              onClick={() => setActiveTab('voiceover')}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                activeTab === 'voiceover' 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Mic size={18} />
              {language === 'my' ? 'စာသားမှ အသံပြောင်းရန်' : 'Voiceover Edit'}
            </button>
          </div>
        </div>

        {/* Dynamic View */}
        <div className={cn(activeTab !== 'transcription' && 'hidden')}>
          <TranscriptionView />
        </div>
        <div className={cn(activeTab !== 'voiceover' && 'hidden')}>
          <VoiceoverView />
        </div>
        
        {/* Render History Globally */}
        <AudioHistory />

        {/* Global How it works / Usage Guide at the very bottom */}
        <div className="pt-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-slate-800 dark:text-white mb-10">How it works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center font-bold mb-6 font-mono text-lg">1</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3">
                <FileAudio size={20} className="text-yellow-500" />
                GET KEY
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-4">Groq.com တွင် API key အခမဲ့ ရယူပြီး Browser တွင် သိမ်းပါ</p>
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="inline-block mt-auto text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline">Get API Key →</a>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center font-bold mb-6 font-mono text-lg">2</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3">
                <Mic size={20} className="text-slate-400 dark:text-slate-300" />
                UPLOAD FILE
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">သင်၏ MP3 ဖိုင်တင်ပါ (အများဆုံး 25MB)</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center font-bold mb-6 font-mono text-lg">3</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3">
                <FileAudio size={20} className="text-cyan-500" />
                EXPORT
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">မိနစ်ပိုင်းအတွင်း Transcript ရပြီး copy ကူးယူနိူင်ပါသည် စာလုံးရေးအတိကျပြပေးမည်</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center font-bold mb-6 font-mono text-lg">4</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3">
                <Mic size={20} className="text-purple-500" />
                VOICEOVER
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">Ai အသံ 14 မျိုး နဲ့ စိတ်ကြိုက် ပြင်ဆင်ပြီး download ယူနိူင်ပါသည်</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all shadow-sm md:col-span-2 lg:col-span-2">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center font-bold mb-6 font-mono text-lg">5</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3">
                <Info size={20} className="text-green-500" />
                SRT SUPPORT
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">Myanmar SRT file များကိုလည်း အဆင်ပြေအောင်ပြုပြင်ပေးထားပါတယ် သက်ဆိုင်ရာ capcut pro VN inshot တို့မှာ ထည့်ပြီး လွယ်ကူလျှင်မြန်စွာ အသုံးပြုနိူင်ပါသည်</p>
            </div>
            
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center mt-12 mb-8 shadow-md dark:shadow-2xl flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">DeepLearn AI × Sai Community တွင် ပါဝင်ပါ</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg">နောက်ဆုံး AI Tools, Tips နှင့် Updates များကိုလည်း လေ့လာနိူင်ပါသည်ခင်ဗျာ</p>
            <a href="https://t.me/Deeplearnxai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full max-w-xs gap-2 bg-[#4BA5F5] hover:bg-[#3B8CD9] text-white font-medium px-6 py-3.5 rounded-2xl transition-colors shadow-lg shadow-blue-500/25 active:scale-95">
               <MessageCircle size={20} />
               Telegram Channel Join ဖြင့်
            </a>
          </div>
        </div>
        </>
        )}
        
        {/* Footer Info Section */}
        <footer className="mt-20 pt-16 pb-12 border-t border-slate-200 dark:border-slate-800/50">
          <div className="flex flex-col items-center justify-center space-y-4">
             <h3 className="text-cyan-600 dark:text-cyan-500 font-semibold text-lg tracking-wide">DeepLearn AI × Sai</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm">by SAIMYANMAR <span className="mx-2">•</span> Powered by SAIMYANMAR</p>
             <a href="https://t.me/Deeplearnxai" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400 text-sm flex items-center gap-1.5 transition-colors">
               @Deeplearn AI × SAI
             </a>
             <div className="flex flex-col items-center gap-4 mt-8 pt-4">
                <span className="text-slate-400 dark:text-slate-600 text-xs">© 2026 SAIMYANMAR • All right reserved</span>
             </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
