import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart as CartIcon, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { apiService } from "../../services/api";

type CartItem = {
  id: string | number;
  name: string;
  price: number;        
  pricePerKg: string;
  image: string;
  quantity: number;
};

type CustomerProfile = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  nicNumber?: string;
  loyaltyPoints?: number;
};

export default function ShoppingCart() {
  const navigate = useNavigate();

  // ✅ Load cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load database cart on mount
  useEffect(() => {
    const loadCartFromDb = async () => {
      const token = localStorage.getItem("customerToken");
      if (token) {
        try {
          const response = await apiService.getCart();
          if (response.success && response.data) {
            setCartItems(response.data.items || []);
          }
        } catch (err) {
          console.error("Error loading cart from DB:", err);
        }
      }
    };
    loadCartFromDb();
  }, []);

  // ✅ Save cart to localStorage and database whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    const token = apiService.getStoredToken();
    if (token) {
      apiService.saveCart(cartItems).then(res => {
        console.log("[ShoppingCart] Cart save response:", res);
        if (!res.success) {
          console.error("[ShoppingCart] Cart save failed:", res.message);
        }
      }).catch(err => console.error("[ShoppingCart] Error saving cart to DB:", err));
    }
  }, [cartItems]);

  useEffect(() => {
    const customer = localStorage.getItem("customer");
    const customerProfileRaw = localStorage.getItem("customerProfile");

    const customerObj = customer ? JSON.parse(customer) : {};
    const profileObj = customerProfileRaw ? JSON.parse(customerProfileRaw) : {};
    const mergedProfile = {
      ...customerObj,
      ...profileObj,
    };

    setCustomerProfile(mergedProfile);
    setDeliveryAddress(mergedProfile.address || "");
  }, []);

  const deliveryFee = 200;

 const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
  return sum + item.price * item.quantity;
}, 0);

  const total = subtotal + deliveryFee;

  // ✅ Update quantity
const updateQuantity = (id: string | number, change: number) => {
  setCartItems((items: CartItem[]) =>
    items.map((item: CartItem) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    )
  );
};

  // ✅ Remove item
 const removeItem = (id: string | number) => {
  setCartItems((items: CartItem[]) =>
    items.filter((item) => item.id !== id)
  );
};

  // ✅ Place order
  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim() || !customerProfile.phone?.trim()) {
      setCheckoutError("Please add your address and contact number in My Profile before placing the order.");
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutError("");

    const normalizedItems = cartItems.map((item: CartItem) => ({
      id: String(item.id),
      name: item.name,
      price: item.price,
      pricePerKg: item.pricePerKg,
      image: item.image,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    const cacheOrder = (order: any) => {
      const storedOrder = {
        ...order,
        id: order.id || order.orderNumber || order._id,
        orderNumber: order.orderNumber || order.id || order._id,
        date: order.date || order.createdAt || new Date().toISOString(),
      };

      const existingOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
      const nextOrders = [
        storedOrder,
        ...existingOrders.filter((existing: any) => {
          const existingId = existing.orderNumber || existing.id || existing._id;
          return existingId !== storedOrder.orderNumber;
        }),
      ];

      localStorage.setItem("customerOrders", JSON.stringify(nextOrders));
    };

    try {
      const response = await apiService.createOrder({
        items: normalizedItems,
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: customerProfile.phone,
        deliveryFee,
      });

      if (response.success && response.data) {
        cacheOrder(response.data);
        localStorage.removeItem("cart");
        try {
          await apiService.saveCart([]);
        } catch (error) {
          console.error("[ShoppingCart] Error clearing cart in DB:", error);
        }
        setCartItems([]);
        navigate("/order-success");
      } else {
        setCheckoutError(response.message || "Unable to save the order right now. Please try again.");
      }
    } catch (error) {
      console.error("[ShoppingCart] Error creating order:", error);
      setCheckoutError("Unable to save the order right now. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ✅ EMPTY CART UI
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">

      {/* Top Bar */}
      <div className="flex justify-between items-end px-6 py-8 border-b text-sm text-gray-600 w-full max-w-7xl mx-auto">
      
     
  
        {/* Left: Continue Shopping */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-600"
        >
          ← Continue Shopping
        </button>

        {/* Center: Shopping Cart */}
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-green-600"
        >
          🛒 Shopping Cart
        </button>

        {/* Right: My Account */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-green-600"
        >
          My Account
        </button>
      </div>

      {/* Empty Cart Content */}
      <div className="flex flex-col items-center justify-center flex-1 mt-20">
        {/* Cart Icon */}
        <div className="w-20 h-20 bg-white p-1 rounded-full flex items-center justify-center mb-2 shadow">
        <CartIcon className="w-16 h-16 text-green-600" />
        </div>

        <p className="text-gray-400 mb-2">Your cart is empty</p>
        <p className="text-gray-400 mb-6 text-center">
          Add some items to get started!
        </p>

        {/* Start Shopping Button */}
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Start Shopping
        </button>
      </div>
    </div>
    );
  }

  // ✅ CART WITH ITEMS UI
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Top Bar */}
      <div className="flex justify-between items-end px-6 py-8 border-b text-sm text-gray-600 w-full max-w-7xl mx-auto">
      
     
  
        {/* Left: Continue Shopping */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-600"
        >
          ← Continue Shopping
        </button>

        {/* Center: Shopping Cart */}
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-green-600"
        >
          🛒 Shopping Cart
        </button>

        {/* Right: My Account */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-green-600"
        >
          My Account
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="md:col-span-2">
          <h2 className="text-xl mb-4">
            Cart Items ({cartItems.length})
          </h2>

          <div className="space-y-4">
           {cartItems.map((item: CartItem) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />

                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Rs. {item.pricePerKg}/kg
                    </p>

                    <div className="flex items-center gap-4">
                      {/* Quantity */}
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          -
                        </button>

                        <span className="px-4 py-1 border-x">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-medium">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <Card className="p-6 sticky top-24 mt-8 md:mt-0">
            <h3 className="text-lg mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Rs. {deliveryFee}</span>
              </div>

              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {!showCheckout ? (
              <>
                <Button
                  onClick={() => {
                    if (!customerProfile.address?.trim() || !customerProfile.phone?.trim()) {
                      setCheckoutError("Please complete your address and contact details in My Profile before checkout.");
                      return;
                    }
                    setCheckoutError("");
                    setShowCheckout(true);
                  }}
                  className="w-full mb-2 bg-green-600 hover:bg-green-700"
                >
                  Proceed to Checkout
                </Button>

                {checkoutError && (
                  <div className="text-sm text-red-600 mb-2">{checkoutError}</div>
                )}

                {(!customerProfile.address?.trim() || !customerProfile.phone?.trim()) && (
                  <Button
                    onClick={() => navigate("/profile/edit")}
                    variant="outline"
                    className="w-full mb-2"
                  >
                    Add Address & Contact Details
                  </Button>
                )}

                <button
                  onClick={() => navigate("/")}
                  className="w-full text-gray-600"
                >
                  Continue Shopping
                </button>
              </>
            ) : (
              <>
                <Textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mb-4"
                />
                <p className="text-xs text-gray-500 mb-4">
                  Contact Number: {customerProfile.phone || "Not set"}
                </p>

                {checkoutError && (
                  <div className="text-sm text-red-600 mb-2">{checkoutError}</div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full mb-2 bg-green-600 hover:bg-green-700"
                >
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </Button>

                <Button
                  onClick={() => setShowCheckout(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}