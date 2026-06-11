import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User,Heart,ArrowLeft,SlidersHorizontal,} from "lucide-react";
import { useNavigate,useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';

export default function Products() {
  const [wishlist, setWishlist] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
    const [addedToCart, setAddedToCart] = useState<number | null>(null);
    const [cartCount, setCartCount] = useState<number>(() => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      return cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    });
    const navigate = useNavigate();
    const location = useLocation();

    console.log(location.state);

    const [selectedCategory, setSelectedCategory] = useState(
  location.state?.category || "All Products"
);

useEffect(() => {
  if (location.state?.category) {
    setSelectedCategory(location.state.category);
  }
}, [location.state]);

useEffect(() => {
  const syncCart = async () => {
    const customerToken = localStorage.getItem("customerToken");
    if (customerToken) {
      try {
        const res = await apiService.getCart();
        if (res.success && res.data) {
          const items = res.data.items || [];
          localStorage.setItem("cart", JSON.stringify(items));
        }
      } catch (err) {
        console.error("Error syncing cart on products page mount:", err);
      }
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartCount(total);
  };
  syncCart();
}, []);

    const updateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  setCartCount(total);
};

  const categories = [
    "All Products",
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Bakery",
    "Meat & Seafood",
    "Beverages",
    "Snacks & Sweets",
    "Frozen Foods",
    "Personal Care",
    "Household Items",
  ];

  const products = [
  { id: 1, name: 'Fresh Apples', category: 'Fruits & Vegetables', price: 'Rs. 450/kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', discount: '10%', rating: 4.0, inStock: true },
  { id: 2, name: 'Milk 1L', category: 'Dairy & Eggs', price: 'Rs. 280', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop', discount: null, rating: 4.8, inStock: true },
  { id: 3, name: 'White Bread', category: 'Bakery', price: 'Rs. 120', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop', discount: '5%', rating: 4.3, inStock: true },
  { id: 4, name: 'Fresh Chicken', category: 'Meat & Seafood', price: 'Rs. 850/kg', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&h=300&fit=crop', discount: null, rating: 4.6, inStock: true },
  { id: 5, name: 'Orange Juice', category: 'Beverages', price: 'Rs. 320', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop', discount: '15%', rating: 4.7, inStock: true },
  { id: 6, name: 'Chocolate Bar', category: 'Snacks & Sweets', price: 'Rs. 180', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop', discount: null, rating: 4.4, inStock: true },
  { id: 7, name: 'Premium Rice 5kg', category: 'Household Items', price: 'Rs. 720', originalPrice: 'Rs. 1,200', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', discount: '40%', rating: 4.9, inStock: true },
  { id: 8, name: 'Fresh Salmon', category: 'Meat & Seafood', price: 'Rs. 1,750/kg', originalPrice: 'Rs. 2,500/kg', image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop', discount: '30%', rating: 4.8, inStock: true },
  { id: 9, name: 'Imported Cheese', category: 'Dairy & Eggs', price: 'Rs. 665', originalPrice: 'Rs. 950', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop', discount: '30%', rating: 4.7, inStock: true },
  { id: 10, name: 'Breakfast Cereal', category: 'Snacks & Sweets', price: 'Rs. 476', originalPrice: 'Rs. 680', image: 'https://media.istockphoto.com/id/2248185261/photo/breakfast-cereals-on-the-kitchen-table-three-bowls-filled-with-healthy-wholegrain-cereals.jpg?s=1024x1024&w=is&k=20&c=zFnfLpfJvfPFs3aYIBoEt4W6VxlCDWmEtKNglWMSCdo=', discount: '30%', rating: 4.5, inStock: true },
  { id: 11, name: 'Olive Oil 1L', category: 'Household Items', price: 'Rs. 1,260', originalPrice: 'Rs. 1,800', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', discount: '30%', rating: 4.6, inStock: true },
  { id: 12, name: 'Fresh Strawberries', category: 'Fruits & Vegetables', price: 'Rs. 595', originalPrice: 'Rs. 850', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop', discount: '30%', rating: 4.9, inStock: true },
  { id: 13, name: 'Greek Yogurt', category: 'Dairy & Eggs', price: 'Rs. 350', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop', discount: null, rating: 4.4, inStock: true },
  { id: 14, name: 'Croissants', category: 'Bakery', price: 'Rs. 450', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop', discount: null, rating: 4.5, inStock: false },
  { id: 15, name: 'Fresh Tomatoes', category: 'Fruits & Vegetables', price: 'Rs. 180/kg', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop', discount: null, rating: 4.3, inStock: true },
];



  // Wishlist
  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };


  // 🛒 ADD TO CART (LOCALSTORAGE VERSION)
  const handleAddToCart = async (product: any) => {
  setCartCount(prev => prev + 1);
  setAddedToCart(product.id);

  // ✅ Get existing cart
  const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

  // ✅ Check if item already exists
  const itemIndex = existingCart.findIndex((item: any) => item.id === product.id);


  if (itemIndex !== -1) {
    // already in cart → increase quantity
    existingCart[itemIndex].quantity += 1;
  } else {
    // add new item
    existingCart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9]/g, "")), // convert Rs string → number
      pricePerKg: product.price,
      image: product.image,
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
      console.log("[Products] Cart save response:", res);
      if (!res.success) {
        console.error("[Products] Cart save failed:", res.message);
      }
    } catch (err) {
      console.error("[Products] Error saving cart to DB:", err);
    }
  }

  // UI effects (same as yours)
  setTimeout(() => setAddedToCart(null), 2000);
};

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All Products" ||
      product.category === selectedCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

 // Convert price string to number
const getPriceValue = (price: string) => {
  return parseInt(price.replace(/[^0-9]/g, ""));
};

// Sort products
const sortedProducts = [...filteredProducts].sort((a, b) => {
  if (sortBy === "rating") {
    return b.rating - a.rating;
  }

  if (sortBy === "price-low") {
    return getPriceValue(a.price) - getPriceValue(b.price);
  }

  if (sortBy === "price-high") {
    return getPriceValue(b.price) - getPriceValue(a.price);
  }

  return 0;
});

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Back */}
            <Link
              to="/"
              className="flex items-center gap-2 text-green-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-full pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-700 text-white p-2 rounded-full">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Icons */}
             <div className="flex items-center gap-6">
              <Link to="/profile" className="flex flex-col items-center gap-1 hover:text-green-700">
                <User className="w-6 h-6" />
              </Link>
              <button onClick={() => navigate('/cart')}  className="flex flex-col items-center gap-1 relative hover:text-green-700"
>
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                
              </button>
            </div>
            
            
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* SIDEBAR */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3>Filters</h3>

                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  ✕
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="mb-3">Categories</h4>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedCategory === category
                          ? "bg-green-100 text-green-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

               {/* Sort By */}
              <div>
                <h4 className="text-gray-700 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </aside>

          {/* PRODUCTS */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl">
                  {selectedCategory}
                </h2>

                <p className="text-gray-500">
                  {sortedProducts.length} products found
                </p>
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden border px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {/* IMAGE */}
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />

                    {product.discount && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {product.discount} OFF
                      </span>
                    )}

                    <button
                      onClick={() =>
                        toggleWishlist(product.id)
                      }
                      className="absolute top-2 left-2 bg-white p-2 rounded-full shadow"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          wishlist.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h3 className="font-medium">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-2">
                      {product.category}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500">
                        ★★★★★
                      </span>

                      <span className="ml-2 text-sm text-gray-500">
                        ({product.rating})
                      </span>
                    </div>

                    {/* Price */}
                    <p className="text-green-700 font-medium mb-4">
                      {product.price}
                    </p>

                    {/* Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:bg-gray-300"
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}