import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

// Schema for user insertion/validation
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for login validation (email/username + password)
export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

// Schema for category validation
export const insertCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().min(1, "Description is required"),
});

// Schema for product insertion/validation
export const insertProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  image: z.string().url("Image must be a valid URL"),
  category: z.string().min(1, "Category is required"),
});

// Schema for cart item insertion/validation
export const insertCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

// Types for frontend usage
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string; // Category ID
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  categoryId: integer("category_id").notNull(), // Added category ID
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
});