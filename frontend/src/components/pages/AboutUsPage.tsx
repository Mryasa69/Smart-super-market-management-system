import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Eye, Award, Users, Leaf, Heart, TrendingUp, Star } from 'lucide-react';
import { actionButtonClass } from '../../lib/actionButton';

const values = [
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'Committed to eco-friendly practices and supporting local farmers for a greener tomorrow.',
    gradient: 'linear-gradient(135deg, #34d399, #059669)',
    bg: '#f0fdf4',
    iconBg: 'linear-gradient(135deg,#34d399,#059669)'
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your satisfaction and trust are the foundation of every decision we make.',
    gradient: 'linear-gradient(135deg, #f87171, #dc2626)',
    bg: '#fff1f2',
    iconBg: 'linear-gradient(135deg,#f87171,#dc2626)'
  },
  {
    icon: Award,
    title: 'Quality Excellence',
    description: 'Only the finest products meet our rigorous quality standards and reach your home.',
    gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    bg: '#fffbeb',
    iconBg: 'linear-gradient(135deg,#fbbf24,#d97706)'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building strong, lasting relationships within our local community and beyond.',
    gradient: 'linear-gradient(135deg, #818cf8, #6d28d9)',
    bg: '#f5f3ff',
    iconBg: 'linear-gradient(135deg,#818cf8,#6d28d9)'
  }
];

const milestones = [
  { year: '2015', title: 'Founded', description: 'Started our first store in Colombo with a vision to transform grocery retail.' },
  { year: '2018', title: 'Expansion', description: 'Opened 10 stores across Sri Lanka, reaching thousands of families.' },
  { year: '2020', title: 'Digital Launch', description: 'Launched our online shopping platform during a pivotal moment for digital retail.' },
  { year: '2024', title: 'AI Innovation', description: 'Introduced AI-powered smart shopping for a personalized experience.' },
  { year: '2026', title: 'Market Leader', description: 'Proudly became the #1 supermarket chain in Sri Lanka.' }
];

