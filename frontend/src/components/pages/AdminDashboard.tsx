import DashboardLayout from '../Layout/DashboardLayout';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AdminDashboardProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
}

const salesData = [
  { month: 'Jan', sales: 45000, profit: 12000 },
  { month: 'Feb', sales: 52000, profit: 15000 },
  { month: 'Mar', sales: 48000, profit: 13500 },
  { month: 'Apr', sales: 61000, profit: 18000 },
  { month: 'May', sales: 55000, profit: 16500 },
  { month: 'Jun', sales: 67000, profit: 20000 },
];

const topProducts = [
  { name: 'Fresh Milk 1L', sold: 450, revenue: 'Rs. 126,000' },
  { name: 'White Bread', sold: 380, revenue: 'Rs. 45,600' },
  { name: 'Chicken 1kg', sold: 320, revenue: 'Rs. 272,000' },
  { name: 'Rice 5kg', sold: 290, revenue: 'Rs. 174,000' },
  { name: 'Fresh Apples', sold: 265, revenue: 'Rs. 119,250' },
];

const lowStockItems = [
  { name: 'Tomatoes', current: 15, minimum: 50, status: 'critical' },
  { name: 'Eggs (Dozen)', current: 25, minimum: 100, status: 'low' },
  { name: 'Orange Juice', current: 30, minimum: 75, status: 'low' },
  { name: 'Butter 500g', current: 8, minimum: 40, status: 'critical' },
];

const recentActivities = [
  { time: '10 mins ago', action: 'New sale completed', amount: 'Rs. 2,450', user: 'Cashier 1' },
  { time: '25 mins ago', action: 'Stock updated', amount: '150 items', user: 'Stock Manager' },
  { time: '1 hour ago', action: 'New supplier added', amount: 'ABC Foods Ltd', user: 'Admin' },
  { time: '2 hours ago', action: 'Employee checked in', amount: 'John Doe', user: 'System' },
];

export default function AdminDashboard({ userRole, onLogout }: AdminDashboardProps) {
  return (
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Sales Today</p>
                <h2 className="text-gray-800">Rs. 45,230</h2>
                <p className="text-green-600 text-sm mt-2">+12.5% from yesterday</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Products</p>
                <h2 className="text-gray-800">1,245</h2>
                <p className="text-green-600 text-sm mt-2">+23 new items</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Customers</p>
                <h2 className="text-gray-800">3,567</h2>
                <p className="text-green-600 text-sm mt-2">+145 this month</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Orders Today</p>
                <h2 className="text-gray-800">182</h2>
                <p className="text-green-600 text-sm mt-2">+8.2% from yesterday</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-800 mb-4">Monthly Sales & Profit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#16a34a" name="Sales (Rs.)" />
                <Bar dataKey="profit" fill="#0ea5e9" name="Profit (Rs.)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-800 mb-4">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} name="Sales (Rs.)" />
                <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2} name="Profit (Rs.)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-700" />
              <h3 className="text-gray-800">Top Selling Products</h3>
            </div>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sold} units sold</p>
                  </div>
                  <p className="text-green-700">{product.revenue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-700" />
              <h3 className="text-gray-800">Low Stock Alerts</h3>
            </div>
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-800">{item.name}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'critical' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current: {item.current}</span>
                    <span className="text-gray-600">Min: {item.minimum}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${(item.current / item.minimum) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b last:border-0">
                <div>
                  <p className="text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time} • {activity.user}</p>
                </div>
                <p className="text-gray-700">{activity.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
