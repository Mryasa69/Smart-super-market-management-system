import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, TrendingUp, LogOut, Gift, Award } from 'lucide-react';
import { apiService } from '../../services/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  loyaltyPoints: number;
  totalPurchases: number;
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [btnHover, setBtnHover] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const parsed = apiService.getStoredCustomer();
    const token = apiService.getStoredToken();

    if (parsed && token) {
      setCustomer({
        id: parsed.id || parsed._id || '',
        name: parsed.name || 'Customer',
        email: parsed.email || '',
        phone: parsed.phone || '',
        tier: parsed.tier || 'Bronze',
        loyaltyPoints: parsed.loyaltyPoints ?? 0,
        totalPurchases: parsed.totalPurchases ?? 0,
      });
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    localStorage.removeItem('rememberCustomer');
    navigate('/login');
  };

  const handleHover = (id: string, isHovered: boolean) =>
    setBtnHover((prev) => ({ ...prev, [id]: isHovered }));

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case 'Platinum': return { bg: '#f3e8ff', color: '#7c3aed', icon: '💜' };
      case 'Gold':    return { bg: '#fef9c3', color: '#b45309', icon: '🥇' };
      case 'Silver':  return { bg: '#f1f5f9', color: '#475569', icon: '🥈' };
      default:        return { bg: '#fff7ed', color: '#c2410c', icon: '🥉' };
    }
  };

  const getTierBarColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'linear-gradient(to right,#8b5cf6,#7c3aed)';
      case 'Gold':    return 'linear-gradient(to right,#fbbf24,#d97706)';
      case 'Silver':  return 'linear-gradient(to right,#94a3b8,#64748b)';
      default:        return 'linear-gradient(to right,#fb923c,#ea580c)';
    }
  };

  const getNextTierPoints = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 1000;
      case 'Silver': return 2000;
      case 'Gold':   return 3000;
      default:       return 3000;
    }
  };

  const getNextTierLabel = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'Silver (1,000 pts)';
      case 'Silver': return 'Gold (2,000 pts)';
      case 'Gold':   return 'Platinum (3,000 pts)';
      default:       return 'Max tier reached 🎉';
    }
  };

  /* ── shared styles mirroring Profile page ── */
  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)',
      fontFamily: "'Inter',system-ui,sans-serif",
    } as React.CSSProperties,

    topbar: {
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    topbarInner: {
      maxWidth: 780,
      margin: '0 auto',
      padding: '0 20px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      fontWeight: 600,
      color: '#374151',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: '6px 10px',
      borderRadius: 8,
      transition: 'all 0.15s',
    } as React.CSSProperties,
    title: { fontSize: 15, fontWeight: 700, color: '#111827' },
    navRight: { display: 'flex', alignItems: 'center', gap: 10 },
    navPill: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      fontWeight: 600,
      color: '#374151',
      cursor: 'pointer',
      background: '#f3f4f6',
      border: 'none',
      padding: '6px 14px',
      borderRadius: 20,
      transition: 'all 0.15s',
    } as React.CSSProperties,

    wrap: { maxWidth: 780, margin: '0 auto', padding: '28px 20px 60px' },

    /* hero banner */
    heroCard: {
      borderRadius: 24,
      background: 'linear-gradient(135deg,#16a34a,#059669)',
      padding: '32px 28px',
      color: '#fff',
      boxShadow: '0 20px 40px rgba(22,163,74,0.25)',
      position: 'relative' as const,
      overflow: 'hidden',
      marginBottom: 20,
    },
    heroBlobTL: {
      position: 'absolute' as const,
      top: -30, right: -30,
      width: 130, height: 130,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
    },
    heroBlobBR: {
      position: 'absolute' as const,
      bottom: -20, left: 10,
      width: 90, height: 90,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
    },
    pill: {
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(6px)',
      borderRadius: 20,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 600,
    },

    /* stat / content cards */
    card: {
      background: '#fff',
      borderRadius: 24,
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      border: '1px solid #f3f4f6',
      overflow: 'hidden',
    },
    cardHeader: {
      padding: '22px 28px 18px',
      borderBottom: '1px solid #f3f4f6',
      background: 'linear-gradient(to right,#f9fafb,#fff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: { fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 },
    cardBody: { padding: '24px 28px' },

    /* stat grid */
    statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
    statCard: (iconBg: string) => ({
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid #f3f4f6',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    } as React.CSSProperties),
    statIcon: (bg: string) => ({
      width: 46,
      height: 46,
      borderRadius: 14,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    } as React.CSSProperties),
    statLabel: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 3px' },
    statValue: { fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 },

    /* progress bar */
    progressTrack: { width: '100%', height: 10, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden', margin: '12px 0 8px' },
    progressFill: (w: number, gradient: string) => ({
      width: `${w}%`,
      height: '100%',
      background: gradient,
      borderRadius: 6,
      transition: 'width 0.5s ease',
    } as React.CSSProperties),

    /* action buttons */
    primaryActionBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '12px 0',
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      background: 'linear-gradient(135deg,#16a34a,#059669)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
      transition: 'all 0.15s',
      marginBottom: 12,
    } as React.CSSProperties,
    secondaryActionBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '11px 0',
      borderRadius: 12,
      border: '2px solid #d1d5db',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      background: '#fff',
      color: '#374151',
      transition: 'all 0.15s',
      marginBottom: 12,
    } as React.CSSProperties,
    logoutBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '11px 0',
      borderRadius: 12,
      border: '2px solid #fee2e2',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      background: '#fff',
      color: '#ef4444',
      transition: 'all 0.15s',
    } as React.CSSProperties,
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '4px solid #d1fae5', borderTopColor: '#16a34a',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: 15 }}>Customer data not found.</p>
      </div>
    );
  }

  const tierStyle = getTierStyle(customer.tier);
  const nextTierPts = getNextTierPoints(customer.tier);
  const progressPct = Math.min((customer.loyaltyPoints / nextTierPts) * 100, 100);
  const tierBarColor = getTierBarColor(customer.tier);

  return (
    <div style={S.page}>
      {/* ── top bar ── */}
      <div style={S.topbar}>
        <div style={S.topbarInner}>
          <button
            style={{ ...S.backBtn, background: btnHover['back'] ? '#f3f4f6' : 'none' }}
            onMouseEnter={() => handleHover('back', true)}
            onMouseLeave={() => handleHover('back', false)}
            onClick={() => navigate('/')}
          >
            ← Continue Shopping
          </button>
          <span style={S.title}>My Dashboard</span>
          <div style={S.navRight}>
            <button
              style={{ ...S.navPill, background: btnHover['profile'] ? '#e5e7eb' : '#f3f4f6' }}
              onMouseEnter={() => handleHover('profile', true)}
              onMouseLeave={() => handleHover('profile', false)}
              onClick={() => navigate('/profile')}
            >
              👤 Profile
            </button>
            <button
              style={{ ...S.navPill, background: btnHover['orders'] ? '#e5e7eb' : '#f3f4f6' }}
              onMouseEnter={() => handleHover('orders', true)}
              onMouseLeave={() => handleHover('orders', false)}
              onClick={() => navigate('/orders')}
            >
              📦 Orders
            </button>
            <button
              style={{ ...S.navPill, background: btnHover['cart'] ? '#e5e7eb' : '#f3f4f6' }}
              onMouseEnter={() => handleHover('cart', true)}
              onMouseLeave={() => handleHover('cart', false)}
              onClick={() => navigate('/cart')}
            >
              🛒 Cart
            </button>
          </div>
        </div>
      </div>

      <div style={S.wrap}>
        {/* ── hero ── */}
        <div style={S.heroCard}>
          <div style={S.heroBlobTL} />
          <div style={S.heroBlobBR} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>
              Welcome back, {customer.name}! 👋
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>
              {customer.email}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={S.pill}>
                {tierStyle.icon} {customer.tier} Member
              </span>
              <span style={S.pill}>🏆 {customer.loyaltyPoints.toLocaleString()} Points</span>
              <span style={S.pill}>📦 {customer.totalPurchases} Purchases</span>
            </div>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div style={S.statGrid}>
          {/* Loyalty Points */}
          <div style={S.statCard('#fff7ed')}>
            <div style={S.statIcon('linear-gradient(135deg,#fb923c,#ea580c)')}>
              <Gift size={22} color="#fff" />
            </div>
            <div>
              <p style={S.statLabel}>Loyalty Points</p>
              <p style={S.statValue}>{customer.loyaltyPoints.toLocaleString()}</p>
            </div>
          </div>

          {/* Total Purchases */}
          <div style={S.statCard('#f0fdf4')}>
            <div style={S.statIcon('linear-gradient(135deg,#22c55e,#16a34a)')}>
              <Package size={22} color="#fff" />
            </div>
            <div>
              <p style={S.statLabel}>Total Purchases</p>
              <p style={S.statValue}>{customer.totalPurchases}</p>
            </div>
          </div>

          {/* Member Tier */}
          <div style={S.statCard(tierStyle.bg)}>
            <div style={S.statIcon(tierBarColor)}>
              <TrendingUp size={22} color="#fff" />
            </div>
            <div>
              <p style={S.statLabel}>Member Tier</p>
              <p style={S.statValue}>{customer.tier}</p>
            </div>
          </div>

          {/* Points to Next Tier */}
          <div style={S.statCard('#f0f9ff')}>
            <div style={S.statIcon('linear-gradient(135deg,#60a5fa,#2563eb)')}>
              <Award size={22} color="#fff" />
            </div>
            <div>
              <p style={S.statLabel}>To Next Tier</p>
              <p style={S.statValue}>
                {customer.tier === 'Platinum'
                  ? '✓'
                  : Math.max(0, nextTierPts - customer.loyaltyPoints)}
              </p>
            </div>
          </div>
        </div>

        {/* ── tier progress card ── */}
        <div style={{ ...S.card, marginBottom: 20 }}>
          <div style={S.cardHeader}>
            <p style={S.cardTitle}>
              🎯 Progress to {customer.tier === 'Platinum' ? 'Maintain Platinum Status' : 'Next Tier'}
            </p>
            <span
              style={{
                background: tierStyle.bg,
                color: tierStyle.color,
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
              }}
            >
              {tierStyle.icon} {customer.tier}
            </span>
          </div>
          <div style={S.cardBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#374151' }}>
              <span>Current Points: <strong style={{ color: '#16a34a' }}>{customer.loyaltyPoints.toLocaleString()}</strong></span>
              <span>Next Tier: <strong style={{ color: '#374151' }}>{getNextTierLabel(customer.tier)}</strong></span>
            </div>
            <div style={S.progressTrack}>
              <div style={S.progressFill(progressPct, tierBarColor)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
              <span>0</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>{Math.round(progressPct)}% complete</span>
              <span>{nextTierPts.toLocaleString()}</span>
            </div>
            {customer.tier !== 'Platinum' && (
              <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280', textAlign: 'center', background: '#f9fafb', borderRadius: 10, padding: '10px 16px' }}>
                Earn <strong style={{ color: '#16a34a' }}>{Math.max(0, nextTierPts - customer.loyaltyPoints).toLocaleString()} more points</strong> to reach {getNextTierLabel(customer.tier).split(' ')[0]}!
              </p>
            )}
          </div>
        </div>

        {/* ── quick actions card ── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardTitle}>⚡ Quick Actions</p>
          </div>
          <div style={S.cardBody}>
            <button
              style={{ ...S.primaryActionBtn, transform: btnHover['shop'] ? 'translateY(-1px)' : 'none', boxShadow: btnHover['shop'] ? '0 6px 20px rgba(22,163,74,0.4)' : '0 4px 14px rgba(22,163,74,0.3)' }}
              onMouseEnter={() => handleHover('shop', true)}
              onMouseLeave={() => handleHover('shop', false)}
              onClick={() => navigate('/products')}
            >
              <ShoppingCart size={18} />
              Start Shopping
            </button>

            <button
              style={{ ...S.secondaryActionBtn, transform: btnHover['orders-btn'] ? 'translateY(-1px)' : 'none' }}
              onMouseEnter={() => handleHover('orders-btn', true)}
              onMouseLeave={() => handleHover('orders-btn', false)}
              onClick={() => navigate('/orders')}
            >
              <Package size={18} />
              View My Orders
            </button>

            <button
              style={{ ...S.secondaryActionBtn, transform: btnHover['profile-btn'] ? 'translateY(-1px)' : 'none' }}
              onMouseEnter={() => handleHover('profile-btn', true)}
              onMouseLeave={() => handleHover('profile-btn', false)}
              onClick={() => navigate('/profile')}
            >
              <Award size={18} />
              Loyalty & Rewards
            </button>

            <button
              style={{ ...S.logoutBtn, transform: btnHover['logout'] ? 'translateY(-1px)' : 'none' }}
              onMouseEnter={() => handleHover('logout', true)}
              onMouseLeave={() => handleHover('logout', false)}
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
