export function splitIntoLines(text: string, maxLen: number = 40): string[] {
  const words = text.split(' ').filter(w => w.length > 0);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxLen) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

export function chunkText(text: string): string[] {
  // Split by Burmese period, Newline, English period, Question mark, Exclamation mark
  const sentences = text.split(/(?<=။|\n|\.|\?|!)/).map(s => s.trim()).filter(s => s.length > 0);
  const finalChunks: string[] = [];

  sentences.forEach(sentence => {
    // Thai doesn't use much punctuation, so splitIntoLines will primarily fall back to chunk by spaces/length
    const lines = splitIntoLines(sentence, 45); 
    for (let i = 0; i < lines.length; i += 2) {
      const chunkLines = lines.slice(i, i + 2);
      finalChunks.push(chunkLines.join('\n'));
    }
  });

  return finalChunks;
}

export function generateLocalSRT(text: string, durationSecs: number): string {
  if (durationSecs <= 0) return '';
  const chunks = chunkText(text);
  const totalChars = chunks.reduce((acc, c) => acc + c.replace(/\n| /g, '').length, 0);
  
  let srt = '';
  let currentSec = 0;

  const pad = (num: number, size: number) => ('000' + num).slice(size * -1);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${pad(hours, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
  };

  chunks.forEach((chunk, index) => {
    const chunkChars = chunk.replace(/\n| /g, '').length;
    let partDuration = (chunkChars / totalChars) * durationSecs;
    
    let start = currentSec;
    let end = currentSec + partDuration;
    
    // Add small buffer to avoid overlap if possible
    let endAdjusted = end - 0.05;
    if (endAdjusted <= start) endAdjusted = end;

    srt += `${index + 1}\n${formatTime(start)} --> ${formatTime(endAdjusted)}\n${chunk}\n\n`;
    currentSec = end;
  });

  return srt.trim();
}
