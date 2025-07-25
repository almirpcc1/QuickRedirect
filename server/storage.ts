import { users, type User, type InsertUser, domains, type Domain, type InsertDomain } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Domain operations
  getAllDomains(): Promise<Domain[]>;
  getDomain(id: number): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: number, domain: InsertDomain): Promise<Domain | undefined>;
  deleteDomain(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Domain operations
  async getAllDomains(): Promise<Domain[]> {
    return await db.select().from(domains);
  }
  
  async getDomain(id: number): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain;
  }
  
  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [newDomain] = await db
      .insert(domains)
      .values(domain)
      .returning();
    return newDomain;
  }
  
  async updateDomain(id: number, domain: InsertDomain): Promise<Domain | undefined> {
    const [updatedDomain] = await db
      .update(domains)
      .set(domain)
      .where(eq(domains.id, id))
      .returning();
    return updatedDomain;
  }
  
  async deleteDomain(id: number): Promise<boolean> {
    const [deletedDomain] = await db
      .delete(domains)
      .where(eq(domains.id, id))
      .returning();
    return !!deletedDomain;
  }
}

export const storage = new DatabaseStorage();
