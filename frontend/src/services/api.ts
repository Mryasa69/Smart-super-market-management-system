import axios, { AxiosError, AxiosResponse } from "axios";

/**
 * Centralised backend connection layer.
 *
 * All HTTP calls go through axios using the exact shape:
 *     axios.<method>(path, payload, config).then((res) => ...).catch((err) => ...)
 *
 * No `fetch`, no XMLHttpRequest. Every public method on `apiService` returns
 * a `Promise<ApiResponse<T>>` so existing callers stay unchanged.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field?: string; message: string }>;
};

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  nicNumber?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface Employee {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  position?: string;
  department?: string;
  salary?: number;
  joinDate?: string;
  status?: string;
  lastLogin?: string;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export type EmployeeCreatePayload = Partial<Employee> & { password?: string };

export interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  status?: string;
  rating?: number;
  totalOrders?: number;
  activeOrders?: number;
  lastDelivery?: string;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  price: number;
  cost?: number;
  stock?: number;
  quantity?: number;
  lowStockThreshold?: number;
  minStock?: number;
  expiryDate?: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  supplier?: string | Supplier;
  specialOffers?: any;
  weeklyDeals?: any;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// PurchaseOrder exposes all fields the management pages may read off the
// payload returned by the backend (`supplierId`, `orderDate`, etc.). They
// are marked optional so the type accepts the variations the server can
// produce.
export interface PurchaseOrder {
  _id: string;
  id?: string;
  orderNumber?: string;
  supplier: string | Supplier | { _id: string; name?: string };
  supplierId?: string | { _id: string; name?: string };
  supplierName?: string;
  items: Array<{
    product: string | Product;
    quantity: number;
    unitCost: number;
  }>;
  totalAmount: number;
  status: "pending" | "approved" | "received" | "cancelled";
  orderDate?: string;
  expectedDelivery?: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CustomerOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  image?: string;
}

export interface CustomerOrder {
  _id: string;
  id?: string;
  orderNumber?: string;
  customer?: string | { _id: string; firstName: string; lastName: string; email: string };
  items: CustomerOrderItem[];
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "completed" | "paid";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: "cash" | "card" | "stripe" | "other";
  deliveryAddress: string;
  contactPhone: string;
  notes?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  itemCount?: number;
  [key: string]: any;
}

// CustomerRecord extends a flexible indexable shape so that fields
// commonly populated by the backend (e.g. `name`, `tier`, `loyaltyPoints`,
// `joinDate`, `totalPurchases`, `lastPurchase`, etc.) can be read without
// TypeScript flagging the lookup as missing.
export interface CustomerRecord {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  tier?: "bronze" | "silver" | "gold" | "platinum" | string;
  joinDate?: string;
  totalPurchases?: number;
  lastPurchase?: string;
  isActive?: boolean;
  createdAt?: string;
  status?: string;
  [key: string]: any;
}

export interface StripeConfig {
  publishableKey: string;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Base URL & auth helpers
// ---------------------------------------------------------------------------

const envBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = envBase && envBase.length > 0 ? envBase : "http://localhost:5000";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const CUSTOMER_TOKEN_KEY = "customer_token";
const CUSTOMER_USER_KEY = "customer_user";

const getToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

const getCustomerToken = (): string | null => {
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch {
    return null;
  }
};

const privateHeaders = (useCustomerToken = false) => {
  const token = useCustomerToken ? getCustomerToken() : getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

/**
 * Convert an axios response into the `ApiResponse<T>` shape used everywhere
 * in the app, regardless of HTTP status. This keeps the contract stable for
 * every `.then()` handler.
 */
const toApiResponse = <T = any>(res: AxiosResponse): ApiResponse<T> => {
  const body = res.data;
  if (body && typeof body === "object" && "success" in body) {
    return body as ApiResponse<T>;
  }
  return { success: res.status >= 200 && res.status < 300, data: body as T };
};

