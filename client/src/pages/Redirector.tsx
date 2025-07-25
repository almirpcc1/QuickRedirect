import { useEffect, useState } from "react";
import { useRedirector } from "@/hooks/use-redirector";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import RedirectNotice from "@/components/RedirectNotice";

export default function Redirector() {
  const { config, isConfigured, isLoading, hasAuthParam, performRedirect } = useRedirector();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const isAuthorized = hasAuthParam();
  const targetDomain = isAuthorized ? config.domain : config.alternativeDomain;
  
  // Verifica se há um parâmetro para acessar o dashboard
  const shouldGoToDashboard = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('dashboard') === 'true';
  };

  useEffect(() => {
    console.log("Redirecionador ativado");
    console.log("Dashboard?", shouldGoToDashboard());
    console.log("Configurado?", isConfigured);
    console.log("Autorizado?", isAuthorized);
    console.log("Configuração:", config);
    console.log("Está carregando?", isLoading);
    
    // Verificar se o usuário quer acessar o dashboard
    if (shouldGoToDashboard()) {
      console.log("Redirecionando para dashboard");
      window.location.href = window.location.origin + '/dashboard';
      return;
    }
    
    // Verificar se há configuração carregada
    if (!isLoading && !isConfigured) {
      console.log("Nenhuma configuração encontrada, redirecionando para dashboard");
      window.location.href = window.location.origin + '/dashboard';
      return;
    }
    
    // Aguardar configuração ser carregada
    if (isLoading) {
      console.log("Carregando configurações, aguardando...");
      return;
    }
    
    // Esconder documento imediatamente para não mostrar nada
    document.body.style.display = 'none';
    document.body.style.opacity = '0';
    document.documentElement.style.backgroundColor = 'transparent';

    // Redirecionamento instantâneo 
    console.log("Realizando redirecionamento para:", targetDomain);
    // Incluir o parâmetro acesso=autorizado se for autorizado
    const redirectUrl = isAuthorized 
      ? `https://${targetDomain}?acesso=autorizado` 
      : `https://${targetDomain}`;
    
    console.log("URL de redirecionamento:", redirectUrl);
    // Redireciona imediatamente com um pequeno atraso para garantir execução
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 100);
    
  }, [isLoading, isConfigured, config, targetDomain, isAuthorized]);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando configurações...</p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Erro no Redirecionador</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link href="/dashboard" className="text-primary hover:underline">
            Ir para o painel de configuração
          </Link>
        </div>
      </div>
    );
  }

  // Estado de redirecionamento
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md animate-fade-in">
        <h1 className="text-2xl font-bold text-primary dark:text-primary-300 mb-2">{config.title || "Redirecionando..."}</h1>
        
        {isAuthorized ? (
          <div className="mb-4 inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full text-sm text-green-800 dark:text-green-300">
            Acesso autorizado ✓
          </div>
        ) : (
          <div className="mb-4 inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full text-sm text-yellow-800 dark:text-yellow-300">
            Redirecionando para site alternativo
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Você está sendo redirecionado para: <span className="font-medium">{targetDomain}</span>
        </p>
        
        <div className="flex justify-center">
          <div className="text-center mt-4 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900 rounded-full">
              <Loader2 className="text-primary dark:text-primary-300 animate-spin mr-2 h-4 w-4" />
              <span className="text-sm text-primary-800 dark:text-primary-200">
                Redirecionando para {isAuthorized ? "o site autorizado" : "o site alternativo"} em <span>{countdown}</span> segundos...
              </span>
            </div>
            <Link href="/dashboard" className="block text-xs text-gray-500 dark:text-gray-400 underline mt-2 hover:text-gray-700 dark:hover:text-gray-300 transition duration-300">
              Cancelar e ir para o painel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}