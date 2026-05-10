import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, DollarSign, Clock, User, Plus, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiService } from '../../services/api';

interface AdminDashboardProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
}


export default function AdminDashboard({ userRole, onLogout }: AdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Set up interval to refresh dashboard data every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Use real API data with fallbacks
  const salesData = dashboardData?.salesData || [];
  const topProducts = dashboardData?.topProducts || [];
  const lowStockItems = dashboardData?.lowStockItems || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const stats = dashboardData?.stats || {};
  const todayTotalSales = dashboardData?.todayTotalSales || 0;
  const todayOrderCount = dashboardData?.todayOrderCount || 0;
  const salesChange = dashboardData?.salesChange || 0;

  // Helper functions for formatting
  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;
  const formatPercentage = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-200 text-red-800';
      case 'low': return 'bg-orange-200 text-orange-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  const getActivityIcon = (action: string) => {
    if (action.includes('sale')) return <ShoppingCart className="w-4 h-4 text-blue-600" />;
    if (action.includes('product') || action.includes('stock')) return <Package className="w-4 h-4 text-green-600" />;
    if (action.includes('employee')) return <User className="w-4 h-4 text-purple-600" />;
    if (action.includes('supplier')) return <Plus className="w-4 h-4 text-orange-600" />;
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

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
                <h2 className="text-gray-800">{formatCurrency(todayTotalSales)}</h2>
                <p className={`${salesChange >= 0 ? 'text-green-600' : 'text-red-600'} text-sm mt-2`}>
                  {formatPercentage(salesChange)} from yesterday
                </p>
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
                <h2 className="text-gray-800">{stats.totalProducts || 0}</h2>
                <p className="text-green-600 text-sm mt-2">{stats.lowStockCount || 0} low stock items</p>
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
                <h2 className="text-gray-800">{stats.totalCustomers || 0}</h2>
                <p className="text-green-600 text-sm mt-2">Active customers</p>
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
                <h2 className="text-gray-800">{todayOrderCount}</h2>
                <p className="text-green-600 text-sm mt-2">{stats.pendingOrders || 0} pending orders</p>
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
              {lowStockItems.length > 0 ? lowStockItems.map((item, index) => (
                <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-800">{item.name}</p>
                    <span className={`px-2 py-1 rounded text-xs ${getStockStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current: {item.current}</span>
                    <span className="text-gray-600">Min: {item.minimum}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(item.status)}`}
                      style={{ width: `${Math.min((item.current / item.minimum) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No low stock items</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div>
                    <p className="text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time} • {activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-700 font-medium">{activity.amount}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
