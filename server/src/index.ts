import express, { Request, Response } from 'express';
import { aiRouter } from './routes/ai.js';
import cors from 'cors';
import { config } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { patientsRouter } from './routes/patients.js';
import { casesRouter } from './routes/cases.js';
import { consentsRouter } from './routes/consents.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MediKiosk Clinical Core API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    databaseMode: config.isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Resilient In-Memory Adapter',
    aiConfig: {
      model: config.groqModel,
      groqConfigured: Boolean(config.groqApiKey)
    }
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/consents', consentsRouter);
app.use('/api/ai', aiRouter);

// Global 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`🏥 MediKiosk Clinical Backend active on http://localhost:${config.port}`);
  console.log(`📡 Storage Mode: ${config.isSupabaseConfigured ? 'Live Supabase' : 'Local Resilient State'}`);
});

export default app;
