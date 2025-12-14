/**
 * TanStack Query hooks for data fetching
 *
 * Custom hooks that wrap TanStack Query to fetch sweets and categories data
 * from the backend API. These hooks handle caching, refetching, and state
 * management automatically.
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchSweets,
  searchSweets,
  fetchCategories,
  type SearchParams,
} from "./api";

/**
 * Hook to fetch all sweets
 */
export function useSweets() {
  return useQuery({
    queryKey: ["sweets"],
    queryFn: fetchSweets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to search sweets with filters
 */
export function useSearchSweets(
  params: SearchParams,
  enabled: boolean | (() => boolean) = true,
) {
  return useQuery({
    queryKey: ["sweets", "search", params],
    queryFn: () => searchSweets(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

/**
 * Hook to fetch all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
