import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart as CartIcon, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { ImageWithFallback } from "../figma/ImageWithFallback";

type CartItem = {
  id: number;
  name: string;
  price: number;        
  pricePerKg: string;
  image: string;
  quantity: number;
};
export default function ShoppingCart() {
  const navigate = useNavigate();

  // ✅ Load cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [deliveryAddress, setDeliveryAddress] = useState(
    "123, Main Street, Colombo 07"
  );
  const [showCheckout, setShowCheckout] = useState(false);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const deliveryFee = 200;

 const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
  return sum + item.price * item.quantity;
}, 0);

  const total = subtotal + deliveryFee;

  // ✅ Update quantity
const updateQuantity = (id: number, change: number) => {
  setCartItems((items: CartItem[]) =>
    items.map((item: CartItem) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    )
  );
};

  // ✅ Remove item
 const removeItem = (id: number) => {
  setCartItems((items: CartItem[]) =>
    items.filter((item) => item.id !== id)
  );
};

  // ✅ Place order
  const handlePlaceOrder = () => {
    localStorage.removeItem("cart"); // clear cart
    setCartItems([]);
    navigate("/order-success");
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
                  onClick={() => setShowCheckout(true)}
                  className="w-full mb-2 bg-green-600 hover:bg-green-700"
                >
                  Proceed to Checkout
                </Button>

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

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full mb-2 bg-green-600 hover:bg-green-700"
                >
                  Place Order
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