const express = require('express');
const cors = require('cors');

const loadConfig = require('./utils/config');
const createDbPool = require('./awsdb');
const createTransporter = require('./utils/mailer');
const createPerplexityService = require('./services/generateWithPerplexity');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const extractRoute = require('./routes/extract');
const generateRoute = require('./routes/generate');
const answerKeyRoute = require('./routes/generateAnswer');
const supportRoute = require('./routes/support');
const slackAlertRoute = require('./routes/slack');
const userRoutes = require('./routes/user');
const s3Upload = require('./routes/s3Upload');
const createTokenAuthMiddleware = require('./utils/middleware');
const googleLoginRoute = require('./routes/googleLoginRoute');
const googleSignupRoute = require('./routes/googleSignupRoute');
const EncryptPDF = require('./routes/EncryptPDF');
const sendPDFEmail = require('./routes/sendPDFEmail');
const creditsHandling = require('./routes/creditsHandling');
const workspacesRoute = require('./routes/workspaces');

async function startServer() {
  try {
    const config = await loadConfig();
    console.log('✅ Configuration loaded successfully.');

    const db = createDbPool(config);
    const transporter = createTransporter(config);
    const protect = createTokenAuthMiddleware(db);
    const perplexityService = createPerplexityService(config);

    const app = express();

    // CORS configuration - allow local dev and production
    const isDev = process.env.NODE_ENV !== 'production';
    const corsOrigins = isDev
      ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080']
      : [config.FRONTEND_URL];

    app.use(cors({
      origin: corsOrigins,
      credentials: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      next();
    });

    // Public routes — no auth required
    app.use('/api', generateRoute(perplexityService));
    app.use('/api', creditsHandling(db));
    app.use('/api', sendPDFEmail(config));
    app.use('/api/auth', authRoutes(db, transporter, config));
    app.use('/api', EncryptPDF(config));
    app.use('/api', s3Upload(config, db));
    app.use('/api', statsRoutes(db, config));
    app.use('/api', googleLoginRoute(config));
    app.use('/api', googleSignupRoute(config));

    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    app.get('/', (req, res) => {
      res.send('Server is running...');
    });

    // Protected routes — Bearer token required
    app.use(protect);
    app.use('/api', extractRoute(config));
    app.use('/api', answerKeyRoute(perplexityService));
    app.use('/api', supportRoute(transporter, config));
    app.use('/api', slackAlertRoute(config));
    app.use('/api/user', userRoutes(db));
    app.use('/api', workspacesRoute(db));

    app.use((err, req, res, next) => {
      console.error('Unhandled Error:', err);
      res.status(500).json({ message: 'An internal server error occurred.' });
    });

    const PORT = config.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Health check available at http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1);
  }
}

startServer();
