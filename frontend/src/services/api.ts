export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};

// ---- Data types used by your pages ----
export type Product = {
  _id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  minStock: number;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | string;
  barcode?: string;
  specialOffers?: boolean;
  weeklyDeals?: boolean;
  image?: string;
};

export type Supplier = {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  category: string;
  rating?: number;
  totalOrders?: number;
  activeOrders?: number;
  lastDelivery?: string | Date | null;
  status: 'active' | 'inactive' | string;
};

export type Employee = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'stock_manager' | string;
  phone: string;
  joinDate: string | Date;
  status: 'active' | 'inactive' | string;
  lastLogin?: string | Date | null;
};

export type PurchaseOrder = {
  _id: string;
  supplierId: any;
  orderDate: string | Date;
  expectedDelivery: string | Date;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled' | string;
  totalAmount: number;
  // Backend model uses `items` as a number (count of items).
  items?: number;
  // Frontend UI sometimes expects `itemCount` (derive/ignore mismatch later).
  itemCount?: number;
  notes?: string;
};

export type CustomerOrderItem = {
  id: string;
  name: string;
  price: number;
  pricePerKg?: string;
  image?: string;
  quantity: number;
  total: number;
};

export type CustomerRecord = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalPurchases: number;
  lastPurchase?: string | null;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinDate?: string;
  createdAt?: string;
};

export type CustomerOrder = {
  _id: string;
  id?: string;
  orderNumber: string;
  customerId?: string;
  items: CustomerOrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  contactPhone: string;
  status: 'Processing' | 'Confirmed' | 'Packed' | 'Out for Delivery' | 'Completed' | 'Cancelled' | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  date?: string | Date;
};

export type StripeConfig = {
  publishableKey: string;
};

export type StripeCheckoutResponse = {
  orderId: string;
  orderNumber: string;
  sessionId: string;
  url?: string;
};

type AuthUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: 'admin' | 'cashier' | 'stock_manager' | 'customer';
};

const API_BASE_URL = 'http://localhost:5000';

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

