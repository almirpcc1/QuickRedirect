// api/saveConfig.js - Endpoint simples para salvar configuração
import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    // Garantir que temos um corpo de requisição
    if (!req.body || !req.body.domain) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        recebido: req.body,
        mensagem: 'O campo "domain" é obrigatório' 
      });
    }
    
    // Extrair dados do corpo
    const { 
      domain, 
      alternativeDomain = 'google.com', 
      title = 'Redirecionador', 
      autoRedirect = true, 
      delay = 0 
    } = req.body;
    
    // Conectar ao banco de dados
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });
    
    // Verificar a conexão com o banco
    await pool.query('SELECT 1');
    console.log('Conexão com o banco estabelecida');
    
    // Inserir na tabela
    console.log('Tentando inserir:', { domain, alternativeDomain, title, autoRedirect, delay });
    
    const result = await pool.query(
      `INSERT INTO domains (domain, alternative_domain, title, auto_redirect, delay)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [domain, alternativeDomain, title, autoRedirect, delay]
    );
    
    console.log('Registro inserido com sucesso:', result.rows[0]);
    
    // Retornar sucesso
    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Configuração salva com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    return res.status(500).json({
      error: 'Erro ao salvar configuração',
      mensagem: error.message,
      stack: error.stack
    });
  }
}