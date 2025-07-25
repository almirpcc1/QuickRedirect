// api/redirectConfig.js - Endpoint para gerenciar configurações entre frontend e banco
import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Conexão com o banco de dados - com verificação extra
    let connection;
    try {
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL 
      });
      
      // Verificar conexão
      await pool.query('SELECT 1');
      connection = pool;
      console.log('Conexão com banco estabelecida');
    } catch (dbError) {
      console.error('Erro ao conectar ao banco:', dbError);
      return res.status(500).json({ 
        error: 'Erro na conexão com o banco de dados',
        details: dbError.message
      });
    }
    
    // SALVAR configuração
    if (req.method === 'POST') {
      // Verificação de dados
      if (!req.body || !req.body.domain) {
        return res.status(400).json({ 
          error: 'Dados incompletos', 
          recebido: req.body 
        });
      }
      
      const {
        domain,
        title = 'Redirecionador',
        alternativeDomain = 'google.com',
        autoRedirect = true,
        delay = 0
      } = req.body;
      
      console.log('Salvando configuração:', { domain, title, alternativeDomain, autoRedirect, delay });
      
      // Inserção no banco
      try {
        const result = await connection.query(
          `INSERT INTO domains (domain, alternative_domain, title, auto_redirect, delay)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [domain, alternativeDomain, title, autoRedirect, delay]
        );
        
        console.log('Configuração salva no banco:', result.rows[0]);
        
        // Retorna os dados normalizados para o frontend
        return res.status(201).json({
          success: true,
          id: result.rows[0].id,
          domain: result.rows[0].domain,
          alternativeDomain: result.rows[0].alternative_domain,
          title: result.rows[0].title,
          autoRedirect: result.rows[0].auto_redirect,
          delay: result.rows[0].delay
        });
      } catch (queryError) {
        console.error('Erro ao inserir no banco:', queryError);
        return res.status(500).json({
          error: 'Erro ao salvar configuração',
          details: queryError.message
        });
      }
    }
    // BUSCAR configuração
    else if (req.method === 'GET') {
      try {
        const result = await connection.query(
          `SELECT * FROM domains ORDER BY id DESC LIMIT 1`
        );
        
        if (result.rowCount === 0) {
          return res.status(404).json({
            error: 'Nenhuma configuração encontrada'
          });
        }
        
        console.log('Configuração recuperada do banco:', result.rows[0]);
        
        // Retorna os dados normalizados para o frontend
        return res.status(200).json({
          id: result.rows[0].id,
          domain: result.rows[0].domain,
          alternativeDomain: result.rows[0].alternative_domain,
          title: result.rows[0].title,
          autoRedirect: result.rows[0].auto_redirect,
          delay: result.rows[0].delay
        });
      } catch (queryError) {
        console.error('Erro ao buscar do banco:', queryError);
        return res.status(500).json({
          error: 'Erro ao buscar configuração',
          details: queryError.message
        });
      }
    } else {
      return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
      stack: error.stack
    });
  }
}