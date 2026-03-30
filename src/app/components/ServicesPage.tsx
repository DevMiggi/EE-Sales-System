import { ShoppingCart, Package, Truck, Briefcase, Layers, Star } from 'lucide-react';

export function ServicesPage() {
  const services = [
    {
      icon: ShoppingCart,
      title: 'Retail Sales',
      description: 'Walk-in purchases for individual customers with competitive pricing on all school supplies and plastic products.',
      features: ['Individual customer service', 'Flexible payment options', 'In-store assistance', 'Product recommendations'],
      color: 'blue'
    },
    {
      icon: Package,
      title: 'Wholesale Orders',
      description: 'Bulk purchasing options for businesses, schools, and organizations with special discounted pricing.',
      features: ['Volume discounts', 'Customized orders', 'Dedicated account manager', 'Priority processing'],
      color: 'green'
    },
    {
      icon: Layers,
      title: 'School Supplies',
      description: 'Complete range of educational materials from notebooks to art supplies for all grade levels.',
      features: ['Notebooks & paper', 'Writing instruments', 'Art supplies', 'Organizational tools'],
      color: 'purple'
    },
    {
      icon: Briefcase,
      title: 'Plastic Products',
      description: 'High-quality plastic supplies including folders, envelopes, binders, storage solutions, and dividers.',
      features: ['Plastic folders', 'Clear envelopes', 'Binders & dividers', 'Storage containers'],
      color: 'orange'
    },
    {
      icon: Truck,
      title: 'Delivery Services',
      description: 'Convenient delivery options for wholesale orders and large retail purchases within the service area.',
      features: ['Local delivery', 'Scheduled deliveries', 'Order tracking', 'Safe packaging'],
      color: 'red'
    },
    {
      icon: Star,
      title: 'General Merchandise',
      description: 'Wide variety of additional products including office supplies, organizational items, and everyday essentials.',
      features: ['Office supplies', 'Organizational items', 'Stationery', 'Business essentials'],
      color: 'indigo'
    }
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', button: 'bg-orange-600 hover:bg-orange-700' },
    red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700' }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Our Services</h1>
        <p className="text-lg text-white/90 max-w-3xl">
          We offer comprehensive solutions for all your school supply and plastic product needs. 
          Whether you're an individual customer or a business looking for wholesale options, we've got you covered.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          const colors = colorClasses[service.color as keyof typeof colorClasses];
          
          return (
            <div 
              key={index}
              className={`${colors.bg} rounded-xl p-6 border ${colors.border} hover:shadow-lg transition-all`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="size-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Icon className={`size-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Key Features:</p>
                <ul className="space-y-1.5">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className={`size-1.5 rounded-full ${colors.icon.replace('text-', 'bg-')}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why Choose Us */}
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose Our Services?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="size-16 bg-gradient-to-br from-[#4A90E2] to-[#357ABD] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Competitive Pricing</h4>
            <p className="text-sm text-gray-600">Best prices in the market for both retail and wholesale customers</p>
          </div>
          
          <div className="text-center">
            <div className="size-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Quality Assurance</h4>
            <p className="text-sm text-gray-600">All products are sourced from trusted manufacturers and suppliers</p>
          </div>
          
          <div className="text-center">
            <div className="size-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Excellent Support</h4>
            <p className="text-sm text-gray-600">Dedicated customer service team ready to assist with your needs</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Contact us today to learn more about our services or place an order. 
          Our team is ready to help you find the perfect products for your needs.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Contact Us
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-white/20">
            View Products
          </button>
        </div>
      </div>
    </div>
  );
}
