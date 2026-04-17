import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, Package, Filter, Download, QrCode } from 'lucide-react';
import ActivityTracker from '../../utils/activityTracker';

interface InventoryManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | 'customer' | null;
  onLogout: () => void;
}

interface Product {
  id: string | number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  minStock: number;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  specialOffers?: boolean;
  weeklyDeals?: boolean;
  weeklyDealsAddedAt?: string | null;
}

const initialProducts: Product[] = [
  { id: 1, name: 'Fresh Milk 1L', category: 'Dairy', sku: 'MILK001', quantity: 150, price: 280, minStock: 50, supplier: 'Dairy Farm Ltd', status: 'in-stock' },
  { id: 2, name: 'White Bread', category: 'Bakery', sku: 'BREAD001', quantity: 80, price: 120, minStock: 30, supplier: 'Golden Bakery', status: 'in-stock' },
  { id: 3, name: 'Tomatoes 1kg', category: 'Vegetables', sku: 'VEG001', quantity: 15, price: 350, minStock: 50, supplier: 'Fresh Farms', status: 'low-stock' },
  { id: 4, name: 'Chicken 1kg', category: 'Meat', sku: 'MEAT001', quantity: 45, price: 850, minStock: 20, supplier: 'ABC Poultry', status: 'in-stock' },
  { id: 5, name: 'Rice 5kg', category: 'Grains', sku: 'RICE001', quantity: 0, price: 600, minStock: 10, supplier: 'Rice Mills', status: 'out-of-stock' },
  { id: 6, name: 'Orange Juice 1L', category: 'Beverages', sku: 'BEV001', quantity: 30, price: 320, minStock: 75, supplier: 'Fruit Drinks Co', status: 'low-stock' },
  { id: 7, name: 'Chocolate Bar', category: 'Snacks', sku: 'SNACK001', quantity: 200, price: 180, minStock: 100, supplier: 'Sweet Treats', status: 'in-stock' },
  { id: 8, name: 'Eggs (Dozen)', category: 'Dairy', sku: 'EGG001', quantity: 25, price: 450, minStock: 100, supplier: 'Dairy Farm Ltd', status: 'low-stock' },
];

