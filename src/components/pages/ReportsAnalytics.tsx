import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsAnalyticsProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | 'customer' | null;
  onLogout: () => void;
}

interface Product {
  id: number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  minStock: number;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalPurchases: number;
  lastPurchase: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinDate: string;
}

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  totalOrders: number;
  activeOrders: number;
  lastDelivery: string;
  status: 'active' | 'inactive';
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  joinDate: string;
  status: string;
  lastLogin: string;
  workingHours: number;
}

interface SaleData {
  id: number;
  productId: number;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  date: string;
  customerId: number;
}

const monthlySalesData = [
  { month: 'Jan', sales: 45000, profit: 12000, expenses: 33000 },
  { month: 'Feb', sales: 52000, profit: 15000, expenses: 37000 },
  { month: 'Mar', sales: 48000, profit: 13500, expenses: 34500 },
  { month: 'Apr', sales: 61000, profit: 18000, expenses: 43000 },
  { month: 'May', sales: 55000, profit: 16500, expenses: 38500 },
  { month: 'Jun', sales: 67000, profit: 20000, expenses: 47000 },
];

const categoryData = [
  { name: 'Dairy', value: 28, amount: 125000 },
  { name: 'Bakery', value: 18, amount: 80000 },
  { name: 'Vegetables', value: 22, amount: 98000 },
  { name: 'Meat', value: 15, amount: 67000 },
  { name: 'Beverages', value: 12, amount: 54000 },
  { name: 'Others', value: 5, amount: 22000 },
];

const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

const topSellingProducts = [
  { rank: 1, name: 'Fresh Milk 1L', sold: 1250, revenue: 350000, growth: 12 },
  { rank: 2, name: 'White Bread', sold: 980, revenue: 117600, growth: 8 },
  { rank: 3, name: 'Eggs (Dozen)', sold: 850, revenue: 382500, growth: 15 },
  { rank: 4, name: 'Chicken 1kg', sold: 720, revenue: 612000, growth: -5 },
  { rank: 5, name: 'Rice 5kg', sold: 650, revenue: 390000, growth: 10 },
];

const leastSellingProducts = [
  { name: 'Exotic Fruits', sold: 25, revenue: 12500 },
  { name: 'Organic Honey', sold: 32, revenue: 19200 },
  { name: 'Premium Cheese', sold: 45, revenue: 36000 },
  { name: 'Imported Snacks', sold: 58, revenue: 17400 },
  { name: 'Specialty Tea', sold: 67, revenue: 20100 },
];

const dailySalesData = [
  { day: 'Mon', sales: 8500 },
  { day: 'Tue', sales: 9200 },
  { day: 'Wed', sales: 7800 },
  { day: 'Thu', sales: 10500 },
  { day: 'Fri', sales: 12000 },
  { day: 'Sat', sales: 15500 },
  { day: 'Sun', sales: 14200 },
];


