const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Employee = require('../models/Employee');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const { getActivities } = require('../utils/activityTracker');

// Helper function to format time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " mins ago";
  }
  return Math.floor(seconds) + " secs ago";
}

// @desc    Get complete dashboard data (compatibility route)
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's sales
    const todaySales = await Sale.find({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    const todayTotalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayOrderCount = todaySales.length;

    // Yesterday's sales for comparison
    const yesterdaySales = await Sale.find({
      createdAt: { $gte: yesterday, $lt: today },
    });
    const yesterdayTotalSales = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);

    // Sales percentage change
    const salesChange = yesterdayTotalSales > 0
      ? (((todayTotalSales - yesterdayTotalSales) / yesterdayTotalSales) * 100).toFixed(1)
      : 0;

    // Total counts
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();

    // Low stock items
    const lowStockItems = await Product.find({
      $or: [{ status: 'low-stock' }, { status: 'out-of-stock' }],
    })
      .sort({ quantity: 1 })
      .limit(10);

    // Top selling products (from recent sales)
    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Recent sales for activity feed
    const recentSales = await Sale.find()
      .populate('cashier', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Sales data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$total' },
          profit: { $sum: { $multiply: ['$total', 0.3] } }, // Estimated 30% profit margin
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const salesData = monthlySales.map((item) => ({
      month: monthNames[item._id.month - 1],
      sales: item.sales,
      profit: Math.round(item.profit),
    }));

    // Get real recent activities using in-memory tracker
    const recentActivities = getActivities();

    res.json({
      success: true,
      data: {
        stats: {
          totalSales: todayTotalSales,
          totalOrders: todayOrderCount,
          totalProducts,
          totalEmployees,
          totalCustomers,
          totalSuppliers,
          lowStockCount: lowStockItems.length,
          pendingOrders: todayOrderCount
        },
        salesData,
        topProducts: topProducts.map(p => ({
          name: p._id,
          sold: p.totalSold,
          revenue: `Rs. ${p.totalRevenue.toLocaleString()}`
        })),
        lowStockItems: lowStockItems.map(item => ({
          name: item.name,
          current: item.quantity,
          minimum: item.minStock,
          status: item.status === 'out-of-stock' ? 'critical' : 'low'
        })),
        recentActivities,
        todayTotalSales,
        todayOrderCount,
        salesChange: parseFloat(salesChange),
        totalProducts,
        totalCustomers,
        lowStockItems,
        topProducts,
        recentSales,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard overview data
// @route   GET /api/dashboard/overview
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's sales
    const todaySales = await Sale.find({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    const todayTotalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayOrderCount = todaySales.length;

    // Yesterday's sales for comparison
    const yesterdaySales = await Sale.find({
      createdAt: { $gte: yesterday, $lt: today },
    });
    const yesterdayTotalSales = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);

    // Sales percentage change
    const salesChange = yesterdayTotalSales > 0
      ? (((todayTotalSales - yesterdayTotalSales) / yesterdayTotalSales) * 100).toFixed(1)
      : 0;

    // Total counts
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // Low stock items
    const lowStockItems = await Product.find({
      $or: [{ status: 'low-stock' }, { status: 'out-of-stock' }],
    })
      .sort({ quantity: 1 })
      .limit(10);

    // Top selling products (from recent sales)
    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Recent sales for activity feed
    const recentSales = await Sale.find()
      .populate('cashier', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        todayTotalSales,
        todayOrderCount,
        salesChange: parseFloat(salesChange),
        totalProducts,
        totalCustomers,
        lowStockItems,
        topProducts,
        recentSales,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly sales data for charts
// @route   GET /api/dashboard/sales-chart
// @access  Private
exports.getSalesChart = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const chartData = monthlySales.map((item) => ({
      month: monthNames[item._id.month - 1],
      sales: item.sales,
      profit: Math.round(item.sales * 0.3), // Estimated 30% profit margin
    }));

    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get daily sales for the current week
// @route   GET /api/dashboard/weekly-sales
// @access  Private
exports.getWeeklySales = async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const dailySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          sales: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const chartData = dayNames.map((day, index) => {
      const found = dailySales.find((s) => s._id === index + 1);
      return {
        day,
        sales: found ? found.sales : 0,
      };
    });

    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sales by category for pie chart
// @route   GET /api/dashboard/category-sales
// @access  Private
exports.getCategorySales = async (req, res) => {
  try {
    const categorySales = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product.category',
          amount: { $sum: '$items.subtotal' },
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const totalAmount = categorySales.reduce((sum, cat) => sum + cat.amount, 0);

    const chartData = categorySales.map((cat) => ({
      name: cat._id || 'Other',
      value: totalAmount > 0 ? Math.round((cat.amount / totalAmount) * 100) : 0,
      amount: cat.amount,
    }));

    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
