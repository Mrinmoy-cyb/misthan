/**
 * API client using axios
 *
 * This module provides a centralized axios instance configured to communicate
 * with the backend API. All API requests should be made through functions
 * exported from this module.
 */
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Configured axios instance for API requests
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies for auth
});

/**
 * Sweet data type
 */
export interface Sweet {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    description: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Fetch all sweets
 */
export async function fetchSweets(): Promise<Sweet[]> {
  const response = await apiClient.get<{ sweets: Sweet[] }>("/sweets");
  return response.data.sweets;
}

/**
 * Search sweets by name, categoryId, or price range
 */
export interface SearchParams {
  name?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
}

export async function searchSweets(params: SearchParams): Promise<Sweet[]> {
  const response = await apiClient.get<{ sweets: Sweet[] }>("/sweets/search", {
    params,
  });
  return response.data.sweets;
}

/**
 * Category data type
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<{ categories: Category[] }>("/category");
  return response.data.categories;
}

/**
 * User data type
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Register a new user
 */
export async function register(data: {
  email: string;
  name: string;
  password: string;
  role?: "USER" | "ADMIN";
}): Promise<{ user: User }> {
  const response = await apiClient.post<{ user: User }>("/auth/register", data);
  return response.data;
}

/**
 * Login user
 */
export async function login(data: {
  email: string;
  password: string;
}): Promise<{ user: User }> {
  const response = await apiClient.post<{ user: User }>("/auth/login", data);
  return response.data;
}

/**
 * Get current user (requires auth)
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User }>("/auth/me");
  return response.data.user;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