const errorToApiResponse = <T = any>(err: unknown): ApiResponse<T> => {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<any>;
    const data = axiosErr.response?.data;
    if (data && typeof data === "object") {
      return {
        success: false,
        message: (data as any).message || (data as any).error || axiosErr.message,
        error: (data as any).error || axiosErr.message,
        errors: (data as any).errors,
      } as ApiResponse<T>;
    }
    return {
      success: false,
      message: axiosErr.message,
      error: axiosErr.message,
    } as ApiResponse<T>;
  }
  const e: any = err;
  return {
    success: false,
    message: e?.message || "Unknown error",
    error: e?.message || "Unknown error",
  } as ApiResponse<T>;
};

// ---------------------------------------------------------------------------
// Local-storage auth helpers (called from pages like LoginPage/SignUpPage)
// ---------------------------------------------------------------------------

const saveAuthData = (token: string, user: any): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (user !== undefined) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch {
    /* ignore quota / privacy errors */
  }
};

const saveCustomerAuthData = (token: string, customer: any): void => {
  try {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    if (customer !== undefined) {
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(customer));
    }
  } catch {
    /* ignore */
  }
};

const clearAllAuth = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
  } catch {
    /* ignore */
  }
};

const getStoredToken = (useCustomerToken = false): string | null => {
  return useCustomerToken ? getCustomerToken() : getToken();
};

