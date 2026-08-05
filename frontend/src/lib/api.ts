import { useAuthStore } from "./auth-store";
import type {
  AuthToken,
  AdminUser,
  BatchPredictionResponse,
  ModelPerformance,
  PlatformStats,
  PredictionHistoryPage,
  PredictionResult,
  PredictionSummary,
  TransactionInput,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data: AuthToken = await res.json();
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body.detail
      ? typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail)
      : fallback;
  } catch {
    return fallback;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  async function doFetch(): Promise<Response> {
    const token = useAuthStore.getState().token;
    const finalHeaders: HeadersInit = {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
    return fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });
  }

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doFetch();
    } else {
      useAuthStore.getState().clearAuth();
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorDetail(res, res.statusText));
  }

  return res.json() as Promise<T>;
}

export const api = {
  register: (email: string, full_name: string, password: string) =>
    request<AuthToken>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, full_name, password }),
      auth: false,
    }),

  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return request<AuthToken>("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      auth: false,
    });
  },

  predict: (input: TransactionInput) =>
    request<PredictionResult>("/api/v1/predictions/predict", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  predictBatch: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return request<BatchPredictionResponse>("/api/v1/predictions/batch", {
      method: "POST",
      body: form,
    });
  },

  history: (page = 1, pageSize = 20, fraudOnly = false) =>
    request<PredictionHistoryPage>(
      `/api/v1/predictions/history?page=${page}&page_size=${pageSize}&fraud_only=${fraudOnly}`
    ),

  modelPerformance: () =>
    request<ModelPerformance>("/api/v1/stats/model-performance", { auth: false }),

  summary: (days = 30) =>
    request<PredictionSummary>(`/api/v1/stats/summary?days=${days}`),

  adminListUsers: () => request<AdminUser[]>("/api/v1/admin/users"),

  adminUpdateUser: (userId: string, payload: { role?: string; is_active?: boolean }) =>
    request<AdminUser>(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  adminStats: () => request<PlatformStats>("/api/v1/admin/stats"),
};
