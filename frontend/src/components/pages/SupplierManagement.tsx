import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, FileText, Star, XCircle } from 'lucide-react';
import { apiService, Supplier, PurchaseOrder } from '../../services/api';

interface SupplierManagementProps {
  userRole?: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout?: () => void;
}

export default function SupplierManagement({ userRole, onLogout }: SupplierManagementProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Dairy Products',
    status: 'active' as 'active' | 'inactive'
  });

  const [poFormData, setPoFormData] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    status: 'pending' as 'pending' | 'confirmed' | 'delivered' | 'cancelled',
    items: 0,
    totalAmount: 0,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, ordersRes] = await Promise.all([
        apiService.getSuppliers(),
        apiService.getPurchaseOrders()
      ]);

      if (suppliersRes.success && suppliersRes.data) {
        setSuppliers(suppliersRes.data as any);
      }
      if (ordersRes.success && ordersRes.data) {
        setPurchaseOrders(ordersRes.data as any);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      if (editingSupplier) {
        response = await apiService.updateSupplier(editingSupplier._id, formData);
        if (response.success) {
          alert('Supplier updated successfully!');
        } else {
          alert('Failed to update supplier: ' + response.message);
        }
      } else {
        response = await apiService.createSupplier(formData);
        if (response.success) {
          alert('Supplier added successfully!');
        } else {
          alert('Failed to add supplier: ' + response.message);
        }
      }

      if (response.success) {
        handleModalClose();
        loadData();
      }
    } catch (error) {
      alert('Error saving supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        ...poFormData,
        items: [],
        notes: poFormData.notes
      };

      let response;
      if (editingPO) {
        response = await apiService.updatePurchaseOrder(editingPO._id, payload);
        if (response.success) {
          alert('Purchase order updated successfully!');
        } else {
          alert('Failed to update purchase order: ' + response.message);
        }
      } else {
        response = await apiService.createPurchaseOrder(payload);
        if (response.success) {
          alert('Purchase order created successfully!');
        } else {
          alert('Failed to create purchase order: ' + response.message);
        }
      }

      if (response.success) {
        handlePOModalClose();
        loadData();
      }
    } catch (error) {
      alert('Error saving purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePOInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPoFormData(prev => ({
      ...prev,
      [name]: name === 'items' || name === 'totalAmount' ? Number(value) : value
    }));
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      category: supplier.category || 'Dairy Products',
      status: (supplier.status as 'active' | 'inactive') || 'active'
    });
    setShowAddModal(true);
  };

  const supplierIdToString = (id: PurchaseOrder['supplierId']): string => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    return id._id;
  };

  const supplierNameFrom = (order: PurchaseOrder): string => {
    if (order.supplierName) return order.supplierName;
    if (typeof order.supplier === 'object' && order.supplier !== null) {
      return (order.supplier as any).name || 'Unknown';
    }
    if (order.supplierId && typeof order.supplierId === 'object') {
      return (order.supplierId as any).name || 'Unknown';
    }
    return 'Unknown';
  };

  const handleEditPO = (po: PurchaseOrder) => {
    setEditingPO(po);
    setPoFormData({
      supplierId: supplierIdToString(po.supplierId),
      orderDate: po.orderDate ? new Date(po.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDelivery: po.expectedDelivery ? new Date(po.expectedDelivery).toISOString().split('T')[0] : '',
      status: (po.status as any) || 'pending',
      items: Array.isArray(po.items) ? po.items.length : 0,
      totalAmount: po.totalAmount || 0,
      notes: po.notes || ''
    });
    setShowPOModal(true);
  };

  const handlePOModalClose = () => {
    setShowPOModal(false);
    setEditingPO(null);
    setPoFormData({
      supplierId: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      status: 'pending',
      items: 0,
      totalAmount: 0,
      notes: ''
    });
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: 'Dairy Products',
      status: 'active'
    });
  };

  const categories = ['all', 'Dairy Products', 'Bakery', 'Vegetables & Fruits', 'Meat & Poultry', 'Grains & Rice', 'Beverages', 'Snacks & Sweets', 'Frozen Foods', 'Personal Care'];

  const filteredSuppliers = suppliers.filter((supplier) => {
    const name = (supplier.name || '').toLowerCase();
    const contact = (supplier.contactPerson || '').toLowerCase();
    const email = (supplier.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || contact.includes(query) || email.includes(query);
    const matchesCategory = filterCategory === 'all' || supplier.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteSupplier = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await apiService.deleteSupplier(id);
        if (response.success) {
          loadData();
        } else {
          alert('Failed to delete supplier: ' + response.message);
        }
      } catch (error) {
        alert('Error deleting supplier');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'delivered':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPOStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
            <p className="text-gray-600">Manage suppliers and purchase orders</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPOModal(true)}
              className="flex items-center gap-2 bg-white text-green-700 border border-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Create Purchase Order
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Total Suppliers</p>
            <h2 className="text-2xl font-bold text-gray-800">{suppliers.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Active Suppliers</p>
            <h2 className="text-2xl font-bold text-green-600">{suppliers.filter((s) => s.status === 'active').length}</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Active Orders</p>
            <h2 className="text-2xl font-bold text-blue-600">{suppliers.reduce((sum, s) => sum + (s.activeOrders || 0), 0)}</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Avg Rating</p>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {(suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / (suppliers.length || 1)).toFixed(1)}
              </h2>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Supplier Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Suppliers List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 font-medium uppercase text-xs">
                  <th className="px-6 py-3 text-left">Supplier</th>
                  <th className="px-6 py-3 text-left">Contact Person</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Rating</th>
                  <th className="px-6 py-3 text-left">Orders</th>
                  <th className="px-6 py-3 text-left">Last Delivery</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold">{supplier.name}</p>
                          <div className="flex flex-col text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {supplier.phone || '-'}</span>
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {supplier.email || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{supplier.contactPerson || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                        {supplier.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        {supplier.rating ?? 0} <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="text-gray-900">Total: {supplier.totalOrders ?? 0}</p>
                        <p className="text-blue-600">Active: {supplier.activeOrders ?? 0}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {supplier.lastDelivery ? new Date(supplier.lastDelivery).toISOString().split('T')[0] : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusColor(supplier.status || 'inactive')}`}>
                        {(supplier.status || 'inactive').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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

        {/* Recent Purchase Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Purchase Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 font-medium uppercase text-xs">
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Supplier</th>
                  <th className="px-6 py-3 text-left">Order Date</th>
                  <th className="px-6 py-3 text-left">Expected Delivery</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchaseOrders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{order._id.slice(-4).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {supplierNameFrom(order)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {Array.isArray(order.items) ? order.items.length : 0} items
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Rs. {(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${getPOStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditPO(order)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No purchase orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Supplier Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {categories.filter(c => c !== 'all').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 font-medium transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : (editingSupplier ? 'Update Supplier' : 'Add Supplier')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create/Edit Purchase Order Modal */}
        {showPOModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingPO ? 'Edit Purchase Order' : 'Create Purchase Order'}
                </h2>
                <button onClick={handlePOModalClose} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSavePO} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Supplier</label>
                    <select
                      name="supplierId"
                      value={poFormData.supplierId}
                      onChange={handlePOInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      disabled={!!editingPO}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select
                      name="status"
                      value={poFormData.status}
                      onChange={handlePOInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                    >
                      <option value="pending">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="delivered">DELIVERED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Order Date</label>
                    <input
                      type="date"
                      name="orderDate"
                      value={poFormData.orderDate}
                      onChange={handlePOInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Expected Delivery</label>
                    <input
                      type="date"
                      name="expectedDelivery"
                      value={poFormData.expectedDelivery}
                      onChange={handlePOInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Number of Items</label>
                    <input
                      type="number"
                      name="items"
                      value={poFormData.items}
                      onChange={handlePOInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Total Amount (Rs.)</label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={poFormData.totalAmount}
                      onChange={handlePOInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Notes</label>
                    <textarea
                      name="notes"
                      value={poFormData.notes}
                      onChange={handlePOInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handlePOModalClose}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 font-medium transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : (editingPO ? 'Update Order' : 'Create Purchase Order')}
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