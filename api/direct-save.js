// api/direct-save.js
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket para o Neon Database
neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      console.log('Dados recebidos para salvar:', data);

      // Validação básica
      if (!data.domain) {
        return res.status(400).json({ error: 'O domínio é obrigatório' });
      }

      // Conectar ao banco de dados
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Inserir diretamente na tabela de domínios
      const result = await pool.query(
        'INSERT INTO domains (title, domain, alternative_domain, auto_redirect, delay) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          data.title || 'Redirecionador',
          data.domain,
          data.alternativeDomain || 'google.com',
          data.autoRedirect !== undefined ? data.autoRedirect : true,
          data.delay || 0
        ]
      );
      
      console.log('Configuração salva com sucesso:', result.rows[0]);
      
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      return res.status(500).json({ error: 'Erro ao salvar configuração' });
    }
  } else if (req.method === 'GET') {
    try {
      // Conectar ao banco de dados
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Buscar a configuração mais recente
      const result = await pool.query('SELECT * FROM domains ORDER BY id DESC LIMIT 1');
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Nenhuma configuração encontrada' });
      }
      
      // Mapear os campos para o formato esperado pelo frontend
      const config = {
        title: result.rows[0].title,
        domain: result.rows[0].domain,
        alternativeDomain: result.rows[0].alternative_domain,
        autoRedirect: result.rows[0].auto_redirect,
        delay: result.rows[0].delay
      };
      
      return res.status(200).json(config);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return res.status(500).json({ error: 'Erro ao buscar configuração' });
    }
  }
  
  return res.status(405).json({ error: 'Método não permitido' });
}