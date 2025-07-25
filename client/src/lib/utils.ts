import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL validation helper
export function validateURL(url: string): boolean {
  const pattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return pattern.test(url);
}

// Local storage helpers
const STORAGE_KEY = 'redirector-config';

export interface RedirectorConfig {
  title: string;
  domain: string;
  alternativeDomain: string;
  autoRedirect: boolean;
  delay: number;
}

export function saveConfiguration(config: RedirectorConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function loadConfiguration(): RedirectorConfig | null {
  const savedConfig = localStorage.getItem(STORAGE_KEY);
  if (!savedConfig) return null;
  
  try {
    const config = JSON.parse(savedConfig) as Partial<RedirectorConfig>;
    // Compatibilidade com configurações antigas
    if (!config.alternativeDomain) {
      config.alternativeDomain = "google.com";
    }
    if (!config.title) {
      config.title = "Redirecionador";
    }
    return config as RedirectorConfig;
  } catch (e) {
    console.error('Failed to parse saved configuration:', e);
    return null;
  }
}

export function clearConfiguration(): void {
  localStorage.removeItem(STORAGE_KEY);
}