const team = [
  { name: 'Rajesh Kumar', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop' },
  { name: 'Priya Fernando', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop' },
  { name: 'Amal Perera', role: 'Technology Director', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop' },
  { name: 'Nisha Silva', role: 'Customer Experience Lead', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop' }
];

const stats = [
  { value: '50+', label: 'Store Locations', icon: '🏪' },
  { value: '100K+', label: 'Happy Customers', icon: '😊' },
  { value: '500+', label: 'Local Suppliers', icon: '🤝' },
  { value: '2000+', label: 'Team Members', icon: '👥' }
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className={`inline-flex items-center gap-2 ${actionButtonClass}`}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)', minHeight: '480px', display: 'flex', alignItems: 'center' }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div className="container mx-auto px-6 py-20 text-center relative" style={{ width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '50px', padding: '6px 18px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Star style={{ width: '14px', height: '14px', color: '#fde68a' }} />
            <span style={{ fontSize: '12px', color: '#fde68a', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sri Lanka's #1 Supermarket</span>
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#fff', marginBottom: '20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            About Smart Supermarket
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Your trusted partner for fresh groceries and everyday essentials since 2015. Bringing quality, convenience, and value to every household in Sri Lanka.
          </p>
          {/* Quick stats inline */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '50px', padding: '6px 16px', marginBottom: '20px', border: '1px solid #bbf7d0' }}>
              <TrendingUp style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Our Story</span>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2.2rem', marginBottom: '20px', lineHeight: 1.2 }}>
              From One Store to a<br />
              <span style={{ color: '#16a34a' }}>National Movement</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '15px' }}>
                Smart Supermarket began with a simple vision: to provide Sri Lankan families with access to fresh, quality groceries at affordable prices. What started as a single store in Colombo has grown into the nation's most trusted supermarket chain.
              </p>
              <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '15px' }}>
                Today, we serve thousands of customers daily across our network of stores and through our innovative online platform. Our commitment to quality, sustainability, and customer satisfaction remains at the heart of everything we do.
              </p>
              <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '15px' }}>
                We work directly with local farmers and suppliers to ensure the freshest produce while supporting our local economy.
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"
              alt="Store Interior"
              style={{ borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <img
              src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400&h=300&fit=crop"
              alt="Fresh Produce"
              style={{ borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '100%', height: '200px', objectFit: 'cover', marginTop: '32px' }}
            />
            <img
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop"
              alt="Shopping Experience"
              style={{ borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '100%', height: '200px', objectFit: 'cover', marginTop: '-32px' }}
            />
            <div style={{ borderRadius: '20px', background: 'linear-gradient(135deg,#14532d,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', height: '200px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>11+</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: '0 16px' }}>Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ background: 'linear-gradient(135deg, #f8fafc, #f0fdf4)', padding: '80px 0' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '12px' }}>Our Purpose</h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>The mission and vision that drive everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div style={{ background: '#fff', padding: '36px', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#16a34a,#34d399)' }} />
              <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#34d399,#16a34a)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
                <Target style={{ width: '28px', height: '28px', color: '#fff' }} />
              </div>
              <h3 style={{ color: '#111827', fontWeight: 800, fontSize: '1.25rem', marginBottom: '14px' }}>Our Mission</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '15px' }}>
                To provide exceptional value and convenience to our customers by offering the freshest products, competitive prices, and outstanding service while supporting local communities and sustainable practices.
              </p>
            </div>
            <div style={{ background: '#fff', padding: '36px', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#60a5fa,#6d28d9)' }} />
              <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#60a5fa,#6d28d9)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 16px rgba(109,40,217,0.3)' }}>
                <Eye style={{ width: '28px', height: '28px', color: '#fff' }} />
              </div>
              <h3 style={{ color: '#111827', fontWeight: 800, fontSize: '1.25rem', marginBottom: '14px' }}>Our Vision</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '15px' }}>
                To be Sri Lanka's most trusted and innovative supermarket chain, setting new standards in retail excellence and making quality groceries accessible to every household across the nation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '50px', padding: '6px 18px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <Star style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>What We Stand For</span>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '12px' }}>Our Core Values</h2>
            <p style={{ color: '#6b7280', maxWidth: '480px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
              The principles that guide every decision we make and every service we provide
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  style={{ background: value.bg, borderRadius: '24px', padding: '32px 24px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '72px', height: '72px', background: value.iconBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
                    <Icon style={{ width: '34px', height: '34px', color: '#fff' }} />
                  </div>
                  <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>{value.title}</h4>
                  <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.7 }}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '80px 0' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(22,163,74,0.12)', borderRadius: '50px', padding: '6px 18px', marginBottom: '16px', border: '1px solid #86efac' }}>
              <TrendingUp style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Our Journey</span>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '12px' }}>Milestones That Shaped Us</h2>
            <p style={{ color: '#4b7c5a', fontSize: '15px' }}>A decade of growth, innovation, and dedication</p>
          </div>

          <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
            {/* center line */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, #16a34a, #86efac)', transform: 'translateX(-50%)' }} />

            {milestones.map((milestone, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={index}
                  style={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', marginBottom: '32px', position: 'relative' }}
                >
                  {/* Dot */}
                  <div style={{ position: 'absolute', left: '50%', top: '24px', width: '16px', height: '16px', borderRadius: '50%', background: '#16a34a', border: '3px solid #fff', boxShadow: '0 0 0 3px #16a34a', transform: 'translateX(-50%)', zIndex: 2 }} />

                  <div
                    style={{
                      width: '44%',
                      background: '#fff',
                      borderRadius: '16px',
                      padding: '20px 22px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(22,163,74,0.15)',
                      marginLeft: isLeft ? 0 : undefined,
                      marginRight: isLeft ? undefined : 0
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.2)'; e.currentTarget.style.borderColor = '#86efac'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(22,163,74,0.15)'; }}
                  >
                    <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#16a34a,#14532d)', color: '#fff', fontWeight: 800, fontSize: '13px', padding: '3px 12px', borderRadius: '50px', marginBottom: '8px' }}>{milestone.year}</div>
                    <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{milestone.title}</h4>
                    <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>{milestone.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '50px', padding: '6px 18px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <Users style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>The People</span>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '12px' }}>Meet Our Leadership Team</h2>
            <p style={{ color: '#6b7280', maxWidth: '420px', margin: '0 auto', fontSize: '15px' }}>
              Dedicated professionals committed to delivering excellence every day
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                style={{ textAlign: 'center', cursor: 'default', transition: 'transform 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-6px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 18px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f0fdf4', boxShadow: '0 8px 24px rgba(22,163,74,0.15)' }}>
                  <img
                    src={member.image}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
                <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{member.name}</h4>
                <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section style={{ background: 'linear-gradient(135deg, #14532d, #15803d)', padding: '60px 0' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ padding: '20px' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>{stat.icon}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '6px', fontSize: '14px' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