const getStoredUser = (): any => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredCustomer = (): any => {
  try {
    const raw = localStorage.getItem(CUSTOMER_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const isAuthenticated = (): boolean => {
  return !!getToken();
};

const isCustomerAuthenticated = (): boolean => {
  return !!getCustomerToken();
};

const logout = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    /* ignore */
  }
};

// ---------------------------------------------------------------------------
// Public API surface
// ---------------------------------------------------------------------------

const apiService = {
  /** Expose the base URL for debugging / external code that needs it. */
  get baseUrl(): string {
    return API_BASE_URL;
  },

  /** Local-storage helpers used by auth pages. */
  saveAuthData,
  saveCustomerAuthData,
  clearAllAuth,
  getStoredToken,
  getStoredUser,
  getStoredCustomer,
  isAuthenticated,
  isCustomerAuthenticated,
  logout,

  // -----------------------------------------------------------------------
  // Generic axios helpers – the literal pattern requested by the project:
  //     axios.<method>(path, data, config).then(...).catch(...)
  // -----------------------------------------------------------------------

  /** GET request. */
  get<T = any>(path: string, useCustomerToken = false): Promise<ApiResponse<T>> {
    return axios
      .get(`${API_BASE_URL}${path}`, { headers: privateHeaders(useCustomerToken) })
      .then((res) => toApiResponse<T>(res))
      .catch((err) => errorToApiResponse<T>(err));
  },

  /** POST request. */
  post<T = any>(
    path: string,
    payload?: any,
    useCustomerToken = false
  ): Promise<ApiResponse<T>> {
    return axios
      .post(`${API_BASE_URL}${path}`, payload, {
        headers: privateHeaders(useCustomerToken),
      })
      .then((res) => toApiResponse<T>(res))
      .catch((err) => errorToApiResponse<T>(err));
  },

  /** PUT request. */
  put<T = any>(
    path: string,
    payload?: any,
    useCustomerToken = false
  ): Promise<ApiResponse<T>> {
    return axios
      .put(`${API_BASE_URL}${path}`, payload, {
        headers: privateHeaders(useCustomerToken),
      })
      .then((res) => toApiResponse<T>(res))
      .catch((err) => errorToApiResponse<T>(err));
  },

  /** PATCH request. */
  patch<T = any>(
    path: string,
    payload?: any,
    useCustomerToken = false
  ): Promise<ApiResponse<T>> {
    return axios
      .patch(`${API_BASE_URL}${path}`, payload, {
        headers: privateHeaders(useCustomerToken),
      })
      .then((res) => toApiResponse<T>(res))
      .catch((err) => errorToApiResponse<T>(err));
  },

  /** DELETE request. */
  delete<T = any>(path: string, useCustomerToken = false): Promise<ApiResponse<T>> {
    return axios
      .delete(`${API_BASE_URL}${path}`, { headers: privateHeaders(useCustomerToken) })
      .then((res) => toApiResponse<T>(res))
      .catch((err) => errorToApiResponse<T>(err));
  },

  // -----------------------------------------------------------------------
  // Auth (staff)
  // -----------------------------------------------------------------------

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return axios
      .post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse<{ token: string; user: any }>(res))
      .catch((err) => errorToApiResponse<{ token: string; user: any }>(err));
  },

  /**
   * Staff login. Accepts a `{ email, password }` object so the LoginPage can
   * pass `formData` directly, and returns a data object that always exposes
   * a `role` (defaulting to the user.role from the backend payload).
   */
  async staffLogin(payload: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; role: string; [k: string]: any }>> {
    return axios
      .post(
        `${API_BASE_URL}/api/auth/login`,
        { email: payload.email, password: payload.password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        const body = res.data || {};
        const data = body.data || body;
        const token = data.token;
        const user = data.user || data;
        return {
          ...body,
          data: {
            ...data,
            token,
            role: user?.role || data.role || "customer",
            user,
          },
        } as ApiResponse<{ token: string; role: string; [k: string]: any }>;
      })
      .catch((err) => errorToApiResponse<{ token: string; role: string; [k: string]: any }>(err));
  },

  async register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    return axios
      .post(`${API_BASE_URL}/api/auth/register`, payload, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => toApiResponse<{ token: string; user: any }>(res))
      .catch((err) => errorToApiResponse<{ token: string; user: any }>(err));
  },

  async getProfile(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/auth/profile`, { headers: privateHeaders() })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async updateProfile(payload: any): Promise<ApiResponse<any>> {
    return axios
      .put(`${API_BASE_URL}/api/auth/profile`, payload, { headers: privateHeaders() })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return axios
      .post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<any>> {
    return axios
      .post(
        `${API_BASE_URL}/api/auth/reset-password`,
        { token, password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // Customer auth (separate token)
  // -----------------------------------------------------------------------

  async customerLogin(
    a: string | { email: string; password: string },
    b?: string
  ): Promise<ApiResponse<{ token: string; customer: any }>> {
    const email = typeof a === "string" ? a : a.email;
    const password = typeof a === "string" ? (b as string) : a.password;
    return axios
      .post(
        `${API_BASE_URL}/api/customer-auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse<{ token: string; customer: any }>(res))
      .catch((err) => errorToApiResponse<{ token: string; customer: any }>(err));
  },

  async customerRegister(payload: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    password: string;
    phone?: string;
    nicNumber?: string;
  }): Promise<ApiResponse<{ token: string; customer: any }>> {
    return axios
      .post(`${API_BASE_URL}/api/customer-auth/register`, payload, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => toApiResponse<{ token: string; customer: any }>(res))
      .catch((err) => errorToApiResponse<{ token: string; customer: any }>(err));
  },

  async sendRegistrationOtp(email: string, name?: string): Promise<ApiResponse<any>> {
    return axios
      .post(
        `${API_BASE_URL}/api/customer-auth/send-registration-otp`,
        { email, name },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async verifyRegistrationOtp(email: string, otp: string): Promise<ApiResponse<any>> {
    return axios
      .post(
        `${API_BASE_URL}/api/customer-auth/verify-registration-otp`,
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async getCustomerProfile(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/customer-auth/profile`, {
        headers: privateHeaders(true),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async updateCustomerProfile(payload: any): Promise<ApiResponse<any>> {
    return axios
      .put(`${API_BASE_URL}/api/customer-auth/profile`, payload, {
        headers: privateHeaders(true),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async customerForgotPassword(email: string): Promise<ApiResponse<any>> {
    return axios
      .post(
        `${API_BASE_URL}/api/customer-auth/forgot-password`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async customerResetPassword(token: string, password: string): Promise<ApiResponse<any>> {
    return axios
      .post(
        `${API_BASE_URL}/api/customer-auth/reset-password`,
        { token, password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // Customers (admin)
  // -----------------------------------------------------------------------

  async getCustomers(): Promise<ApiResponse<CustomerRecord[]>> {
    return axios
      .get(`${API_BASE_URL}/api/customers`, { headers: privateHeaders() })
      .then((res) => toApiResponse<CustomerRecord[]>(res))
      .catch((err) => errorToApiResponse<CustomerRecord[]>(err));
  },

  async getCustomerOrders(customerId: string): Promise<ApiResponse<CustomerOrder[]>> {
    return axios
      .get(`${API_BASE_URL}/api/customers/${customerId}/orders`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<CustomerOrder[]>(res))
      .catch((err) => errorToApiResponse<CustomerOrder[]>(err));
  },

  // -----------------------------------------------------------------------
  // Employees
  // -----------------------------------------------------------------------

  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    return axios
      .get(`${API_BASE_URL}/api/employees`, { headers: privateHeaders() })
      .then((res) => toApiResponse<Employee[]>(res))
      .catch((err) => errorToApiResponse<Employee[]>(err));
  },

  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return axios
      .get(`${API_BASE_URL}/api/employees/${id}`, { headers: privateHeaders() })
      .then((res) => toApiResponse<Employee>(res))
      .catch((err) => errorToApiResponse<Employee>(err));
  },

  async createEmployee(payload: EmployeeCreatePayload): Promise<ApiResponse<Employee>> {
    return axios
      .post(`${API_BASE_URL}/api/employees`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<Employee>(res))
      .catch((err) => errorToApiResponse<Employee>(err));
  },

  async updateEmployee(id: string, payload: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return axios
      .put(`${API_BASE_URL}/api/employees/${id}`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<Employee>(res))
      .catch((err) => errorToApiResponse<Employee>(err));
  },

  async deleteEmployee(id: string): Promise<ApiResponse<any>> {
    return axios
      .delete(`${API_BASE_URL}/api/employees/${id}`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // Suppliers
  // -----------------------------------------------------------------------

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    return axios
      .get(`${API_BASE_URL}/api/suppliers`, { headers: privateHeaders() })
      .then((res) => toApiResponse<Supplier[]>(res))
      .catch((err) => errorToApiResponse<Supplier[]>(err));
  },

  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return axios
      .get(`${API_BASE_URL}/api/suppliers/${id}`, { headers: privateHeaders() })
      .then((res) => toApiResponse<Supplier>(res))
      .catch((err) => errorToApiResponse<Supplier>(err));
  },

  async createSupplier(payload: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    return axios
      .post(`${API_BASE_URL}/api/suppliers`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<Supplier>(res))
      .catch((err) => errorToApiResponse<Supplier>(err));
  },

  async updateSupplier(id: string, payload: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    return axios
      .put(`${API_BASE_URL}/api/suppliers/${id}`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<Supplier>(res))
      .catch((err) => errorToApiResponse<Supplier>(err));
  },

  async deleteSupplier(id: string): Promise<ApiResponse<any>> {
    return axios
      .delete(`${API_BASE_URL}/api/suppliers/${id}`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // Products / inventory
  // -----------------------------------------------------------------------

  async getProducts(): Promise<ApiResponse<Product[]>> {
    return axios
      .get(`${API_BASE_URL}/api/products`, { headers: privateHeaders() })
      .then((res) => toApiResponse<Product[]>(res))
      .catch((err) => errorToApiResponse<Product[]>(err));
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return axios
      .get(`${API_BASE_URL}/api/products/${id}`, { headers: privateHeaders() })
      .then((res) => toApiResponse<Product>(res))
      .catch((err) => errorToApiResponse<Product>(err));
  },

  async createProduct(payload: Partial<Product>): Promise<ApiResponse<Product>> {
    return axios
      .post(`${API_BASE_URL}/api/products`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<Product>(res))
      .catch((err) => errorToApiResponse<Product>(err));
  },

  async updateProduct(id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> {
    return axios
      .put(`${API_BASE_URL}/api/products/${id}`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<Product>(res))
      .catch((err) => errorToApiResponse<Product>(err));
  },

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return axios
      .delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  /** Returns active weekly deals with server-computed serverNow + time-left fields. */
  async getWeeklyDeals(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/products/weekly-deals`, { headers: privateHeaders() })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // Purchase orders
  // -----------------------------------------------------------------------

  async getPurchaseOrders(): Promise<ApiResponse<PurchaseOrder[]>> {
    return axios
      .get(`${API_BASE_URL}/api/purchase-orders`, { headers: privateHeaders() })
      .then((res) => toApiResponse<PurchaseOrder[]>(res))
      .catch((err) => errorToApiResponse<PurchaseOrder[]>(err));
  },

  async getPurchaseOrder(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return axios
      .get(`${API_BASE_URL}/api/purchase-orders/${id}`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<PurchaseOrder>(res))
      .catch((err) => errorToApiResponse<PurchaseOrder>(err));
  },

  async createPurchaseOrder(payload: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
    return axios
      .post(`${API_BASE_URL}/api/purchase-orders`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<PurchaseOrder>(res))
      .catch((err) => errorToApiResponse<PurchaseOrder>(err));
  },

  async updatePurchaseOrder(
    id: string,
    payload: Partial<PurchaseOrder>
  ): Promise<ApiResponse<PurchaseOrder>> {
    return axios
      .put(`${API_BASE_URL}/api/purchase-orders/${id}`, payload, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<PurchaseOrder>(res))
      .catch((err) => errorToApiResponse<PurchaseOrder>(err));
  },

  async deletePurchaseOrder(id: string): Promise<ApiResponse<any>> {
    return axios
      .delete(`${API_BASE_URL}/api/purchase-orders/${id}`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // Cart (customer)
  // -----------------------------------------------------------------------

  async getCart(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/cart`, { headers: privateHeaders(true) })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async saveCart(items: any[]): Promise<ApiResponse<any>> {
    return axios
      .post(
        `${API_BASE_URL}/api/cart`,
        { items },
        { headers: privateHeaders(true) }
      )
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // Orders / Stripe
  // -----------------------------------------------------------------------

  async getStripeConfig(): Promise<ApiResponse<StripeConfig>> {
    return axios
      .get(`${API_BASE_URL}/api/orders/stripe/config`, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => toApiResponse<StripeConfig>(res))
      .catch((err) => errorToApiResponse<StripeConfig>(err));
  },

  async createStripeOrder(payload: {
    items: CustomerOrderItem[];
    deliveryAddress: string;
    contactPhone: string;
    deliveryFee?: number;
  }): Promise<ApiResponse<StripeCheckoutResponse>> {
    return axios
      .post(`${API_BASE_URL}/api/orders/stripe`, payload, {
        headers: privateHeaders(true),
      })
      .then((res) => toApiResponse<StripeCheckoutResponse>(res))
      .catch((err) => errorToApiResponse<StripeCheckoutResponse>(err));
  },

  async verifyStripeOrder(sessionId: string): Promise<ApiResponse<CustomerOrder>> {
    return axios
      .post(
        `${API_BASE_URL}/api/orders/stripe/verify`,
        { sessionId },
        { headers: privateHeaders(true) }
      )
      .then((res) => toApiResponse<CustomerOrder>(res))
      .catch((err) => errorToApiResponse<CustomerOrder>(err));
  },

  async getOrders(): Promise<ApiResponse<CustomerOrder[]>> {
    return axios
      .get(`${API_BASE_URL}/api/orders`, { headers: privateHeaders(true) })
      .then((res) => toApiResponse<CustomerOrder[]>(res))
      .catch((err) => errorToApiResponse<CustomerOrder[]>(err));
  },

  async getOrder(id: string): Promise<ApiResponse<CustomerOrder>> {
    return axios
      .get(`${API_BASE_URL}/api/orders/${id}`, {
        headers: privateHeaders(true),
      })
      .then((res) => toApiResponse<CustomerOrder>(res))
      .catch((err) => errorToApiResponse<CustomerOrder>(err));
  },

  async createOrder(payload: {
    items: CustomerOrderItem[];
    deliveryAddress: string;
    contactPhone: string;
    deliveryFee?: number;
  }): Promise<ApiResponse<CustomerOrder>> {
    return axios
      .post(`${API_BASE_URL}/api/orders`, payload, {
        headers: privateHeaders(true),
      })
      .then((res) => toApiResponse<CustomerOrder>(res))
      .catch((err) => errorToApiResponse<CustomerOrder>(err));
  },

  // -----------------------------------------------------------------------
  // Reports / analytics
  // -----------------------------------------------------------------------

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/reports/dashboard`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async getSalesReport(params?: { from?: string; to?: string }): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/reports/sales`, {
        headers: privateHeaders(),
        params,
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  async getInventoryReport(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/reports/inventory`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  /**
   * Combined dashboard payload used by AdminDashboard / ReportsAnalytics.
   * Wraps the dedicated endpoints into a single response so the page can
   * fall back to the older `getDashboardData()` callers.
   */
  async getDashboardData(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/reports/dashboard`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  /** Sales-chart data for the Reports & Analytics page. */
  async getSalesChart(params?: { range?: string }): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/reports/sales-chart`, {
        headers: privateHeaders(),
        params,
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  /** Weekly sales breakdown for the Reports & Analytics page. */
  async getWeeklySales(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/reports/weekly-sales`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  /** Category sales breakdown for the Reports & Analytics page. */
  async getCategorySales(): Promise<ApiResponse<any>> {
    return axios
      .get(`${API_BASE_URL}/api/reports/category-sales`, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse(res.data))
      .catch((err) => errorToApiResponse(err));
  },

  // -----------------------------------------------------------------------
  // POS / cash register
  // -----------------------------------------------------------------------

  /**
   * Create a sale from the POS (cashier) screen. Accepts a cart-like
   * payload and returns the persisted order.
   */
  async createSale(payload: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    paymentMethod?: "cash" | "card" | "qr" | "other";
    customerId?: string;
    notes?: string;
  }): Promise<ApiResponse<CustomerOrder>> {
    // Normalise the payment method so the backend always sees an allowed value
    const body = { ...payload } as any;
    if (body.paymentMethod === "qr") {
      body.paymentMethod = "other";
    }
    return axios
      .post(`${API_BASE_URL}/api/orders/pos`, body, {
        headers: privateHeaders(),
      })
      .then((res) => toApiResponse<CustomerOrder>(res))
      .catch((err) => errorToApiResponse<CustomerOrder>(err));
  },

  // -----------------------------------------------------------------------
  // Google OAuth (customer)
  // -----------------------------------------------------------------------

  /**
   * Exchange a Google OAuth ID-token for a customer session. The backend
   * returns the JWT + customer profile which the caller can persist with
   * `saveCustomerAuthData()`.
   */
  async customerGoogleLogin(
    payload: { accessToken: string } | string
  ): Promise<ApiResponse<{ token: string; customer: any }>> {
    const body = typeof payload === "string" ? { accessToken: payload } : payload;
    return axios
      .post(
        `${API_BASE_URL}/api/customer-auth/google-login`,
        body,
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => toApiResponse<{ token: string; customer: any }>(res))
      .catch((err) => errorToApiResponse<{ token: string; customer: any }>(err));
  },
};

export { apiService };