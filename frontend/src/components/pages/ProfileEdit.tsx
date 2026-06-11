import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { apiService } from "../../services/api";
import { toast } from "sonner";

/* ─── canvas crop helper ─────────────────────────────────────────────────── */
async function getCroppedImg(src: string, px: any): Promise<string | null> {
  const img = new Image();
  img.src = src;
  await new Promise<void>((r) => { img.onload = () => r(); });
  const S = 300;
  const canvas = document.createElement("canvas");
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, px.x, px.y, px.width, px.height, 0, 0, S, S);
  return canvas.toDataURL("image/jpeg", 0.9);
}

/* ─── tiny field component ───────────────────────────────────────────────── */
function Field({
  label, id, name, value, onChange, type = "text", placeholder, icon,
}: {
  label: string; id: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; icon: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: focused ? "#f0fdf4" : "#f9fafb",
        border: `2px solid ${focused ? "#16a34a" : "#e5e7eb"}`,
        borderRadius: 12, padding: "11px 14px",
        transition: "all 0.2s",
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <input
          id={id} name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none",
            background: "transparent", fontSize: 14,
            color: "#111827", fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */
export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = localStorage.getItem("user") || localStorage.getItem("customer");

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", nicNumber: "", profilePicture: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [rawImg, setRawImg] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPx, setCroppedPx] = useState<any>(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  /* load data */
  useEffect(() => {
    const empRaw  = localStorage.getItem("user");
    const custRaw = localStorage.getItem("customer");
    const profRaw = localStorage.getItem("customerProfile");
    const emp  = empRaw  ? JSON.parse(empRaw)  : null;
    const cust = custRaw ? JSON.parse(custRaw) : null;
    const prof = profRaw ? JSON.parse(profRaw) : {};

    let baseName = "", baseEmail = "", basePhone = "", basePic = "";
    if (emp)  { baseName = `${emp.firstName||""} ${emp.lastName||""}`.trim(); baseEmail = emp.email||""; basePhone = emp.phone||""; basePic = emp.profilePicture||""; }
    else if (cust) { baseName = cust.name||""; baseEmail = cust.email||""; basePhone = cust.phone||""; basePic = cust.profilePicture||""; }

    const name   = prof.name || baseName;
    const parts  = name.trim().split(" ").filter(Boolean);
    const localPic = prof.profilePicture || basePic || "";

    setForm({ firstName: parts[0]||"", lastName: parts.slice(1).join(" "), email: prof.email||baseEmail, phone: prof.phone||basePhone, address: prof.address||"", nicNumber: prof.nicNumber||"", profilePicture: localPic });
    if (localPic) setPreview(localPic);

    /* hydrate from DB */
    if (cust) {
      apiService.getCustomerProfile().then((r) => {
        if (r.success && r.data) {
          const dbPic = r.data.profilePicture || "";
          const dbParts = (r.data.name||"").trim().split(" ").filter(Boolean);
          setForm(prev => ({ ...prev, firstName: dbParts[0]||prev.firstName, lastName: dbParts.slice(1).join(" ")||prev.lastName, phone: r.data.phone||prev.phone, address: r.data.address||prev.address, nicNumber: r.data.nicNumber||prev.nicNumber, profilePicture: dbPic||prev.profilePicture }));
          if (dbPic) setPreview(dbPic);
          localStorage.setItem("customerProfile", JSON.stringify({ ...prof, name: r.data.name, phone: r.data.phone, address: r.data.address, nicNumber: r.data.nicNumber, profilePicture: dbPic }));
          localStorage.setItem("customer", JSON.stringify({ ...cust, name: r.data.name, phone: r.data.phone, profilePicture: dbPic }));
        }
      }).catch(() => {});
    }
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setRawImg(reader.result as string); setCrop({ x: 0, y: 0 }); setZoom(1); setShowCrop(true); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: any, px: any) => setCroppedPx(px), []);

  const applyCrop = async () => {
    if (!rawImg || !croppedPx) return;
    setCropLoading(true);
    try {
      const cropped = await getCroppedImg(rawImg, croppedPx);
      if (cropped) { setPreview(cropped); setForm(p => ({ ...p, profilePicture: cropped })); toast.success("Photo cropped! Save when ready."); }
    } catch { toast.error("Crop failed, please retry."); }
    finally { setCropLoading(false); setShowCrop(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    const name = `${form.firstName} ${form.lastName}`.trim();
    const prof  = JSON.parse(localStorage.getItem("customerProfile") || "{}");
    localStorage.setItem("customerProfile", JSON.stringify({ ...prof, name, email: form.email, phone: form.phone, address: form.address, nicNumber: form.nicNumber, profilePicture: form.profilePicture }));
    const empRaw = localStorage.getItem("user");
    if (empRaw) { const e = JSON.parse(empRaw); localStorage.setItem("user", JSON.stringify({ ...e, firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, profilePicture: form.profilePicture })); }
    const custRaw = localStorage.getItem("customer");
    if (custRaw) {
      try {
        const res = await apiService.updateCustomerProfile({ name, phone: form.phone, address: form.address, nicNumber: form.nicNumber, profilePicture: form.profilePicture });
        if (res.success && res.data) {
          const c = JSON.parse(custRaw);
          localStorage.setItem("customer", JSON.stringify({ ...c, name: res.data.name, email: form.email, phone: res.data.phone, profilePicture: res.data.profilePicture }));
          toast.success("Profile saved successfully! ✅");
        } else { toast.error(res.message || "Save failed."); }
      } catch { toast.error("Network error – saved locally."); }
    } else { toast.success("Profile saved! ✅"); }
    setSaving(false);
    setTimeout(() => navigate("/profile"), 700);
  };

  const displayName = `${form.firstName} ${form.lastName}`.trim() || "Customer";
  const loyaltyPts  = JSON.parse(localStorage.getItem("customer") || "{}")?.loyaltyPoints || 0;
  const orders      = JSON.parse(localStorage.getItem("customerOrders") || "[]").length;

  /* ── styles ── */
  const S = {
    page: { minHeight: "100vh", background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)", fontFamily: "'Inter',system-ui,sans-serif" } as React.CSSProperties,
    topbar: { background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky" as const, top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
    topbarInner: { maxWidth: 780, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" },
    backBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", background: "none", border: "none", padding: "6px 10px", borderRadius: 8, transition: "all 0.15s" } as React.CSSProperties,
    cartBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", background: "#f3f4f6", border: "none", padding: "6px 14px", borderRadius: 20, transition: "all 0.15s" } as React.CSSProperties,
    title: { fontSize: 15, fontWeight: 700, color: "#111827" },
    wrap: { maxWidth: 780, margin: "0 auto", padding: "28px 20px 60px" },

    heroCard: { borderRadius: 24, background: "linear-gradient(135deg,#16a34a,#059669)", padding: "32px 28px", color: "#fff", boxShadow: "0 20px 40px rgba(22,163,74,0.25)", position: "relative" as const, overflow: "hidden", marginBottom: 20 },
    heroBlobTL: { position: "absolute" as const, top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.08)" },
    heroBlobBR: { position: "absolute" as const, bottom: -20, left: 10, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)" },
    heroRow: { position: "relative" as const, display: "flex", alignItems: "center", gap: 24 },

    avatarWrap: { position: "relative" as const, flexShrink: 0, cursor: "pointer" },
    avatar: { width: 88, height: 88, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.5)", overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.2)", transition: "transform 0.2s", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.2)" } as React.CSSProperties,
    avatarHoverOverlay: { position: "absolute" as const, inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" },
    cameraBadge: { position: "absolute" as const, bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", border: "2px solid #16a34a", cursor: "pointer" },

    heroInfo: { flex: 1, minWidth: 0 },
    heroName: { fontSize: 22, fontWeight: 800, margin: 0, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
    heroEmail: { fontSize: 13, color: "rgba(255,255,255,0.8)", margin: "3px 0 0" },
    heroHint: { fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "2px 0 10px" },
    heroPills: { display: "flex", gap: 8, flexWrap: "wrap" as const },
    pill: { background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 },

    formCard: { background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6", overflow: "hidden" },
    formHeader: { padding: "22px 28px 18px", borderBottom: "1px solid #f3f4f6", background: "linear-gradient(to right,#f9fafb,#fff)" },
    formHeaderTitle: { fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 },
    formHeaderSub: { fontSize: 13, color: "#9ca3af", margin: "3px 0 0" },
    formBody: { padding: "24px 28px 28px", display: "flex", flexDirection: "column" as const, gap: 18 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    divider: { height: 1, background: "#f3f4f6", margin: "4px 0" },

    saveBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 32px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg,#16a34a,#059669)", color: "#fff", boxShadow: "0 4px 14px rgba(22,163,74,0.35)", transition: "all 0.2s", letterSpacing: "0.01em" } as React.CSSProperties,
    cancelBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 24px", borderRadius: 12, border: "2px solid #e5e7eb", cursor: "pointer", fontSize: 15, fontWeight: 600, background: "#fff", color: "#6b7280", transition: "all 0.15s" } as React.CSSProperties,
    btnRow: { display: "flex", gap: 12, paddingTop: 8 },

    /* crop modal */
    overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
    modal: { background: "#fff", borderRadius: 24, overflow: "hidden", width: "100%", maxWidth: 480, boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column" as const },
    modalHead: { padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", background: "linear-gradient(to right,#f0fdf4,#fff)" },
    modalTitle: { fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 },
    modalSub: { fontSize: 12, color: "#9ca3af", margin: "2px 0 0" },
    closeBtn: { width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#6b7280", transition: "background 0.15s" } as React.CSSProperties,
    cropArea: { position: "relative" as const, height: 320, background: "#0f172a" },
    modalFoot: { padding: "18px 22px", display: "flex", flexDirection: "column" as const, gap: 14 },
    zoomRow: { display: "flex", alignItems: "center", gap: 10 },
    zoomLabel: { fontSize: 12, fontWeight: 600, color: "#6b7280", minWidth: 36 },
    zoomSlider: { flex: 1, accentColor: "#16a34a", cursor: "pointer", height: 4 } as React.CSSProperties,
    previewRow: { display: "flex", alignItems: "center", gap: 14, background: "#f9fafb", borderRadius: 14, padding: "12px 14px" },
    previewCircle: { width: 54, height: 54, borderRadius: "50%", overflow: "hidden", border: "2px solid #16a34a", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as React.CSSProperties,
    previewLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
    previewHint: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
    modalBtns: { display: "flex", gap: 10 },
    applyBtn: { flex: 1, padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#16a34a,#059669)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" } as React.CSSProperties,
    cancelCropBtn: { flex: 1, padding: "13px 0", borderRadius: 12, border: "2px solid #e5e7eb", cursor: "pointer", fontSize: 14, fontWeight: 600, background: "#fff", color: "#6b7280", transition: "all 0.15s" } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      {/* hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

      {/* ── top bar ── */}
      <div style={S.topbar}>
        <div style={S.topbarInner}>
          <button style={S.backBtn} onClick={() => navigate("/profile")}>
            ← Back to Profile
          </button>
          <span style={S.title}>Edit Profile</span>
          <button style={S.cartBtn} onClick={() => navigate("/cart")}>
            🛒 Cart
          </button>
        </div>
      </div>

      <div style={S.wrap}>

        {/* ── hero card ── */}
        <div style={S.heroCard}>
          <div style={S.heroBlobTL} />
          <div style={S.heroBlobBR} />
          <div style={S.heroRow}>

            {/* avatar */}
            <div
              style={S.avatarWrap}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => fileRef.current?.click()}
              title="Click to change photo"
            >
              <div style={{ ...S.avatar, transform: avatarHover ? "scale(1.07)" : "scale(1)" }}>
                {preview
                  ? <img src={preview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 36 }}>👤</span>
                }
                <div style={{ ...S.avatarHoverOverlay, opacity: avatarHover ? 1 : 0 }}>
                  <span style={{ fontSize: 20 }}>📷</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginTop: 2 }}>Change</span>
                </div>
              </div>
              <div style={S.cameraBadge} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                <span style={{ fontSize: 12 }}>📷</span>
              </div>
            </div>

            {/* info */}
            <div style={S.heroInfo}>
              <p style={S.heroName}>{displayName}</p>
              <p style={S.heroEmail}>{form.email}</p>
              <p style={S.heroHint}>Click the photo to update it</p>
              <div style={S.heroPills}>
                <span style={S.pill}>🏆 {loyaltyPts} Points</span>
                <span style={S.pill}>📦 {orders} Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── form card ── */}
        <div style={S.formCard}>
          <div style={S.formHeader}>
            <p style={S.formHeaderTitle}>Personal Information</p>
            <p style={S.formHeaderSub}>Update your details below and hit Save Changes</p>
          </div>

          <div style={S.formBody}>
            <div style={S.grid2}>
              <Field label="First Name" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" icon="👤" />
              <Field label="Last Name"  id="lastName"  name="lastName"  value={form.lastName}  onChange={handleChange} placeholder="Doe"  icon="👤" />
            </div>

            <div style={S.divider} />

            <div style={S.grid2}>
              <Field label="Email Address" id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@email.com" icon="✉️" />
              <Field label="Phone Number"  id="phone" name="phone"              value={form.phone} onChange={handleChange} placeholder="+94 77 000 0000"  icon="📞" />
            </div>

            <Field label="Delivery Address" id="address" name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, Colombo" icon="🏠" />
            <Field label="NIC Number"       id="nicNumber" name="nicNumber" value={form.nicNumber} onChange={handleChange} placeholder="e.g. 991234567V" icon="🪪" />

            <div style={S.divider} />

            <div style={S.btnRow}>
              <button
                style={{ ...S.saveBtn, opacity: saving ? 0.75 : 1, cursor: saving ? "not-allowed" : "pointer" }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "⏳ Saving…" : "✅ Save Changes"}
              </button>
              <button style={S.cancelBtn} onClick={() => navigate("/profile")}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CROP MODAL ══ */}
      {showCrop && rawImg && (
        <div style={S.overlay} onClick={handleCropCancel}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>

            {/* header */}
            <div style={S.modalHead}>
              <div>
                <p style={S.modalTitle}>Crop Your Photo</p>
                <p style={S.modalSub}>Drag to reposition · slider to zoom</p>
              </div>
              <button style={S.closeBtn} onClick={handleCropCancel}>✕</button>
            </div>

            {/* cropper */}
            <div style={S.cropArea}>
              <Cropper
                image={rawImg}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* controls */}
            <div style={S.modalFoot}>
              <div style={S.zoomRow}>
                <span style={S.zoomLabel}>Zoom</span>
                <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={S.zoomSlider} />
                <span style={{ fontSize: 13, color: "#9ca3af", minWidth: 28 }}>{zoom.toFixed(1)}×</span>
              </div>

              {/* preview */}
              <div style={S.previewRow}>
                <div style={S.previewCircle}>
                  {preview
                    ? <img src={preview} alt="current" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 22 }}>👤</span>
                  }
                </div>
                <div>
                  <p style={S.previewLabel}>Profile Preview</p>
                  <p style={S.previewHint}>This is your current photo. The new crop will replace it.</p>
                </div>
              </div>

              <div style={S.modalBtns}>
                <button style={S.cancelCropBtn} onClick={handleCropCancel}>Cancel</button>
                <button
                  style={{ ...S.applyBtn, opacity: cropLoading ? 0.75 : 1, cursor: cropLoading ? "not-allowed" : "pointer" }}
                  onClick={applyCrop}
                  disabled={cropLoading}
                >
                  {cropLoading ? "⏳ Applying…" : "✂️ Apply & Use Photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleCropCancel() { setShowCrop(false); setRawImg(null); }
}
