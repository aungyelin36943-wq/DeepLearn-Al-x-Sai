export interface AudioRecord {
  id: string;
  text: string;
  blob: Blob;
  createdAt: number;
  filename: string;
  duration: number;
}

let memoryRecords: AudioRecord[] = [];

export async function saveAudioRecord(record: AudioRecord): Promise<void> {
  memoryRecords.push(record);
}

export async function getAudioRecords(): Promise<AudioRecord[]> {
  return [...memoryRecords].sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteAudioRecord(id: string): Promise<void> {
  memoryRecords = memoryRecords.filter(r => r.id !== id);
}

export async function cleanupOldRecords(): Promise<void> {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  memoryRecords = memoryRecords.filter(r => now - r.createdAt <= SEVEN_DAYS_MS);
}
