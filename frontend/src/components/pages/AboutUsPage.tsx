import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Eye, Award, Users, Leaf, Heart } from 'lucide-react';

const values = [
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'Committed to eco-friendly practices and supporting local farmers'
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your satisfaction and trust are our top priorities'
  },
  {
    icon: Award,
    title: 'Quality Excellence',
    description: 'Only the finest products meet our quality standards'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building strong relationships within our community'
  }
];

const milestones = [
  { year: '2015', title: 'Founded', description: 'Started our first store in Colombo' },
  { year: '2018', title: 'Expansion', description: 'Opened 10 stores across Sri Lanka' },
  { year: '2020', title: 'Digital Launch', description: 'Launched online shopping platform' },
  { year: '2024', title: 'Innovation', description: 'Introduced AI-powered smart shopping' },
  { year: '2026', title: 'Leadership', description: 'Became #1 supermarket chain in Sri Lanka' }
];

const team = [
  { name: 'Rajesh Kumar', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop' },
  { name: 'Priya Fernando', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop' },
  { name: 'Amal Perera', role: 'Technology Director', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop' },
  { name: 'Nisha Silva', role: 'Customer Experience Lead', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop' }
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
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
      <section className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6">About Smart Supermarket</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Your trusted partner for fresh groceries and everyday essentials since 2015. 
            We're committed to bringing quality, convenience, and value to every household in Sri Lanka.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Smart Supermarket began with a simple vision: to provide Sri Lankan families with access to 
              fresh, quality groceries at affordable prices. What started as a single store in Colombo has 
              grown into the nation's most trusted supermarket chain.
            </p>
            <p className="text-gray-600 mb-4">
              Today, we serve thousands of customers daily across our network of stores and through our 
              innovative online platform. Our commitment to quality, sustainability, and customer satisfaction 
              remains at the heart of everything we do.
            </p>
            <p className="text-gray-600">
              We work directly with local farmers and suppliers to ensure the freshest produce while 
              supporting our local economy. Every product on our shelves is carefully selected to meet 
              our strict quality standards.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" 
              alt="Store Interior"
              className="rounded-lg shadow-md"
            />
            <img 
              src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400&h=300&fit=crop" 
              alt="Fresh Produce"
              className="rounded-lg shadow-md mt-8"
            />
            <img 
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop" 
              alt="Shopping Experience"
              className="rounded-lg shadow-md -mt-8"
            />
           
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide exceptional value and convenience to our customers by offering the freshest 
                products, competitive prices, and outstanding service while supporting local communities 
                and sustainable practices.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be Sri Lanka's most trusted and innovative supermarket chain, setting new standards 
                in retail excellence and making quality groceries accessible to every household across 
                the nation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-800 mb-4">Our Core Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The principles that guide every decision we make and every service we provide
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-10 h-10 text-green-700" />
                </div>
                <h4 className="text-gray-800 mb-2">{value.title}</h4>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-800 mb-4">Our Journey</h2>
            <p className="text-gray-600">Milestones that shaped our success</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-300 transform -translate-x-1/2"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative mb-8 md:mb-12 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="text-green-700 mb-2">{milestone.year}</div>
                      <h4 className="text-gray-800 mb-2">{milestone.title}</h4>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>
                  </div>
                  {/* Timeline Dot */}
                  <div className="hidden md:block absolute top-6 left-1/2 w-4 h-4 bg-green-600 rounded-full transform -translate-x-1/2 border-4 border-green-50"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-800 mb-4">Meet Our Leadership Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dedicated professionals committed to delivering excellence
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {team.map((member, index) => (
            <div key={index} className="text-center group">
              <div className="mb-4 overflow-hidden rounded-lg">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h4 className="text-gray-800 mb-1">{member.name}</h4>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-600 text-white ">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">50+</div>
              <p className="opacity-90">Store Locations</p>
            </div>
            <div>
              <div className="text-4xl mb-2">100K+</div>
              <p className="opacity-90">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl mb-2">500+</div>
              <p className="opacity-90">Local Suppliers</p>
            </div>
            <div>
              <div className="text-4xl mb-2">2000+</div>
              <p className="opacity-90">Team Members</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
