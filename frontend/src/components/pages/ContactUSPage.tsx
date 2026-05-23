import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['+94 11 234 5678', '+94 77 123 4567'],
    color: 'bg-green-100 text-green-700'
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['info@smartsupermarket.lk', 'support@smartsupermarket.lk'],
    color: 'bg-blue-100 text-blue-700'
  },
  {
    icon: MapPin,
    title: 'Head Office',
    details: ['123, Galle Road', 'Colombo 03, Sri Lanka'],
    color: 'bg-purple-100 text-purple-700'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Mon - Sat: 8:00 AM - 10:00 PM', 'Sunday: 9:00 AM - 9:00 PM'],
    color: 'bg-orange-100 text-orange-700'
  }
];

const storeLocations = [
  { name: 'Colombo 03 - Main Branch', address: '123, Galle Road, Colombo 03', phone: '+94 11 234 5678', hours: '8:00 AM - 10:00 PM' },
  { name: 'Kandy Branch', address: '456, Peradeniya Road, Kandy', phone: '+94 81 234 5678', hours: '8:00 AM - 9:00 PM' },
  { name: 'Galle Branch', address: '789, Matara Road, Galle', phone: '+94 91 234 5678', hours: '8:00 AM - 9:00 PM' },
  { name: 'Negombo Branch', address: '321, Main Street, Negombo', phone: '+94 31 234 5678', hours: '8:00 AM - 9:00 PM' }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Message sent successfully! We'll get back to you soon.</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    // Reset form after 2 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'general',
        message: ''
      });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-green-700 hover:text-green-800">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4">Get in Touch</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            We're here to help! Reach out to us for any questions, concerns, or feedback.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className={`w-12 h-12 ${info.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-gray-800 mb-3">{info.title}</h4>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 text-sm mb-1">{detail}</p>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-8 h-8 text-green-700" />
              <h2 className="text-gray-800">Send us a Message</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 flex items-center justify-center gap-2 disabled:bg-green-400"
              >
                <Send className="w-5 h-5" />
                {submitted ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Map & Additional Info */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-80 bg-gray-200 relative">
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.81489960679!2d79.82037454863282!3d6.927078700000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259698e5c0d63%3A0x8c8e1e6d60d3f87f!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-gray-800 mb-4">Need Immediate Assistance?</h3>
              <div className="space-y-3">
                <a href="tel:+94112345678" className="flex items-center gap-3 text-green-700 hover:text-green-800">
                  <Phone className="w-5 h-5" />
                  <span>Call us at +94 11 234 5678</span>
                </a>
                <a href="mailto:info@smartsupermarket.lk" className="flex items-center gap-3 text-green-700 hover:text-green-800">
                  <Mail className="w-5 h-5" />
                  <span>Email us at info@smartsupermarket.lk</span>
                </a>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-gray-800 mb-2">Frequently Asked Questions</h3>
              <p className="text-gray-600 text-sm mb-4">
                Find quick answers to common questions in our FAQ section.
              </p>
              <Link to="/faq" className="text-green-700 hover:text-green-800 flex items-center gap-2">
                Visit FAQ
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-800 mb-4">Our Store Locations</h2>
            <p className="text-gray-600">Visit us at any of our convenient locations</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {storeLocations.map((store, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h4 className="text-gray-800 mb-3">{store.name}</h4>
                <div className="space-y-2 text-gray-600 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-700 flex-shrink-0 mt-1" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-700" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-700" />
                    <span>{store.hours}</span>
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
