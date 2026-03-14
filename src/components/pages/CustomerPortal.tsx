import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== 'customer') {
      navigate('/login');
      return;
    }

    fetchCustomerData();
  }, [userRole, navigate]);

  const fetchCustomerData = async () => {
    const customerName = localStorage.getItem('customerName');
    console.log('Customer data from localStorage:', {
      name: customerName,
      email: localStorage.getItem('customerEmail'),
      phone: localStorage.getItem('customerPhone'),
      loyaltyPoints: localStorage.getItem('customerLoyaltyPoints'),
      tier: localStorage.getItem('customerTier')
    });
    
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
          console.log('Customer API Response:', data); // Debug: See API response
          if (data.success) {
            setCustomerData(data.data);
            setLoading(false);
            return;
          }
        }
      }
      
      // Fallback to localStorage data if API fails
      console.log('API failed, using localStorage data');
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
      
      console.log('Setting fallback data:', fallbackData); // Debug: See fallback data
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
      
      console.log('Setting error fallback data:', fallbackData); // Debug: See error fallback
      setCustomerData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleShopNow = () => {
    navigate('/');
  };

  const handleOrderHistory = () => {
    // Navigate to order history section or page
    console.log('Order History clicked');
    // You can expand this to show actual order history
  };

  const handleWishlist = () => {
    // Navigate to wishlist section or page
    console.log('Wishlist clicked');
    // You can expand this to show actual wishlist items
  };

  const handleProfileSettings = () => {
    // Navigate to profile settings
    console.log('Profile Settings clicked');
    // You can expand this to show editable profile form
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-green-700 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-green-700">Smart Supermarket</h1>
                <p className="text-xs text-gray-500">Customer Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={handleShopNow}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <ShoppingCart className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-800">Shop Now</h3>
            <p className="text-gray-600 text-sm">Browse products and place orders</p>
          </button>

          <button 
            onClick={handleOrderHistory}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <Package className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-800">Order History</h3>
            <p className="text-gray-600 text-sm">View your past purchases</p>
          </button>

          <button 
            onClick={handleWishlist}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <Heart className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-semibold text-gray-800">Wishlist</h3>
            <p className="text-gray-600 text-sm">Manage your favorite items</p>
          </button>

          <button 
            onClick={handleProfileSettings}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <User className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-800">Profile Settings</h3>
            <p className="text-gray-600 text-sm">Update your information</p>
          </button>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="font-medium text-gray-800">{customerData?.name || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-gray-500 text-sm">Email Address</p>
              <p className="font-medium text-gray-800">{customerData?.email || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-gray-500 text-sm">Phone Number</p>
              <p className="font-medium text-gray-800">{customerData?.phone || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-gray-500 text-sm">Member Since</p>
              <p className="font-medium text-gray-800">
                {customerData ? 
                  new Date(customerData.joinDate || Date.now()).toLocaleDateString() : 
                  'N/A'
                }
              </p>
            </div>
          </div>
          
          {customerData && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Shopping Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{customerData.loyaltyPoints || 0}</p>
                  <p className="text-sm text-gray-600">Loyalty Points</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">Rs. {(customerData.totalPurchases || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-700">
                    {customerData.lastPurchase ? 
                      new Date(customerData.lastPurchase).toLocaleDateString() : 
                      'No purchases yet'
                    }
                  </p>
                  <p className="text-sm text-gray-600">Last Purchase</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
