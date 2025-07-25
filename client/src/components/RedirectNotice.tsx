import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRedirector } from "@/hooks/use-redirector";

interface RedirectNoticeProps {
  delay: number;
  onCancel: () => void;
}

export default function RedirectNotice({ delay, onCancel }: RedirectNoticeProps) {
  const [countdown, setCountdown] = useState(delay || 3);
  const { hasAuthParam } = useRedirector();
  const isAuthorized = hasAuthParam();

  useEffect(() => {
    if (delay === 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [delay]);

  return (
    <div className="text-center mt-4 animate-fade-in">
      <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900 rounded-full">
        <RefreshCw className="text-primary dark:text-primary-300 animate-spin mr-2 h-4 w-4" />
        <span className="text-sm text-primary-800 dark:text-primary-200">
          Redirecionando para {isAuthorized ? "o site autorizado" : "o site alternativo"} em <span>{countdown}</span> segundos...
        </span>
      </div>
      <Button
        variant="link"
        size="sm"
        onClick={onCancel}
        className="text-xs text-gray-500 dark:text-gray-400 underline mt-2 hover:text-gray-700 dark:hover:text-gray-300 transition duration-300"
      >
        Cancelar
      </Button>
    </div>
  );
}