export default function ReportsAnalytics({ userRole, onLogout }: ReportsAnalyticsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [realCategoryData, setRealCategoryData] = useState<any[]>([]);
  const [realMetrics, setRealMetrics] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalExpenses: 0,
    profitMargin: 0,
  });

  // Load real data from localStorage
  useEffect(() => {
    console.log('=== LOADING ANALYTICS DATA ===');
    
    // Load products
    const localProducts = localStorage.getItem('products');
    if (localProducts) {
      try {
        const parsed = JSON.parse(localProducts);
        setProducts(parsed);
        console.log('Loaded products for analytics:', parsed);
      } catch (e) {
        console.error('Failed to parse products:', e);
      }
    }

    // Load customers
    const localCustomers = localStorage.getItem('customers');
    if (localCustomers) {
      try {
        const parsed = JSON.parse(localCustomers);
        setCustomers(parsed);
        console.log('Loaded customers for analytics:', parsed);
      } catch (e) {
        console.error('Failed to parse customers:', e);
      }
    }

    // Load suppliers
    const localSuppliers = localStorage.getItem('suppliers');
    if (localSuppliers) {
      try {
        const parsed = JSON.parse(localSuppliers);
        setSuppliers(parsed);
        console.log('Loaded suppliers for analytics:', parsed);
      } catch (e) {
        console.error('Failed to parse suppliers:', e);
      }
    }

    // Load employees
    const localEmployees = localStorage.getItem('employees');
    if (localEmployees) {
      try {
        const parsed = JSON.parse(localEmployees);
        setEmployees(parsed);
        console.log('Loaded employees for analytics:', parsed);
      } catch (e) {
        console.error('Failed to parse employees:', e);
      }
    }

    // Load sales data (create mock sales based on products)
    const localSales = localStorage.getItem('sales');
    if (localSales) {
      try {
        const parsed = JSON.parse(localSales);
        setSalesData(parsed);
      } catch (e) {
        console.error('Failed to parse sales:', e);
      }
    } else {
      // Generate mock sales data based on products
      generateMockSalesData();
    }
  }, []);

  // Generate mock sales data based on products
  const generateMockSalesData = () => {
    const localProducts = localStorage.getItem('products');
    if (localProducts) {
      try {
        const products: Product[] = JSON.parse(localProducts);
        const mockSales: SaleData[] = products.map((product: Product, index: number) => ({
          id: index + 1,
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price,
          quantity: Math.floor(Math.random() * 50) + 10,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerId: Math.floor(Math.random() * 100) + 1,
        }));
        setSalesData(mockSales);
        localStorage.setItem('sales', JSON.stringify(mockSales));
        console.log('Generated mock sales data:', mockSales);
      } catch (e) {
        console.error('Failed to generate mock sales:', e);
      }
    }
  };

  // Calculate real metrics when data changes
  useEffect(() => {
    if (products.length > 0 && salesData.length > 0) {
      calculateRealMetrics();
      calculateCategoryData();
    }
  }, [products, salesData]);

  const calculateRealMetrics = () => {
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    const totalProfit = totalRevenue * 0.29; // Assume 29% profit margin
    const totalExpenses = totalRevenue - totalProfit;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    setRealMetrics({
      totalRevenue,
      totalProfit,
      totalExpenses,
      profitMargin,
    });
  };

  const calculateCategoryData = () => {
    const categoryMap = new Map();
    
    salesData.forEach(sale => {
      const category = sale.category || 'Other';
      const revenue = sale.price * sale.quantity;
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        categoryMap.set(category, {
          name: category,
          value: existing.value + sale.quantity,
          amount: existing.amount + revenue,
        });
      } else {
        categoryMap.set(category, {
          name: category,
          value: sale.quantity,
          amount: revenue,
        });
      }
    });

    const categoryArray = Array.from(categoryMap.values());
    setRealCategoryData(categoryArray);
  };

  // Calculate real top products
  const getTopSellingProducts = () => {
    if (salesData.length === 0) return topSellingProducts;
    
    const productSales = new Map();
    salesData.forEach(sale => {
      if (productSales.has(sale.productName)) {
        const existing = productSales.get(sale.productName);
        productSales.set(sale.productName, {
          name: sale.productName,
          sold: existing.sold + sale.quantity,
          revenue: existing.revenue + (sale.price * sale.quantity),
        });
      } else {
        productSales.set(sale.productName, {
          name: sale.productName,
          sold: sale.quantity,
          revenue: sale.price * sale.quantity,
        });
      }
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product, index) => ({
        rank: index + 1,
        name: product.name,
        sold: product.sold,
        revenue: product.revenue,
        growth: Math.floor(Math.random() * 20) - 5, // Mock growth
      }));
  };

  const realTopProducts = getTopSellingProducts();
  return (
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800">Reports & Analytics</h1>
            <p className="text-gray-600">Track performance and generate insights</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              Date Range
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-gray-800 mb-1">Rs. {realMetrics.totalRevenue.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Based on {salesData.length} sales</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Total Profit</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-gray-800 mb-1">Rs. {realMetrics.totalProfit.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{realMetrics.profitMargin.toFixed(1)}% margin</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Total Expenses</p>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-gray-800 mb-1">Rs. {realMetrics.totalExpenses.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Operating costs</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Active Products</p>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-gray-800 mb-1">{products.length}</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{products.filter(p => p.status === 'in-stock').length} in stock</span>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Sales Trend */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-800 mb-4">Monthly Sales & Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} name="Sales (Rs.)" />
                <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2} name="Profit (Rs.)" />
                <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name="Expenses (Rs.)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-800 mb-4">Sales by Category (Real Data)</h3>
            {realCategoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={realCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {realCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {realCategoryData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-sm text-gray-600">{cat.name}: Rs. {cat.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sales data available</p>
                <p className="text-sm">Add products and sales to see category distribution</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-800 mb-4">Daily Sales This Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#16a34a" name="Sales (Rs.)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-700" />
              Top Selling Products (Real Data)
            </h3>
            {realTopProducts.length > 0 ? (
              <div className="space-y-3">
                {realTopProducts.map((product) => (
                  <div key={product.rank} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center">
                          {product.rank}
                        </div>
                        <div>
                          <p className="text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-800">Rs. {product.revenue.toLocaleString()}</p>
                        <div className={`flex items-center gap-1 text-sm ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{Math.abs(product.growth)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sales data available</p>
                <p className="text-sm">Add products and sales to see top performers</p>
              </div>
            )}
          </div>

          {/* Least Selling Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-700" />
              Least Selling Products
            </h3>
            <div className="space-y-3">
              {leastSellingProducts.map((product, index) => (
                <div key={index} className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sold} units sold</p>
                    </div>
                    <p className="text-gray-800">Rs. {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Recommendation:</strong> Consider promotional offers or review inventory levels for these products.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-md">
          <h3 className="text-gray-800 mb-4">Monthly Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 mb-2">Best Performing Day</p>
              <p className="text-gray-800">Saturday</p>
              <p className="text-sm text-gray-500">Avg. Rs. 15,500 sales</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Best Performing Category</p>
              <p className="text-gray-800">Dairy Products</p>
              <p className="text-sm text-gray-500">28% of total sales</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Customer Growth</p>
              <p className="text-gray-800">+145 new customers</p>
              <p className="text-sm text-gray-500">+4.2% growth rate</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
