import { useState, useEffect } from 'react';

import DashboardLayout from '../Layout/DashboardLayout';

import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, MapPin, FileText } from 'lucide-react';
import ActivityTracker from '../../utils/activityTracker';



interface SupplierManagementProps {

  userRole: 'admin' | 'cashier' | 'stock_manager' | 'customer' | null;

  onLogout: () => void;

}



interface Supplier {

  id: string | number;

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

  id: string | number;

  supplierId: string | number;

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

  const [orders, setOrders] = useState<PurchaseOrder[]>(purchaseOrders);

  const activityTracker = ActivityTracker.getInstance();

  const [searchQuery, setSearchQuery] = useState('');

  const [filterCategory, setFilterCategory] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);

  const [showOrderModal, setShowOrderModal] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  

  // Form states

  const [newSupplier, setNewSupplier] = useState({

    name: '',

    contactPerson: '',

    email: '',

    phone: '',

    address: '',

    category: 'Dairy Products',

  });

  

  const [newOrder, setNewOrder] = useState({

    supplierId: '' as string | number,

    expectedDelivery: '',

    notes: '',

    items: '',

    amount: '',

    status: 'pending' as 'pending' | 'confirmed' | 'delivered' | 'cancelled',

  });



  const categories = ['all', 'Dairy Products', 'Vegetables & Fruits', 'Meat & Poultry', 'Bakery Products', 'Grains & Rice', 'Beverages'];



  // Load suppliers and orders from localStorage and backend

  useEffect(() => {

    console.log('=== LOADING SUPPLIERS AND ORDERS ===');

    

    // TEMPORARY: Clear problematic data on first load

    const hasReset = localStorage.getItem('suppliersReset');

    if (!hasReset) {

      console.log('🔥 Clearing problematic supplier data...');

      localStorage.removeItem('suppliers');

      localStorage.removeItem('suppliersCleaned');

      localStorage.setItem('suppliersReset', 'true');

    }

    

    // Simple, reliable loading logic

    const localSuppliers = localStorage.getItem('suppliers');

    console.log('🔥 localStorage suppliers data:', localSuppliers);

    

    if (localSuppliers) {

      try {

        const parsed = JSON.parse(localSuppliers);

        console.log('🔥 Loaded suppliers from localStorage:', parsed);

        console.log('🔥 Number of suppliers from localStorage:', parsed.length);

        setSuppliers(parsed);

      } catch (e) {

        console.error('🔥 Failed to parse localStorage suppliers:', e);

        console.log('🔥 Falling back to initial suppliers');

        setSuppliers(initialSuppliers);

      }

    } else {

      console.log('🔥 No suppliers in localStorage, using initial suppliers');

      setSuppliers(initialSuppliers);

    }

    

    // Load orders from localStorage

    const localOrders = localStorage.getItem('purchaseOrders');

    if (localOrders) {

      try {

        const parsed = JSON.parse(localOrders);

        console.log('Loaded orders from localStorage:', parsed);

        setOrders(parsed);

      } catch (e) {

        console.error('Failed to parse localStorage orders:', e);

      }

    }

    

    // Try to fetch from backend

    const token = localStorage.getItem('authToken');

    if (token) {

      // Fetch suppliers

      fetch('http://localhost:5000/api/suppliers', {

        headers: { 'Authorization': `Bearer ${token}` }

      })

      .then(response => response.ok ? response.json() : Promise.reject('Failed'))

      .then(data => {

        if (data.success && data.data) {

          const transformed = data.data.map((supplier: any) => ({

            id: supplier._id || supplier.id,

            name: supplier.name || 'Unknown',

            contactPerson: supplier.contactPerson || '',

            email: supplier.email || '',

            phone: supplier.phone || '',

            address: supplier.address || '',

            category: supplier.category || 'Other',

            rating: supplier.rating || 4.0,

            totalOrders: supplier.totalOrders || 0,

            activeOrders: supplier.activeOrders || 0,

            lastDelivery: supplier.lastDelivery || new Date().toISOString().split('T')[0],

            status: supplier.status || 'active',

          }));

          setSuppliers(transformed);

          localStorage.setItem('suppliers', JSON.stringify(transformed));

        }

      })

      .catch(e => console.log('Backend suppliers fetch failed:', e));

      

      // Fetch orders

      fetch('http://localhost:5000/api/purchase-orders', {

        headers: { 'Authorization': `Bearer ${token}` }

      })

      .then(response => response.ok ? response.json() : Promise.reject('Failed'))

      .then(data => {

        if (data.success && data.data) {

          const transformed = data.data.map((order: any) => ({

            id: order._id || order.id,

            supplierId: order.supplierId || 0,

            orderDate: order.orderDate || new Date().toISOString().split('T')[0],

            expectedDelivery: order.expectedDelivery || new Date().toISOString().split('T')[0],

            status: order.status || 'pending',

            totalAmount: order.totalAmount || 0,

            items: order.items || 0,

          }));

          setOrders(transformed);

          localStorage.setItem('purchaseOrders', JSON.stringify(transformed));

        }

      })

      .catch(e => console.log('Backend orders fetch failed:', e));

    }

  }, []);



  const filteredSuppliers = suppliers.filter((supplier) => {

    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||

                         supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || supplier.category === filterCategory;

    return matchesSearch && matchesCategory;

  });



  const handleDeleteSupplier = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      const supplierToDelete = suppliers.find(s => s.id === id);
      
      // Try to delete from backend
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await fetch(`http://localhost:5000/api/suppliers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        } catch (error) {
          console.log('Backend delete failed, removing locally:', error);
        }
      }
      
      const updatedSuppliers = suppliers.filter((s) => s.id !== id);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      
      // Trigger event for other components
      window.dispatchEvent(new CustomEvent('suppliersUpdated', {
        detail: {
          action: 'delete',
          supplier: supplierToDelete,
          allSuppliers: updatedSuppliers
        }
      }));
      
      // Log activity
      if (supplierToDelete) {
        activityTracker.logSupplierDeleted(supplierToDelete.name);
      }
      
      alert('Supplier deleted successfully!');
    }
  };



  const handleAddSupplier = async (e: React.FormEvent) => {

    e.preventDefault();

    

    console.log('🔥 STARTING SUPPLIER ADDITION 🔥');

    console.log('Current suppliers before adding:', suppliers);

    console.log('Current suppliers count before adding:', suppliers.length);

    

    try {

      // Get admin auth token

      const token = localStorage.getItem('authToken');

      

      // Prepare data

      const requestData = {

        name: newSupplier.name,

        contactPerson: newSupplier.contactPerson,

        email: newSupplier.email,

        phone: newSupplier.phone,

        address: newSupplier.address,

        category: newSupplier.category,

      };

      

      console.log('Supplier request data:', requestData);

      

      // Try to create in backend

      let apiSuccess = false;

      let backendSupplierId = null;

      if (token) {

        try {

          const response = await fetch('http://localhost:5000/api/suppliers', {

            method: 'POST',

            headers: {

              'Content-Type': 'application/json',

              'Authorization': `Bearer ${token}`,

            },

            body: JSON.stringify(requestData),

          });



          if (response.ok) {

            const data = await response.json();

            console.log('Backend supplier creation response:', data);

            backendSupplierId = data.data?._id || data.data?.id || data.id;

            apiSuccess = true;

          }

        } catch (error) {

          console.log('Backend supplier creation failed:', error);

        }

      }



      // Add supplier locally (always)

      const supplier: Supplier = {

        id: backendSupplierId || (Math.max(...suppliers.filter(s => typeof s.id === 'number').map(s => s.id as number), 0) + 1),

        name: newSupplier.name,

        contactPerson: newSupplier.contactPerson,

        email: newSupplier.email,

        phone: newSupplier.phone,

        address: newSupplier.address,

        category: newSupplier.category,

        rating: 4.0,

        totalOrders: 0,

        activeOrders: 0,

        lastDelivery: 'Never',

        status: 'active',

      };



      console.log('Adding supplier:', supplier);

      const updatedSuppliers = [...suppliers, supplier];

      console.log('Updated suppliers list:', updatedSuppliers);

      

      // Save to localStorage

      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));

      setSuppliers(updatedSuppliers);

      // Log activity
      activityTracker.logSupplierAdded(supplier.name);
      
      // Reset form
      setNewSupplier({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        category: 'Dairy Products',
      });
      setShowAddModal(false);

      

      const message = apiSuccess ? 

        'Supplier added successfully!' : 

        'Supplier added locally (backend failed)';

      alert(message);

      

      console.log('🔥 SUPPLIER ADDITION COMPLETED 🔥');

      console.log('Final suppliers state:', updatedSuppliers);

      console.log('Final suppliers count:', updatedSuppliers.length);

      

    } catch (error) {

      console.error('Error adding supplier:', error);

      alert('Failed to add supplier. Check console for details.');

    }

  };



  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSupplier) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const requestData = {
        name: editingSupplier.name,
        contactPerson: editingSupplier.contactPerson,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        address: editingSupplier.address,
        category: editingSupplier.category,
      };
      
      let apiSuccess = false;
      
      if (token) {
        try {
          const response = await fetch(`http://localhost:5000/api/suppliers/${editingSupplier.id}`, {
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
            console.error('Backend supplier update failed:', response.status);
          }
        } catch (error) {
          console.error('Backend supplier update failed:', error);
        }
      }
      
      const updatedSupplier = { ...editingSupplier };

      // Always update locally (even if backend failed, to keep UI responsive)
      const updatedSuppliers = suppliers.map(s => 
        s.id === editingSupplier.id ? updatedSupplier : s
      );
      
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      
      // Trigger a custom event to notify other components of the update
      window.dispatchEvent(new CustomEvent('suppliersUpdated', { 
        detail: { 
          action: 'update',
          supplier: updatedSupplier,
          allSuppliers: updatedSuppliers
        } 
      }));
      
      // Log activity
      activityTracker.logSupplierUpdated(updatedSupplier.name);
      
      setEditingSupplier(null);
      
      if (apiSuccess) {
        alert('Supplier updated successfully!');
      } else if (token) {
        alert('Supplier updated locally. Backend sync failed.');
      } else {
        alert('Supplier updated successfully!');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Failed to update supplier');
    }
  };



  const handleCreateOrder = async (e: React.FormEvent) => {

    e.preventDefault();

    

    console.log('🔥 STARTING PURCHASE ORDER CREATION 🔥');

    console.log('Current orders before adding:', orders);

    console.log('Current orders count before adding:', orders.length);

    console.log('Form data:', newOrder);

    console.log('Selected supplier ID:', newOrder.supplierId);

    

    // Validate form data

    if (!newOrder.supplierId) {

      alert('Please select a supplier');

      return;

    }

    

    if (!newOrder.expectedDelivery) {

      alert('Please select expected delivery date');

      return;

    }

    

    try {

      // Get admin auth token

      const token = localStorage.getItem('authToken');

      

      // Prepare data

      const requestData = {

        supplierId: newOrder.supplierId,

        expectedDelivery: newOrder.expectedDelivery,

        notes: newOrder.notes,

        items: newOrder.items,

        totalAmount: parseFloat(newOrder.amount) || 0,

        status: newOrder.status,

      };

      

      console.log('Order request data:', requestData);

      

      // Try to create in backend

      let apiSuccess = false;

      if (token) {

        try {

          const response = await fetch('http://localhost:5000/api/purchase-orders', {

            method: 'POST',

            headers: {

              'Content-Type': 'application/json',

              'Authorization': `Bearer ${token}`,

            },

            body: JSON.stringify(requestData),

          });



          if (response.ok) {

            const data = await response.json();

            console.log('Backend order creation response:', data);

            apiSuccess = true;

          }

        } catch (error) {

          console.log('Backend order creation failed:', error);

        }

      }



      // Add order locally (always)

      const order: PurchaseOrder = {

        id: Math.max(...orders.filter(o => typeof o.id === 'number').map(o => o.id as number), 1000) + 1,

        supplierId: newOrder.supplierId,

        orderDate: new Date().toISOString().split('T')[0],

        expectedDelivery: newOrder.expectedDelivery,

        status: newOrder.status,

        totalAmount: requestData.totalAmount,

        items: parseInt(requestData.items) || 1,

      };



      console.log('Adding order:', order);

      const updatedOrders = [...orders, order];

      console.log('Updated orders list:', updatedOrders);

      

      // Save to localStorage

      localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));

      console.log('Saved orders to localStorage');

      

      setOrders(updatedOrders);
      
      // Update supplier's active orders count
      const supplier = suppliers.find(s => s.id === newOrder.supplierId);
      if (supplier) {
        // Log activity
        activityTracker.logPurchaseOrderCreated(supplier.name, `Rs. ${requestData.totalAmount}`);
        
        const updatedSuppliers = suppliers.map(s => 
          s.id === newOrder.supplierId 
            ? { ...s, activeOrders: s.activeOrders + 1, totalOrders: s.totalOrders + 1 }
            : s
        );

        setSuppliers(updatedSuppliers);
        localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      }

      

      // Reset form

      setNewOrder({

        supplierId: '',

        expectedDelivery: '',

        notes: '',

        items: '',

        amount: '',

        status: 'pending' as 'pending' | 'confirmed' | 'delivered' | 'cancelled',

      });

      setShowOrderModal(false);

      

      const message = apiSuccess ? 

        'Purchase order created successfully!' : 

        'Purchase order created locally (backend failed)';

      alert(message);

      

      console.log('🔥 PURCHASE ORDER CREATION COMPLETED 🔥');

      console.log('Final orders state:', updatedOrders);

      console.log('Final orders count:', updatedOrders.length);

      

    } catch (error) {

      console.error('Error creating order:', error);

      alert('Failed to create purchase order. Check console for details.');

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

                          onClick={() => setEditingSupplier(supplier)}

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



        {/* Add/Edit Supplier Modal */}

        {(showAddModal || editingSupplier) && (

          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              <h2 className="text-gray-800 mb-4">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>

              <form onSubmit={editingSupplier ? handleUpdateSupplier : handleAddSupplier} className="space-y-4">

                <div className="grid md:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-gray-700 mb-2">Supplier Name</label>

                    <input

                      type="text"

                      value={editingSupplier ? editingSupplier.name : newSupplier.name}

                      onChange={(e) => editingSupplier ? 

                        setEditingSupplier({...editingSupplier, name: e.target.value}) :

                        setNewSupplier({...newSupplier, name: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="Enter supplier name"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Contact Person</label>

                    <input

                      type="text"

                      value={editingSupplier ? editingSupplier.contactPerson : newSupplier.contactPerson}

                      onChange={(e) => editingSupplier ? 

                        setEditingSupplier({...editingSupplier, contactPerson: e.target.value}) :

                        setNewSupplier({...newSupplier, contactPerson: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="Enter contact person"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Email</label>

                    <input

                      type="email"

                      value={editingSupplier ? editingSupplier.email : newSupplier.email}

                      onChange={(e) => editingSupplier ? 

                        setEditingSupplier({...editingSupplier, email: e.target.value}) :

                        setNewSupplier({...newSupplier, email: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="Enter email"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Phone</label>

                    <input

                      type="tel"

                      value={editingSupplier ? editingSupplier.phone : newSupplier.phone}

                      onChange={(e) => editingSupplier ? 

                        setEditingSupplier({...editingSupplier, phone: e.target.value}) :

                        setNewSupplier({...newSupplier, phone: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="Enter phone"

                      required

                    />

                  </div>

                  <div className="md:col-span-2">

                    <label className="block text-gray-700 mb-2">Address</label>

                    <input

                      type="text"

                      value={editingSupplier ? editingSupplier.address : newSupplier.address}

                      onChange={(e) => editingSupplier ? 

                        setEditingSupplier({...editingSupplier, address: e.target.value}) :

                        setNewSupplier({...newSupplier, address: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="Enter address"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Category</label>

                    <select 

                      value={editingSupplier ? editingSupplier.category : newSupplier.category}

                      onChange={(e) => editingSupplier ? 

                        setEditingSupplier({...editingSupplier, category: e.target.value}) :

                        setNewSupplier({...newSupplier, category: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      required

                    >

                      {categories.filter((c) => c !== 'all').map((cat) => (

                        <option key={cat} value={cat}>{cat}</option>

                      ))}

                    </select>

                  </div>

                </div>

                <div className="flex gap-2 justify-end mt-6">

                  <button

                    type="button"

                    onClick={() => {

                      setShowAddModal(false);

                      setEditingSupplier(null);

                    }}

                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"

                  >

                    {editingSupplier ? 'Update Supplier' : 'Add Supplier'}

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

              <form onSubmit={handleCreateOrder} className="space-y-4">

                <div className="grid md:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-gray-700 mb-2">Supplier</label>

                    <select 

                      value={newOrder.supplierId || ''}

                      onChange={(e) => setNewOrder({...newOrder, supplierId: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      required

                    >

                      <option value="">Select a supplier</option>

                      {suppliers.filter((s) => s.status === 'active').map((supplier) => (

                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>

                      ))}

                    </select>

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Expected Delivery</label>

                    <input

                      type="date"

                      value={newOrder.expectedDelivery}

                      onChange={(e) => setNewOrder({...newOrder, expectedDelivery: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Items</label>

                    <input

                      type="text"

                      value={newOrder.items}

                      onChange={(e) => setNewOrder({...newOrder, items: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="Enter items (e.g., Milk, Bread, Eggs)"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Amount (Rs.)</label>

                    <input

                      type="number"

                      value={newOrder.amount}

                      onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      placeholder="Enter total amount"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-gray-700 mb-2">Status</label>

                    <select 

                      value={newOrder.status}

                      onChange={(e) => setNewOrder({...newOrder, status: e.target.value as 'pending' | 'confirmed' | 'delivered' | 'cancelled'})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                      required

                    >

                      <option value="pending">Pending</option>

                      <option value="confirmed">Confirmed</option>

                      <option value="delivered">Delivered</option>

                      <option value="cancelled">Cancelled</option>

                    </select>

                  </div>

                </div>

                <div>

                  <label className="block text-gray-700 mb-2">Notes</label>

                  <textarea

                    rows={4}

                    value={newOrder.notes}

                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}

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

