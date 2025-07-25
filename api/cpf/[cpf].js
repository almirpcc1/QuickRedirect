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
  
  // Validar se o CPF tem exatamente 11 dígitos
  if (!cpf || !/^\d{11}$/.test(cpf)) {
    console.log('CPF inválido:', cpf);
    res.status(400).json({ error: 'CPF deve ter exatamente 11 dígitos numéricos' });
    return;
  }
  
  // Construir URL da Receita Federal
  const receitaUrl = `https://receita.canalgovbr.org/${cpf}`;
  
  console.log('Redirecionando para Receita Federal:', receitaUrl);
  
  // Realizar redirecionamento
  return res.redirect(307, receitaUrl);
}