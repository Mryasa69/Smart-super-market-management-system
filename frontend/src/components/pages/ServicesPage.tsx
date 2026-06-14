import { Link } from 'react-router-dom';
import { Truck, Clock, Shield, Headphones, Gift, CreditCard, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { actionButtonClass } from '../../lib/actionButton';

const services = [
  {
    icon: Truck,
    title: 'Free Home Delivery',
    description: 'Enjoy free delivery on orders above Rs. 3,000 within Colombo city limits.',
    features: [
      'Same-day delivery available',
      'Track your order in real-time',
      'Contactless delivery option',
      'Flexible delivery time slots'
    ],
    gradient: 'linear-gradient(135deg, #34d399, #059669)'
  },
  {
    icon: Clock,
    title: '24/7 Online Shopping',
    description: 'Shop anytime, anywhere with our online platform accessible round the clock.',
    features: [
      'Browse thousands of products',
      'Easy-to-use interface',
      'Save items for later',
      'Quick reorder from history'
    ],
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)'
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'We ensure the highest quality standards for all our fresh and packaged products.',
    features: [
      '100% fresh produce',
      'Quality check before delivery',
      'Easy returns within 24 hours',
      'Money-back guarantee'
    ],
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)'
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    description: 'Our dedicated support team is here to help you with any questions or concerns.',
    features: [
      'Live chat support',
      'Phone support: +94 11 234 5678',
      'Email support',
      'FAQ and help center'
    ],
    gradient: 'linear-gradient(135deg, #fb923c, #ea580c)'
  },
  {
    icon: Gift,
    title: 'Loyalty Rewards',
    description: 'Earn points with every purchase and redeem them for exclusive discounts.',
    features: [
      'Earn 1 point per Rs. 100 spent',
      'Exclusive member discounts',
      'Birthday special offers',
      'Early access to sales'
    ],
    gradient: 'linear-gradient(135deg, #f472b6, #db2777)'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Multiple payment options with secure checkout for your peace of mind.',
    features: [
      'Credit/Debit cards accepted',
      'Mobile payment options',
      'Cash on delivery available',
      'SSL encrypted transactions'
    ],
    gradient: 'linear-gradient(135deg, #818cf8, #4f46e5)'
  }
];

const additionalServices = [
  {
    title: 'Personal Shopper Service',
    description: 'Let our expert shoppers handpick the best products for you.',
    image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&h=400&fit=crop'
  },
  {
    title: 'Recipe & Meal Planning',
    description: 'Get personalized recipe suggestions and meal plans based on your preferences.',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=400&fit=crop'
  },
  {
    title: 'Corporate Bulk Orders',
    description: 'Special pricing and services for corporate and bulk orders.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop'
  }
];

export default function ServicesPage() {
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
            <Sparkles style={{ width: '14px', height: '14px', color: '#fde68a' }} />
            <span style={{ fontSize: '12px', color: '#bbf7d0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Premium Services</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Our Services
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            Providing exceptional service and convenience to make your shopping experience seamless and enjoyable
          </p>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ border: '1px solid rgba(0,0,0,0.06)', transform: 'translateY(0)', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: service.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '1.25rem', marginBottom: '12px' }}>{service.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>{service.description}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {service.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#6b7280' }}>
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Services */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '50px', padding: '6px 16px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Premium</span>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '16px', lineHeight: 1.2 }}>
              Premium Services
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
              Explore our premium services designed to enhance your shopping experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="bg-white p-6">
                  <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '1.15rem', marginBottom: '12px' }}>{service.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '16px', lineHeight: 1.2 }}>
            Ready to Experience Our Services?
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            Start shopping today and enjoy all the benefits of our premium services
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/products"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '12px',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Browse Products
            </Link>
            <Link
              to="/contact"
              style={{
                border: '2px solid #16a34a',
                color: '#16a34a',
                padding: '12px 32px',
                borderRadius: '12px',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                background: '#fff'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0fdf4';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
