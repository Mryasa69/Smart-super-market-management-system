import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Clock, Zap, Tag, Check, Heart, Star, LogOut, UserCircle, ChevronDown, Settings, FileText, CreditCard, ShoppingBag, TrendingUp, Shield, Database, HelpCircle, LayoutDashboard, Package, Users, BarChart3, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';

const categories = [
  { name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop' },
  { name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop' },
  { name: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop' },
  { name: 'Meat & Seafood', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop' },
  { name: 'Beverages', image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400&h=300&fit=crop' },
  { name: 'Snacks & Sweets', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop' },
  { name: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1580621312534-f3f5e28eff85?w=400&h=300&fit=crop' },
  { name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop' },
];

interface HomePageProps {
  onLogout?: () => void;
}

export default function HomePage({ onLogout }: HomePageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([
    { id: 1, name: 'Fresh Apples', price: 'Rs. 450/kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', discount: '10% OFF' },
    { id: 2, name: 'Milk 1L', price: 'Rs. 280', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop', discount: null },
    { id: 3, name: 'White Bread', price: 'Rs. 120', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop', discount: '5% OFF' },
    { id: 4, name: 'Fresh Chicken', price: 'Rs. 850/kg', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&h=300&fit=crop', discount: null },
    { id: 5, name: 'Orange Juice', price: 'Rs. 320', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop', discount: '15% OFF' },
    { id: 6, name: 'Chocolate Bar', price: 'Rs. 180', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop', discount: null },
  ]);
  const [weeklyDeals, setWeeklyDeals] = useState([
    { id: 1, name: 'Premium Rice 5kg', originalPrice: 'Rs. 1,200', salePrice: 'Rs. 720', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', discount: '40%', badge: 'HOT DEAL' },
    { id: 2, name: 'Fresh Salmon', originalPrice: 'Rs. 2,500/kg', salePrice: 'Rs. 1,750/kg', image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop', discount: '30%', badge: 'WEEKLY SPECIAL' },
    { id: 3, name: 'Imported Cheese', originalPrice: 'Rs. 950', salePrice: 'Rs. 665', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop', discount: '30%', badge: 'LIMITED' },
    { id: 4, name: 'Breakfast Cereal 500g', originalPrice: 'Rs. 680', salePrice: 'Rs. 476', image: 'https://images.unsplash.com/photo-1621588335788-5a2cfc610c0e?w=400&h=400&fit=crop', discount: '30%', badge: 'BEST SELLER' },
    { id: 5, name: 'Olive Oil 1L', originalPrice: 'Rs. 1,800', salePrice: 'Rs. 1,260', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', discount: '30%', badge: 'PREMIUM' },
    { id: 6, name: 'Fresh Strawberries', originalPrice: 'Rs. 850', salePrice: 'Rs. 595', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop', discount: '30%', badge: 'FRESH TODAY' },
  ]);

  // Check authentication state on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setUserRole(savedRole);
      if (savedRole === 'customer') {
        // Try to get customer data from API
        fetchCustomerData();
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // Listen for product updates from inventory management
  useEffect(() => {
    const handleProductsUpdated = (event: CustomEvent) => {
      console.log('🔥 HomePage received product update event:', event.detail);
      
      // Refresh products from localStorage
      const updatedProducts = localStorage.getItem('products');
      if (updatedProducts) {
        try {
          const parsed = JSON.parse(updatedProducts);
          console.log('🔥 HomePage refreshed products:', parsed);
          
          // Update featured products and weekly deals based on the new products
          // This will trigger a re-render with updated product information
          updateHomePageProducts(parsed);
          
        } catch (error) {
          console.error('Failed to parse updated products:', error);
        }
      }
    };

    // Add event listener
    window.addEventListener('productsUpdated', handleProductsUpdated as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated as EventListener);
    };
  }, []);

  // Function to update home page products based on inventory changes
  const updateHomePageProducts = (inventoryProducts: any[]) => {
    // Define proper placeholder images for different categories
    const categoryImages: { [key: string]: string } = {
      'Dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop',
      'Bakery': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop',
      'Vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=300&fit=crop',
      'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop',
      'Beverages': 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=300&h=300&fit=crop',
      'Snacks': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop',
      'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop',
      'Fruits': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
      'Other': 'https://images.unsplash.com/photo-1546069201-fa0b8da78894?w=300&h=300&fit=crop'
    };

    // Map inventory products to featured products format
    const updatedFeaturedProducts = inventoryProducts
      .filter(product => product.specialOffers === true) // Use product flags
      .slice(0, 12) // Increased from 6 to 12 products
      .map((product, index) => ({
      id: product.id,
      name: product.name,
      price: `Rs. ${product.price}`,
      image: categoryImages[product.category] || categoryImages['Other'],
      discount: product.quantity <= product.minStock ? 'Low Stock' : 'SPECIAL OFFER'
    }));

    // Map products to weekly deals (only those added within last 7 days)
    const currentDate = new Date();
    const updatedWeeklyDeals = inventoryProducts
      .filter(product => {
        // Check if product is marked for weekly deals and added within 7 days
        if (product.weeklyDeals === true) {
          if (product.weeklyDealsAddedAt) {
            const addedDate = new Date(product.weeklyDealsAddedAt);
            const daysDiff = Math.floor((currentDate.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff < 7; // Only show if less than 7 days
          }
          // For backwards compatibility, show if no timestamp but flagged
          return true;
        }
        return false;
      })
      .slice(0, 12) // Increased from 6 to 12 products
      .map((product, index) => {
      const originalPrice = product.price * 1.3; // Show as if it's on sale
      return {
        id: product.id,
        name: product.name,
        originalPrice: `Rs. ${originalPrice.toFixed(0)}`,
        salePrice: `Rs. ${product.price}`,
        image: categoryImages[product.category] || categoryImages['Other'],
        discount: '30%',
        badge: index === 0 ? 'WEEKLY DEAL' : 'HOT DEAL'
      };
    });

    // Show all products as regular products (including those with special flags)
    const regularProducts = inventoryProducts
      .slice(0, 12) // Show more products since this is the main display
      .map((product, index) => ({
      id: product.id,
      name: product.name,
      price: `Rs. ${product.price}`,
      image: categoryImages[product.category] || categoryImages['Other'],
      discount: product.quantity <= product.minStock ? 'Low Stock' : 
                 product.specialOffers ? 'SPECIAL OFFER' : 
                 product.weeklyDeals ? 'WEEKLY DEAL' : null
      }));

    // Update the component state
    setFeaturedProducts(updatedFeaturedProducts);
    setWeeklyDeals(updatedWeeklyDeals);
    
    console.log('🔥 Updated featured products:', updatedFeaturedProducts);
    console.log('🔥 Updated weekly deals:', updatedWeeklyDeals);
  };

  // Load initial products from localStorage and backend on mount
  useEffect(() => {
    // First try to load from localStorage
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts);
        if (parsed.length > 0) {
          updateHomePageProducts(parsed);
        }
      } catch (error) {
        console.error('Failed to load initial products:', error);
      }
    }

    // Then try to fetch from backend
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
          
          // Update localStorage and home page
          localStorage.setItem('products', JSON.stringify(transformed));
          updateHomePageProducts(transformed);
          
          console.log('🔥 HomePage loaded products from backend:', transformed);
        }
      })
      .catch(error => console.log('Backend fetch failed:', error));
    }
  }, []);

  // Periodic sync with backend every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(() => {
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
            
            // Update localStorage and home page
            localStorage.setItem('products', JSON.stringify(transformed));
            updateHomePageProducts(transformed);
            
            console.log('🔥 HomePage synced products from backend:', transformed);
          }
        })
        .catch(error => console.log('Periodic sync failed:', error));
      }
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, []);

  // Function to clean up expired weekly deals
  const cleanupExpiredWeeklyDeals = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/products/cleanup-weekly-deals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.removedProducts.length > 0) {
            console.log(`🔥 Cleaned up ${data.removedProducts.length} expired weekly deals:`, data.removedProducts);
            
            // Refresh products from localStorage to update the display
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
              try {
                const parsed = JSON.parse(storedProducts);
                // Update local products to remove expired weekly deals
                const updatedProducts = parsed.map((product: any) => {
                  const removedProduct = data.removedProducts.find((removed: any) => removed.id === product.id);
                  if (removedProduct) {
                    return { ...product, weeklyDeals: false, weeklyDealsAddedAt: null };
                  }
                  return product;
                });
                localStorage.setItem('products', JSON.stringify(updatedProducts));
                updateHomePageProducts(updatedProducts);
              } catch (error) {
                console.error('Failed to update local products after cleanup:', error);
              }
            }
          }
        }
      } catch (error) {
        console.log('Failed to cleanup expired weekly deals:', error);
      }
    }
  };

  // Check for expired weekly deals every 5 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupExpiredWeeklyDeals, 5 * 60 * 1000); // 5 minutes
    
    // Run cleanup immediately on mount
    cleanupExpiredWeeklyDeals();
    
    return () => clearInterval(cleanupInterval);
  }, []);

  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/customers/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomerData(data.data);
        }
      } else {
        // Set basic data if API fails
        setCustomerData({
          name: localStorage.getItem('customerName') || 'Customer',
          loyaltyPoints: 0,
          tier: 'Bronze'
        });
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // Set basic data if API fails
      setCustomerData({
        name: localStorage.getItem('customerName') || 'Customer',
        loyaltyPoints: 0,
        tier: 'Bronze'
      });
    }
  };

  const handleAddToWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Countdown timer for weekly deals
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (productId: number, productName: string) => {
    setCartCount(prev => prev + 1);
    setAddedToCart(productId);
    
    // Show success message
    const message = document.createElement('div');
    message.className = 'fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
    message.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${productName} added to cart!</span>
      </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
    
    // Reset button state after 2 seconds
    setTimeout(() => {
      setAddedToCart(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-50">
        {/* Top Bar */}
        <div className="bg-green-700 text-white py-2">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +94 11 234 5678
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@smartsupermarket.lk
              </span>
            </div>
            <div className="flex items-center gap-4">
              {userRole === 'customer' && customerData && (
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {customerData.loyaltyPoints || 0} Points
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {wishlist.length} Wishlist
                  </span>
                </div>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Store Locator
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-green-700" />
              <div>
                <h1 className="text-green-700">Smart Supermarket</h1>
                <p className="text-sm text-gray-500">Your One-Stop Shop</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-700 text-white p-2 rounded-full hover:bg-green-800">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-6">
              {userRole ? (
                <div className="flex items-center gap-4">
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="flex flex-col items-center gap-1 hover:text-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen(!isDropdownOpen);
                      }}
                    >
                      <UserCircle className="w-6 h-6" />
                      <span className="text-sm capitalize">{userRole}</span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        {/* Account Info */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <UserCircle className="w-8 h-8 text-green-700" />
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">{userRole}</p>
                              <p className="text-sm text-gray-500">Logged in</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          {userRole === 'customer' ? (
                            <>
                              {/* Profile Management - Available for all roles */}
                              <div className="px-3 py-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Profile Management</p>
                                <div className="space-y-1">
                                  <Link
                                    to="/customer-portal?section=profile"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <UserCircle className="w-4 h-4" />
                                    <span>My Profile</span>
                                  </Link>
                                  <Link
                                    to="/customer-portal?section=orders"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span>View Orders</span>
                                  </Link>
                                  <Link
                                    to="/customer-portal?section=wishlist"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Heart className="w-4 h-4" />
                                    <span>Wishlist</span>
                                  </Link>
                                </div>
                              </div>

                              {/* Logout */}
                              <div className="px-3 py-2 border-t border-gray-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(false);
                                    if (onLogout) {
                                      onLogout();
                                      navigate('/login');
                                    }
                                  }}
                                  className="flex items-center gap-3 px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full"
                                >
                                  <LogOut className="w-4 h-4" />
                                  <span>Logout</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* System Management - Role-based */}
                              <div className="px-3 py-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System Management</p>
                                <div className="space-y-1">
                                  {/* Dashboard - All roles */}
                                  <Link
                                    to="/dashboard"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                  </Link>
                                  
                                  {/* Inventory - Admin & Stock Manager */}
                                  {(userRole === 'admin' || userRole === 'stock_manager') && (
                                    <Link
                                      to="/inventory"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                      }}
                                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <Package className="w-4 h-4" />
                                      <span>Inventory</span>
                                    </Link>
                                  )}
                                  
                                  {/* POS System - Admin & Cashier */}
                                  {(userRole === 'admin' || userRole === 'cashier') && (
                                    <Link
                                      to="/pos"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                      }}
                                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <ShoppingCart className="w-4 h-4" />
                                      <span>POS System</span>
                                    </Link>
                                  )}
                                  
                                  {/* Employees - Admin Only */}
                                  {userRole === 'admin' && (
                                    <Link
                                      to="/employees"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                      }}
                                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <Users className="w-4 h-4" />
                                      <span>Employees</span>
                                    </Link>
                                  )}
                                  
                                  {/* Customers - Admin & Cashier */}
                                  {(userRole === 'admin' || userRole === 'cashier') && (
                                    <Link
                                      to="/customers"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                      }}
                                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <UserCircle className="w-4 h-4" />
                                      <span>Customers</span>
                                    </Link>
                                  )}
                                  
                                  {/* Suppliers - Admin & Stock Manager */}
                                  {(userRole === 'admin' || userRole === 'stock_manager') && (
                                    <Link
                                      to="/suppliers"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                      }}
                                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <Truck className="w-4 h-4" />
                                      <span>Suppliers</span>
                                    </Link>
                                  )}
                                  
                                  {/* Reports - Admin Only */}
                                  {userRole === 'admin' && (
                                    <Link
                                      to="/reports"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                      }}
                                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <BarChart3 className="w-4 h-4" />
                                      <span>Reports & Analytics</span>
                                    </Link>
                                  )}
                                </div>
                              </div>

                              {/* Logout */}
                              <div className="px-3 py-2 border-t border-gray-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(false);
                                    if (onLogout) {
                                      onLogout();
                                      navigate('/login');
                                    }
                                  }}
                                  className="flex items-center gap-3 px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full"
                                >
                                  <LogOut className="w-4 h-4" />
                                  <span>Logout</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link to="/login" className="flex flex-col items-center gap-1 hover:text-green-700">
                  <User className="w-6 h-6" />
                  <span className="text-sm">Account</span>
                </Link>
              )}
              <button className="flex flex-col items-center gap-1 relative hover:text-green-700">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="text-sm">Cart</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-green-600 text-white">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-8 py-3">
              <li><a href="#" className="hover:text-green-200">Home</a></li>
              <li><a href="#categories" className="hover:text-green-200">Shop by Category</a></li>
              <li><a href="#offers" className="hover:text-green-200">Special Offers</a></li>
              <li><a href="#weekly-deals" className="hover:text-green-200">Weekly Deals</a></li>
              <li><a href="#" className="hover:text-green-200">Contact Us</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold text-green-700 mb-4">Fresh Groceries Delivered to Your Doorstep</h2>
              <p className="text-gray-600 mb-6">Shop from our wide range of fresh fruits, vegetables, dairy products, and more. Quality guaranteed!</p>
              <button className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800">
                Shop Now
              </button>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop" 
                alt="Supermarket"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section id="categories" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <p className="text-white p-4">{category.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="offers" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Special Offers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.discount && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      {product.discount}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-green-700 mb-3">{product.price}</p>
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                      onClick={() => handleAddToCart(product.id, product.name)}
                      disabled={addedToCart === product.id}
                    >
                      {addedToCart === product.id ? 'Added!' : 'Add to Cart'}
                    </button>
                    {userRole === 'customer' && (
                      <button 
                        className={`p-2 rounded transition-colors ${
                          wishlist.includes(product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        onClick={() => handleAddToWishlist(product.id)}
                        title={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className="w-4 h-4" fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Deals */}
      <section id="weekly-deals" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Weekly Deals</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {weeklyDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                    {deal.discount} OFF
                  </span>
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                    {deal.badge}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-800 mb-2">{deal.name}</h3>
                  <p className="text-gray-500 line-through mb-1">{deal.originalPrice}</p>
                  <p className="text-green-700 mb-3">{deal.salePrice}</p>
                  <button 
                    className={`w-full text-white py-2 rounded transition-all ${
                      addedToCart === deal.id + 100 
                        ? 'bg-green-800' 
                        : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                    }`}
                    onClick={() => handleAddToCart(deal.id + 100, deal.name)}
                    disabled={addedToCart === deal.id + 100}
                  >
                    {addedToCart === deal.id + 100 ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Added!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </span>
                    )}
                  </button>
                </div>
                <div className="bg-gray-100 text-center p-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Products</h3>
              <p className="text-gray-600">Fresh and high-quality products guaranteed</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Island-wide Delivery</h3>
              <p className="text-gray-600">Fast delivery to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loyalty Rewards</h3>
              <p className="text-gray-600">Earn points with every purchase</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold">About Us</h3>
              <p className="text-gray-400">Smart Supermarket - Your trusted partner for fresh groceries and daily essentials.</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Customer Service</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Return Policy</a></li>
                <li><a href="#" className="hover:text-white">Delivery Info</a></li>
                <li><Link to="/login" className="hover:text-white">Staff Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
              <div className="flex gap-4">
                <Facebook className="w-6 h-6 cursor-pointer hover:text-green-400" />
                <Instagram className="w-6 h-6 cursor-pointer hover:text-green-400" />
                <Twitter className="w-6 h-6 cursor-pointer hover:text-green-400" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Smart Supermarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
