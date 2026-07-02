import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, Package, Filter, Download, QrCode } from 'lucide-react';
import { apiService, Product } from '../../services/api';

interface InventoryManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
}


export default function InventoryManagement({ userRole, onLogout }: InventoryManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dairy',
    sku: '',
    quantity: 0,
    price: 0,
    minStock: 0,
    supplier: '',
    specialOffers: false,
    weeklyDeals: false,
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let response;
      if (editingProduct) {
        response = await apiService.updateProduct(editingProduct._id, formData);
        if (response.success) {
          alert('Product updated successfully!');
        } else {
          alert('Failed to update product: ' + response.message);
        }
      } else {
        response = await apiService.createProduct(formData);
        if (response.success) {
          alert('Product added successfully!');
        } else {
          alert('Failed to add product: ' + response.message);
        }
      }
      
      if (response.success) {
        setShowAddModal(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          category: 'Dairy',
          sku: '',
          quantity: 0,
          price: 0,
          minStock: 0,
          supplier: '',
          specialOffers: false,
          weeklyDeals: false,
          image: ''
        });
        loadProducts(); // Reload products
      }
    } catch (error) {
      alert('Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' || name === 'minStock' ? Number(value) : value
    }));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      sku: product.sku,
      quantity: product.quantity,
      price: product.price,
      minStock: product.minStock,
      supplier: typeof product.supplier === 'string' ? product.supplier : (product.supplier && typeof product.supplier === 'object' ? product.supplier._id : ''),
      specialOffers: product.specialOffers || false,
      weeklyDeals: product.weeklyDeals || false,
      image: product.image || ''
    });
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Dairy',
      sku: '',
      quantity: 0,
      price: 0,
      minStock: 0,
      supplier: '',
      specialOffers: false,
      weeklyDeals: false,
      image: ''
    });
  };

  const categories = ['all', 'Dairy', 'Bakery', 'Vegetables', 'Meat', 'Grains', 'Beverages', 'Snacks', 'Fruits', 'Other'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await apiService.deleteProduct(id);
        if (response.success) {
          setProducts(products.filter((p) => p._id !== id));
        } else {
          alert('Failed to delete product: ' + response.message);
        }
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-orange-100 text-orange-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductStatus = (product: Product): string => {
    if (product.quantity === 0) return 'out-of-stock';
    if (product.quantity <= product.minStock) return 'low-stock';
    return 'in-stock';
  };

  return (
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800">Inventory Management</h1>
            <p className="text-gray-600">Manage your product stock and inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Total Products</p>
            <h2 className="text-gray-800">{products.length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">In Stock</p>
            <h2 className="text-green-700">{products.filter((p) => p.status === 'in-stock').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Low Stock</p>
            <h2 className="text-orange-700">{products.filter((p) => p.status === 'low-stock').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Out of Stock</p>
            <h2 className="text-red-700">{products.filter((p) => p.status === 'out-of-stock').length}</h2>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <QrCode className="w-4 h-4" />
              Generate Barcodes
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">SKU</th>
                  <th className="px-6 py-3 text-left text-gray-700">Product Name</th>
                  <th className="px-6 py-3 text-left text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-gray-700">Quantity</th>
                  <th className="px-6 py-3 text-left text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-gray-700">Supplier</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const status = getProductStatus(product);
                  return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className={`${product.quantity <= product.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.quantity}
                      </span>
                      <span className="text-gray-500"> / {product.minStock}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">Rs. {product.price}</td>
                    <td className="px-6 py-4 text-gray-600">{typeof product.supplier === 'string' ? product.supplier : (product.supplier && typeof product.supplier === 'object' ? product.supplier.name : '')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                        {status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {(showAddModal || editingProduct) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-gray-800 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {categories.filter((c) => c !== 'all').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter supplier"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter quantity"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Minimum Stock</label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter minimum stock"
                      min="0"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter image URL (Unsplash/Imgur etc.)"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Price (Rs.)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                {/* Promotion Options */}
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <h3 className="text-sm font-bold text-green-800 uppercase">Promotion Settings</h3>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="specialOffers"
                        checked={formData.specialOffers}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialOffers: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700 group-hover:text-green-700 transition-colors">Add to Special Offers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="weeklyDeals"
                        checked={formData.weeklyDeals}
                        onChange={(e) => setFormData(prev => ({ ...prev, weeklyDeals: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700 group-hover:text-green-700 transition-colors">Add to Weekly Deals</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
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
                    {isSubmitting ? (editingProduct ? 'Updating...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
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
