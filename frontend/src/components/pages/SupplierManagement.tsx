import { useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, MapPin, FileText } from 'lucide-react';

interface SupplierManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
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

interface PurchaseOrder {
  id: number;
  supplierId: number;
  orderDate: string;
  expectedDelivery: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: number;
}

const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Dairy Farm Ltd',
    contactPerson: 'Sunil Perera',
    email: 'contact@dairyfarm.lk',
    phone: '+94 11 234 5678',
    address: 'Colombo 05, Sri Lanka',
    category: 'Dairy Products',
    rating: 4.5,
    totalOrders: 125,
    activeOrders: 3,
    lastDelivery: '2025-12-09',
    status: 'active',
  },
  {
    id: 2,
    name: 'Fresh Farms',
    contactPerson: 'Kamal Silva',
    email: 'info@freshfarms.lk',
    phone: '+94 11 345 6789',
    address: 'Nuwara Eliya, Sri Lanka',
    category: 'Vegetables & Fruits',
    rating: 4.8,
    totalOrders: 98,
    activeOrders: 2,
    lastDelivery: '2025-12-10',
    status: 'active',
  },
  {
    id: 3,
    name: 'ABC Poultry',
    contactPerson: 'Nimal Fernando',
    email: 'sales@abcpoultry.lk',
    phone: '+94 11 456 7890',
    address: 'Gampaha, Sri Lanka',
    category: 'Meat & Poultry',
    rating: 4.2,
    totalOrders: 87,
    activeOrders: 1,
    lastDelivery: '2025-12-08',
    status: 'active',
  },
  {
    id: 4,
    name: 'Golden Bakery',
    contactPerson: 'Chamari Wickrama',
    email: 'orders@goldenbakery.lk',
    phone: '+94 11 567 8901',
    address: 'Kandy, Sri Lanka',
    category: 'Bakery Products',
    rating: 4.6,
    totalOrders: 156,
    activeOrders: 4,
    lastDelivery: '2025-12-10',
    status: 'active',
  },
  {
    id: 5,
    name: 'Rice Mills Co',
    contactPerson: 'Raveen Mendis',
    email: 'contact@ricemills.lk',
    phone: '+94 11 678 9012',
    address: 'Ampara, Sri Lanka',
    category: 'Grains & Rice',
    rating: 3.9,
    totalOrders: 45,
    activeOrders: 0,
    lastDelivery: '2025-11-28',
    status: 'inactive',
  },
];

const purchaseOrders: PurchaseOrder[] = [
  {
    id: 1001,
    supplierId: 1,
    orderDate: '2025-12-08',
    expectedDelivery: '2025-12-12',
    status: 'confirmed',
    totalAmount: 125000,
    items: 15,
  },
  {
    id: 1002,
    supplierId: 2,
    orderDate: '2025-12-09',
    expectedDelivery: '2025-12-11',
    status: 'pending',
    totalAmount: 85000,
    items: 22,
  },
  {
    id: 1003,
    supplierId: 4,
    orderDate: '2025-12-10',
    expectedDelivery: '2025-12-13',
    status: 'confirmed',
    totalAmount: 45000,
    items: 18,
  },
  {
    id: 1004,
    supplierId: 3,
    orderDate: '2025-12-07',
    expectedDelivery: '2025-12-10',
    status: 'delivered',
    totalAmount: 156000,
    items: 12,
  },
];

export default function SupplierManagement({ userRole, onLogout }: SupplierManagementProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [orders] = useState<PurchaseOrder[]>(purchaseOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const categories = ['all', 'Dairy Products', 'Vegetables & Fruits', 'Meat & Poultry', 'Bakery Products', 'Grains & Rice', 'Beverages'];

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || supplier.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteSupplier = (id: number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800">Supplier Management</h1>
            <p className="text-gray-600">Manage suppliers and purchase orders</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50"
            >
              <FileText className="w-5 h-5" />
              Create Purchase Order
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
            >
              <Plus className="w-5 h-5" />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Total Suppliers</p>
            <h2 className="text-gray-800">{suppliers.length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Active Suppliers</p>
            <h2 className="text-green-700">{suppliers.filter((s) => s.status === 'active').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Active Orders</p>
            <h2 className="text-blue-700">
              {orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length}
            </h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Avg Rating</p>
            <h2 className="text-yellow-700">
              {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)} ★
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-gray-800">Suppliers List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Supplier</th>
                  <th className="px-6 py-3 text-left text-gray-700">Contact Person</th>
                  <th className="px-6 py-3 text-left text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-gray-700">Rating</th>
                  <th className="px-6 py-3 text-left text-gray-700">Orders</th>
                  <th className="px-6 py-3 text-left text-gray-700">Last Delivery</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          {supplier.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {supplier.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {supplier.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{supplier.contactPerson}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {supplier.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{supplier.rating} ★</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">Total: {supplier.totalOrders}</p>
                        <p className="text-sm text-blue-600">Active: {supplier.activeOrders}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{supplier.lastDelivery}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {supplier.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSupplier(supplier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-gray-800">Recent Purchase Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-gray-700">Supplier</th>
                  <th className="px-6 py-3 text-left text-gray-700">Order Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Expected Delivery</th>
                  <th className="px-6 py-3 text-left text-gray-700">Items</th>
                  <th className="px-6 py-3 text-left text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => {
                  const supplier = suppliers.find((s) => s.id === order.supplierId);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 text-gray-900">{supplier?.name}</td>
                      <td className="px-6 py-4 text-gray-600">{order.orderDate}</td>
                      <td className="px-6 py-4 text-gray-600">{order.expectedDelivery}</td>
                      <td className="px-6 py-4 text-gray-900">{order.items} items</td>
                      <td className="px-6 py-4 text-gray-900">Rs. {order.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${getOrderStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-gray-800 mb-4">Add New Supplier</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Supplier Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Contact Person</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter contact person"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter phone"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      {categories.filter((c) => c !== 'all').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    Add Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Purchase Order Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-gray-800 mb-4">Create Purchase Order</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Supplier</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      {suppliers.filter((s) => s.status === 'active').map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Expected Delivery</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add order notes..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
