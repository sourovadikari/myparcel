import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).send("Forbidden");
    }
    next();
  };

  // Products (public routes)
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Categories (public routes)
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Cart
  app.get("/api/cart", requireAuth, async (req, res) => {
    const items = await storage.getCartItems(req.user!.id);
    res.json(items);
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    const item = await storage.addToCart(req.user!.id, productId, quantity);
    res.json(item);
  });

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
    await storage.removeFromCart(req.params.id);
    res.sendStatus(200);
  });

  // Admin routes - User Management
  app.get("/api/users", requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.sendStatus(200);
  });

  app.patch("/api/users/:id/role", requireAdmin, async (req, res) => {
    const user = await storage.updateUserRole(req.params.id, req.body.role);
    res.json(user);
  });

  // Admin routes - Category Management
  app.post("/api/categories", requireAdmin, async (req, res) => {
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  });

  app.patch("/api/categories/:id", requireAdmin, async (req, res) => {
    const category = await storage.updateCategory(req.params.id, req.body);
    res.json(category);
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    await storage.deleteCategory(req.params.id);
    res.sendStatus(200);
  });

  // Admin routes - Product Management
  app.post("/api/products", requireAdmin, async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    const product = await storage.updateProduct(req.params.id, req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    await storage.deleteProduct(req.params.id);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}