import { Link } from 'react-router-dom';
import { Truck, Clock, Shield, Headphones, Gift, CreditCard, ArrowLeft, Check } from 'lucide-react';
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
    color: 'bg-green-100 text-green-700'
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
    color: 'bg-blue-100 text-blue-700'
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
    color: 'bg-purple-100 text-purple-700'
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
    color: 'bg-orange-100 text-orange-700'
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
    color: 'bg-pink-100 text-pink-700'
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
    color: 'bg-indigo-100 text-indigo-700'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className={`inline-flex items-center gap-2 ${actionButtonClass}`}>
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4">Our Services</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Providing exceptional service and convenience to make your shopping experience seamless and enjoyable
          </p>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Services */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-800 mb-4">Premium Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our premium services designed to enhance your shopping experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="bg-white p-6">
                  <h3 className="text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-gray-800 mb-4">Ready to Experience Our Services?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start shopping today and enjoy all the benefits of our premium services
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800">
              Browse Products
            </Link>
            <Link to="/contact" className="border border-green-700 text-green-700 px-8 py-3 rounded-lg hover:bg-green-50">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
