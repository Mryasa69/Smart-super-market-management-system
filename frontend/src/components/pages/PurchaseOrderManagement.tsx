import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, ShoppingCart, Calendar, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiService, PurchaseOrder } from '../../services/api';

interface PurchaseOrderManagementProps {
  userRole?: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout?: () => void;
}

interface POItem {
  product: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export default function PurchaseOrderManagement({ userRole, onLogout }: PurchaseOrderManagementProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    supplierId: '',
    orderDate: '',
    expectedDelivery: '',
    status: 'pending' as 'pending' | 'approved' | 'received' | 'cancelled',
    items: [] as POItem[]
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    name: '',
    quantity: 1,
    unitCost: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPOData();
  }, []);

  const loadPOData = async () => {
    try {
      setLoading(true);
      const [poRes, supRes, prodRes] = await Promise.all([
        apiService.getPurchaseOrders(),
        apiService.getSuppliers(),
        apiService.getProducts()
      ]);
      if (poRes.success && poRes.data) {
        setPurchaseOrders(poRes.data as any);
      }
      if (supRes.success && supRes.data) {
        setSuppliers(supRes.data as any);
      }
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data as any);
      }
    } catch (error) {
      console.error('Error loading purchase order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one item to the purchase order!');
      return;
    }
    setIsSubmitting(true);

    try {
      const orderData: any = {
        supplier: formData.supplierId,
        orderDate: formData.orderDate,
        expectedDelivery: formData.expectedDelivery,
        status: formData.status,
        totalAmount: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
        items: formData.items,
        notes: `PO containing ${formData.items.length} different product lines.`
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
        loadPOData();
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

  const handleProductSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    const selectedProd = products.find((p: any) => p._id === prodId);
    if (selectedProd) {
      setNewItem({
        productId: prodId,
        name: selectedProd.name,
        quantity: 1,
        unitCost: selectedProd.cost || selectedProd.price || 0
      });
    } else {
      setNewItem({
        productId: '',
        name: '',
        quantity: 1,
        unitCost: 0
      });
    }
  };

  const handleAddItemToPO = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newItem.productId) {
      alert('Please select a product first!');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product: newItem.productId,
        name: newItem.name,
        quantity: newItem.quantity,
        unitCost: newItem.unitCost
      }]
    }));
    setNewItem({
      productId: '',
      name: '',
      quantity: 1,
      unitCost: 0
    });
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    const dateFormatted = order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '';
    const deliveryFormatted = order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : '';
    const supplierId = typeof order.supplier === 'string'
      ? order.supplier
      : (typeof order.supplierId === 'object' && order.supplierId !== null
          ? (order.supplierId as any)._id
          : (typeof order.supplierId === 'string' ? order.supplierId : ''));

    setFormData({
      supplierId: supplierId,
      orderDate: dateFormatted,
      expectedDelivery: deliveryFormatted,
      status: (order.status as any) || 'pending',
      items: Array.isArray(order.items) ? order.items as any : []
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
    setNewItem({
      productId: '',
      name: '',
      quantity: 1,
      unitCost: 0
    });
  };

  const removeItemFromOrder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const getSupplierName = (order: PurchaseOrder): string => {
    if (typeof order.supplier === 'object' && order.supplier !== null) {
      return (order.supplier as any).name || 'Unknown';
    }
    if (order.supplierId && typeof order.supplierId === 'object') {
      return (order.supplierId as any).name || 'Unknown';
    }
    if (order.supplierName) return order.supplierName;
    return 'Unknown';
  };

  const filteredOrders = purchaseOrders.filter((order) => {
    const orderIdString = order._id.toLowerCase();
    const supplierName = getSupplierName(order).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = orderIdString.includes(query) || supplierName.includes(query);
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
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'received':
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
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'received':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getItemsCount = (order: PurchaseOrder): number => {
    if (Array.isArray(order.items)) {
      return (order.items as any[]).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
    return 0;
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
            <p className="text-gray-600">Approved</p>
            <h2 className="text-blue-700">{purchaseOrders.filter((o) => o.status === 'approved').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Received</p>
            <h2 className="text-green-700">{purchaseOrders.filter((o) => o.status === 'received').length}</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by ID or supplier name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="received">Received</option>
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
                  <th className="px-6 py-3 text-left text-gray-700">Supplier</th>
                  <th className="px-6 py-3 text-left text-gray-700">Order Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Expected Delivery</th>
                  <th className="px-6 py-3 text-left text-gray-700">Items Count</th>
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
                        <span className="text-gray-900 font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">
                      {getSupplierName(order)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {getItemsCount(order)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-900 font-semibold">
                        <span>Rs. </span>
                        <span>{(order.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
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
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Supplier</label>
                    <select
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((sup: any) => (
                        <option key={sup._id} value={sup._id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                    >
                      <option value="pending">PENDING</option>
                      <option value="approved">APPROVED</option>
                      <option value="received">RECEIVED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Order Date</label>
                    <input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Expected Delivery Date</label>
                    <input
                      type="date"
                      name="expectedDelivery"
                      value={formData.expectedDelivery}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-gray-800 mb-2 font-bold text-sm">Add Products to Order</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-xs text-gray-500 mb-1">Product</label>
                      <select
                        value={newItem.productId}
                        onChange={handleProductSelectChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="">Select Product</option>
                        {products.map((p: any) => (
                          <option key={p._id} value={p._id}>{p.name} (Rs. {p.cost || p.price})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Math.max(1, Number(e.target.value)) }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItemToPO}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors h-[38px]"
                    >
                      Add Item
                    </button>
                  </div>

                  {/* List of currently added items */}
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border text-sm">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs. {item.unitCost}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-700">Rs. {(item.quantity * item.unitCost).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => removeItemFromOrder(index)}
                            className="text-red-500 hover:text-red-700 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.items.length === 0 && (
                      <p className="text-gray-400 text-xs text-center italic py-4">No items added to this order yet.</p>
                    )}
                  </div>

                  {formData.items.length > 0 && (
                    <div className="flex justify-between font-bold text-gray-800 text-sm border-t pt-3 mt-3">
                      <span>Estimated Order Value:</span>
                      <span className="text-green-700 text-base">Rs. {formData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}
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