#!/bin/bash

# Construir a aplicação frontend
echo "Construindo o frontend..."
npm run build

# Criar arquivo de redirecionamento para o Vercel
echo "Configurando redirecionamentos para a Vercel..."
cat > dist/public/200.html << EOF
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=/">
  <title>Redirecionando...</title>
</head>
<body>
  <p>Redirecionando...</p>
  <script>
    window.location.href = "/";
  </script>
</body>
</html>
EOF

echo "Construção concluída!"