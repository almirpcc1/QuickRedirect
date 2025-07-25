import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { RedirectorConfig, validateURL } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const defaultConfig: RedirectorConfig = {
  title: "Redirecionador",
  domain: "",
  alternativeDomain: "google.com",
  autoRedirect: true,
  delay: 0
};

export function useRedirector() {
  const [config, setConfig] = useState<RedirectorConfig>(defaultConfig);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verifica se o parâmetro de acesso está presente na URL
  const hasAuthParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('acesso') === 'autorizado';
  };

  // Buscar configuração do servidor
  const { data: serverConfig, isLoading, isError } = useQuery({
    queryKey: ['/api/config'],
    queryFn: async () => {
      try {
        console.log("Buscando configuração do servidor...");
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/api/config`;
        console.log("URL da API:", fullUrl);
        
        const response = await fetch(fullUrl);
        console.log("Status da resposta:", response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null; // Não há configuração ainda
          }
          const errorText = await response.text();
          console.error("Erro na resposta:", errorText);
          throw new Error('Falha ao carregar configuração');
        }
        
        const data = await response.json();
        console.log("Dados recebidos:", data);
        return data;
      } catch (error) {
        console.error('Erro ao buscar configuração:', error);
        // Fallback para local storage apenas em caso de erro
        const localConfig = localStorage.getItem('redirector-config');
        if (localConfig) {
          try {
            console.log("Usando configuração do localStorage como fallback");
            return JSON.parse(localConfig);
          } catch (e) {
            console.error("Erro ao parsear configuração local:", e);
            return null;
          }
        }
        return null;
      }
    },
    retry: 3, // Aumenta número de tentativas
    retryDelay: 1000, // 1 segundo entre tentativas
    staleTime: 10000 // 10 segundos
  });

  // Mutation para salvar configuração no servidor
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: RedirectorConfig) => {
      console.log("Salvando configuração no servidor...", newConfig);
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/api/config`;
      console.log("URL da API para salvar:", fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });
      
      console.log("Status da resposta ao salvar:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta ao salvar:", errorText);
        throw new Error('Falha ao salvar configuração');
      }
      
      const data = await response.json();
      console.log("Configuração salva com sucesso:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Mutation realizada com sucesso:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      
      // Salvar também no localStorage como backup
      localStorage.setItem('redirector-config', JSON.stringify(data));
      
      toast({
        title: "Configuração salva",
        description: "Suas configurações foram salvas com sucesso no banco de dados!",
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar configuração:', error);
      // Fallback para local storage apenas em caso de erro
      localStorage.setItem('redirector-config', JSON.stringify(config));
      toast({
        title: "Aviso",
        description: "As configurações foram salvas apenas localmente. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  // Load saved configuration on mount
  useEffect(() => {
    if (!isLoading && !isError && serverConfig) {
      if (validateURL(serverConfig.domain) && validateURL(serverConfig.alternativeDomain)) {
        setConfig(serverConfig);
        setIsConfigured(true);
      }
    }
  }, [isLoading, isError, serverConfig]);

  // Handle redirection
  const startRedirect = useCallback((currentConfig: RedirectorConfig) => {
    setIsRedirecting(true);
    
    if (currentConfig.delay === 0) {
      performRedirect(currentConfig);
      return;
    }
    
    const timer = setTimeout(() => {
      performRedirect(currentConfig);
    }, currentConfig.delay * 1000);
    
    setRedirectTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Redireciona para o domínio correto com base no parâmetro de consulta
  const performRedirect = (currentConfig: RedirectorConfig) => {
    const isAuthorized = hasAuthParam();
    const targetDomain = isAuthorized ? currentConfig.domain : currentConfig.alternativeDomain;
    
    // Se for autorizado, mantém o parâmetro acesso=autorizado no redirecionamento
    if (isAuthorized) {
      window.location.href = `https://${targetDomain}?acesso=autorizado`;
    } else {
      window.location.href = `https://${targetDomain}`;
    }
  };

  const cancelRedirect = useCallback(() => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    setIsRedirecting(false);
  }, [redirectTimer]);

  // Save configuration
  const saveConfig = useCallback((newConfig: RedirectorConfig) => {
    setConfig(newConfig);
    setIsConfigured(true);
    
    // Salvar no servidor
    saveConfigMutation.mutate(newConfig);
    
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
  }, [redirectTimer, saveConfigMutation]);

  // Edit configuration
  const editConfig = useCallback(() => {
    setIsConfigured(false);
    cancelRedirect();
  }, [cancelRedirect]);

  return {
    config,
    isConfigured,
    isLoading,
    isRedirecting,
    saveConfig,
    cancelRedirect,
    editConfig,
    hasAuthParam,
    startRedirect,
    performRedirect
  };
}
