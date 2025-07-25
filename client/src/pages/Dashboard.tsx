import { useState, useEffect } from "react";
import DomainForm from "@/components/DomainForm";
import StatusCard from "@/components/StatusCard";
import RedirectNotice from "@/components/RedirectNotice";
import { useToast } from "@/hooks/use-toast";
import { useRedirector } from "@/hooks/use-redirector";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { 
    config, 
    saveConfig, 
    isConfigured, 
    cancelRedirect, 
    editConfig, 
    isRedirecting,
    hasAuthParam
  } = useRedirector();

  const handleSave = (data: { title: string; domain: string; alternativeDomain: string; autoRedirect: boolean; delay: number }) => {
    saveConfig(data);
    toast({
      title: "Configuração salva",
      description: "Configuração de redirecionamento salva com sucesso.",
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isAuthorized = hasAuthParam();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-8 h-8"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-primary dark:text-primary-300 mb-2">Painel de Controle</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Configure domínios para redirecionamento condicional</p>
          
          {isAuthorized && (
            <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full text-xs text-green-800 dark:text-green-300">
              Acesso autorizado
            </div>
          )}
        </div>

        {/* Main Form or Status Card */}
        {!isConfigured ? (
          <DomainForm 
            initialValues={config} 
            onSubmit={handleSave} 
          />
        ) : (
          <StatusCard 
            domain={config.domain}
            alternativeDomain={config.alternativeDomain}
            onEdit={editConfig} 
          />
        )}
      </div>
    </div>
  );
}