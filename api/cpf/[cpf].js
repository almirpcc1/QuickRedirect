// api/cpf/[cpf].js - Endpoint específico para redirecionamento de CPF
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Capturar o CPF da URL
  const { cpf } = req.query;
  
  console.log('CPF capturado da URL:', cpf);
  
  // Verificar se é um CPF válido (com ou sem pontuação)
  const cpfPattern = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})$/;
  
  if (!cpf || !cpfPattern.test(cpf)) {
    console.log('CPF inválido:', cpf);
    res.status(400).json({ error: 'CPF deve ter formato válido (11 dígitos com ou sem pontuação)' });
    return;
  }
  
  // Remover pontuação para obter apenas números
  const cleanCpf = cpf.replace(/[.-]/g, '');
  
  // Verificar se tem exatamente 11 dígitos após limpeza
  if (cleanCpf.length !== 11 || !/^\d{11}$/.test(cleanCpf)) {
    console.log('CPF inválido após limpeza:', cleanCpf);
    res.status(400).json({ error: 'CPF deve ter exatamente 11 dígitos numéricos' });
    return;
  }
  
  console.log('CPF limpo:', cleanCpf);
  
  // Construir URL da Receita Federal com CPF limpo
  const receitaUrl = `https://receita.canalgovbr.org/${cleanCpf}`;
  
  console.log('Redirecionando para Receita Federal:', receitaUrl);
  
  // Realizar redirecionamento
  return res.redirect(307, receitaUrl);
}