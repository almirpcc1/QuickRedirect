import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { domainValidationSchema } from "../shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints for domain configuration
  app.get("/api/domains", async (req, res) => {
    try {
      // In a real application, this would filter domains by user ID
      // For now, return all domains as we have an in-memory storage
      const domains = await storage.getAllDomains();
      res.json(domains);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar domínios" });
    }
  });

  app.post("/api/domains", async (req, res) => {
    try {
      const validatedData = domainValidationSchema.parse(req.body);
      const domain = await storage.createDomain({
        domain: validatedData.domain,
        autoRedirect: validatedData.autoRedirect,
        delay: validatedData.delay,
        userId: 1, // Default user ID for now
      });
      res.status(201).json(domain);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Dados de domínio inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Falha ao salvar domínio" });
      }
    }
  });

  app.put("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = domainValidationSchema.parse(req.body);
      const domain = await storage.updateDomain(id, {
        domain: validatedData.domain,
        autoRedirect: validatedData.autoRedirect,
        delay: validatedData.delay,
        userId: 1, // Default user ID for now
      });
      
      if (!domain) {
        return res.status(404).json({ message: "Domínio não encontrado" });
      }
      
      res.json(domain);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Dados de domínio inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Falha ao atualizar domínio" });
      }
    }
  });

  app.delete("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDomain(id);
      
      if (!success) {
        return res.status(404).json({ message: "Domínio não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir domínio" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
