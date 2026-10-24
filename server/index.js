import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './services/db.js';
import appointmentsRoutes from './routes/appointments.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database & tables
initDatabase();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logger in dev
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Resplandor ATL Booking API',
    timestamp: new Date().toISOString()
  });
});

// Privacy notice API
app.get('/api/privacy-notice', (req, res) => {
  res.json({
    title: 'Resplandor ATL Customer Privacy Commitment',
    location: 'Snellville, Georgia',
    summary: 'We collect your name, phone number, and optional email solely for appointment scheduling, service consultations, and salon schedule coordination. Your personal information is encrypted and stored in our secure database and is never shared, rented, or sold.'
  });
});

// Serve frontend in production build if dist exists
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback routing compatible with Express 4 and 5
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(distPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) next();
    });
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ Resplandor ATL Backend API running at: http://localhost:${PORT}`);
});

export default app;
