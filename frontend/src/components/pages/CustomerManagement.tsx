import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Star, Gift, TrendingUp, Mail, Phone } from 'lucide-react';
import { apiService, CustomerRecord, CustomerOrder } from '../../services/api';

interface CustomerManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return 'No purchases yet';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function CustomerManagement({ userRole, onLogout }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        setError(response.message || 'Failed to load customers');
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCustomerDetails = async (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setOrdersLoading(true);

    try {
      const response = await apiService.getCustomerOrders(customer._id);
      if (response.success && response.data) {
        setCustomerOrders(response.data);
      }
    } catch (err) {
      console.error('Error loading customer orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const tiers = ['all', 'Bronze', 'Silver', 'Gold', 'Platinum'];
  const avgLoyaltyPoints = customers.length
    ? Math.round(customers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / customers.length)
    : 0;

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesTier = filterTier === 'all' || customer.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return 'bg-orange-100 text-orange-800';
      case 'Silver':
        return 'bg-gray-100 text-gray-800';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Platinum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-gray-800">Customer Management</h1>
          <p className="text-gray-600">Manage customer data and loyalty programs</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Total Customers</p>
            <h2 className="text-gray-800">{customers.length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Avg Loyalty Points</p>
            <h2 className="text-blue-700">{avgLoyaltyPoints}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Total Revenue</p>
            <h2 className="text-green-700">
              Rs. {(customers.reduce((sum, c) => sum + c.totalPurchases, 0) / 1000).toFixed(0)}K
            </h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Platinum Members</p>
            <h2 className="text-purple-700">{customers.filter((c) => c.tier === 'Platinum').length}</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {tiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : tier}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loyalty Tiers Info */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-md">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-700" />
            Loyalty Program Tiers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-orange-700">Bronze</p>
              <p className="text-sm text-gray-600">0 - 999 points</p>
              <p className="text-xs text-gray-500 mt-1">5% discount</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-700">Silver</p>
              <p className="text-sm text-gray-600">1,000 - 1,999 points</p>
              <p className="text-xs text-gray-500 mt-1">10% discount</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-yellow-700">Gold</p>
              <p className="text-sm text-gray-600">2,000 - 4,999 points</p>
              <p className="text-xs text-gray-500 mt-1">15% discount</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-purple-700">Platinum</p>
              <p className="text-sm text-gray-600">5,000+ points</p>
              <p className="text-xs text-gray-500 mt-1">20% discount</p>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-gray-700">Contact</th>
                  <th className="px-6 py-3 text-left text-gray-700">Tier</th>
                  <th className="px-6 py-3 text-left text-gray-700">Loyalty Points</th>
                  <th className="px-6 py-3 text-left text-gray-700">Total Purchases</th>
                  <th className="px-6 py-3 text-left text-gray-700">Last Purchase</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No customers found yet. Customers appear here after they register and place orders.
                    </td>
                  </tr>
                ) : filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">
                          Member since {formatDate(customer.joinDate || customer.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${getTierColor(customer.tier)}`}>
                        <Star className="w-4 h-4" />
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-900">{customer.loyaltyPoints.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-gray-900">Rs. {customer.totalPurchases.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(customer.lastPurchase)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openCustomerDetails(customer)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-gray-800 mb-4">Customer Details</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Name</p>
                    <p className="text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <p className="text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Member Since</p>
                    <p className="text-gray-900">{formatDate(selectedCustomer.joinDate || selectedCustomer.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Tier</p>
                    <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 ${getTierColor(selectedCustomer.tier)}`}>
                      <Star className="w-4 h-4" />
                      {selectedCustomer.tier}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Loyalty Points</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-600" />
                      {selectedCustomer.loyaltyPoints.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Purchases</p>
                    <p className="text-gray-900">Rs. {selectedCustomer.totalPurchases.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last Purchase</p>
                    <p className="text-gray-900">{formatDate(selectedCustomer.lastPurchase)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-gray-800 mb-3">Purchase History</h3>
                  {ordersLoading ? (
                    <p className="text-gray-500">Loading orders...</p>
                  ) : customerOrders.length === 0 ? (
                    <p className="text-gray-500">No orders placed yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {customerOrders.map((order) => (
                        <div key={order._id} className="flex justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <span className="text-gray-700 block">
                              {formatDate(order.createdAt || order.date)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.orderNumber || order.id} · {order.status}
                            </span>
                          </div>
                          <span className="text-gray-900">Rs. {order.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
