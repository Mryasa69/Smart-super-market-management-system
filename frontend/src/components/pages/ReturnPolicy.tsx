import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Clock, FileText, AlertTriangle, Check, ShieldCheck, Mail, Phone, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { actionButtonClass } from '../../lib/actionButton';

const policyCards = [
  {
    icon: Clock,
    title: 'Return Window',
    description: 'Fresh groceries can be returned within 24 hours. Packaged non-perishable items can be returned within 7 days.',
    gradient: 'linear-gradient(135deg, #34d399, #059669)',
    bg: '#f0fdf4'
  },
  {
    icon: FileText,
    title: 'Proof of Purchase',
    description: 'A valid original printed receipt or electronic invoice is required for all returns and exchanges.',
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    bg: '#eff6ff'
  },
  {
    icon: RefreshCw,
    title: 'Refund Options',
    description: 'Choose between store credit (credited immediately to loyalty account) or original payment refund.',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    bg: '#f5f3ff'
  },
  {
    icon: AlertTriangle,
    title: 'Exclusions',
    description: 'For safety and hygiene, open baby products, personal care goods, and clearance items are not returnable.',
    gradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
    bg: '#fff7ed'
  }
];

const returnSteps = [
  {
    step: '01',
    title: 'Check Eligibility',
    description: 'Ensure items are unused, in original packaging, and within the return window.'
  },
  {
    step: '02',
    title: 'Visit Customer Desk',
    description: 'Bring the items and original receipt to the Customer Support desk at any branch.'
  },
  {
    step: '03',
    title: 'Verification',
    description: 'Our staff will quickly check the item condition and verify the purchase.'
  },
  {
    step: '04',
    title: 'Instant Resolution',
    description: 'Receive your store credit refund or original payment refund immediately.'
  }
];

const faqs = [
  {
    q: 'Can I return fresh vegetables or dairy products?',
    a: 'Yes, fresh vegetables, fruits, dairy, and meat products can be returned within 24 hours of purchase if they do not meet quality standards. We will verify the batch number and store storage conditions if necessary.'
  },
  {
    q: 'What if I lost my receipt?',
    a: 'If you are registered in our loyalty program, our store managers can lookup your purchase history using your registered phone number or loyalty ID.'
  },
  {
    q: 'How long does a card refund take?',
    a: 'Store credit and cash refunds are processed instantly. If you paid via credit card or online payment gateway, card issuer refunds typically take 3 to 7 business days to reflect in your account.'
  },
  {
    q: 'Can I return an item purchased online to a physical store?',
    a: 'Absolutely. Online orders can be returned either by visiting the Customer Desk at any of our outlets, or by contacting our delivery support team to schedule a pickup (standard pickup fees may apply).'
  }
];

export default function ReturnPolicy() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', transform: 'translate(-50%, -50%)' }} />

        <div className="container mx-auto px-6 py-20 text-center relative">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '50px', padding: '6px 18px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ShieldCheck style={{ width: '14px', height: '14px', color: '#86efac' }} />
            <span style={{ fontSize: '12px', color: '#bbf7d0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Hassle-Free Returns</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Return & Refund Policy
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            We want you to shop with complete confidence. Read our transparent policy guidelines to learn how we make returns simple and straightforward.
          </p>
        </div>
      </section>

      {/* Policy Details Cards */}
      <section className="container mx-auto px-6" style={{ marginTop: '20px', position: 'relative', zIndex: 10 }}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {policyCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ border: '1px solid rgba(0,0,0,0.06)', transform: 'translateY(0)', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '10px' }}>{card.title}</h4>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>{card.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Return Process Timeline */}
      <section style={{ background: '#fff', padding: '80px 0', marginTop: '60px' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '12px' }}>How to Return an Item</h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Four simple steps to complete your return or exchange</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {returnSteps.map((step, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '32px 24px', border: '1px solid #f1f5f9', height: '100%' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', opacity: 0.25, marginBottom: '12px', lineHeight: 1 }}>{step.step}</div>
                  <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{step.title}</h4>
                  <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '50px', padding: '6px 16px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <HelpCircle style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>FAQ</span>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '2rem', marginBottom: '10px' }}>Return FAQs</h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Quick answers to common questions regarding returns</p>
          </div>

          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.2s' }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'between', alignItems: 'center', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', outline: 'none' }}
                >
                  <span style={{ color: '#1f2937', fontWeight: 600, fontSize: '15px', flexGrow: 1 }}>{faq.q}</span>
                  <ChevronDown
                    style={{
                      width: '18px',
                      height: '18px',
                      color: '#9ca3af',
                      transform: openFaq === index ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>
                {openFaq === index && (
                  <div style={{ padding: '0 24px 20px', color: '#6b7280', fontSize: '13px', lineHeight: 1.7, borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #14532d, #15803d)', padding: '60px 0', color: '#fff' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', marginBottom: '12px' }}>Still Have Questions?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Our customer relations team is available to assist you with any return or refund queries.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:support@smartsupermarket.lk"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#16a34a', padding: '12px 28px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Mail style={{ width: '16px', height: '16px' }} />
              support@smartsupermarket.lk
            </a>
            <a
              href="tel:+94112345678"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', padding: '12px 28px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Phone style={{ width: '16px', height: '16px' }} />
              +94 11 234 5678
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
