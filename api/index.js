// api/index.js
import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema.js';
import ws from 'ws';
import { DatabaseStorage } from '../server/storage.js';
import session from 'express-session';
import createMemoryStore from 'memorystore';

// Configure WebSocket para Neon Database
neonConfig.webSocketConstructor = ws;

const app = express();
app.use(express.json());

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Configuração da sessão
const MemoryStore = createMemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000 
  }
}));

// Configurar banco de dados
let db;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log('Database connected');
} else {
  console.warn('DATABASE_URL not provided. Database functionality may be limited.');
}

// Registrar rotas da API
app.get('/api/domains', async (req, res) => {
  const storage = new DatabaseStorage();
  try {
    const domains = await storage.getAllDomains();
    res.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/domains', async (req, res) => {
  const storage = new DatabaseStorage();
  try {
    const newDomain = await storage.createDomain(req.body);
    res.status(201).json(newDomain);
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/domains/:id', async (req, res) => {
  const storage = new DatabaseStorage();
  try {
    const updatedDomain = await storage.updateDomain(parseInt(req.params.id), req.body);
    if (!updatedDomain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    res.json(updatedDomain);
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/domains/:id', async (req, res) => {
  const storage = new DatabaseStorage();
  try {
    const success = await storage.deleteDomain(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lidar com erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Exportar para Vercel
export default app;