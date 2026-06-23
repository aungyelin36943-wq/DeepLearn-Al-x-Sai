import { useState, useRef, useEffect } from 'react';
import { Play, Download, Trash, Clipboard, Mic, Loader2, PlayCircle, Globe } from 'lucide-react';
import { voices, emotions, VOICE_LANG_MAP, languagesTTS } from '../data';
import { saveAudioRecord } from '../lib/db';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

import { useAuth } from '../lib/AuthContext';

export default function VoiceoverView() {
  const { language } = useAppStore();
  const { user } = useAuth();
  const [text, setText] = useState('');
  
  const [activeLang, setActiveLang] = useState('my');
  
  const [activeVoice, setActiveVoice] = useState(voices[0].id);
  const [activeEmotion, setActiveEmotion] = useState(emotions[11].id); // NORMAL
  
  const [speed, setSpeed] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // We are not showing standard audio player immediately, we will let Background history handle it.
  // Wait, user still wants to see generation happen and saved.
  // Actually, let's just trigger generate and tell them to check below.

  const MAX_CHARS = 25000;

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const newText = text ? text + '\n' + clipboardText : clipboardText;
      handleTextChange(newText);
    } catch (err) {
      toast.error(language === 'my' 
        ? 'ဘရောက်ဇာ ကန့်သတ်ချက်ကြောင့် Paste ခလုတ်ကို အသုံးပြု၍မရပါ။ စာရိုက်သည့်နေရာကို ဖိ၍ (သို့) Ctrl+V ကို အသုံးပြုပြီး Paste ချပါ။' 
        : 'Browser blocked paste. Please use Ctrl+V or long-press inside the text box to paste.');
    }
  };

  const handleTextChange = (val: string) => {
    setText(val.slice(0, MAX_CHARS));
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error(language === 'my' ? 'ကျေးဇူးပြု၍ စာသားထည့်ပါ' : 'Please enter some text');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const mappedVoice = VOICE_LANG_MAP[activeLang]?.[activeVoice] || VOICE_LANG_MAP['my'][activeVoice];
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text,
          voice: mappedVoice,
          rate: speed,
          pitch: pitch
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to generate audio');
      }

      const blob = await res.blob();
      
      // Determine duration by loading into audio element seamlessly
      const tempAudioUrl = URL.createObjectURL(blob);
      const audio = new Audio(tempAudioUrl);
      
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('loadedmetadata', async () => {
          try {
            const duration = audio.duration;
            const voiceName = voices.find(v => v.id === activeVoice)?.name || 'Voice';
            
            // Save to DB
            await saveAudioRecord({
              id: Date.now().toString(),
              text: text.trim(),
              blob,
              createdAt: Date.now(),
              filename: `DeepLearn_AI_${voiceName}`,
              duration: duration === Infinity || isNaN(duration) ? 0 : duration
            });

            toast.success(language === 'my' ? 'အသံထုတ်ပြီးပါပြီ၊ အောက်ဘက်တွင် ဝင်ရောက်နားဆင်ပါ' : 'Audio saved successfully. Check below.');
            window.dispatchEvent(new Event('audio-generated'));
            resolve();
          } catch (e) {
            reject(e);
          } finally {
            URL.revokeObjectURL(tempAudioUrl);
          }
        });
        
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(tempAudioUrl);
          reject(new Error('Failed to load audio metadata'));
        });
      });

    } catch (error) {
      console.error(error);
      toast.error(language === 'my' ? 'အသံထုတ်လုပ်ရာတွင် အမှားဖြစ်နေပါသည်' : 'Error generating audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyEmotion = (eId: string) => {
    setActiveEmotion(eId);
    const emotion = emotions.find(e => e.id === eId);
    if (emotion) {
      setSpeed(emotion.s);
      setPitch(emotion.p);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Text Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Mic size={20} className="text-cyan-400" />
            {language === 'my' ? 'အသံပြောင်းလိုသော စာသားများကို ဤနေရာတွင် ရေးပါ သို့မဟုတ် paste ချပါ' : 'Enter or paste text to convert to speech'}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePaste} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
              <Clipboard size={16} /> Paste
            </button>
            <button onClick={() => setText('')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-medium transition-colors">
              <Trash size={16} /> Clean
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder={language === 'my' ? 'ဤနေရာတွင် စာသားများ ရိုက်ထည့်ပါ သို့မဟုတ် ကူးထည့်ပါ...' : 'Type or paste text here...'}
          className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-y transition-all"
        />
        
        <div className="flex items-center justify-end mt-2 text-xs font-medium text-slate-500">
          <span className={cn("transition-colors", text.length >= MAX_CHARS && "text-red-400")}>
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid Layout for settings */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Voices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              {language === 'my' ? 'အသံများရွေးချယ်ပါ' : 'Select Voice'}
            </h3>
            
            {/* Language Selector */}
            <div className="relative">
              <select
                value={activeLang}
                onChange={(e) => setActiveLang(e.target.value)}
                className="appearance-none bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {languagesTTS.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <Globe size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start" style={{ maxHeight: '300px' }}>
            {voices.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVoice(v.id)}
                className={cn(
                  "p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-start gap-1",
                  activeVoice === v.id 
                    ? "bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/50 text-white shadow-lg shadow-pink-500/10" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <PlayCircle size={14} className={activeVoice === v.id ? "text-pink-400" : "text-slate-600"} />
                  <span className="truncate max-w-[100px]">{v.name}</span>
                </span>
                <span className="text-[10px] text-slate-500 ml-5">{v.gender}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emotions & Sliders */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              {language === 'my' ? 'စကားပြော စိတ်ခံစားမှု စတိုင်များ' : 'Speaking Styles & Emotions'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotions.map((e) => (
                <button
                  key={e.id}
                  onClick={() => applyEmotion(e.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    activeEmotion === e.id
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-100"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold tracking-widest text-[#4ade80] uppercase">{language === 'my' ? 'အသံအမြန်နှုန်း (Speed)' : 'SPEED'}</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSpeed(s => Math.max(-100, s - 5))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[#4ade80] hover:text-white hover:bg-slate-700 transition-colors border border-[#4ade80]/20">-</button>
                  <span className="text-base font-mono w-14 text-center text-purple-400">{speed > 0 ? '+' : ''}{speed}%</span>
                  <button onClick={() => setSpeed(s => Math.min(100, s + 5))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[#4ade80] hover:text-white hover:bg-slate-700 transition-colors border border-[#4ade80]/20">+</button>
                </div>
              </div>
              <input 
                type="range" min="-100" max="100" step="1" 
                value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4ade80] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#4ade80] focus:outline-none mb-2"
                style={{ background: `linear-gradient(to right, #4ade80 ${((speed + 100) / 200) * 100}%, #334155 ${((speed + 100) / 200) * 100}%)` }}
              />
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>-100%</span>
                <span>+100%</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold tracking-widest text-pink-400 uppercase">{language === 'my' ? 'အသံ အတက်/အကျ (Pitch)' : 'PITCH'}</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPitch(p => Math.max(-100, p - 5))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-pink-400 hover:text-white hover:bg-slate-700 transition-colors border border-pink-400/20">-</button>
                  <span className="text-base font-mono w-14 text-center text-purple-400">{pitch > 0 ? '+' : ''}{pitch}%</span>
                  <button onClick={() => setPitch(p => Math.min(100, p + 5))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-pink-400 hover:text-white hover:bg-slate-700 transition-colors border border-pink-400/20">+</button>
                </div>
              </div>
              <input 
                type="range" min="-100" max="100" step="1" 
                value={pitch} onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(244,114,182,0.8)] focus:outline-none mb-2"
                style={{ background: `linear-gradient(to right, #f472b6 ${((pitch + 100) / 200) * 100}%, #334155 ${((pitch + 100) / 200) * 100}%)` }}
              />
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>-100%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4 text-center divide-x divide-slate-800 border-b border-slate-800 pb-6 mb-2">
          <div className="flex flex-col items-center">
             <span className="text-green-400 text-xl font-bold mb-1">25,000</span>
             <span className="text-[10px] text-slate-500 font-semibold tracking-wider">CHARACTER LIMIT</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-green-400 text-xl font-bold mb-1">{text.trim() ? text.trim().split(/\s+/).length : 0}</span>
             <span className="text-[10px] text-slate-500 font-semibold tracking-wider">WORDS</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-green-400 text-xl font-bold mb-1">{text.length}</span>
             <span className="text-[10px] text-slate-500 font-semibold tracking-wider">CHARACTERS</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-green-400 text-xl font-bold mb-1">{text.trim() ? text.split('\n').length : 0}</span>
             <span className="text-[10px] text-slate-500 font-semibold tracking-wider">LINES</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-4 flex items-center justify-center gap-3 font-semibold text-lg transition-all shadow-lg shadow-pink-500/25 active:scale-[0.98]"
        >
          {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} className="fill-current" />}
          {language === 'my' ? 'အသံထုတ်ယူမည်' : 'Generate Audio'}
        </button>
      </div>

    </div>
  );
}
