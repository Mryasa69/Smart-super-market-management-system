import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Printer, X } from 'lucide-react';
import { apiService } from '../../services/api';

interface POSSystemProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  barcode?: string;
  quantity: number;
  subtotal: number;
}

export default function POSSystem({ userRole, onLogout }: POSSystemProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('cash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPOSData();
  }, []);

  const loadPOSData = async () => {
    try {
      setLoading(true);
      const [prodRes, custRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getCustomers(),
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (custRes.success && custRes.data) {
        setCustomers(custRes.data);
      }
    } catch (error) {
      console.error('Error loading POS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert('Cannot add more items than available in stock!');
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      if (product.quantity <= 0) {
        alert('Product is out of stock!');
        return;
      }
      setCart([...cart, { 
        productId: product._id, 
        name: product.name, 
        price: product.price, 
        barcode: product.barcode || product.sku,
        quantity: 1, 
        subtotal: product.price 
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p._id === productId);
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + delta;
            if (product && newQuantity > product.quantity) {
              alert('Cannot exceed available stock limit!');
              return item;
            }
            const validatedQuantity = Math.max(0, newQuantity);
            return { ...item, quantity: validatedQuantity, subtotal: validatedQuantity * item.price };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.barcode === barcodeInput || p.sku === barcodeInput);
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

  const completeSale = async () => {
    const salePayload = {
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      subtotal,
      discountPercent,
      discountAmount,
      total,
      paymentMethod,
      customerId: selectedCustomerId || null
    };

    try {
      const response = await apiService.createSale(salePayload);
      if (response.success) {
        alert(`Sale completed successfully!\nTotal: Rs. ${total.toFixed(2)}\nPayment method: ${paymentMethod.toUpperCase()}`);
        setCart([]);
        setDiscountPercent(0);
        setSelectedCustomerId('');
        setShowPaymentModal(false);
        await loadPOSData(); // Reload inventory levels
      } else {
        alert('Failed to save sale: ' + response.message);
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Network error completing sale transaction.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading POS system data...</div>
        </div>
      </DashboardLayout>
    );
  }

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
                  placeholder="Search products by name, barcode, SKU..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left flex flex-col justify-between"
                    disabled={product.quantity <= 0}
                  >
                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">{product.name}</p>
                      <p className="text-green-700 font-medium">Rs. {product.price}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500 w-full">
                      <span>{product.barcode || product.sku}</span>
                      <span className={product.quantity <= 5 ? "text-red-600 font-bold" : "text-gray-600"}>
                        Qty: {product.quantity}
                      </span>
                    </div>
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
                    <div key={item.productId} className="border-b pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">Rs. {item.price} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
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

              {/* Customer Link & Discount */}
              <div className="border-t pt-4 space-y-3">
                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">Link Customer (Loyalty Points)</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="">Walk-in Customer (No points)</option>
                    {customers.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.name} - {cust.phone} ({cust.tier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">Discount (%)</label>
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
                <div className="space-y-2 pt-2">
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
                  <div className="flex justify-between text-gray-800 border-t pt-2 font-bold">
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
                <p className="text-gray-600 mb-2 font-semibold">Total Amount:</p>
                <p className="text-2xl font-bold text-green-700">Rs. {total.toFixed(2)}</p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-gray-700 font-medium">Select Payment Method:</p>
                
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg ${
                    paymentMethod === 'cash' ? 'border-green-700 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="text-gray-800 font-semibold">Cash</p>
                    <p className="text-sm text-gray-500">Pay with cash</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg ${
                    paymentMethod === 'card' ? 'border-green-700 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="text-gray-800 font-semibold">Card</p>
                    <p className="text-sm text-gray-500">Credit/Debit card</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg ${
                    paymentMethod === 'qr' ? 'border-green-700 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <QrCode className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="text-gray-800 font-semibold">QR Payment</p>
                    <p className="text-sm text-gray-500">Mobile wallet / UPI</p>
                  </div>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={completeSale}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center justify-center gap-2 font-medium"
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

