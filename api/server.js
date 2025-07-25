// server.js
import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema.js';
import ws from 'ws';
import { DatabaseStorage } from '../server/storage.js';
import cors from 'cors';

// Configure WebSocket para Neon Database
neonConfig.webSocketConstructor = ws;

const app = express();

// Habilitar CORS para integração com frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Configurar banco de dados
let db;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log('Database connected');
} else {
  console.warn('DATABASE_URL not provided. Database functionality may be limited.');
}

// Rotas da API
app.get('/api/domains', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const domains = await storage.getAllDomains();
    res.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/domains', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const newDomain = await storage.createDomain(req.body);
    res.status(201).json(newDomain);
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/domains/:id', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
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
  try {
    const storage = new DatabaseStorage();
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

// Status da API
app.get('/api', (req, res) => {
  res.json({ status: 'API is running' });
});

// API para buscar configurações de redirecionamento
app.get('/api/config', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const domains = await storage.getAllDomains();
    // Retornar o domínio mais recente como configuração ativa
    if (domains && domains.length > 0) {
      const latestDomain = domains[domains.length - 1];
      res.json({
        title: latestDomain.title,
        domain: latestDomain.domain,
        alternativeDomain: latestDomain.alternativeDomain,
        autoRedirect: latestDomain.autoRedirect,
        delay: latestDomain.delay
      });
    } else {
      res.status(404).json({ error: 'No configuration found' });
    }
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API para salvar configurações de redirecionamento
app.post('/api/config', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const newDomain = await storage.createDomain({
      title: req.body.title || 'Redirecionador',
      domain: req.body.domain,
      alternativeDomain: req.body.alternativeDomain || 'google.com',
      autoRedirect: req.body.autoRedirect !== undefined ? req.body.autoRedirect : true,
      delay: req.body.delay || 0,
      userId: null
    });
    res.status(201).json(newDomain);
  } catch (error) {
    console.error('Error saving configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Exportar para Vercel
export default app;