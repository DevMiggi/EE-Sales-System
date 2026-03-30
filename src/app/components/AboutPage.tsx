import { Package, Users, Award, TrendingUp } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-4">About E&E Sales and Inventory Management System</h1>
        <p className="text-lg text-white/90 max-w-3xl">
          Your trusted partner for quality school supplies, plastic products, and general merchandise since 2020. 
          We're committed to providing the best products at competitive prices for students, offices, and businesses.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Award className="size-6 text-[#4A90E2]" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            To provide high-quality, affordable school supplies and plastic products to our community, 
            supporting education and business needs with exceptional customer service and reliable inventory.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="size-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">
            To become the leading supplier of school and office supplies in our region, known for quality products, 
            competitive pricing, and outstanding customer satisfaction in both wholesale and retail markets.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Founded in 2020, E&E Sales and Inventory Management System started with a simple mission: to make quality 
            school supplies and plastic products accessible to everyone in our community. What began as a small 
            retail operation has grown into a thriving business serving both individual customers and wholesale clients.
          </p>
          <p>
            Named after our founders' beloved family members, our store embodies the values of trust, quality, 
            and community service. We understand the importance of having reliable supplies for education and business, 
            which is why we carefully curate our inventory to include only the best products.
          </p>
          <p>
            Today, we're proud to offer an extensive range of school supplies, plastic products, and general merchandise. 
            From students preparing for the school year to businesses stocking their offices, we're here to meet your needs 
            with competitive pricing and friendly service.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="size-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <Package className="size-6 text-[#4A90E2]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Wide Selection</h3>
          <p className="text-gray-600 text-sm">
            Extensive inventory of school supplies, plastic products, and general merchandise to meet all your needs.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="size-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <Award className="size-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Quality Products</h3>
          <p className="text-gray-600 text-sm">
            We source only the best products from trusted manufacturers to ensure customer satisfaction.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="size-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <Users className="size-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Customer Service</h3>
          <p className="text-gray-600 text-sm">
            Dedicated support team ready to assist with your orders, whether retail or wholesale.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Impact</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4A90E2] mb-2">4+</div>
            <div className="text-sm text-gray-300">Years in Business</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4A90E2] mb-2">500+</div>
            <div className="text-sm text-gray-300">Products Available</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4A90E2] mb-2">1000+</div>
            <div className="text-sm text-gray-300">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4A90E2] mb-2">50+</div>
            <div className="text-sm text-gray-300">Wholesale Partners</div>
          </div>
        </div>
      </div>
    </div>
  );
}