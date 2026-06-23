export const emotions = [
    { id: 'EXCITING', name: 'စိတ်လှုပ်ရှား 🤩', s: 15, p: 10 },
    { id: 'CALM', name: 'တည်ငြိမ် 😌', s: -10, p: -5 },
    { id: 'PROFESSIONAL', name: 'သတင်း 💼', s: 0, p: -2 },
    { id: 'NARRATIVE', name: 'ဇာတ်ကြောင်း 📖', s: -5, p: 0 },
    { id: 'HAPPY', name: 'ပျော်ရွှင် 😊', s: 10, p: 15 },
    { id: 'SERIOUS', name: 'လေးနက် 😠', s: -5, p: -10 },
    { id: 'WHISPER', name: 'တီးတိုး 🤫', s: -15, p: -20 },
    { id: 'SAD', name: 'ဝမ်းနည်း 😢', s: -15, p: -15 },
    { id: 'SARCASTIC', name: 'ရွဲ့ပြော 🙄', s: -10, p: 5 },
    { id: 'ANGRY', name: 'ဒေါသထွက် 🤬', s: 20, p: -10 },
    { id: 'FEAR', name: 'ကြောက်လန့် 😨', s: 10, p: 20 },
    { id: 'NORMAL', name: 'ပုံမှန်အသံ 😐', s: 0, p: 0 }
];

export const languagesTTS = [
    { id: 'my', name: 'Myanmar' },
    { id: 'en', name: 'English' },
    { id: 'th', name: 'Thailand' }
];

export const voices = [
    { id: 'v1', name: 'ကိုစိုင်းစိုင်း', gender: 'ယောက်ျားလေး' },
    { id: 'v2', name: 'မဖွေးဖွေး', gender: 'မိန်းကလေး' },
    { id: 'v3', name: 'ကိုနေတိုး', gender: 'ယောက်ျားလေး' },
    { id: 'v4', name: 'ကိုအောင်ရဲလင်း', gender: 'ယောက်ျားလေး' },
    { id: 'v5', name: 'ကိုမြင့်မြတ်', gender: 'ယောက်ျားလေး' },
    { id: 'v6', name: 'မဝတ်မှုံရွှေရည်', gender: 'မိန်းကလေး' },
    { id: 'v7', name: 'ကိုဒေါင်း', gender: 'ယောက်ျားလေး' },
    { id: 'v8', name: 'မသက်မွန်မြင့်', gender: 'မိန်းကလေး' },
    { id: 'v9', name: 'ကိုလူမင်း', gender: 'ယောက်ျားလေး' },
    { id: 'v10', name: 'မအိန္ဒြာကျော်ဇင်', gender: 'မိန်းကလေး' },
    { id: 'v11', name: 'မရွှေမှုံရတီ', gender: 'မိန်းကလေး' },
    { id: 'v12', name: 'ကိုပြေတီဦး', gender: 'ယောက်ျားလေး' },
    { id: 'v13', name: 'မသင်ဇာဝင့်ကျော်', gender: 'မိန်းကလေး' },
    { id: 'v14', name: 'ကိုပိုင်တံခွန်', gender: 'ယောက်ျားလေး' }
];

export const VOICE_LANG_MAP: Record<string, Record<string, string>> = {
    "my": {
        "v1": "my-MM-ThihaNeural",
        "v2": "my-MM-NilarNeural",
        "v3": "it-IT-GiuseppeMultilingualNeural",
        "v4": "en-AU-WilliamMultilingualNeural",
        "v5": "en-US-AndrewMultilingualNeural",
        "v6": "en-US-AvaMultilingualNeural",
        "v7": "en-US-BrianMultilingualNeural",
        "v8": "en-US-EmmaMultilingualNeural",
        "v9": "fr-FR-RemyMultilingualNeural",
        "v10": "fr-FR-VivienneMultilingualNeural",
        "v11": "de-DE-SeraphinaMultilingualNeural",
        "v12": "de-DE-FlorianMultilingualNeural",
        "v13": "pt-BR-ThalitaMultilingualNeural",
        "v14": "ko-KR-HyunsuMultilingualNeural"
    },
    "en": {
        "v1": "en-US-ChristopherNeural",
        "v2": "en-US-AriaNeural",
        "v3": "en-US-GuyNeural",
        "v4": "en-US-RogerNeural",
        "v5": "en-US-SteffanNeural",
        "v6": "en-US-JennyNeural",
        "v7": "en-GB-RyanNeural",
        "v8": "en-GB-SoniaNeural",
        "v9": "en-GB-ThomasNeural",
        "v10": "en-US-MichelleNeural",
        "v11": "en-GB-LibbyNeural",
        "v12": "en-US-EricNeural",
        "v13": "en-GB-MaisieNeural",
        "v14": "en-AU-WilliamNeural"
    },
    "th": {
        "v1": "th-TH-NiwatNeural",
        "v2": "th-TH-PremwadeeNeural",
        "v3": "en-US-AndrewMultilingualNeural",
        "v4": "en-US-BrianMultilingualNeural",
        "v5": "fr-FR-RemyMultilingualNeural",
        "v6": "th-TH-AcharaNeural",
        "v7": "de-DE-FlorianMultilingualNeural",
        "v8": "en-US-EmmaMultilingualNeural",
        "v9": "it-IT-GiuseppeMultilingualNeural",
        "v10": "en-US-AvaMultilingualNeural",
        "v11": "de-DE-SeraphinaMultilingualNeural",
        "v12": "pt-BR-ThalitaMultilingualNeural",
        "v13": "fr-FR-VivienneMultilingualNeural",
        "v14": "ko-KR-HyunsuMultilingualNeural"
    }
};
