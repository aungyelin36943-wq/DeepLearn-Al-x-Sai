import React from 'react';
import { X, Key, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAppStore } from '../store';

export default function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, groqKeys, addGroqKey, removeGroqKey } = useAppStore();

  if (!isSettingsOpen) return null;

  const handleAddKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get('apiKey') as string;
    if (key && key.trim() && groqKeys.length < 5) {
      addGroqKey(key.trim());
      e.currentTarget.reset();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Key size={20} className="text-cyan-400" />
            Groq API Settings
          </h2>
          <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-slate-300 text-sm">
          <div>
            <p className="mb-4">
              Add your Groq API keys here to use the transcription feature. You can add up to 5 keys. 
              If one key encounters an error, the system will automatically switch to the next one.
            </p>
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors">
              Get Groq API Key <ExternalLink size={14} />
            </a>
          </div>

          <form onSubmit={handleAddKey} className="flex gap-2">
            <input 
              name="apiKey"
              type="text" 
              placeholder="gsk_..."
              autoComplete="off"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={groqKeys.length >= 5}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 rounded-lg px-4 py-2 font-medium transition-colors flex items-center gap-1"
            >
              <Plus size={18} /> Add
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-400 text-xs uppercase tracking-wider mb-3">Saved Keys ({groqKeys.length}/5)</h3>
            {groqKeys.length === 0 ? (
              <div className="text-slate-500 text-center py-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                No API keys added yet.
              </div>
            ) : (
              groqKeys.map((key, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-cyan-100">
                      {key.slice(0, 8)}********{key.slice(-4)}
                    </span>
                  </div>
                  <button onClick={() => removeGroqKey(idx)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
