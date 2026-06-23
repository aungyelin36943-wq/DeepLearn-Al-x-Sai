import { Settings, Moon, Sun, Languages, LogOut, Crown } from 'lucide-react';
import { useAppStore } from '../store';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

export default function Header() {
  const { theme, setTheme, language, setLanguage, setSettingsOpen, adminPanelOpen, setAdminPanelOpen } = useAppStore();
  const { signOut, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            D
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
              DeepLearn AI
            </span>
            <span className="text-slate-500">×</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
              Sai
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {isAdmin && (
            <button 
              onClick={() => setAdminPanelOpen(!adminPanelOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium",
                adminPanelOpen ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              title="Admin Dashboard"
            >
              <Crown size={20} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button 
            onClick={() => setLanguage(language === 'my' ? 'en' : 'my')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Toggle Language"
          >
            <Languages size={20} />
            <span className="hidden sm:inline">{language === 'my' ? 'မြန်မာ' : 'English'}</span>
          </button>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            title="Settings"
          >
            <Settings size={20} className="hover:rotate-90 transition-transform duration-300" />
          </button>

          <button 
            onClick={signOut}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
