import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { domainValidationSchema } from "@shared/schema";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type FormSchema = z.infer<typeof domainValidationSchema>;

interface DomainFormProps {
  initialValues: {
    title: string;
    domain: string;
    alternativeDomain: string;
    autoRedirect: boolean;
    delay: number;
  };
  onSubmit: (values: FormSchema) => void;
}

export default function DomainForm({ initialValues, onSubmit }: DomainFormProps) {
  const [showPrimaryError, setShowPrimaryError] = useState(false);
  const [showAlternativeError, setShowAlternativeError] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(domainValidationSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = (values: FormSchema) => {
    onSubmit(values);
  };

  const clearDomain = (field: "domain" | "alternativeDomain") => {
    form.setValue(field, "");
    form.setFocus(field);
    if (field === "domain") {
      setShowPrimaryError(false);
    } else {
      setShowAlternativeError(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 animate-fade-in transition-all duration-300">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Título do Site */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título do Site
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Redirecionador"
                      className="py-3 focus:ring-primary focus:border-primary transition-all duration-300 dark:bg-gray-700 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nome que aparecerá no topo da página de redirecionamento
                  </div>
                </FormItem>
              )}
            />

            {/* Domínio Principal */}
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Domínio de destino (com ?acesso=autorizado)
                  </FormLabel>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">https://</span>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="exemplo.com.br"
                        className={cn(
                          "pl-16 pr-12 py-3 focus:ring-primary focus:border-primary transition-all duration-300 dark:bg-gray-700 dark:text-white",
                          showPrimaryError && "animate-shake border-red-500"
                        )}
                        onBlur={(e) => {
                          field.onBlur();
                          if (form.formState.errors.domain) {
                            setShowPrimaryError(true);
                            setTimeout(() => setShowPrimaryError(false), 500);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-500 p-2 focus:outline-none"
                        onClick={() => clearDomain("domain")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage className="text-xs text-red-500" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    URL quando o parâmetro ?acesso=autorizado for detectado
                  </div>
                </FormItem>
              )}
            />

            {/* Domínio Alternativo */}
            <FormField
              control={form.control}
              name="alternativeDomain"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Domínio alternativo (sem parâmetro)
                  </FormLabel>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">https://</span>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="google.com"
                        className={cn(
                          "pl-16 pr-12 py-3 focus:ring-primary focus:border-primary transition-all duration-300 dark:bg-gray-700 dark:text-white",
                          showAlternativeError && "animate-shake border-red-500"
                        )}
                        onBlur={(e) => {
                          field.onBlur();
                          if (form.formState.errors.alternativeDomain) {
                            setShowAlternativeError(true);
                            setTimeout(() => setShowAlternativeError(false), 500);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-500 p-2 focus:outline-none"
                        onClick={() => clearDomain("alternativeDomain")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage className="text-xs text-red-500" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    URL quando o usuário acessar sem parâmetro ou com parâmetro incorreto
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Configurações</h3>
                
                <FormField
                  control={form.control}
                  name="autoRedirect"
                  render={({ field }) => (
                    <div className="flex items-center justify-between mb-3">
                      <FormLabel className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                        Redirecionar automaticamente
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </FormControl>
                    </div>
                  )}
                />
                
                {form.watch("autoRedirect") && (
                  <FormField
                    control={form.control}
                    name="delay"
                    render={({ field }) => (
                      <div className="flex items-center justify-between mb-3">
                        <FormLabel className="text-sm text-gray-600 dark:text-gray-400">
                          Atraso (segundos)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            min={0}
                            max={10}
                            className="w-20 py-1 px-2 text-right border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary text-sm transition-all duration-300"
                          />
                        </FormControl>
                      </div>
                    )}
                  />
                )}
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition duration-300"
                >
                  Salvar Configuração
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
