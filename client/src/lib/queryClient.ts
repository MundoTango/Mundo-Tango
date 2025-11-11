import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";
import { logger } from './logger';

function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error: any = new Error(`${res.status}: ${text}`);
    error.status = res.status;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('accessToken');
  const csrfToken = getCsrfToken();
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Include CSRF token for mutating requests
  if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
    headers["x-xsrf-token"] = csrfToken;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Build URL with query parameters
    let url = queryKey[0] as string;
    
    // If there's a second element and it's an object, treat it as query params
    if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null && !Array.isArray(queryKey[1])) {
      const params = new URLSearchParams();
      const queryParams = queryKey[1] as Record<string, any>;
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    } else if (queryKey.length > 1) {
      // If additional elements are strings or numbers, join them as path segments
      url = queryKey.filter(k => typeof k === 'string' || typeof k === 'number').join("/") as string;
    }
    
    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      logger.error('Query failed', error, {
        component: 'ReactQuery',
        action: 'query',
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      logger.error('Mutation failed', error, {
        component: 'ReactQuery',
        action: 'mutation',
      });
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      // Network-aware refetching
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Stale-while-revalidate strategy
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime in v4)
      // Retry logic with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});
