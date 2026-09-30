import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint (PRD FR-09 & API Requirements)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'Facial Emotion Detection API',
      version: '1.0.0',
      model_loaded: true,
      supported_emotions: [
        'Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Disgust', 'Neutral'
      ],
      dataset: 'FER-2013',
      runtime: 'Node.js + Face-API (TensorFlow) & Python FastAPI',
      developer: {
        student: 'D Naga Chandu',
        roll_number: '27986',
        department: 'CSE - AIDS',
        institution: 'Vel Tech University'
      },
      timestamp: new Date().toISOString()
    });
  });

  // Emotions categories endpoint (PRD Section 4 & 9)
  app.get('/api/emotions', (req, res) => {
    res.json({
      emotions: [
        {
          name: 'Happy',
          emoji: '😊',
          description: 'Elevation of lip corners (zygomatic major), cheek raising, periocular wrinkles (Duchenne marker)'
        },
        {
          name: 'Sad',
          emoji: '😢',
          description: 'Inner corner of eyebrows raised (frontalis), drooping eyelids, downturned lip corners'
        },
        {
          name: 'Angry',
          emoji: '😠',
          description: 'Lowered and pulled together eyebrows (corrugator), narrowed eye aperture, tense lips'
        },
        {
          name: 'Fear',
          emoji: '😨',
          description: 'Eyebrows raised and pulled together, widened eye aperture (sclera visible), lip stretch'
        },
        {
          name: 'Surprise',
          emoji: '😲',
          description: 'Curved elevated eyebrows, wide open eyes, dropped mandible (open mouth)'
        },
        {
          name: 'Disgust',
          emoji: '🤢',
          description: 'Wrinkled nose dorsum (levator labii superioris), elevated upper lip, squinted eyes'
        },
        {
          name: 'Neutral',
          emoji: '😐',
          description: 'Relaxed facial musculature, resting baseline without characteristic muscle contraction'
        }
      ],
      labels: ['Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Disgust', 'Neutral'],
      dataset: 'FER-2013 (Facial Expression Recognition 2013)',
      classes_count: 7
    });
  });

  // Single-image prediction endpoint (PRD Section 9)
  app.post('/api/predict', (req, res) => {
    const { filename, results, faces_detected } = req.body;
    res.json({
      success: true,
      filename: filename || 'uploaded_image.jpg',
      faces_detected: typeof faces_detected === 'number' ? faces_detected : (results?.length || 0),
      results: results || [],
      processed_at: new Date().toISOString()
    });
  });

  // Batch prediction endpoint (PRD Section 9)
  app.post('/api/predict/batch', (req, res) => {
    const { batch } = req.body;
    res.json({
      success: true,
      total_images: Array.isArray(batch) ? batch.length : 0,
      batch_results: batch || [],
      processed_at: new Date().toISOString()
    });
  });

  // Mount Vite middleware in development or serve static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Facial Emotion Detection server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
