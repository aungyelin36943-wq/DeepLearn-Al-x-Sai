import { useState, useEffect, useRef } from 'react';
import { Download, Trash2, FileText, CheckCircle2, Play, Pause } from 'lucide-react';
import { getAudioRecords, deleteAudioRecord, cleanupOldRecords, AudioRecord } from '../lib/db';
import { generateLocalSRT } from '../lib/srt';
import toast from 'react-hot-toast';

const CustomAudioPlayer = ({ url, isPlaying, setPlayingId, id }: { url: string, isPlaying: boolean, setPlayingId: (id: string | null) => void, id: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const bars = Array.from({ length: 24 });

  return (
    <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-inner">
      <audio 
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlayingId(null)}
        onPause={() => { if(isPlaying) setPlayingId(null); }}
        onPlay={() => setPlayingId(id)}
        className="hidden"
      />
      
      {/* Visualizer */}
      <div className="flex items-end justify-between h-24 mb-6 gap-1 px-2">
        {bars.map((_, i) => {
          const defaultHeight = 15 + Math.abs(Math.sin(i * 0.5)) * 80;
          const ratio = i / (bars.length - 1);
          // Interpolate color from #22d3ee (cyan-400) to #a855f7 (purple-500)
          const r = Math.round(34 + ratio * (168 - 34));
          const g = Math.round(211 + ratio * (85 - 211));
          const b = Math.round(238 + ratio * (247 - 238));
          return (
            <div 
              key={i} 
              className={`w-full rounded-sm origin-bottom transition-all duration-300 ${isPlaying ? 'animate-wave' : ''}`}
              style={{
                 backgroundColor: `rgb(${r}, ${g}, ${b})`,
                 height: isPlaying ? '100%' : `${defaultHeight}%`,
                 animationDelay: `${i * 0.07}s`,
                 animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                 opacity: isPlaying ? 1 : 0.7
              }}
            />
          );
        })}
      </div>

      {/* Controls & Progress */}
      <div className="flex items-center gap-4 px-2">
        <button 
          onClick={() => isPlaying ? setPlayingId(null) : setPlayingId(id)}
          className="w-12 h-12 flex-shrink-0 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition active:scale-95"
        >
          {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
        </button>
        
        <span className="text-slate-400 text-sm font-medium w-12 text-center">{formatTime(currentTime)}</span>
        
        <div 
            className="flex-1 h-2 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) {
                audioRef.current.currentTime = pos * duration;
              }
            }}
        >
          <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${(currentTime / duration) * 100}%` }} />
        </div>
        
        <span className="text-slate-400 text-sm font-medium w-12 text-center">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export default function AudioHistory() {
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [filenames, setFilenames] = useState<{ [key: string]: string }>({});

  const handleFilenameChange = (id: string, name: string) => {
    setFilenames(prev => ({ ...prev, [id]: name }));
  };

  const loadRecords = async () => {
    await cleanupOldRecords();
    const data = await getAudioRecords();
    setRecords(data);
    // Initialize filenames
    const initialNames: { [key: string]: string } = {};
    data.forEach(r => initialNames[r.id] = r.filename);
    setFilenames(initialNames);
  };

  useEffect(() => {
    loadRecords();
    // Custom event listener to reload when explicitly generated
    window.addEventListener('audio-generated', loadRecords);
    return () => window.removeEventListener('audio-generated', loadRecords);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('သေချာပါသလား?')) {
      await deleteAudioRecord(id);
      loadRecords();
      toast.success('ဖျက်ပြီးပါပြီ');
    }
  };

  const handleDownloadMp3 = (record: AudioRecord) => {
    let rawName = filenames[record.id] || record.filename || 'Audio';
    rawName = rawName.replace(/\.mp3$/i, '').replace(/\.srt$/i, '');
    const filename = rawName.trim().replace(/[/\\?%*:|"<>]/g, '-');
    
    const url = URL.createObjectURL(record.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename}.mp3 ဒေါင်းလုဒ် ရယူပြီးပါပြီ`);
  };

  const handleDownloadSRT = (record: AudioRecord) => {
    if (!record.duration) {
      toast.error('အသံကြာချိန် အချက်အလက်မရှိပါ');
      return;
    }
    
    let rawName = filenames[record.id] || record.filename || 'Audio';
    rawName = rawName.replace(/\.mp3$/i, '').replace(/\.srt$/i, '');
    const filename = rawName.trim().replace(/[/\\?%*:|"<>]/g, '-');

    const srtContent = generateLocalSRT(record.text, record.duration);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename}.srt ဒေါင်းလုဒ် ရယူပြီးပါပြီ`);
  };

  if (records.length === 0) return null;

  return (
    <div className="mt-16 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <CheckCircle2 className="text-green-400" />
          ထုတ်လုပ်ပြီးသော အသံဖိုင်များ
        </h3>
      </div>

      <div className="flex flex-col gap-6">
        {records.map((record) => {
          const url = URL.createObjectURL(record.blob);
          const isPlaying = playingId === record.id;

          return (
            <div key={record.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
              
              {/* Header Title / Text Snippet & Delete Button */}
              <div className="bg-slate-900/80 px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300 line-clamp-1 italic">"{record.text}"</p>
                </div>
              </div>

              {/* Player Section */}
              <div className="px-6 py-4">
                <CustomAudioPlayer 
                   url={url} 
                   isPlaying={isPlaying} 
                   setPlayingId={setPlayingId} 
                   id={record.id} 
                />
              </div>

              {/* Filename Input */}
              <div className="px-6 pb-6 space-y-4">
                 <div>
                   <label className="block text-sm text-slate-400 mb-2">
                     သိမ်းဆည်းမည့် ဖိုင်အမည် (အသံရော စာတန်းထိုးအတွက်ပါ)
                   </label>
                   <div className="flex items-stretch bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                      <input 
                        type="text" 
                        value={filenames[record.id] || ''}
                        onChange={(e) => handleFilenameChange(record.id, e.target.value)}
                        className="flex-1 bg-transparent px-4 py-3 text-slate-200 focus:outline-none text-sm"
                        placeholder="ဖိုင်အမည် ထည့်ပါ"
                      />
                      <div className="flex flex-col bg-slate-800/80 justify-center px-4 border-l border-slate-700">
                        <span className="text-[10px] text-slate-400 font-mono">.mp3 / .srt</span>
                      </div>
                   </div>
                 </div>

                 {/* Download Buttons Stacked */}
                 <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => handleDownloadMp3(record)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-400 text-slate-950 rounded-xl font-bold transition-colors shadow-lg shadow-green-500/20 active:scale-[0.98]"
                    >
                      <Download size={20} /> အသံဖိုင် (.mp3) သိမ်းဆည်းမည်
                    </button>
                    
                    <button
                      onClick={() => handleDownloadSRT(record)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                    >
                      <FileText size={20} /> စာတန်းထိုး (.srt) သိမ်းဆည်းမည်
                    </button>
                 </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
