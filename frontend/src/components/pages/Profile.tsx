import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Heart, Award, MapPin, Phone, Mail, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { apiService } from "../../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    () => (location.state as { tab?: string } | null)?.tab ?? "profile"
  );
  const [btnHover, setBtnHover] = useState<{ [key: string]: boolean }>({});
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    points: 0,
    orders: 0,
    phone: "",
    address: "",
    nicNumber: "",
    profilePicture: "",
  });

  useEffect(() => {
    const tab = (location.state as { tab?: string } | null)?.tab;
    if (tab && ["profile", "wishlist", "loyalty"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Base logic for basic info
      const employee = localStorage.getItem("user");
      const customer = localStorage.getItem("customer");
      
      const employeeObj = employee ? JSON.parse(employee) : null;
      const customerObj = customer ? JSON.parse(customer) : null;
      
      let baseName = "";
      let baseEmail = "";
      let basePhone = "";
      let basePic = "";

      if (employeeObj) {
        baseName = `${employeeObj.firstName || ""} ${employeeObj.lastName || ""}`.trim();
        baseEmail = employeeObj.email || "";
        basePhone = employeeObj.phone || "";
        basePic = employeeObj.profilePicture || "";
      } else if (customerObj) {
        baseName = customerObj.name || "";
        baseEmail = customerObj.email || "";
        basePhone = customerObj.phone || "";
        basePic = customerObj.profilePicture || "";
      }

      const initialProfile = JSON.parse(localStorage.getItem("customerProfile") || "{}");
      const initialOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");

      setUserData({
        name: initialProfile.name || baseName || "Customer",
        email: initialProfile.email || baseEmail || "",
        points: initialProfile.points || customerObj?.loyaltyPoints || 0,
        orders: initialOrders.length,
        phone: initialProfile.phone || basePhone || "",
        address: initialProfile.address || "",
        nicNumber: initialProfile.nicNumber || "",
        profilePicture: initialProfile.profilePicture || basePic || "",
      });

      // Fetch from API if customer
      const token = localStorage.getItem("customerToken");
      if (token && customerObj) {
        try {
          const [profileRes, ordersRes] = await Promise.all([
            apiService.getProfile(),
            apiService.getOrders()
          ]);

          if (profileRes.success && profileRes.data) {
            const serverProfile = profileRes.data;
            setUserData(prev => ({
              ...prev,
              name: serverProfile.name || prev.name,
              email: serverProfile.email || prev.email,
              points: serverProfile.loyaltyPoints || prev.points,
              phone: serverProfile.phone || prev.phone,
              address: serverProfile.address || prev.address,
              nicNumber: serverProfile.nicNumber || prev.nicNumber,
              profilePicture: serverProfile.profilePicture || prev.profilePicture,
            }));
            
            // Sync to local storage
            localStorage.setItem("customerProfile", JSON.stringify({
              ...initialProfile,
              name: serverProfile.name,
              email: serverProfile.email,
              phone: serverProfile.phone,
              address: serverProfile.address,
              nicNumber: serverProfile.nicNumber,
              points: serverProfile.loyaltyPoints,
              profilePicture: serverProfile.profilePicture
            }));
            
            localStorage.setItem("customer", JSON.stringify({
              ...customerObj,
              ...serverProfile
            }));
          }

          if (ordersRes.success && ordersRes.data) {
            setUserData(prev => ({ ...prev, orders: ordersRes.data.length }));
            localStorage.setItem("customerOrders", JSON.stringify(ordersRes.data));
          }
        } catch (err) {
          console.error("Failed to fetch profile data:", err);
        }
      }
    };

    fetchProfileData();
  }, [location.pathname]);

  const rewards = [
    {
      id: 1,
      title: "Rs. 100 Voucher",
      points: 1000,
      description: "Get Rs. 100 off on your next purchase",
      available: userData.points >= 1000,
    },
    {
      id: 2,
      title: "Rs. 250 Voucher",
      points: 2500,
      description: "Get Rs. 250 off on your next purchase",
      available: userData.points >= 2500,
    },
    {
      id: 3,
      title: "Rs. 500 Voucher",
      points: 5000,
      description: "Get Rs. 500 off on your next purchase",
      available: userData.points >= 5000,
    },
    {
      id: 4,
      title: "Free Delivery",
      points: 500,
      description: "Get free delivery on your next order",
      available: userData.points >= 500,
    },
  ];

  const loyaltySteps = [
    {
      step: 1,
      title: "Earn Points",
      description: "Earn 1 point for every Rs. 100 spent",
    },
    {
      step: 2,
      title: "Collect Points",
      description: "Accumulate points with every purchase",
    },
    {
      step: 3,
      title: "Redeem Rewards",
      description: "Exchange points for amazing vouchers & discounts",
    },
  ];

  const handleHover = (id: string, isHovered: boolean) => {
    setBtnHover((prev) => ({ ...prev, [id]: isHovered }));
  };

  /* Calculate progress percentage towards next reward */
  const getProgressInfo = () => {
    const nextMilestones = [500, 1000, 2500, 5000];
    const currentPoints = userData.points;
    const nextMilestone = nextMilestones.find(m => m > currentPoints) || 5000;
    const prevMilestone = [...nextMilestones].reverse().find(m => m <= currentPoints) || 0;
    
    const range = nextMilestone - prevMilestone;
    const progressInRange = currentPoints - prevMilestone;
    const percentage = Math.min(100, Math.max(0, (progressInRange / range) * 100));
    const pointsToGo = Math.max(0, nextMilestone - currentPoints);

    return { percentage, pointsToGo, nextMilestone };
  };

  const { percentage, pointsToGo, nextMilestone } = getProgressInfo();

  /* ── premium inline styles ── */
  const S = {
    page: { minHeight: "100vh", background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)", fontFamily: "'Inter',system-ui,sans-serif" } as React.CSSProperties,
    topbar: { background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky" as const, top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
    topbarInner: { maxWidth: 780, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" },
    backBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", background: "none", border: "none", padding: "6px 10px", borderRadius: 8, transition: "all 0.15s" } as React.CSSProperties,
    navRight: { display: "flex", alignItems: "center", gap: 10 },
    navPill: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", background: "#f3f4f6", border: "none", padding: "6px 14px", borderRadius: 20, transition: "all 0.15s" } as React.CSSProperties,
    title: { fontSize: 15, fontWeight: 700, color: "#111827" },
    wrap: { maxWidth: 780, margin: "0 auto", padding: "28px 20px 60px" },

    heroCard: { borderRadius: 24, background: "linear-gradient(135deg,#16a34a,#059669)", padding: "32px 28px", color: "#fff", boxShadow: "0 20px 40px rgba(22,163,74,0.25)", position: "relative" as const, overflow: "hidden", marginBottom: 20 },
    heroBlobTL: { position: "absolute" as const, top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.08)" },
    heroBlobBR: { position: "absolute" as const, bottom: -20, left: 10, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)" },
    heroRow: { position: "relative" as const, display: "flex", alignItems: "center", gap: 24 },

    avatar: { width: 88, height: 88, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.5)", overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.2)" } as React.CSSProperties,
    heroInfo: { flex: 1, minWidth: 0 },
    heroName: { fontSize: 22, fontWeight: 800, margin: 0, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
    heroEmail: { fontSize: 13, color: "rgba(255,255,255,0.8)", margin: "3px 0 0" },
    heroPills: { display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 12 },
    pill: { background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 },

    /* tabs styling */
    tabsContainer: { display: "flex", gap: 8, background: "#fff", padding: 6, borderRadius: 16, border: "1px solid #e5e7eb", marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
    tabBtn: (isActive: boolean) => ({
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none",
      background: isActive ? "#f0fdf4" : "transparent",
      color: isActive ? "#16a34a" : "#4b5563",
      fontWeight: isActive ? 700 : 500,
      padding: "11px 14px", borderRadius: 12, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
    } as React.CSSProperties),

    /* content cards */
    card: { background: "#fff", borderRadius: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6", overflow: "hidden" },
    cardHeader: { padding: "22px 28px 18px", borderBottom: "1px solid #f3f4f6", background: "linear-gradient(to right,#f9fafb,#fff)", display: "flex", alignItems: "center", justifyContent: "space-between" },
    cardTitle: { fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 },
    cardBody: { padding: "28px", display: "flex", flexDirection: "column" as const, gap: 20 },

    /* buttons */
    editBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 12, border: "2px solid #16a34a", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#16a34a", background: "#fff", transition: "all 0.2s" } as React.CSSProperties,
    redeemBtn: (available: boolean) => ({
      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: "none", cursor: available ? "pointer" : "not-allowed",
      fontSize: 13, fontWeight: 700,
      background: available ? "linear-gradient(135deg,#16a34a,#059669)" : "#e5e7eb",
      color: available ? "#fff" : "#9ca3af",
      boxShadow: available ? "0 4px 10px rgba(22,163,74,0.2)" : "none",
      transition: "all 0.15s"
    } as React.CSSProperties),

    /* details styling */
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
    fieldWrap: { display: "flex", flexDirection: "column" as const, gap: 6 },
    fieldLabel: { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
    fieldBox: { display: "flex", alignItems: "center", gap: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 16px" },
    fieldVal: { fontSize: 14, color: "#1f2937", fontWeight: 600 },
    fieldValPlaceholder: { fontSize: 14, color: "#9ca3af", fontWeight: 500, fontStyle: "italic" },

    /* loyalty points elements */
    pointsCard: { background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", border: "1px solid #d1fae5", borderRadius: 20, padding: "24px", display: "flex", flexDirection: "column" as const, alignItems: "center", textCenter: "center" },
    progressBarTrack: { width: "100%", height: 10, background: "#e5e7eb", borderRadius: 6, overflow: "hidden", marginTop: 14 },
    progressBarFill: (w: number) => ({ width: `${w}%`, height: "100%", background: "linear-gradient(to right, #22c55e, #16a34a)", borderRadius: 6 } as React.CSSProperties),
    
    stepRow: { display: "flex", gap: 16, alignItems: "flex-start" },
    stepNum: { width: 34, height: 34, borderRadius: "50%", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, border: "2px solid #bbf7d0", flexShrink: 0 },
    stepTitle: { fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 3px" },
    stepDesc: { fontSize: 13, color: "#6b7280", margin: 0 },

    rewardCard: { border: "1px solid #e5e7eb", borderRadius: 16, padding: "18px", background: "#fff", display: "flex", flexDirection: "column" as const, justifyContent: "space-between", gap: 12, transition: "transform 0.2s" },
  };

  const getFirstName = () => userData.name.split(" ")[0] || "-";
  const getLastName = () => userData.name.split(" ").slice(1).join(" ") || "-";

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
          <span style={S.title}>My Profile</span>
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

      <div style={S.wrap}>
        {/* ── hero card ── */}
        <div style={S.heroCard}>
          <div style={S.heroBlobTL} />
          <div style={S.heroBlobBR} />
          <div style={S.heroRow}>
            {/* avatar */}
            <div style={S.avatar}>
              {userData.profilePicture ? (
                <img src={userData.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 36 }}>👤</span>
              )}
            </div>
            {/* info */}
            <div style={S.heroInfo}>
              <p style={S.heroName}>{userData.name}</p>
              <p style={S.heroEmail}>{userData.email}</p>
              <div style={S.heroPills}>
                <span style={S.pill}>🏆 {userData.points} Points</span>
                <span style={S.pill}>📦 {userData.orders} Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── tabs list ── */}
        <div style={S.tabsContainer}>
          <button style={S.tabBtn(activeTab === "profile")} onClick={() => setActiveTab("profile")}>
            <User size={16} /> Profile Details
          </button>
          <button style={S.tabBtn(activeTab === "wishlist")} onClick={() => setActiveTab("wishlist")}>
            <Heart size={16} /> Wishlist
          </button>
          <button style={S.tabBtn(activeTab === "loyalty")} onClick={() => setActiveTab("loyalty")}>
            <Award size={16} /> Loyalty Points
          </button>
        </div>

        {/* ── tab content ── */}
        {activeTab === "profile" && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <p style={S.cardTitle}>Personal Information</p>
              <button
                style={{
                  ...S.editBtn,
                  background: btnHover["edit"] ? "#f0fdf4" : "#fff",
                }}
                onMouseEnter={() => handleHover("edit", true)}
                onMouseLeave={() => handleHover("edit", false)}
                onClick={() => navigate("/profile/edit")}
              >
                ✏️ Edit Profile
              </button>
            </div>
            <div style={S.cardBody}>
              <div style={S.grid2}>
                <div style={S.fieldWrap}>
                  <label style={S.fieldLabel}>First Name</label>
                  <div style={S.fieldBox}>
                    <User size={16} color="#16a34a" />
                    <span style={S.fieldVal}>{getFirstName()}</span>
                  </div>
                </div>
                <div style={S.fieldWrap}>
                  <label style={S.fieldLabel}>Last Name</label>
                  <div style={S.fieldBox}>
                    <User size={16} color="#16a34a" />
                    <span style={S.fieldVal}>{getLastName()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div style={S.fieldWrap}>
                  <label style={S.fieldLabel}>Email Address</label>
                  <div style={S.fieldBox}>
                    <Mail size={16} color="#16a34a" />
                    <span style={S.fieldVal}>{userData.email || "-"}</span>
                  </div>
                </div>
                <div style={S.fieldWrap}>
                  <label style={S.fieldLabel}>Phone Number</label>
                  <div style={S.fieldBox}>
                    <Phone size={16} color="#16a34a" />
                    {userData.phone ? (
                      <span style={S.fieldVal}>{userData.phone}</span>
                    ) : (
                      <span style={S.fieldValPlaceholder}>Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={S.fieldWrap}>
                <label style={S.fieldLabel}>Delivery Address</label>
                <div style={S.fieldBox}>
                  <MapPin size={16} color="#16a34a" />
                  {userData.address ? (
                    <span style={S.fieldVal}>{userData.address}</span>
                  ) : (
                    <span style={S.fieldValPlaceholder}>Not provided</span>
                  )}
                </div>
              </div>

              <div style={S.fieldWrap}>
                <label style={S.fieldLabel}>NIC Number</label>
                <div style={S.fieldBox}>
                  <CreditCard size={16} color="#16a34a" />
                  {userData.nicNumber ? (
                    <span style={S.fieldVal}>{userData.nicNumber}</span>
                  ) : (
                    <span style={S.fieldValPlaceholder}>Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "wishlist" && (
          <div style={S.card}>
            <div style={S.cardBody}>
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ display: "inline-flex", background: "#fee2e2", color: "#ef4444", borderRadius: "50%", padding: 18, marginBottom: 16 }}>
                  <Heart size={36} fill="#ef4444" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", margin: "0 0 6px" }}>Your wishlist is empty</h3>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "0 auto 20px", maxWidth: 280 }}>Start adding items you love to your wishlist to see them here!</p>
                <button
                  style={{
                    padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
                    background: "linear-gradient(135deg,#16a34a,#059669)", color: "#fff", boxShadow: "0 4px 14px rgba(22,163,74,0.3)"
                  }}
                  onClick={() => navigate("/")}
                >
                  Explore Store
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "loyalty" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* stats card */}
            <div style={S.card}>
              <div style={S.cardBody}>
                <div style={S.pointsCard}>
                  <Award size={40} color="#16a34a" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#065f46", margin: 0 }}>{userData.points} XP</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#047857", margin: "2px 0 0" }}>Total Loyalty Points Balance</p>

                  <div style={S.progressBarTrack}>
                    <div style={S.progressBarFill(percentage)} />
                  </div>
                  <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, fontWeight: 600, color: "#047857" }}>
                    <span>{userData.points} points</span>
                    {pointsToGo > 0 ? (
                      <span>{pointsToGo} points until next reward ({nextMilestone} pts)</span>
                    ) : (
                      <span>Top tier achieved!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* steps card */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <p style={S.cardTitle}>How Loyalty Points Work</p>
              </div>
              <div style={{ ...S.cardBody, gap: 24 }}>
                {loyaltySteps.map((item) => (
                  <div key={item.step} style={S.stepRow}>
                    <div style={S.stepNum}>{item.step}</div>
                    <div style={{ flex: 1 }}>
                      <p style={S.stepTitle}>{item.title}</p>
                      <p style={S.stepDesc}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* rewards card */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <p style={S.cardTitle}>Available Rewards</p>
              </div>
              <div style={{ ...S.cardBody, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {rewards.map((reward) => (
                  <div key={reward.id} style={S.rewardCard}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: 0 }}>{reward.title}</p>
                        <span style={{ background: reward.available ? "#d1fae5" : "#f3f4f6", color: reward.available ? "#065f46" : "#6b7280", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                          {reward.points} XP
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{reward.description}</p>
                    </div>
                    <button style={S.redeemBtn(reward.available)} disabled={!reward.available}>
                      {reward.available ? "🎁 Redeem Reward" : "🔒 Need More Points"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


