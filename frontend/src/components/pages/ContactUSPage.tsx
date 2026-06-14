import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { actionButtonClass } from '../../lib/actionButton';

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+94 11 234 5678', '+94 77 123 4567'],
    gradient: 'from-emerald-400 to-green-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600'
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['info@smartsupermarket.lk', 'support@smartsupermarket.lk'],
    gradient: 'from-blue-400 to-indigo-600',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    icon: MapPin,
    title: 'Head Office',
    details: ['123, Galle Road', 'Colombo 03, Sri Lanka'],
    gradient: 'from-purple-400 to-violet-600',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Mon–Sat: 8:00 AM – 10:00 PM', 'Sunday: 9:00 AM – 9:00 PM'],
    gradient: 'from-orange-400 to-amber-600',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600'
  }
];

const storeLocations = [
  { name: 'Colombo 03 – Main Branch', address: '123, Galle Road, Colombo 03', phone: '+94 11 234 5678', hours: '8:00 AM – 10:00 PM' },
  { name: 'Kandy Branch', address: '456, Peradeniya Road, Kandy', phone: '+94 81 234 5678', hours: '8:00 AM – 9:00 PM' },
  { name: 'Galle Branch', address: '789, Matara Road, Galle', phone: '+94 91 234 5678', hours: '8:00 AM – 9:00 PM' },
  { name: 'Negombo Branch', address: '321, Main Street, Negombo', phone: '+94 31 234 5678', hours: '8:00 AM – 9:00 PM' }
];

const departments = [
  { name: 'General Inquiries', value: 'general' },
  { name: 'Customer Support', value: 'support' },
  { name: 'Bulk Orders', value: 'bulk' },
  { name: 'Feedback & Complaints', value: 'feedback' },
  { name: 'Partnership Opportunities', value: 'partnership' }
];

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; top:90px; right:20px; background:linear-gradient(135deg,#16a34a,#15803d);
      color:#fff; padding:14px 22px; border-radius:12px; box-shadow:0 8px 32px rgba(22,163,74,0.35);
      z-index:9999; display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500;
      animation: slideIn 0.4s ease;
    `;
    toast.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Message sent! We'll get back to you soon.`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);

    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', department: 'general', message: '' });
      setSubmitted(false);
    }, 2000);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl bg-white transition-all duration-200 outline-none text-gray-800 text-sm ${
      focused === field
        ? 'border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.12)]'
        : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
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
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', transform: 'translate(-50%, -50%)' }} />

        <div className="container mx-auto px-6 py-20 text-center relative">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '50px', padding: '6px 18px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <MessageSquare style={{ width: '14px', height: '14px', color: '#86efac' }} />
            <span style={{ fontSize: '12px', color: '#bbf7d0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>We're here for you</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Get in Touch
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            Have a question or feedback? We'd love to hear from you. Our team typically responds within a few hours.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-6" style={{ marginTop: '20px', position: 'relative', zIndex: 10 }}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ border: '1px solid rgba(0,0,0,0.06)', transform: 'translateY(0)', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${info.gradient.includes('emerald') ? '#34d399,#16a34a' : info.gradient.includes('blue') ? '#60a5fa,#4338ca' : info.gradient.includes('purple') ? '#c084fc,#7c3aed' : '#fb923c,#d97706'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '10px' }}>{info.title}</h4>
                {info.details.map((detail, idx) => (
                  <p key={idx} style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>{detail}</p>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-lg p-8" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #34d399, #16a34a)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send style={{ width: '20px', height: '20px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.2 }}>Send us a Message</h2>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '2px' }}>We'll respond within 24 hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    className={inputClass('name')}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused(null)}
                    className={inputClass('phone')}
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className={inputClass('email')}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  onFocus={() => setFocused('department')}
                  onBlur={() => setFocused(null)}
                  className={inputClass('department')}
                  style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  rows={5}
                  className={inputClass('message')}
                  placeholder="How can we help you?"
                  style={{ resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: submitted ? '#9ca3af' : 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '15px',
                  border: 'none',
                  cursor: submitted ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: submitted ? 'none' : '0 4px 16px rgba(22,163,74,0.35)'
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
                {submitted ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Map */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                  Find Us on the Map
                </h3>
              </div>
              <div style={{ height: '280px' }}>
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.81489960679!2d79.82037454863282!3d6.927078700000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259698e5c0d63%3A0x8c8e1e6d60d3f87f!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            {/* Quick Contact */}
            <div className="rounded-3xl p-6" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
              <h3 style={{ color: '#14532d', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Need Immediate Help?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="tel:+94112345678" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#15803d', textDecoration: 'none', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #bbf7d0', transition: 'all 0.2s', fontWeight: 600, fontSize: '14px' }}
                   onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.15)'}
                   onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#34d399,#16a34a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone style={{ width: '16px', height: '16px', color: '#fff' }} />
                  </div>
                  +94 11 234 5678
                  <ChevronRight style={{ width: '16px', height: '16px', marginLeft: 'auto', color: '#9ca3af' }} />
                </a>
                <a href="mailto:info@smartsupermarket.lk" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#15803d', textDecoration: 'none', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #bbf7d0', transition: 'all 0.2s', fontWeight: 600, fontSize: '14px' }}
                   onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.15)'}
                   onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#34d399,#16a34a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail style={{ width: '16px', height: '16px', color: '#fff' }} />
                  </div>
                  info@smartsupermarket.lk
                  <ChevronRight style={{ width: '16px', height: '16px', marginLeft: 'auto', color: '#9ca3af' }} />
                </a>
              </div>
            </div>

            {/* FAQ Promo */}
            <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Frequently Asked Questions</h3>
              <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '14px', lineHeight: 1.6 }}>Find quick answers to common questions in our FAQ section.</p>
              <Link to="/faq" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                Visit FAQ <ChevronRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section style={{ background: '#fff', padding: '64px 0' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '50px', padding: '6px 18px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <MapPin style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Find a Store</span>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '10px' }}>Our Store Locations</h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Visit us at any of our convenient locations across Sri Lanka</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {storeLocations.map((store, index) => (
              <div
                key={index}
                style={{ background: '#fff', border: '2px solid #f3f4f6', borderRadius: '20px', padding: '24px', transition: 'all 0.25s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>{store.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5, marginTop: '6px' }}>{store.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{store.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{store.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
