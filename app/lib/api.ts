const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Types
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: 'admin' | 'manager' | 'cashier';
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface DashboardStats {
  total_sales: number;
  total_cogs: number;
  gross_profit: number;
  gross_margin_percent: number;
  total_expenses: number;
  net_profit: number;
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  top_menu_items: Array<{
    name: string;
    total_sold: number;
    total_revenue: number;
  }>;
  top_add_ons: Array<{
    name: string;
    total_sold: number;
    total_revenue: number;
  }>;
  sales_chart: Array<{
    date: string;
    amount: number;
    orders: number;
  }>;
  expense_chart: Array<{
    date: string;
    amount: number;
    type: string;
  }>;
  sales_by_payment_method: Array<{
    payment_method: string;
    total_sales: number;
  }>;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Helper to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || `HTTP ${response.status}`,
        code: response.status.toString(),
        details: errorData,
      } as ApiError;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw {
        message: 'Network error',
        code: 'NETWORK_ERROR',
        details: error,
      } as ApiError;
    }
    throw error;
  }
}

// Auth API endpoints
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return apiCall<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    return apiCall('/profile');
  },
};

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const endpoint = `/dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall<DashboardStats>(endpoint);
  },

  getData: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const endpoint = `/dashboard/data${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  getSalesReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const endpoint = `/dashboard/sales-report${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall(endpoint);
  },
};

// Menu API endpoints (public)
export const menuAPI = {
  getCategories: async () => {
    return apiCall('/public/menu/categories');
  },

  getMenuItems: async (categoryId?: number) => {
    const params = categoryId ? `?category_id=${categoryId}` : '';
    return apiCall(`/public/menu/items${params}`);
  },

  getAddOns: async () => {
    return apiCall('/public/add-ons?available=true');
  },

  getPaymentMethods: async () => {
    return apiCall('/public/payment-methods');
  },
};
