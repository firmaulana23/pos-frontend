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

// Transaction Types
export interface TransactionItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  menu_item: {
    id: number;
    name: string;
    price: number;
  };
  add_ons: Array<{
    id: number;
    add_on_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    add_on: {
      id: number;
      name: string;
      price: number;
    };
  }>;
}

export interface Transaction {
  id: number;
  transaction_no: string;
  customer_name: string | null;
  status: 'pending' | 'paid';
  payment_method: string;
  sub_total: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
  created_at: string;
  updated_at: string;
  items: TransactionItem[];
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

// Menu Types
export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AddOnItem {
  id: number;
  menu_item_id: number | null;
  name: string;
  description: string;
  price: number;
  cogs: number;
  margin: number;
  is_available: boolean;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  cogs: number;
  margin: number;
  is_available: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
  category: Category;
  add_ons?: AddOnItem[];
}

export interface MenuItemsResponse {
  data: MenuItem[];
  total?: number;
  page?: number;
  limit?: number;
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

// Transactions API endpoints
export const transactionsAPI = {
  getTransactions: async (status?: 'pending' | 'paid', limit: number = 10, offset: number = 0): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const endpoint = `/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall<TransactionsResponse>(endpoint);
  },

  getTransaction: async (id: number): Promise<Transaction> => {
    return apiCall<Transaction>(`/transactions/${id}`);
  },

  createTransaction: async (data: {
    customer_name?: string;
    items: Array<{
      menu_item_id: number;
      quantity: number;
      add_ons?: Array<{ add_on_id: number; quantity: number }>;
    }>;
    payment_method?: string;
    tax?: number;
    discount_percentage?: number;
  }): Promise<{ success: boolean; data: Transaction }> => {
    return apiCall<{ success: boolean; data: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  payTransaction: async (id: number, paymentMethod: string): Promise<Transaction> => {
    return apiCall<Transaction>(`/transactions/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ payment_method: paymentMethod }),
    });
  },

  updateTransaction: async (id: number, data: {
    customer_name?: string;
    tax?: number;
    discount_percentage?: number;
  }): Promise<Transaction> => {
    return apiCall<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTransaction: async (id: number): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin Menu API endpoints
export const adminMenuAPI = {
  getMenuItems: async (categoryId?: number, page: number = 1, limit: number = 10): Promise<MenuItemsResponse> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId.toString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const endpoint = `/menu/items${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall<MenuItemsResponse>(endpoint);
  },

  getMenuItem: async (id: number): Promise<MenuItem> => {
    return apiCall<MenuItem>(`/menu/items/${id}`);
  },

  createMenuItem: async (data: {
    category_id: number;
    name: string;
    description: string;
    price: number;
    cogs: number;
    is_available: boolean;
  }): Promise<MenuItem> => {
    return apiCall<MenuItem>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMenuItem: async (id: number, data: {
    category_id?: number;
    name?: string;
    description?: string;
    price?: number;
    cogs?: number;
    is_available?: boolean;
  }): Promise<MenuItem> => {
    return apiCall<MenuItem>(`/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMenuItem: async (id: number): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/menu/items/${id}`, {
      method: 'DELETE',
    });
  },

  getCategories: async (): Promise<Category[]> => {
    return apiCall<Category[]>('/menu/categories');
  },

  createCategory: async (data: {
    name: string;
    description: string;
  }): Promise<Category> => {
    return apiCall<Category>('/menu/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (id: number, data: {
    name?: string;
    description?: string;
  }): Promise<Category> => {
    return apiCall<Category>(`/menu/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (id: number): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/menu/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
