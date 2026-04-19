import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Clock, Zap, Tag, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const featuredProducts = [
  { id: 1, name: 'Fresh Apples', price: 'Rs. 450/kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', discount: '10% OFF' },
  { id: 2, name: 'Milk 1L', price: 'Rs. 280', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop', discount: null },
  { id: 3, name: 'White Bread', price: 'Rs. 120', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop', discount: '5% OFF' },
  { id: 4, name: 'Fresh Chicken', price: 'Rs. 850/kg', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&h=300&fit=crop', discount: null },
  { id: 5, name: 'Orange Juice', price: 'Rs. 320', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop', discount: '15% OFF' },
  { id: 6, name: 'Chocolate Bar', price: 'Rs. 180', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop', discount: null },
];

const weeklyDeals = [
  { id: 1, name: 'Premium Rice 5kg', originalPrice: 'Rs. 1,200', salePrice: 'Rs. 720', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', discount: '40%', badge: 'HOT DEAL' },
  { id: 2, name: 'Fresh Salmon', originalPrice: 'Rs. 2,500/kg', salePrice: 'Rs. 1,750/kg', image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop', discount: '30%', badge: 'WEEKLY SPECIAL' },
  { id: 3, name: 'Imported Cheese', originalPrice: 'Rs. 950', salePrice: 'Rs. 665', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop', discount: '30%', badge: 'LIMITED' },
  { id: 4, name: 'Breakfast Cereal 500g', originalPrice: 'Rs. 680', salePrice: 'Rs. 476', image: 'https://images.unsplash.com/photo-1621588335788-5a2cfc610c0e?w=400&h=400&fit=crop', discount: '30%', badge: 'BEST SELLER' },
  { id: 5, name: 'Olive Oil 1L', originalPrice: 'Rs. 1,800', salePrice: 'Rs. 1,260', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', discount: '30%', badge: 'PREMIUM' },
  { id: 6, name: 'Fresh Strawberries', originalPrice: 'Rs. 850', salePrice: 'Rs. 595', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop', discount: '30%', badge: 'FRESH TODAY' },
];

export default function HomePage() {

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

const handleAddToCart = (
  productId: number,
  productName: string,
  productPrice: string,
  productImage: string
) => {
  setCartCount(prev => prev + 1);
  setAddedToCart(productId);

  // ✅ Get existing cart
  const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

  // ✅ Check if item already exists
  const itemIndex = existingCart.findIndex((item: any) => item.id === productId);

  if (itemIndex !== -1) {
    // already in cart → increase quantity
    existingCart[itemIndex].quantity += 1;
  } else {
    // add new item
    existingCart.push({
      id: productId,
      name: productName,
      price: parseFloat(productPrice.replace(/[^0-9]/g, "")), // convert Rs string → number
      pricePerKg: productPrice,
      image: productImage,
      quantity: 1
    });
  }

  // ✅ Save to localStorage
  localStorage.setItem("cart", JSON.stringify(existingCart));

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

            
            <div className="flex items-center gap-6">
              <Link to="/profile" className="flex flex-col items-center gap-1 hover:text-green-700">
                <User className="w-6 h-6" />
                <span className="text-sm">Account</span>
              </Link>
              <button onClick={() => navigate('/cart')}  className="flex flex-col items-center gap-1 relative hover:text-green-700"
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
              <h2 className="text-green-700 mb-4">Fresh Groceries Delivered to Your Doorstep</h2>
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
          <h2 className="text-gray-800 mb-8 text-center">Shop by Category</h2>
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
          <h2 className="text-gray-800 mb-8 text-center">Special Offers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
                  <button 
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    onClick={() => handleAddToCart( product.id, product.name, product.price,  product.image )}
                    disabled={addedToCart === product.id}
                  >
                    {addedToCart === product.id ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Deals */}
      <section id="weekly-deals" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-gray-800 mb-8 text-center">Weekly Deals</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
                    onClick={() => handleAddToCart( deal.id + 100, deal.name, deal.salePrice, deal.image )}
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
              <p className="text-gray-400">Smart Supermarket - Your trusted partner for fresh groceries and daily essentials.</p>
            </div>
            <div>
              <h3 className="mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Customer Service</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Return Policy</a></li>
                <li><a href="#" className="hover:text-white">Delivery Info</a></li>
                <li><Link to="/login" className="hover:text-white">Staff Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Follow Us</h3>
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