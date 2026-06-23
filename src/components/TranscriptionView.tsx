import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileAudio, Loader2, Download, CheckCircle2, AlertCircle, FileText, ClipboardList, Globe, Key, Music, MessageCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function TranscriptionView() {
  const { language, groqKeys, activeKeyIndex, nextActiveKey, setSettingsOpen } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [srtContent, setSrtContent] = useState<string | null>(null);
  const [transcribeLanguage, setTranscribeLanguage] = useState('');

  const languages = [
    { code: '', label: 'Auto Detect (အကြံပြု)' },
    { code: 'en', label: 'English' },
    { code: 'my', label: 'မြန်မာ (Burmese)' },
    { code: 'zh', label: 'Chinese (中文)' },
    { code: 'th', label: 'Thai (ภาษาไทย)' },
    { code: 'ja', label: 'Japanese (日本語)' },
    { code: 'ko', label: 'Korean (한국어)' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'ar', label: 'Arabic' },
    { code: 'hi', label: 'Hindi' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'id', label: 'Indonesian' },
    { code: 'de', label: 'German' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'tr', label: 'Turkish' },
    { code: 'it', label: 'Italian' },
    { code: 'nl', label: 'Dutch' },
    { code: 'pl', label: 'Polish' },
    { code: 'sv', label: 'Swedish' },
    { code: 'ms', label: 'Malay' },
    { code: 'tl', label: 'Filipino' },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSrtContent(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB max per UI spec
  } as any);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTranscribe = async () => {
    if (!file) return;
    
    if (groqKeys.length === 0) {
      toast.error(language === 'my' ? 'Groq API Key ထည့်ရန်လိုအပ်ပါသည်' : 'Groq API Key is required');
      setSettingsOpen(true);
      return;
    }

    // Note: Groq native limit is 25MB. We'll warn if it's over 25MB but still try.
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File is larger than 25MB. Groq API might reject it.");
    }

    setIsTranscribing(true);
    setSrtContent(null);

    let attempts = 0;
    const maxAttempts = groqKeys.length;
    let currentKeyIndex = activeKeyIndex;

    while (attempts < maxAttempts) {
      try {
        const apiKey = groqKeys[currentKeyIndex];
        const formData = new FormData();
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const validExtensions = ['.flac', '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.ogg', '.opus', '.wav', '.webm'];
        let extension = extMatch ? extMatch[0].toLowerCase() : '.mp3';
        
        if (!validExtensions.includes(extension)) {
          extension = '.mp3';
        }
        
        const mimeTypes: Record<string, string> = {
          '.flac': 'audio/flac',
          '.mp3': 'audio/mpeg',
          '.mp4': 'video/mp4',
          '.mpeg': 'audio/mpeg',
          '.mpga': 'audio/mpeg',
          '.m4a': 'audio/mp4',
          '.ogg': 'audio/ogg',
          '.opus': 'audio/opus',
          '.wav': 'audio/wav',
          '.webm': 'audio/webm'
        };
        const forcedType = mimeTypes[extension] || 'audio/mpeg';
        const finalFileName = 'audio' + extension;

        const audioBlob = new Blob([file], { type: forcedType });
        formData.append('file', audioBlob, finalFileName);
        formData.append('model', 'whisper-large-v3'); // Fast model for transcription
        formData.append('response_format', 'verbose_json');
        if (transcribeLanguage) {
          formData.append('language', transcribeLanguage);
        }

        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData
        });

        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = `API Error: ${res.status}`;
          try {
            const parsedError = JSON.parse(errorText);
            if (parsedError.error && parsedError.error.message) {
              errorMessage = parsedError.error.message;
            }
          } catch (e) {
            errorMessage = errorText;
          }
          
          const err: any = new Error(errorMessage);
          err.status = res.status;
          throw err;
        }

        const jsonOutput = await res.json();
        
        // Extract raw text directly
        const rawText = jsonOutput.text || 'Transcription text unavailable.';

        setSrtContent(rawText);
        toast.success(language === 'my' ? 'စာသားထုတ်ယူပြီးပါပြီ' : 'Transcription successful');
        break; // Success! exit loop
        
      } catch (error: any) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        
        const errorMessage = error?.message || 'Unknown error';
        
        // If it's a bad request like file format, do not retry with other keys
        if (error.status === 400 || error.status === 413) {
           let msg = errorMessage;
           if (msg.includes('file must be one of the following types')) {
             msg = language === 'my' 
               ? 'ဖိုင်အမျိုးအစား မှားယွင်းနေပါသည်။ mp3, wav, m4a စသည့် အသံဖိုင်များကိုသာ ထည့်ပါ။'
               : 'Invalid file format. Please upload an mp3, wav, m4a, etc.';
           }
           toast.error(msg);
           break;
        }

        attempts++;
        if (attempts < maxAttempts) {
          toast.error(`Key ${currentKeyIndex + 1} failed, trying next key...`);
          currentKeyIndex = (currentKeyIndex + 1) % groqKeys.length;
          nextActiveKey(); // Save state
          // Delay briefly before retry
          await new Promise(r => setTimeout(r, 1000));
        } else {
          toast.error(errorMessage);
        }
      }
    }

    setIsTranscribing(false);
  };

  const handleDownloadSRT = () => {
    if (!srtContent) return;
    const originalName = file?.name.split('.')[0] || 'audio';
    const filename = prompt(language === 'my' ? 'ဖိုင်အမည်ပေးပါ' : 'Enter file name', `${originalName}_Myanmar`);
    if (filename) {
      const blob = new Blob([srtContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.srt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getWordCount = (text: string) => {
    if (!text) return 0;
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
      return Array.from(segmenter.segment(text)).filter(s => s.isWordLike).length;
    } catch (e) {
      const cjkChars = text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u0E00-\u0E7F\u1000-\u109F]/g)?.length || 0;
      const spacedWords = text.replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u0E00-\u0E7F\u1000-\u109F]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
      return cjkChars + spacedWords;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-medium text-white mb-2 text-center">
          {language === 'my' ? 'MP3 / Audio လေးကို ဒီမှာ ထည့်ပါ' : 'Upload MP3 / Audio'}
        </h2>
        <p className="text-slate-500 text-sm mb-8 text-center flex flex-col sm:flex-row items-center justify-center gap-1.5">
          {language === 'my' ? (
            <>
              <span>MP3</span> • <span>အများဆုံး: 25MB (10 မိနစ်ခန့်)</span>
            </>
          ) : (
            <>
              <span>MP3</span> • <span>Size: Max 25MB (10 mins)</span>
            </>
          )}
        </p>

        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-[0_0_20px_rgba(59,130,246,0.1)]",
            isDragActive 
              ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.25)]" 
              : "border-blue-500/40 hover:border-blue-400 bg-slate-900/50 hover:bg-blue-950/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          )}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <input {...getInputProps()} />
          <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center mb-5 text-blue-400 group-hover:scale-110 transition-transform duration-500">
            <UploadCloud size={32} />
          </div>
          <p className="text-blue-100 font-medium mb-1">
            {isDragActive 
              ? (language === 'my' ? 'ဤနေရာတွင် ချလိုက်ပါ' : 'Drop file here') 
              : (language === 'my' ? 'ဖိုင်ရွေးရန် နှိပ်ပါ သို့မဟုတ် ဆွဲချပါ' : 'Click or drag file here to upload')}
          </p>
        </div>

        {file && (
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4 w-full max-w-md">
              <FileAudio className="text-cyan-400 shrink-0" size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={() => setFile(null)} className="text-slate-500 hover:text-red-400 transition-colors p-2">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 mt-6 w-full max-w-md bg-slate-950/50 border border-slate-800 p-3 rounded-2xl">
              <Globe className="text-slate-400 shrink-0 ml-2" size={20} />
              <span className="text-slate-300 font-medium whitespace-nowrap text-sm">ဘာသာစကား:</span>
              <select 
                value={transcribeLanguage}
                onChange={(e) => setTranscribeLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-cyan-500 text-sm appearance-none cursor-pointer"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="mt-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] w-full max-w-md"
            >
              {isTranscribing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {language === 'my' ? 'စာသားထုတ်ယူနေပါသည်...' : 'Transcribing...'}
                </>
              ) : (
                <>
                  <FileText size={20} />
                  {language === 'my' ? 'Transcript စတင်ရန်' : 'Extract Pure Text'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {srtContent && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-400" />
                {language === 'my' ? 'စာသားထုတ်ယူပြီးပါပြီ' : 'Extracted Text'}
              </h3>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md">
                  {language === 'my' ? 'စာလုံးရေ (Words)' : 'Words'}: {getWordCount(srtContent)}
                </span>
                <span className="text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md">
                  {language === 'my' ? 'အက္ခရာများ (Characters)' : 'Characters'}: {srtContent.length}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(srtContent);
                toast.success(language === 'my' ? 'ကော်ပီကူးယူပြီးပါပြီ' : 'Copied to clipboard');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <ClipboardList size={18} />
              {language === 'my' ? 'စာသားကော်ပီယူမည်' : 'Copy Text'}
            </button>
          </div>
          
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto font-sans text-sm text-slate-300 custom-scrollbar">
            <p className="whitespace-pre-wrap leading-relaxed">{srtContent}</p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 text-slate-400 text-sm">
        <h4 className="flex items-center gap-2 font-medium text-slate-300 mb-3">
          <AlertCircle size={16} className="text-blue-400" />
          {language === 'my' ? 'မှတ်ချက်' : 'Note'}
        </h4>
        <ul className="list-disc list-inside space-y-1 ml-1 marker:text-slate-600">
          <li>{language === 'my' ? 'မူရင်းအသံဖိုင်မှ စာသားအစစ်အမှန်များကိုသာ အတိအကျ ထုတ်ပေးပါမည်။' : 'Extracts exact origin text without timestamps.'}</li>
          <li>{language === 'my' ? 'ထွက်လာသော စာသားကို Copy ယူ၍ Gemini, ChatGPT တို့တွင် ဘာသာပြန်နိုင်ပါသည်။' : 'You can copy the result and translate it elsewhere.'}</li>
          <li>{language === 'my' ? 'API keys ပြဿနာရှိပါက နောက်တစ်ခုသို့ Auto ပြောင်းပေးမည်။' : 'Auto-fails over to the next API key if one restricts access.'}</li>
        </ul>
      </div>

    </div>
  );
}
