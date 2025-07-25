import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRightLeft } from "lucide-react";
import { useRedirector } from "@/hooks/use-redirector";

interface StatusCardProps {
  domain: string;
  alternativeDomain: string;
  onEdit: () => void;
}

export default function StatusCard({ domain, alternativeDomain, onEdit }: StatusCardProps) {
  const { hasAuthParam } = useRedirector();
  const isAuthorized = hasAuthParam();
  const targetDomain = isAuthorized ? domain : alternativeDomain;

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-green-100 dark:border-green-900 animate-fade-in">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Redirecionamento Configurado</h3>
            </div>
            <div className="flex flex-col mt-2 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs mb-1 font-medium text-primary">Status atual:</p>
                  <p className="truncate">
                    {isAuthorized 
                      ? "Autorizado (?acesso=autorizado)" 
                      : "Não autorizado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowRightLeft className="text-primary mr-2 h-4 w-4" />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  Redirecionando para: <span className="font-medium">{targetDomain}</span>
                </span>
              </div>
            </div>
          </div>
          <div>
            <Button
              variant="link"
              onClick={onEdit}
              className="text-primary hover:text-primary/80 transition duration-300 text-sm font-medium p-0"
            >
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
