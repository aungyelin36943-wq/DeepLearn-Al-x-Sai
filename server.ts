import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { getFirebaseAdmin } from './src/lib/firebase-admin';

async function startServer() {
  const app = express();
  const PORT = 3000;

  getFirebaseAdmin(); // Initialize Firebase Admin

  app.use(express.json());

  // Auth Middleware
  const requireAuthAndVip = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const admin = getFirebaseAdmin();
      const decodedToken = await admin.auth.verifyIdToken(token);
      
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0903017904/databases/ai-studio-971330af-554b-45e8-aba1-e78aa2898cc7/documents/users/${decodedToken.uid}`;
      const userRes = await fetch(firestoreUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!userRes.ok) {
        if (userRes.status === 404) return res.status(403).json({ error: 'User not found in database' });
        return res.status(403).json({ error: 'Forbidden: Failed to load user profile' });
      }

      const userDoc = await userRes.json();
      const fields = userDoc.fields || {};
      const role = fields.role?.stringValue;
      const vipExpiresAtStr = fields.vipExpiresAt?.integerValue || fields.vipExpiresAt?.doubleValue || fields.vipExpiresAt?.stringValue;
      const vipExpiresAt = vipExpiresAtStr ? Number(vipExpiresAtStr) : 0;
      const now = Date.now();

      if (role === 'admin') {
        (req as any).user = decodedToken;
        return next();
      }

      if (!vipExpiresAt || vipExpiresAt < now) {
        return res.status(403).json({ error: 'Forbidden: App requires active VIP subscription. Please contact support to upgrade.' });
      }

      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  // Concurrency limiter for Server
  let activeRequests = 0;
  const MAX_CONCURRENT = 100;

  const concurrencyLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (activeRequests >= MAX_CONCURRENT) {
      return res.status(429).json({ error: 'ဆာဗာလူပြည့်နေပါသည်။ ခဏစောင့်ပြီးမှ ထပ်လုပ်ကြည့်ပါ။ (Server is at maximum capacity)' });
    }
    
    activeRequests++;
    let decremented = false;
    const done = () => {
      if (!decremented) {
        activeRequests--;
        decremented = true;
      }
    };
    
    res.on('finish', done);
    res.on('close', done);
    
    next();
  };

  // API Route for TTS
  app.post('/api/tts', requireAuthAndVip, concurrencyLimiter, async (req, res) => {
    try {
      let { text, voice, rate, pitch } = req.body;

      if (!text || !voice) {
        return res.status(400).json({ error: 'Text and voice are required' });
      }

      // Escape special characters to prevent SSML parsing errors
      text = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const options: any = {};
      
      // Convert to SSML percentages (rate string in req body like "+10%" or "-5%")
      if (rate !== undefined && rate !== 0) {
        options.rate = rate > 0 ? `+${rate}%` : `${rate}%`;
      }
      if (pitch !== undefined && pitch !== 0) {
        options.pitch = pitch > 0 ? `+${pitch}%` : `${pitch}%`;
      }

      let audioStream: NodeJS.ReadableStream | null = null;
      let ttsInstance: MsEdgeTTS | null = null;
      let lastError: any = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          ttsInstance = new MsEdgeTTS();
          await ttsInstance.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
          
          const result = ttsInstance.toStream(text, options);
          audioStream = result.audioStream;
          break; // Success
        } catch (err) {
          lastError = err;
          // Silent retry
        }
      }

      if (!audioStream || !ttsInstance) {
        throw lastError || new Error('Failed to create TTS stream after retries');
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      
      audioStream.pipe(res);

      let closed = false;
      const cleanup = () => {
        if (!closed) {
          closed = true;
          try { ttsInstance!.close(); } catch (e) {}
        }
      };

      audioStream.on('end', cleanup);
      audioStream.on('error', cleanup);
      res.on('close', cleanup);
      res.on('finish', cleanup);

    } catch (error) {
      console.error('Error generating TTS:', error);
      res.status(500).json({ error: 'Failed to generate audio' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
