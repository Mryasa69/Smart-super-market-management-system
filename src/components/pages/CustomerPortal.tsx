import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, User, ShoppingBag, Heart, LogOut, Home, Package, Star } from 'lucide-react';

interface CustomerPortalProps {
  userRole: string | null;
  onLogout: () => void;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  tier: string;
  totalPurchases: number;
  lastPurchase: string;
  joinDate: string;
}

export default function CustomerPortal({ userRole, onLogout }: CustomerPortalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'orders' | 'wishlist'>('profile');

  // Set active section based on URL parameter
  useEffect(() => {
    const section = searchParams.get('section') as 'profile' | 'orders' | 'wishlist';
    if (section && ['profile', 'orders', 'wishlist'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userRole !== 'customer') {
      navigate('/login');
      return;
    }

    fetchCustomerData();
  }, [userRole, navigate]);

  const fetchCustomerData = async () => {
    const customerName = localStorage.getItem('customerName');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Try API call first
      if (token) {
        const response = await fetch('http://localhost:5000/api/customers/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCustomerData(data.data);
            setLoading(false);
            return;
          }
        }
      }
      
      // Fallback to localStorage data if API fails
      const customerEmail = localStorage.getItem('customerEmail');
      const customerPhone = localStorage.getItem('customerPhone');
      const customerLoyaltyPoints = localStorage.getItem('customerLoyaltyPoints');
      const customerTier = localStorage.getItem('customerTier');
      const customerJoinDate = localStorage.getItem('customerJoinDate') || new Date().toISOString();
      
      const fallbackData = {
        name: customerName || 'Customer',
        email: customerEmail || 'customer@example.com',
        phone: customerPhone || '+94 11 234 5678',
        loyaltyPoints: parseInt(customerLoyaltyPoints || '150'),
        tier: customerTier || 'Bronze',
        totalPurchases: 0,
        lastPurchase: '',
        joinDate: customerJoinDate
      };
      
      setCustomerData(fallbackData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      
      // Set fallback data even on error
      const customerEmail = localStorage.getItem('customerEmail');
      const customerPhone = localStorage.getItem('customerPhone');
      const customerLoyaltyPoints = localStorage.getItem('customerLoyaltyPoints');
      const customerTier = localStorage.getItem('customerTier');
      const customerJoinDate = localStorage.getItem('customerJoinDate') || new Date().toISOString();
      
      const fallbackData = {
        name: customerName || 'Customer',
        email: customerEmail || 'customer@example.com',
        phone: customerPhone || '+94 11 234 5678',
        loyaltyPoints: parseInt(customerLoyaltyPoints || '150'),
        tier: customerTier || 'Bronze',
        totalPurchases: 0,
        lastPurchase: '',
        joinDate: customerJoinDate
      };
      
      setCustomerData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleShopNow = () => {
    navigate('/');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 text-green-700" />
                <span className="text-xl font-bold text-gray-900">Smart Supermarket</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome back, {customerData?.name || 'Customer'}!
              </h2>
              <p className="text-gray-600">Manage your account and view your shopping history</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${getTierColor(customerData?.tier || 'Bronze')}`}>
              {customerData?.tier || 'Bronze'} Member
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Loyalty Points</p>
                <p className="text-3xl font-bold text-green-700">{customerData?.loyaltyPoints || 0}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Purchases</p>
                <p className="text-3xl font-bold text-blue-700">Rs. {(customerData?.totalPurchases || 0).toLocaleString()}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Last Purchase</p>
                <p className="text-lg font-semibold text-gray-700">
                  {customerData?.lastPurchase ? 
                    new Date(customerData.lastPurchase).toLocaleDateString() : 
                    'No purchases yet'
                  }
                </p>
              </div>
              <Package className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'profile' 
                  ? 'bg-green-700 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveSection('orders')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'orders' 
                  ? 'bg-green-700 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveSection('wishlist')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'wishlist' 
                  ? 'bg-green-700 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Wishlist
            </button>
          </div>
        </div>

        {/* Section-based Content */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Full Name</p>
                  <p className="font-medium">{customerData?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{customerData?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-medium">{customerData?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Member Since</p>
                  <p className="font-medium">
                    {customerData?.joinDate ? 
                      new Date(customerData.joinDate).toLocaleDateString() : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order History</h3>
            <p className="text-gray-600">You haven't placed any orders yet.</p>
            <button 
              onClick={handleShopNow}
              className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        {activeSection === 'wishlist' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">My Wishlist</h3>
            <p className="text-gray-600">Your wishlist is empty.</p>
            <button 
              onClick={handleShopNow}
              className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
