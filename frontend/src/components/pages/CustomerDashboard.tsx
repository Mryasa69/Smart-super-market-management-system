import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, TrendingUp, LogOut, Settings, Gift } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  loyaltyPoints: number;
  totalPurchases: number;
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    const token = localStorage.getItem('customerToken');
    
    if (customerData && token) {
      setCustomer(JSON.parse(customerData));
    } else {
      navigate('/customer-login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    localStorage.removeItem('rememberCustomer');
    navigate('/login');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const getNextTierPoints = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 1000; // Need 1000 more for Silver
      case 'Silver': return 2000; // Need 2000 more for Gold
      case 'Gold': return 3000; // Need 3000 more for Platinum
      default: return 1000;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Customer data not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Smart Market</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                {customer.tier} Member
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 sm:py-6 md:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Welcome back, {customer.name}!
          </h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Loyalty Points</dt>
                      <dd className="text-lg font-medium text-gray-900">{customer.loyaltyPoints.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Purchases</dt>
                      <dd className="text-lg font-medium text-gray-900">{customer.totalPurchases}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Member Tier</dt>
                      <dd className="text-lg font-medium text-gray-900">{customer.tier}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Points to Next Tier</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {getNextTierPoints(customer.tier) - customer.loyaltyPoints}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progress to {customer.tier === 'Platinum' ? 'Maintain Status' : 'Next Tier'}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Current Points</span>
                  <span className="font-medium">{customer.loyaltyPoints}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Next Tier</span>
                  <span className="font-medium">
                    {customer.tier === 'Bronze' ? 'Silver (1000 pts)' :
                     customer.tier === 'Silver' ? 'Gold (2000 pts)' :
                     customer.tier === 'Gold' ? 'Platinum (3000 pts)' : 'Current'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      customer.tier === 'Bronze' ? 'bg-orange-500' :
                      customer.tier === 'Silver' ? 'bg-gray-500' :
                      customer.tier === 'Gold' ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ 
                      width: `${Math.min((customer.loyaltyPoints / getNextTierPoints(customer.tier)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/products')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Start Shopping
                  </button>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Account Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