const apiService = {
  getStoredToken(): string | null {
    // Prioritise customer token so cart & customer-facing endpoints
    // don't accidentally use a stale admin/staff token.
    return localStorage.getItem('customerToken') || localStorage.getItem('token');
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isCustomerAuthenticated(): boolean {
    const customerToken = localStorage.getItem('customerToken');
    const customer = localStorage.getItem('customer');
    if (customerToken && customer) return true;

    const user = apiService.getStoredUser();
    return user?.role === 'customer' && !!localStorage.getItem('token');
  },

  getStoredCustomer(): Record<string, any> | null {
    const customerRaw = localStorage.getItem('customer');
    if (customerRaw) {
      try {
        return JSON.parse(customerRaw);
      } catch {
        return null;
      }
    }

    const user = apiService.getStoredUser();
    if (user?.role === 'customer') {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
      const userRecord = user as AuthUser & {
        name?: string;
        phone?: string;
        tier?: string;
        loyaltyPoints?: number;
        totalPurchases?: number;
      };
      return {
        _id: user._id,
        name: name || userRecord.name || user.email || 'Customer',
        email: user.email || '',
        phone: userRecord.phone || '',
        tier: userRecord.tier || 'Bronze',
        loyaltyPoints: userRecord.loyaltyPoints ?? 0,
        totalPurchases: userRecord.totalPurchases ?? 0,
      };
    }

    return null;
  },

  saveAuthData(token: string, user: AuthUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  saveCustomerAuthData(token: string, customer: any) {
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customer', JSON.stringify(customer));
  },

  logout() {
    this.clearAllAuth();
  },

  clearAllAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    localStorage.removeItem('rememberCustomer');
    localStorage.removeItem('customerProfile');
    // NOTE: 'cart' is intentionally NOT removed here so guest cart items
    // are preserved and can be merged after login.
  },

  clearCart() {
    localStorage.removeItem('cart');
  },

  privateHeaders(): Record<string, string> {
    const token = apiService.getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  async staffLogin(formData: { email: string; password: string }): Promise<ApiResponse<AuthUser & { token?: string }>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async customerLogin(formData: { email: string; password: string }): Promise<ApiResponse<{ customer: any; token: string }>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async customerRegister(formData: any): Promise<ApiResponse<{ customer: any; token: string }>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async getProfile(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/profile`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async updateProfile(payload: any): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/profile`, {
      method: 'PUT',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async customerGoogleLogin(accessToken: string): Promise<ApiResponse<{ customer: any; token: string }>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });

    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async getSalesChart(): Promise<ApiResponse<any[]>> {
    const res = await fetch(`${API_BASE_URL}/api/sales/chart`, {
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any[]>;
  },

  async getWeeklySales(): Promise<ApiResponse<any[]>> {
    const res = await fetch(`${API_BASE_URL}/api/sales/weekly`, {
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any[]>;
  },

  async getCategorySales(): Promise<ApiResponse<any[]>> {
    const res = await fetch(`${API_BASE_URL}/api/sales/category`, {
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any[]>;
  },

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async getDashboardData(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async getProducts(): Promise<ApiResponse<Product[]>> {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Product[]>;
  },

  async createProduct(payload: any): Promise<ApiResponse<Product>> {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Product>;
  },

  async updateProduct(id: string, payload: any): Promise<ApiResponse<Product>> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Product>;
  },

  async deleteProduct(id: string): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse;
  },

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Supplier[]>;
  },

  async createSupplier(payload: any): Promise<ApiResponse<Supplier>> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Supplier>;
  },

  async updateSupplier(id: string, payload: any): Promise<ApiResponse<Supplier>> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
      method: 'PUT',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Supplier>;
  },

  async deleteSupplier(id: string): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
      method: 'DELETE',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse;
  },

  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    const res = await fetch(`${API_BASE_URL}/api/employees`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Employee[]>;
  },

  async createEmployee(payload: any): Promise<ApiResponse<Employee>> {
    const res = await fetch(`${API_BASE_URL}/api/employees`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Employee>;
  },

  async updateEmployee(id: string, payload: any): Promise<ApiResponse<Employee>> {
    const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
      method: 'PUT',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<Employee>;
  },

  async deleteEmployee(id: string): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
      method: 'DELETE',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse;
  },

  async getPurchaseOrders(): Promise<ApiResponse<PurchaseOrder[]>> {
    const res = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<PurchaseOrder[]>;
  },

  async createPurchaseOrder(payload: any): Promise<ApiResponse<PurchaseOrder>> {
    const res = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<PurchaseOrder>;
  },

  async updatePurchaseOrder(id: string, payload: any): Promise<ApiResponse<PurchaseOrder>> {
    const res = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`, {
      method: 'PUT',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<PurchaseOrder>;
  },

  async deletePurchaseOrder(id: string): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`, {
      method: 'DELETE',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse;
  },

  async getCart(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async saveCart(items: any[]): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify({ items }),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async getStripeConfig(): Promise<ApiResponse<StripeConfig>> {
    const res = await fetch(`${API_BASE_URL}/api/orders/stripe/config`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<StripeConfig>;
  },

  async createStripeOrder(payload: {
    items: CustomerOrderItem[];
    deliveryAddress: string;
    contactPhone: string;
    deliveryFee?: number;
  }): Promise<ApiResponse<StripeCheckoutResponse>> {
    const res = await fetch(`${API_BASE_URL}/api/orders/stripe`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<StripeCheckoutResponse>;
  },

  async verifyStripeOrder(sessionId: string): Promise<ApiResponse<CustomerOrder>> {
    const res = await fetch(`${API_BASE_URL}/api/orders/stripe/verify`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify({ sessionId }),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<CustomerOrder>;
  },

  async getOrders(): Promise<ApiResponse<CustomerOrder[]>> {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<CustomerOrder[]>;
  },

  async getOrder(id: string): Promise<ApiResponse<CustomerOrder>> {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<CustomerOrder>;
  },

  async createOrder(payload: {
    items: CustomerOrderItem[];
    deliveryAddress: string;
    contactPhone: string;
    deliveryFee?: number;
  }): Promise<ApiResponse<CustomerOrder>> {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<CustomerOrder>;
  },
  async getCustomers(): Promise<ApiResponse<CustomerRecord[]>> {
    const res = await fetch(`${API_BASE_URL}/api/customers`, {
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<CustomerRecord[]>;
  },

  async getCustomerOrders(customerId: string): Promise<ApiResponse<CustomerOrder[]>> {
    const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/orders`, {
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<CustomerOrder[]>;
  },

  async getCustomerProfile(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/profile`, {
      method: 'GET',
      headers: apiService.privateHeaders(),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async updateCustomerProfile(payload: any): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/profile`, {
      method: 'PUT',
      headers: apiService.privateHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async sendRegistrationOtp(email: string, name?: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/send-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },

  async verifyRegistrationOtp(email: string, otp: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/api/customer-auth/verify-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await parseJsonSafe(res);
    return data as ApiResponse<any>;
  },
};

export { apiService };

