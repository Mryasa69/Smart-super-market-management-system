import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PackageCheck, ArrowRight, ShoppingBag, RotateCw } from "lucide-react";
import { apiService } from "../../services/api";

export function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFinalizing, setIsFinalizing] = useState(true);
  const [message, setMessage] = useState("Finalizing your payment...");
  const [btnHover, setBtnHover] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const finalizePayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setIsFinalizing(false);
        setMessage("Your order was placed successfully.");
        return;
      }

      try {
        const response = await apiService.verifyStripeOrder(sessionId);
        if (response.success && response.data) {
          const orderData = response.data;
          localStorage.removeItem("cart");
          localStorage.setItem("customerOrders", JSON.stringify([orderData, ...JSON.parse(localStorage.getItem("customerOrders") || "[]").filter((order: any) => {
            const existingId = order.orderNumber || order.id || order._id;
            return existingId !== orderData.orderNumber;
          })]));

          try {
            await apiService.saveCart([]);
          } catch (error) {
            console.error("[OrderSuccess] Failed to clear cart in DB:", error);
          }

          setMessage("Payment completed successfully.");
        } else {
          setMessage(response.message || "Payment confirmation is still processing.");
        }
      } catch (error) {
        console.error("[OrderSuccess] Stripe verification failed:", error);
        setMessage("Payment was received, but confirmation is still syncing.");
      } finally {
        setIsFinalizing(false);
      }
    };

    finalizePayment();
  }, [searchParams]);

  const handleHover = (id: string, isHovered: boolean) =>
    setBtnHover((prev) => ({ ...prev, [id]: isHovered }));

  /* ── premium inline styles matching Profile & OrderHistory ── */
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

    /* success card */
    card: {
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      border: "1px solid #f3f4f6",
      overflow: "hidden",
    },
    cardBody: {
      padding: "48px 32px",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      textAlign: "center" as const,
    },

    /* icon container */
    iconWrap: {
      position: "relative" as const,
      width: 120,
      height: 120,
      marginBottom: 28,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 12px 30px rgba(22,163,74,0.15)",
    },
    checkBadge: {
      position: "absolute" as const,
      top: 2,
      right: 2,
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#16a34a,#059669)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
      border: "3px solid #fff",
    },

    /* spinner for loading state */
    spinnerWrap: {
      width: 120,
      height: 120,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 12px 30px rgba(59,130,246,0.15)",
      animation: "pulse 2s ease-in-out infinite",
    },

    heading: {
      fontSize: 24,
      fontWeight: 800,
      color: "#111827",
      margin: "0 0 8px",
    },
    subtext: {
      fontSize: 14,
      color: "#6b7280",
      margin: "0 0 32px",
      maxWidth: 360,
      lineHeight: 1.6,
    },

    /* action buttons */
    btnRow: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap" as const,
      justifyContent: "center",
    },
    primaryBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 24px",
      borderRadius: 14,
      border: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 700,
      background: "linear-gradient(135deg,#16a34a,#059669)",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(22,163,74,0.25)",
      transition: "all 0.2s",
    } as React.CSSProperties,
    secondaryBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 24px",
      borderRadius: 14,
      border: "2px solid #16a34a",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 700,
      background: "#fff",
      color: "#16a34a",
      transition: "all 0.2s",
    } as React.CSSProperties,

    /* decorative blobs */
    blobTL: {
      position: "absolute" as const,
      top: -40,
      left: -40,
      width: 120,
      height: 120,
      borderRadius: "50%",
      background: "rgba(22,163,74,0.04)",
    },
    blobBR: {
      position: "absolute" as const,
      bottom: -30,
      right: -30,
      width: 90,
      height: 90,
      borderRadius: "50%",
      background: "rgba(22,163,74,0.03)",
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
          <span style={S.title}>Order Confirmation</span>
          <div style={S.navRight}>
            <button
              style={{ ...S.navPill, background: btnHover["orders"] ? "#e5e7eb" : "#f3f4f6" }}
              onMouseEnter={() => handleHover("orders", true)}
              onMouseLeave={() => handleHover("orders", false)}
              onClick={() => navigate("/orders")}
            >
              📦 Orders
            </button>
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
        <div style={{ ...S.card, position: "relative" as const, overflow: "hidden" }}>
          <div style={S.blobTL} />
          <div style={S.blobBR} />

          <div style={S.cardBody}>
            {/* icon */}
            <div style={S.iconWrap}>
              {isFinalizing ? (
                <div style={S.spinnerWrap}>
                  <RotateCw size={48} color="#3b82f6" style={{ animation: "spin 1.5s linear infinite" }} />
                </div>
              ) : (
                <>
                  <div style={S.iconCircle}>
                    <PackageCheck size={52} color="#16a34a" strokeWidth={1.5} />
                  </div>
                  <div style={S.checkBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </>
              )}
            </div>

            {/* text */}
            <h2 style={S.heading}>
              {isFinalizing ? "Securing your order..." : "Order Placed Successfully!"}
            </h2>
            <p style={S.subtext}>
              {isFinalizing
                ? "Please wait while we confirm your payment and finalize your order."
                : message}
            </p>

            {/* action buttons */}
            {!isFinalizing && (
              <div style={S.btnRow}>
                <button
                  style={{
                    ...S.primaryBtn,
                    transform: btnHover["viewOrders"] ? "translateY(-2px)" : "none",
                    boxShadow: btnHover["viewOrders"]
                      ? "0 8px 20px rgba(22,163,74,0.3)"
                      : "0 4px 14px rgba(22,163,74,0.25)",
                  }}
                  onMouseEnter={() => handleHover("viewOrders", true)}
                  onMouseLeave={() => handleHover("viewOrders", false)}
                  onClick={() => navigate("/orders")}
                >
                  View Order Details
                  <ArrowRight size={16} />
                </button>
                <button
                  style={{
                    ...S.secondaryBtn,
                    background: btnHover["shop"] ? "#f0fdf4" : "#fff",
                  }}
                  onMouseEnter={() => handleHover("shop", true)}
                  onMouseLeave={() => handleHover("shop", false)}
                  onClick={() => navigate("/")}
                >
                  <ShoppingBag size={16} />
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* keyframe for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
