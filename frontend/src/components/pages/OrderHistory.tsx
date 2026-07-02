import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, CheckCircle, Clock } from "lucide-react";
import { apiService, CustomerOrder } from "../../services/api";

export function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [btnHover, setBtnHover] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadOrders = async () => {
      const localOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
      const token = apiService.getStoredToken();

      if (!token) {
        setOrders(localOrders);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getOrders();
        if (response.success && response.data) {
          setOrders(response.data);
          setError("");
        } else {
          setOrders(localOrders);
          setError(response.message || "Showing locally cached orders.");
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        setOrders(localOrders);
        setError("Showing locally cached orders.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const formatOrderDate = (order: CustomerOrder) => {
    const rawDate = order.date || order.createdAt;
    if (!rawDate) return "Recently";
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) return String(rawDate);
    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const orderId = (order: CustomerOrder) => order.id || order.orderNumber || order._id;

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

    /* heading */
    sectionTitle: { fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 20px" },

    /* order cards */
    card: {
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      border: "1px solid #f3f4f6",
      overflow: "hidden",
      marginBottom: 16,
    },
    cardBody: { padding: "24px 28px" },

    statusPill: (isCompleted: boolean) =>
      ({
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: isCompleted ? "#d1fae5" : "#dbeafe",
        color: isCompleted ? "#065f46" : "#1d4ed8",
      } as React.CSSProperties),

    detailBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 18px",
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      background: "linear-gradient(135deg,#16a34a,#059669)",
      color: "#fff",
      boxShadow: "0 4px 10px rgba(22,163,74,0.2)",
      transition: "all 0.15s",
    } as React.CSSProperties,

    emptyWrap: {
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      border: "1px solid #f3f4f6",
      padding: "60px 20px",
      textAlign: "center" as const,
    },
  };

  return (
    <div style={S.page}>
      {/* ── top bar ── */}
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
          <span style={S.title}>My Orders</span>
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
              style={{ ...S.navPill, background: btnHover["cart"] ? "#e5e7eb" : "#f3f4f6" }}
              onMouseEnter={() => handleHover("cart", true)}
              onMouseLeave={() => handleHover("cart", false)}
              onClick={() => navigate("/cart")}
            >
              🛒 Cart
            </button>
          </div>
        </div>
      </div>

      {/* ── body ── */}
      <div style={S.wrap}>
        <p style={S.sectionTitle}>Order History</p>

        {error && (
          <p style={{ fontSize: 13, color: "#92400e", marginBottom: 16 }}>{error}</p>
        )}

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280", fontSize: 15 }}>
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
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
              <Package size={36} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", margin: "0 0 8px" }}>
              No orders yet
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 auto 20px", maxWidth: 280 }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button
              style={S.detailBtn}
              onClick={() => navigate("/")}
            >
              Explore Store
            </button>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <div key={orderId(order)} style={S.card}>
                <div style={S.cardBody}>
                  {/* header row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "#111827",
                          margin: "0 0 4px",
                        }}
                      >
                        Order {orderId(order)}
                      </p>
                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                        {formatOrderDate(order)}
                      </p>
                    </div>
                    <span style={S.statusPill(order.status === "delivered")}>
                      {order.status === "delivered" ? (
                        <CheckCircle size={13} />
                      ) : (
                        <Clock size={13} />
                      )}
                      {order.status}
                    </span>
                  </div>

                  {/* product thumbnails */}
                  {order.items && order.items.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {order.items.map((item, index) => (
                        <img
                          key={`${orderId(order)}-${index}`}
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* footer row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 2px" }}>
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                        Total: Rs. {order.total.toLocaleString()}
                      </p>
                    </div>
                    <button
                      style={S.detailBtn}
                      onClick={() => navigate(`/orders/${orderId(order)}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
