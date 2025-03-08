import { User, Category, Product, CartItem } from './db';
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Types for our data models
export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export interface ICategory {
  id: string;
  name: string;
  description: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface ICartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
}

export interface IStorage {
  // User management
  getUser(id: string): Promise<IUser | undefined>;
  getUserByUsername(username: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  getUserByIdentifier(identifier: string): Promise<IUser | undefined>;
  createUser(user: Omit<IUser, 'id'>): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
  deleteUser(id: string): Promise<void>;
  updateUserRole(id: string, role: 'user' | 'admin'): Promise<IUser>;

  // Category management
  createCategory(category: Omit<ICategory, 'id'>): Promise<ICategory>;
  getCategories(): Promise<ICategory[]>;
  getCategory(id: string): Promise<ICategory | undefined>;
  updateCategory(id: string, category: Partial<ICategory>): Promise<ICategory>;
  deleteCategory(id: string): Promise<void>;

  // Product management
  createProduct(product: Omit<IProduct, 'id'>): Promise<IProduct>;
  getProducts(): Promise<IProduct[]>;
  getProduct(id: string): Promise<IProduct | undefined>;
  updateProduct(id: string, product: Partial<IProduct>): Promise<IProduct>;
  deleteProduct(id: string): Promise<void>;

  // Cart management
  getCartItems(userId: string): Promise<ICartItem[]>;
  addToCart(userId: string, productId: string, quantity: number): Promise<ICartItem>;
  removeFromCart(cartItemId: string): Promise<void>;

  sessionStore: session.Store;
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User management methods
  async getUser(id: string): Promise<IUser | undefined> {
    const user = await User.findById(id);
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    };
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    const user = await User.findOne({ username });
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    };
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    const user = await User.findOne({ email });
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    };
  }

  async getUserByIdentifier(identifier: string): Promise<IUser | undefined> {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    };
  }

  async createUser(userData: Omit<IUser, 'id'>): Promise<IUser> {
    const user = await User.create(userData);
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    };
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find();
    return users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    }));
  }

  async deleteUser(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
    await CartItem.deleteMany({ userId: id });
  }

  async updateUserRole(id: string, role: 'user' | 'admin'): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    if (!user) throw new Error('User not found');
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    };
  }

  // Category management methods
  async createCategory(categoryData: Omit<ICategory, 'id'>): Promise<ICategory> {
    const category = await Category.create(categoryData);
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description
    };
  }

  async getCategories(): Promise<ICategory[]> {
    const categories = await Category.find();
    return categories.map(category => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description
    }));
  }

  async getCategory(id: string): Promise<ICategory | undefined> {
    const category = await Category.findById(id);
    if (!category) return undefined;
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description
    };
  }

  async updateCategory(id: string, categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = await Category.findByIdAndUpdate(
      id,
      categoryData,
      { new: true }
    );
    if (!category) throw new Error('Category not found');
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description
    };
  }

  async deleteCategory(id: string): Promise<void> {
    await Category.findByIdAndDelete(id);
    await Product.deleteMany({ category: id });
  }

  // Product management methods
  async createProduct(productData: Omit<IProduct, 'id'>): Promise<IProduct> {
    const product = await Product.create(productData);
    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category.toString()
    };
  }

  async getProducts(): Promise<IProduct[]> {
    const products = await Product.find().populate('category');
    return products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category.toString()
    }));
  }

  async getProduct(id: string): Promise<IProduct | undefined> {
    const product = await Product.findById(id).populate('category');
    if (!product) return undefined;
    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category.toString()
    };
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true }
    ).populate('category');
    if (!product) throw new Error('Product not found');
    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category.toString()
    };
  }

  async deleteProduct(id: string): Promise<void> {
    await Product.findByIdAndDelete(id);
    await CartItem.deleteMany({ productId: id });
  }

  // Cart management methods
  async getCartItems(userId: string): Promise<ICartItem[]> {
    const items = await CartItem.find({ userId });
    return items.map(item => ({
      id: item._id.toString(),
      userId: item.userId.toString(),
      productId: item.productId.toString(),
      quantity: item.quantity
    }));
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<ICartItem> {
    const item = await CartItem.create({ userId, productId, quantity });
    return {
      id: item._id.toString(),
      userId: item.userId.toString(),
      productId: item.productId.toString(),
      quantity: item.quantity
    };
  }

  async removeFromCart(cartItemId: string): Promise<void> {
    await CartItem.findByIdAndDelete(cartItemId);
  }
}

export const storage = new MongoDBStorage();