import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart as CartIcon, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
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

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [btnHover, setBtnHover] = useState<{ [key: string]: boolean }>({});

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

  // Save cart to localStorage and database whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));

    const token = apiService.getStoredToken();
    if (token) {
      apiService
        .saveCart(cartItems)
        .then((res) => {
          if (!res.success) console.error("[ShoppingCart] Cart save failed:", res.message);
        })
        .catch((err) => console.error("[ShoppingCart] Error saving cart to DB:", err));
    }
  }, [cartItems]);

  useEffect(() => {
    const customer = localStorage.getItem("customer");
    const customerProfileRaw = localStorage.getItem("customerProfile");
    const customerObj = customer ? JSON.parse(customer) : {};
    const profileObj = customerProfileRaw ? JSON.parse(customerProfileRaw) : {};
    const mergedProfile = { ...customerObj, ...profileObj };
    setCustomerProfile(mergedProfile);
    setDeliveryAddress(mergedProfile.address || "");
  }, []);

  const deliveryFee = 200;
  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + deliveryFee;

  const updateQuantity = (id: string | number, change: number) => {
    setCartItems((items: CartItem[]) =>
      items.map((item: CartItem) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      )
    );
  };

  const removeItem = (id: string | number) => {
    setCartItems((items: CartItem[]) => items.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim() || !customerProfile.phone?.trim()) {
      setCheckoutError(
        "Please add your address and contact number in My Profile before placing the order."
      );
      return;
    }

    const normalizedItems = cartItems.map((item: CartItem) => ({
      id: String(item.id),
      name: item.name,
      price: item.price,
      pricePerKg: item.pricePerKg,
      image: item.image,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    try {
      setIsPlacingOrder(true);
      setCheckoutError("");

      const response = await apiService.createStripeOrder({
        items: normalizedItems,
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: customerProfile.phone,
        deliveryFee,
      });

      if (!response.success || !response.data?.url) {
        setCheckoutError(
          response.message || "Unable to save the order right now. Please try again."
        );
        return;
      }

      window.location.href = response.data.url;
    } catch (error) {
      console.error("[ShoppingCart] Error creating order:", error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Unable to save the order right now. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleHover = (id: string, isHovered: boolean) =>
    setBtnHover((prev) => ({ ...prev, [id]: isHovered }));

  /* ── shared styles mirroring Profile page ── */
  const S = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)",
      fontFamily: "'Inter',system-ui,sans-serif",
    } as React.CSSProperties,
    topbar: {
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky" as const,
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    topbarInner: {
      maxWidth: 780,
      margin: "0 auto",
      padding: "0 20px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 14,
      fontWeight: 600,
      color: "#374151",
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: "6px 10px",
      borderRadius: 8,
      transition: "all 0.15s",
    } as React.CSSProperties,
    title: { fontSize: 15, fontWeight: 700, color: "#111827" },
    navRight: { display: "flex", alignItems: "center", gap: 10 },
    navPill: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 14,
      fontWeight: 600,
      color: "#374151",
      cursor: "pointer",
      background: "#f3f4f6",
      border: "none",
      padding: "6px 14px",
      borderRadius: 20,
      transition: "all 0.15s",
    } as React.CSSProperties,
    wrap: { maxWidth: 780, margin: "0 auto", padding: "28px 20px 60px" },
    sectionTitle: { fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 20px" },

    card: {
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      border: "1px solid #f3f4f6",
      overflow: "hidden",
    },
    cardBody: { padding: "20px 24px" },

    summaryCard: {
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      border: "1px solid #f3f4f6",
      padding: "24px",
    },

    emptyWrap: {
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      border: "1px solid #f3f4f6",
      padding: "60px 20px",
      textAlign: "center" as const,
    },

    primaryBtn: {
      width: "100%",
      padding: "12px 0",
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 700,
      background: "linear-gradient(135deg,#16a34a,#059669)",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
      transition: "all 0.15s",
      marginBottom: 10,
    } as React.CSSProperties,

    outlineBtn: {
      width: "100%",
      padding: "11px 0",
      borderRadius: 12,
      border: "2px solid #d1d5db",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      background: "#fff",
      color: "#374151",
      transition: "all 0.15s",
      marginBottom: 8,
    } as React.CSSProperties,

    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: 700,
      color: "#374151",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,

    removeBtn: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#ef4444",
      fontSize: 13,
      fontWeight: 600,
      padding: "4px 8px",
      borderRadius: 8,
      transition: "background 0.15s",
    } as React.CSSProperties,
  };

  /* ── EMPTY CART ── */
  if (cartItems.length === 0) {
    return (
      <div style={S.page}>
        {/* topbar */}
        <div style={S.topbar}>
          <div style={S.topbarInner}>
            <button
              style={{ ...S.backBtn, background: btnHover["back"] ? "#f3f4f6" : "none" }}
              onMouseEnter={() => handleHover("back", true)}
              onMouseLeave={() => handleHover("back", false)}
              onClick={() => navigate("/")}
            >
              ← Continue Shopping
            </button>
            <span style={S.title}>Shopping Cart</span>
            <div style={S.navRight}>
              <button
                style={{ ...S.navPill, background: btnHover["profile"] ? "#e5e7eb" : "#f3f4f6" }}
                onMouseEnter={() => handleHover("profile", true)}
                onMouseLeave={() => handleHover("profile", false)}
                onClick={() => navigate("/profile")}
              >
                👤 Profile
              </button>
              <button
                style={{ ...S.navPill, background: btnHover["orders"] ? "#e5e7eb" : "#f3f4f6" }}
                onMouseEnter={() => handleHover("orders", true)}
                onMouseLeave={() => handleHover("orders", false)}
                onClick={() => navigate("/orders")}
              >
                📦 Orders
              </button>
            </div>
          </div>
        </div>

        {/* empty state */}
        <div style={S.wrap}>
          <div style={S.emptyWrap}>
            <div
              style={{
                display: "inline-flex",
                background: "#f0fdf4",
                borderRadius: "50%",
                padding: 18,
                marginBottom: 16,
              }}
            >
              <CartIcon size={36} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", margin: "0 0 8px" }}>
              Your cart is empty
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 auto 20px", maxWidth: 280 }}>
              Add some items to get started!
            </p>
            <button
              style={{
                padding: "10px 24px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                background: "linear-gradient(135deg,#16a34a,#059669)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
              }}
              onClick={() => navigate("/")}
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── CART WITH ITEMS ── */
  return (
    <div style={S.page}>
      {/* topbar */}
      <div style={S.topbar}>
        <div style={S.topbarInner}>
          <button
            style={{ ...S.backBtn, background: btnHover["back"] ? "#f3f4f6" : "none" }}
            onMouseEnter={() => handleHover("back", true)}
            onMouseLeave={() => handleHover("back", false)}
            onClick={() => navigate("/")}
          >
            ← Continue Shopping
          </button>
          <span style={S.title}>Shopping Cart</span>
          <div style={S.navRight}>
            <button
              style={{ ...S.navPill, background: btnHover["profile"] ? "#e5e7eb" : "#f3f4f6" }}
              onMouseEnter={() => handleHover("profile", true)}
              onMouseLeave={() => handleHover("profile", false)}
              onClick={() => navigate("/profile")}
            >
              👤 Profile
            </button>
            <button
              style={{ ...S.navPill, background: btnHover["orders"] ? "#e5e7eb" : "#f3f4f6" }}
              onMouseEnter={() => handleHover("orders", true)}
              onMouseLeave={() => handleHover("orders", false)}
              onClick={() => navigate("/orders")}
            >
              📦 Orders
            </button>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={S.wrap}>
        <p style={S.sectionTitle}>Cart Items ({cartItems.length})</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* ── LEFT: item list ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cartItems.map((item: CartItem) => (
              <div key={item.id} style={S.card}>
                <div style={{ ...S.cardBody, display: "flex", gap: 16 }}>
                  {/* thumbnail */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <ImageWithFallback src={item.image} alt={item.name} />
                  </div>

                  {/* details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#111827",
                        margin: "0 0 4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px" }}>
                      Rs. {item.pricePerKg}/kg
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {/* qty */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button style={S.qtyBtn} onClick={() => updateQuantity(item.id, -1)}>
                          −
                        </button>
                        <span
                          style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 20, textAlign: "center" }}
                        >
                          {item.quantity}
                        </span>
                        <button style={S.qtyBtn} onClick={() => updateQuantity(item.id, 1)}>
                          +
                        </button>
                      </div>

                      {/* remove */}
                      <button style={S.removeBtn} onClick={() => removeItem(item.id)}>
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* price */}
                  <div
                    style={{
                      flexShrink: 0,
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#111827",
                      alignSelf: "center",
                    }}
                  >
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── RIGHT: order summary ── */}
          <div style={{ position: "sticky", top: 72 }}>
            <div style={S.summaryCard}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 20px" }}>
                Order Summary
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280" }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280" }}>Delivery</span>
                  <span style={{ fontWeight: 600 }}>Rs. {deliveryFee}</span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {!showCheckout ? (
                <>
                  <button
                    style={S.primaryBtn}
                    onClick={() => {
                      if (!customerProfile.address?.trim() || !customerProfile.phone?.trim()) {
                        setCheckoutError(
                          "Please complete your address and contact details in My Profile before checkout."
                        );
                        return;
                      }
                      setCheckoutError("");
                      setShowCheckout(true);
                    }}
                  >
                    Proceed to Checkout
                  </button>

                  {checkoutError && (
                    <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 10 }}>
                      {checkoutError}
                    </p>
                  )}

                  {(!customerProfile.address?.trim() || !customerProfile.phone?.trim()) && (
                    <button
                      style={S.outlineBtn}
                      onClick={() => navigate("/profile/edit")}
                    >
                      Add Address & Contact Details
                    </button>
                  )}

                  <button
                    style={{ ...S.outlineBtn, marginBottom: 0 }}
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                    Delivery Address
                  </p>
                  <Textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mb-3"
                  />
                  <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
                    Contact: {customerProfile.phone || "Not set"}
                  </p>

                  {checkoutError && (
                    <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 10 }}>
                      {checkoutError}
                    </p>
                  )}

                  <button
                    style={{ ...S.primaryBtn, opacity: isPlacingOrder ? 0.7 : 1 }}
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? "Redirecting to Secure Checkout…" : "Pay with Stripe"}
                  </button>

                  <button style={{ ...S.outlineBtn, marginBottom: 0 }} onClick={() => setShowCheckout(false)}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}