export default function InventoryManagement({ userRole, onLogout }: InventoryManagementProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const activityTracker = ActivityTracker.getInstance();
  
  // Form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Dairy',
    supplier: '',
    quantity: 0,
    minStock: 10,
    price: 0,
    specialOffers: false,
    weeklyDeals: false,
  });

  const categories = ['all', 'Dairy', 'Bakery', 'Vegetables', 'Meat', 'Grains', 'Beverages', 'Snacks'];

  // Load products from localStorage and backend
  useEffect(() => {
    // Load products from localStorage first
    const localProducts = localStorage.getItem('products');
    
    if (localProducts) {
      try {
        const parsed = JSON.parse(localProducts);
        setProducts(parsed);
      } catch (e) {
        console.error('Failed to parse localStorage products:', e);
      }
    }
    
    // Try to load from backend
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.ok ? response.json() : Promise.reject('Failed'))
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          const transformed = data.data.map((product: any) => ({
            id: product._id || product.id,
            name: product.name || 'Unknown',
            category: product.category || 'Other',
            sku: product.sku || '',
            quantity: product.quantity || 0,
            price: product.price || 0,
            minStock: product.minStock || 10,
            supplier: product.supplier || 'Unknown',
            status: product.status || 'in-stock',
            specialOffers: product.specialOffers || false,
            weeklyDeals: product.weeklyDeals || false,
            weeklyDealsAddedAt: product.weeklyDealsAddedAt || null,
          }));
          setProducts(transformed);
          localStorage.setItem('products', JSON.stringify(transformed));
        }
      })
      .catch(e => console.log('Backend fetch failed:', e));
    }
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteProduct = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const productToDelete = products.find(p => p.id === id);
      
      // Try to delete from backend
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        } catch (error) {
          console.log('Backend delete failed, removing locally:', error);
        }
      }
      
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Trigger a custom event to notify other components (like HomePage) of the deletion
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: 'delete',
          product: productToDelete,
          allProducts: updatedProducts
        } 
      }));
      
      // Log activity
      if (productToDelete) {
        activityTracker.logProductDeleted(productToDelete.name);
      }
      
      alert('Product deleted successfully!');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔥 STARTING PRODUCT ADDITION 🔥');
    
    try {
      const token = localStorage.getItem('authToken');
      const requestData = {
        name: newProduct.name,
        category: newProduct.category,
        sku: newProduct.sku,
        quantity: newProduct.quantity,
        price: newProduct.price,
        minStock: newProduct.minStock,
        supplier: newProduct.supplier,
        barcode: newProduct.sku,
        specialOffers: newProduct.specialOffers || false,
        weeklyDeals: newProduct.weeklyDeals || false,
      };
      
      let apiSuccess = false;
      let backendProductId = null;
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Backend product creation response:', data);
            backendProductId = data.data?._id || data.data?.id || data.id;
            apiSuccess = true;
          }
        } catch (error) {
          console.log('Backend product creation failed:', error);
        }
      }

      const status = newProduct.quantity <= 0 ? 'out-of-stock' : 
                    newProduct.quantity <= newProduct.minStock ? 'low-stock' : 'in-stock';
      
      const product: Product = {
        id: backendProductId || (Math.max(...products.filter(p => typeof p.id === 'number').map(p => p.id as number), 0) + 1),
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        supplier: newProduct.supplier,
        quantity: newProduct.quantity,
        minStock: newProduct.minStock,
        price: newProduct.price,
        status: status as 'in-stock' | 'low-stock' | 'out-of-stock',
        specialOffers: newProduct.specialOffers || false,
        weeklyDeals: newProduct.weeklyDeals || false,
        weeklyDealsAddedAt: newProduct.weeklyDeals ? new Date().toISOString() : null,
      };

      const updatedProducts = [...products, product];
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Trigger a custom event to notify other components (like HomePage) of the addition
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: 'add',
          product: product,
          allProducts: updatedProducts
        } 
      }));
      
      // Log activity
      activityTracker.logProductAdded(product.name);
      
      setNewProduct({
        name: '',
        sku: '',
        category: 'Dairy',
        supplier: '',
        quantity: 0,
        minStock: 10,
        price: 0,
        specialOffers: false,
        weeklyDeals: false,
      });
      setShowAddModal(false);
      
      alert(apiSuccess ? 'Product added successfully!' : 'Product added locally');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const requestData = {
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        supplier: editingProduct.supplier,
        quantity: editingProduct.quantity,
        minStock: editingProduct.minStock,
        price: editingProduct.price,
        specialOffers: editingProduct.specialOffers || false,
        weeklyDeals: editingProduct.weeklyDeals || false,
      };
      
      let apiSuccess = false;
      
      if (token) {
        try {
          const response = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });
          
          if (response.ok) {
            apiSuccess = true;
          } else {
            console.error('Backend product update failed:', response.status);
          }
        } catch (error) {
          console.error('Backend product update failed:', error);
        }
      }

      const status = editingProduct.quantity <= 0 ? 'out-of-stock' : 
                    editingProduct.quantity <= editingProduct.minStock ? 'low-stock' : 'in-stock';
      
      const updatedProduct = {
        ...editingProduct,
        status: status as 'in-stock' | 'low-stock' | 'out-of-stock',
        specialOffers: editingProduct.specialOffers || false,
        weeklyDeals: editingProduct.weeklyDeals || false,
        weeklyDealsAddedAt: editingProduct.weeklyDeals && !editingProduct.weeklyDealsAddedAt 
          ? new Date().toISOString() 
          : editingProduct.weeklyDealsAddedAt,
      };

      // Always update locally (even if backend failed, to keep UI responsive)
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      );
      
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Trigger a custom event to notify other components (like HomePage) of the update
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: 'update',
          product: updatedProduct,
          allProducts: updatedProducts
        } 
      }));
      
      // Log activity
      activityTracker.logProductUpdated(updatedProduct.name);
      
      setEditingProduct(null);
      
      if (apiSuccess) {
        alert('Product updated successfully!');
      } else if (token) {
        alert('Product updated locally. Backend sync failed.');
      } else {
        alert('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 text-gray-600">{product.supplier}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)}`}>
                        {product.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
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

        {/* Add/Edit Product Modal */}
        {(showAddModal || editingProduct) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-gray-800 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={editingProduct ? editingProduct.name : newProduct.name}
                      onChange={(e) => editingProduct ? 
                        setEditingProduct({...editingProduct, name: e.target.value}) :
                        setNewProduct({...newProduct, name: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={editingProduct ? editingProduct.sku : newProduct.sku}
                      onChange={(e) => editingProduct ? 
                        setEditingProduct({...editingProduct, sku: e.target.value}) :
                        setNewProduct({...newProduct, sku: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select 
                      value={editingProduct ? editingProduct.category : newProduct.category}
                      onChange={(e) => editingProduct ? 
                        setEditingProduct({...editingProduct, category: e.target.value}) :
                        setNewProduct({...newProduct, category: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
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
                      value={editingProduct ? editingProduct.supplier : newProduct.supplier}
                      onChange={(e) => editingProduct ? 
                        setEditingProduct({...editingProduct, supplier: e.target.value}) :
                        setNewProduct({...newProduct, supplier: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter supplier"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                      onChange={(e) => editingProduct ? 
                        setEditingProduct({...editingProduct, quantity: parseInt(e.target.value) || 0}) :
                        setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Minimum Stock</label>
                    <input
                      type="number"
                      value={editingProduct ? editingProduct.minStock : newProduct.minStock}
                      onChange={(e) => editingProduct ? 
                        setEditingProduct({...editingProduct, minStock: parseInt(e.target.value) || 0}) :
                        setNewProduct({...newProduct, minStock: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter minimum stock"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Price (Rs.)</label>
                    <input
                      type="number"
                      value={editingProduct ? editingProduct.price : newProduct.price}
                      onChange={(e) => editingProduct ? 
                        setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0}) :
                        setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  
                  {/* Special Offers and Weekly Deals Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editingProduct ? editingProduct.specialOffers || false : newProduct.specialOffers || false}
                        onChange={(e) => editingProduct ? 
                          setEditingProduct({...editingProduct, specialOffers: e.target.checked}) :
                          setNewProduct({...newProduct, specialOffers: e.target.checked})
                        }
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label className="text-gray-700 font-medium">Add to Special Offers</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editingProduct ? editingProduct.weeklyDeals || false : newProduct.weeklyDeals || false}
                        onChange={(e) => editingProduct ? 
                          setEditingProduct({...editingProduct, weeklyDeals: e.target.checked}) :
                          setNewProduct({...newProduct, weeklyDeals: e.target.checked})
                        }
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label className="text-gray-700 font-medium">Add to Weekly Deals</label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
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
