import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Clock, Zap, Tag, Check, ChevronDown, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const categories = [
  { name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop' },
  { name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop' },
  { name: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop' },
  { name: 'Meat & Seafood', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop' },
  { name: 'Beverages', image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?q=80&w=1170&auto=format&fit=crop' },
  { name: 'Snacks & Sweets', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop' },
  { name: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1589010588553-46e8e7c21788?q=80&w=1260&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop' },
];

const getDefaultImage = (name: string, category: string) => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  //if (lowerName.includes('apple')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop';
  //if (lowerName.includes('milk')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop';
  //if (lowerName.includes('bread')) return 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop';
  //if (lowerName.includes('chicken')) return 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop';
  //if (lowerName.includes('juice')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop';
  //if (lowerName.includes('chocolate')) return 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop';
  //if (lowerName.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop';
  //if (lowerName.includes('salmon') || lowerName.includes('fish')) return 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop';


  // if (lowerName.includes('cheese')) return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop';
  // if (lowerName.includes('cereal')) return 'https://images.unsplash.com/photo-1621588335788-5a2cfc610c0e?w=400&h=400&fit=crop';
  // if (lowerName.includes('oil')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop';
  // if (lowerName.includes('strawberry') || lowerName.includes('berry')) return 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop';
  // if (lowerCat.includes('fruit') || lowerCat.includes('veg')) return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop';
  // if (lowerCat.includes('dairy')) return 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop';
  // if (lowerCat.includes('bakery')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop';
  // if (lowerCat.includes('meat')) return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop';

  //return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';
};


export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  });
  const [addedToCart, setAddedToCart] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30
  });
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [memberRole, setMemberRole] = useState<'customer' | 'admin' | 'cashier' | 'stock_manager' | null>(null);
  const [memberDisplayName, setMemberDisplayName] = useState('Guest User');
  const [memberEmail, setMemberEmail] = useState('');
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const res = await apiService.getProducts();
        console.log("Products fetch response:", res);
        if (res.success && res.data) {
          setRealProducts(res.data);
        } else {
          console.warn("Product fetch failed or returned no data:", res.message);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      const customerToken = localStorage.getItem('customerToken');
      if (customerToken) {
        try {
          const res = await apiService.getCart();
          if (res.success && res.data) {
            const items = res.data.items || [];
            localStorage.setItem("cart", JSON.stringify(items));
            const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            setCartCount(count);
          }
        } catch (err) {
          console.error("Error loading cart on homepage:", err);
        }
      }
    };
    loadCart();
  }, []);

  const normalizedQuery = searchQuery.toLowerCase();
  const featuredList = realProducts.filter(
    (p) => !!p?.specialOffers && (p?.name ?? '').toLowerCase().includes(normalizedQuery)
  );
  const weeklyList = realProducts.filter(
    (p) => !!p?.weeklyDeals && (p?.name ?? '').toLowerCase().includes(normalizedQuery)
  );

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
  useEffect(() => {
    if (apiService.isCustomerAuthenticated()) {
      const customerObj = apiService.getStoredCustomer();
      setMemberRole('customer');
      setMemberDisplayName(customerObj?.name || 'Customer');
      setMemberEmail(customerObj?.email || '');
      return;
    }

    const employeeUser = apiService.getStoredUser();
    if (employeeUser?.role) {
      setMemberRole(employeeUser.role as 'customer' | 'admin' | 'cashier' | 'stock_manager');
      setMemberDisplayName(
        [employeeUser.firstName, employeeUser.lastName].filter(Boolean).join(' ') || employeeUser.email || 'Member'
      );
      setMemberEmail(employeeUser.email || '');
      return;
    }

    setMemberRole(null);
    setMemberDisplayName('Guest User');
    setMemberEmail('');
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAccountMenuOpen]);

  const accountMenuItems = (() => {
    if (memberRole === 'customer') {
      return [
        { label: 'My Profile', path: '/profile' },
        { label: 'My Orders', path: '/orders' },
        { label: 'Loyalty Activity', path: '/customer-dashboard' },
      ];
    }

    if (memberRole === 'cashier') {
      return [
        { label: 'POS Activity', path: '/pos' },
        { label: 'Customer Activity', path: '/customers' },
      ];
    }

    if (memberRole === 'stock_manager') {
      return [
        { label: 'Inventory Activity', path: '/inventory' },
        { label: 'Supplier Activity', path: '/suppliers' },
      ];
    }

    if (memberRole === 'admin') {
      return [
        { label: 'Dashboard Activity', path: '/dashboard' },
        { label: 'Employee Activity', path: '/employees' },
        { label: 'Reports Activity', path: '/reports' },
      ];
    }

    return [];
  })();

  const handleLogout = () => {
    apiService.logout();
    setMemberRole(null);
    setIsAccountMenuOpen(false);
    window.location.href = '/login';
  };

  const handleAddToCart = async (
    productId: any,
    productName: string,
    productPrice: any,
    productImage: string
  ) => {
    setCartCount((prev: number) => prev + 1);
    setAddedToCart(productId);

    // ✅ Get existing cart
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // ✅ Check if item already exists
    const itemIndex = existingCart.findIndex((item: any) => item.id === productId);

    const priceNum = typeof productPrice === 'string'
      ? parseFloat(productPrice.replace(/[^0-9.]/g, ""))
      : productPrice;

    if (itemIndex !== -1) {
      // already in cart → increase quantity
      existingCart[itemIndex].quantity += 1;
    } else {
      // add new item
      existingCart.push({
        id: productId,
        name: productName,
        price: priceNum,
        pricePerKg: `Rs. ${priceNum}`,
        image: productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
        quantity: 1
      });
    }

    // ✅ Save to localStorage
    localStorage.setItem("cart", JSON.stringify(existingCart));

    // ✅ Sync with MongoDB database if customer is logged in
    const authToken = apiService.getStoredToken();
    if (authToken) {
      try {
        const res = await apiService.saveCart(existingCart);
        console.log("[HomePage] Cart save response:", res);
        if (!res.success) {
          console.error("[HomePage] Cart save failed:", res.message);
        }
      } catch (err) {
        console.error("[HomePage] Error saving cart to DB:", err);
      }
    }

    // UI effects (same as yours)
    setTimeout(() => setAddedToCart(null), 2000);
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


            <div className="flex items-center gap-6 ">

              <div className="relative cursor-pointer" ref={accountMenuRef}>

                <button
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="flex flex-col items-center gap-1 hover:text-green-700"
                >
                  <div className="flex items-center gap-1">
                    <User className="w-6 h-6" />
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <span className="text-sm capitalize">{memberRole ? memberRole.replace('_', ' ') : 'Account'}</span>
                </button>

                {isAccountMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 cursor-pointer"
                    style={{ width: '150px' }}
                  >
                    {!memberRole ? (
                      <div className="px-4 py-3 space-y-3">

                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-800">Welcome Guest!</p>
                          <p className="text-xs text-gray-500">Sign in to manage your orders and loyalty points.</p>
                        </div>

                        <button
                          onClick={() => {
                            navigate('/login');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full bg-green-700 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4 rotate-180" />
                          Sign In
                        </button>

                        <div className="flex items-center gap-2 py-1">
                          <div className="flex-1 h-[1px] bg-gray-100"></div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">New here?</span>
                          <div className="flex-1 h-[1px] bg-gray-100"></div>
                        </div>

                        <button
                          onClick={() => {
                            navigate('/customer-register');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                        >
                          Create Account
                        </button>

                      </div>
                    ) : (
                      <>

                        <div className="px-4 pb-2 border-b border-gray-100 cursor-pointer">
                          <p className="text-sm font-bold text-gray-800 truncate">{memberDisplayName}</p>
                          {memberEmail && <p className="text-xs text-gray-500 truncate">{memberEmail}</p>}
                        </div>

                        <div className="py-1 cursor-pointer">
                          <p className="px-4 py-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">Activities</p>
                          {accountMenuItems.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                navigate(item.path, 'state' in item ? { state: item.state } : undefined);
                                setIsAccountMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors cursor-pointer"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 mt-1 pt-1 cursor-pointer">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>

                      </>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/cart')} className="flex flex-col items-center gap-1 relative hover:text-green-700 cursor-pointer"
              >
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
              <li><Link to="/products" className="hover:text-green-200">Shop by Category</Link></li>
              <li><a href="#offers" className="hover:text-green-200">Special Offers</a></li>
              <li><a href="#weekly-deals" className="hover:text-green-200">Weekly Deals</a></li>
              <li><a href="/contact" className="hover:text-green-200">Contact Us</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-green-700 mb-4">Fresh Groceries Delivered to Your Doorstep</h2>
              <p className="text-gray-600 mb-6">Shop from our wide range of fresh fruits, vegetables, dairy products, and more. Quality guaranteed!</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800"
              >
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
          <h2 className="text-gray-800 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() =>
                  navigate("/products", {
                    state: { category: category.name }
                  })
                }
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
          <h2 className="text-gray-800 mb-8 text-center">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Special Offers'}
          </h2>
          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredList.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={product.image || getDefaultImage(product.name, product.category)}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.specialOffers && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                        SPECIAL
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-green-700 mb-3 font-bold">Rs. {product.price}</p>
                    <button
                      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                      onClick={() => handleAddToCart(product._id, product.name, product.price, product.image)}
                      disabled={addedToCart === product._id}
                    >
                      {addedToCart === product._id ? 'Added!' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchQuery && featuredList.length === 0 && !isLoadingProducts && (
            <div className="text-center py-10">
              <p className="text-gray-500 italic">No special offers found matching your search.</p>
            </div>
          )}
          {!searchQuery && featuredList.length === 0 && !isLoadingProducts && (
            <div className="text-center py-10 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No products are currently marked as Special Offers.</p>
            </div>
          )}
        </div>
      </section>

      {/* Weekly Deals */}
      <section id="weekly-deals" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-gray-800 mb-8 text-center">Weekly Deals</h2>
          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {weeklyList.map((deal) => (
                <div key={deal._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={deal.image || getDefaultImage(deal.name, deal.category)}
                      alt={deal.name}
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      HOT DEAL
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-800 mb-2">{deal.name}</h3>
                    <p className="text-green-700 mb-3 font-bold">Rs. {deal.price}</p>
                    <button
                      className={`w-full text-white py-2 rounded transition-all ${addedToCart === deal._id
                        ? 'bg-green-800'
                        : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                        }`}
                      onClick={() => handleAddToCart(deal._id, deal.name, deal.price, deal.image)}
                      disabled={addedToCart === deal._id}
                    >
                      {addedToCart === deal._id ? (
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
          )}
          {searchQuery && weeklyList.length === 0 && !isLoadingProducts && (
            <div className="text-center py-10">
              <p className="text-gray-500 italic">No weekly deals found matching your search.</p>
            </div>
          )}
          {!searchQuery && weeklyList.length === 0 && !isLoadingProducts && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No products are currently marked as Weekly Deals.</p>
            </div>
          )}
          {searchQuery &&
            featuredList.length === 0 &&
            weeklyList.length === 0 && !isLoadingProducts && (
              <div className="bg-green-50 rounded-xl p-8 text-center max-w-lg mx-auto">
                <Search className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-gray-800">No products found</h3>
                <p className="text-gray-600">Try searching for something else like "Apples" or "Milk".</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-green-700 font-bold hover:underline"
                >
                  Clear Search
                </button>
              </div>
            )}
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
              <h3 className="text-gray-800 mb-2">Quality Products</h3>
              <p className="text-gray-600">Fresh and high-quality products guaranteed</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-gray-800 mb-2">Island-wide Delivery</h3>
              <p className="text-gray-600">Fast delivery to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-gray-800 mb-2">Loyalty Rewards</h3>
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
              <h3 className="mb-4">About Us</h3>
              <p className="text-gray-400 mb-4">Smart Supermarket - Your trusted partner for fresh groceries and daily essentials.</p>
              <Link to="/about" className="text-green-400 hover:text-green-300">Learn More →</Link>
            </div>
            <div>
              <h3 className="mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:text-white">Products</Link></li>
                <li><Link to="/services" className="hover:text-white">Services</Link></li>
                <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
                <li><Link to="/profile" className="hover:text-white">My Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Customer Service</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/return-policy" className="hover:text-white">Return Policy</Link></li>
                <li><Link to="/login" className="hover:text-white">Staff Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Follow Us</h3>
              <div className="flex gap-4 mb-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
              <div className="text-gray-400">
                <p className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Colombo, Sri Lanka</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+94 11 234 5678</span>
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Smart Supermarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
