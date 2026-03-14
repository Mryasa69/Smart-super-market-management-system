import { useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import Sidebar from "../Layout/Sidebar"; // adjust the path
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Printer, X } from 'lucide-react';
import ActivityTracker from '../../utils/activityTracker';

interface POSSystemProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | 'customer' | null;
  onLogout: () => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

const availableProducts: Product[] = [
  { id: 1, name: 'Fresh Milk 1L', price: 280, barcode: 'MILK001', category: 'Dairy' },
  { id: 2, name: 'White Bread', price: 120, barcode: 'BREAD001', category: 'Bakery' },
  { id: 3, name: 'Tomatoes 1kg', price: 350, barcode: 'VEG001', category: 'Vegetables' },
  { id: 4, name: 'Chicken 1kg', price: 850, barcode: 'MEAT001', category: 'Meat' },
  { id: 5, name: 'Rice 5kg', price: 600, barcode: 'RICE001', category: 'Grains' },
  { id: 6, name: 'Orange Juice 1L', price: 320, barcode: 'BEV001', category: 'Beverages' },
  { id: 7, name: 'Chocolate Bar', price: 180, barcode: 'SNACK001', category: 'Snacks' },
  { id: 8, name: 'Eggs (Dozen)', price: 450, barcode: 'EGG001', category: 'Dairy' },
  { id: 9, name: 'Fresh Apples 1kg', price: 450, barcode: 'FRUIT001', category: 'Fruits' },
  { id: 10, name: 'Butter 500g', price: 680, barcode: 'DAIRY002', category: 'Dairy' },
];

export default function POSSystem({ userRole, onLogout }: POSSystemProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('cash');
  const activityTracker = ActivityTracker.getInstance();

  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: product.price }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const product = availableProducts.find((p) => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Product not found!');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setShowPaymentModal(true);
  };

  const completeSale = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Log activity
    activityTracker.logSaleCompleted(`Rs. ${total.toFixed(2)}`, totalItems);
    
    alert(`Sale completed! Total: Rs. ${total.toFixed(2)}\nPayment method: ${paymentMethod.toUpperCase()}`);
    setCart([]);
    setDiscountPercent(0);
    setShowPaymentModal(false);
  };

  return (

    
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-gray-800">Point of Sale (POS)</h1>
          <p className="text-gray-600">Fast and efficient billing system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Barcode Scanner */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <form onSubmit={handleBarcodeScan} className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan barcode or enter SKU..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Search Products */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                  >
                    <p className="text-gray-800 mb-1">{product.name}</p>
                    <p className="text-green-700">Rs. {product.price}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.barcode}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800">Cart Items</h3>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="border-b pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">Rs. {item.price} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-800">Rs. {item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount */}
              <div className="border-t pt-4 space-y-3">
                <div>
                  <label className="block text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({discountPercent}%):</span>
                      <span>- Rs. {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-800 border-t pt-2">
                    <span>Total:</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={cart.length === 0}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-800">Complete Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">Total Amount:</p>
                <p className="text-gray-800">Rs. {total.toFixed(2)}</p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-gray-700">Select Payment Method:</p>
                
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg ${
                    paymentMethod === 'cash' ? 'border-green-700 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-gray-800">Cash</p>
                    <p className="text-sm text-gray-500">Pay with cash</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg ${
                    paymentMethod === 'card' ? 'border-green-700 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-gray-800">Card</p>
                    <p className="text-sm text-gray-500">Credit/Debit card</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg ${
                    paymentMethod === 'qr' ? 'border-green-700 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-gray-800">QR Payment</p>
                    <p className="text-sm text-gray-500">Mobile wallet / UPI</p>
                  </div>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={completeSale}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Complete & Print
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
