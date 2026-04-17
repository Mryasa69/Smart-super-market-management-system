import React from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsAnalyticsProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
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
            <h2 className="text-gray-800 mb-1">Rs. 328,000</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+14.2% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Total Profit</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-gray-800 mb-1">Rs. 95,500</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+18.5% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Total Expenses</p>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-gray-800 mb-1">Rs. 232,500</h2>
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+8.3% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Profit Margin</p>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-gray-800 mb-1">29.1%</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+2.1% from last month</span>
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
            <h3 className="text-gray-800 mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm text-gray-600">{cat.name}: Rs. {cat.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
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
              Top Selling Products
            </h3>
            <div className="space-y-3">
              {topSellingProducts.map((product) => (
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
