import { useState, useEffect, useCallback } from 'react';
import { CowayProduct, ProductFilterParams } from '../types/index.ts';
import { productService, DataFetchResult } from '../services/productService';

/**
 * Custom React Hook for Product Data Access
 * Encapsulates live Supabase data fetching and fallback states.
 */
export function useProducts(initialParams?: ProductFilterParams) {
  const [products, setProducts] = useState<CowayProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'supabase' | 'mock'>('mock');
  const [supabaseCount, setSupabaseCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const fetchProducts = useCallback(async (params?: ProductFilterParams) => {
    try {
      setLoading(true);
      setError(null);
      const result: DataFetchResult = await productService.getProductsWithStatus(params || initialParams);
      setProducts(result.products);
      setSource(result.source);
      setSupabaseCount(result.supabaseCount);
      setStatusMessage(result.message || '');
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const seedSampleProducts = useCallback(async () => {
    const res = await productService.seedSampleProductsToSupabase();
    if (res.success) {
      await fetchProducts();
    }
    return res;
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    source,
    supabaseCount,
    statusMessage,
    refetch: fetchProducts,
    seedSampleProducts,
    getProductById: productService.getProductById.bind(productService),
  };
}
