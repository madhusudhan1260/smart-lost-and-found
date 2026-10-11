// The Express application (kept separate from index.js so tests can import it without starting a server)
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Middleware run in order for every request
app.use(cors({ origin: config.clientOrigin })); // allow the React dev server to call the API
app.use(express.json({ limit: '2mb' })); // parse JSON bodies (photos are sent as data URLs)
if (!config.isTest) app.use(morgan('dev')); // log "GET /api/items 200 4 ms"

app.get('/', (_req, res) => res.json({ name: 'Smart Lost & Found API', docs: '/api/health' }));
app.use('/api', apiRoutes);

app.use(notFound); // unknown route → 404
app.use(errorHandler); // every error → JSON

export default app;
