/**
 * HTTP API client with automatic JWT token injection and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

// ─── Token Management ─────────────────────────────────────────

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAccessToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─── API Error ────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Request Helpers ──────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Attach JWT access token unless skipAuth
  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 — try refreshing the token
  if (response.status === 401 && !skipAuth) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry the original request with the new token
      requestHeaders["Authorization"] = `Bearer ${tokenStorage.getAccessToken()}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
      return handleResponse<T>(retryResponse);
    }
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.statusCode ?? response.status,
      data.error ?? "Request Failed",
      data.message ?? "An unexpected error occurred",
      data.details
    );
  }

  return data as T;
}

async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clear();
      return false;
    }

    const data = await response.json();
    tokenStorage.setAccessToken(data.data.tokens.accessToken);
    tokenStorage.setRefreshToken(data.data.tokens.refreshToken);
    return true;
  } catch {
    tokenStorage.clear();
    return false;
  }
}

// ─── Public API ───────────────────────────────────────────────

export const api = {
  async get<T>(endpoint: string, headers?: Record<string, string>) {
    return request<T>(endpoint, { method: "GET", headers });
  },

  async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return request<T>(endpoint, { method: "POST", body, headers, skipAuth: false });
  },

  async postPublic<T>(endpoint: string, body?: unknown) {
    return request<T>(endpoint, { method: "POST", body, skipAuth: true });
  },

  async patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return request<T>(endpoint, { method: "PATCH", body, headers });
  },

  async delete<T>(endpoint: string, options?: { data?: unknown }) {
    return request<T>(endpoint, { method: "DELETE", body: options?.data });
  },
};
