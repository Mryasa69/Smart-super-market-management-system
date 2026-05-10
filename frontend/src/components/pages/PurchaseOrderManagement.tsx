import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, ShoppingCart, Calendar, DollarSign, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiService, PurchaseOrder } from '../../services/api';

interface PurchaseOrderManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
}

export default function PurchaseOrderManagement({ userRole, onLogout }: PurchaseOrderManagementProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    supplierId: '',
    orderDate: '',
    expectedDelivery: '',
    status: 'pending' as 'pending' | 'confirmed' | 'delivered' | 'cancelled',
    items: [] as Array<{productId: string, name: string, quantity: number, price: number}>
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPurchaseOrders();
      if (response.success && response.data) {
        setPurchaseOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const orderData = {
        ...formData,
        totalAmount: formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        itemCount: formData.items.length
      };
      
      let response;
      if (editingOrder) {
        response = await apiService.updatePurchaseOrder(editingOrder._id, orderData);
        if (response.success) {
          alert('Purchase order updated successfully!');
        } else {
          alert('Failed to update purchase order: ' + response.message);
        }
      } else {
        response = await apiService.createPurchaseOrder(orderData);
        if (response.success) {
          alert('Purchase order created successfully!');
        } else {
          alert('Failed to create purchase order: ' + response.message);
        }
      }
      
      if (response.success) {
        setShowAddModal(false);
        setEditingOrder(null);
        setFormData({
          supplierId: '',
          orderDate: '',
          expectedDelivery: '',
          status: 'pending',
          items: []
        });
        loadPurchaseOrders();
      }
    } catch (error) {
      alert('Error saving purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setFormData({
      supplierId: order.supplierId,
      orderDate: order.orderDate,
      expectedDelivery: order.expectedDelivery,
      status: order.status,
      items: order.items || []
    });
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingOrder(null);
    setFormData({
      supplierId: '',
      orderDate: '',
      expectedDelivery: '',
      status: 'pending',
      items: []
    });
  };

  const addItemToOrder = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', name: '', quantity: 1, price: 0 }]
    }));
  };

  const updateItemInOrder = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItemFromOrder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        const response = await apiService.deletePurchaseOrder(id);
        if (response.success) {
          setPurchaseOrders(purchaseOrders.filter((o) => o._id !== id));
        } else {
          alert('Failed to delete purchase order: ' + response.message);
        }
      } catch (error) {
        alert('Error deleting purchase order');
      }
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading purchase orders...</div>
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
            <h1 className="text-gray-800">Purchase Order Management</h1>
            <p className="text-gray-600">Manage your purchase orders and supplier deliveries</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
          >
            <Plus className="w-5 h-5" />
            Create Purchase Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Total Orders</p>
            <h2 className="text-gray-800">{purchaseOrders.length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Pending</p>
            <h2 className="text-yellow-700">{purchaseOrders.filter((o) => o.status === 'pending').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Confirmed</p>
            <h2 className="text-blue-700">{purchaseOrders.filter((o) => o.status === 'confirmed').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Delivered</p>
            <h2 className="text-green-700">{purchaseOrders.filter((o) => o.status === 'delivered').length}</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-gray-700">Order Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Expected Delivery</th>
                  <th className="px-6 py-3 text-left text-gray-700">Items</th>
                  <th className="px-6 py-3 text-left text-gray-700">Total Amount</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">#{order._id.slice(-8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.expectedDelivery).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <p className="text-gray-900 font-medium">{order.itemCount}</p>
                        <p className="text-gray-500 text-sm">items</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
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

        {/* Add/Edit Purchase Order Modal */}
        {(showAddModal || editingOrder) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-gray-800 mb-4">
                {editingOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
              </h2>
              <form onSubmit={handleSaveOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Supplier</option>
                  <option value="supplier1">Dairy Farm Ltd</option>
                  <option value="supplier2">Golden Bakery</option>
                  <option value="supplier3">Fresh Farms</option>
                </select>
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  placeholder="Order Date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="date"
                  name="expectedDelivery"
                  value={formData.expectedDelivery}
                  onChange={handleInputChange}
                  placeholder="Expected Delivery"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Items Section */}
              <div className="mt-6">
                <h3 className="text-gray-800 mb-4">Order Items</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select Product</option>
                      <option value="product1">Fresh Milk 1L</option>
                      <option value="product2">White Bread</option>
                      <option value="product3">Tomatoes 1kg</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Add Item
                    </button>
                  </div>
                </div>
              </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
                  >
                    {isSubmitting ? (editingOrder ? 'Updating...' : 'Creating...') : (editingOrder ? 'Update Order' : 'Create Order')}
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
