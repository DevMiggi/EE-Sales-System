import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-white/90 max-w-3xl">
          Have questions or ready to place an order? We're here to help! 
          Reach out through any of the methods below or fill out our contact form.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Cards */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="size-6 text-[#4A90E2]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Visit Our Store</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  123 Business St, Metro Manila, Philippines 1000
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="size-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
                <p className="text-sm text-gray-600">+63 123 456 7890</p>
                <p className="text-xs text-gray-500 mt-1">Mon-Sat: 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="size-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
                <p className="text-sm text-gray-600">eesales@gmail.com</p>
                <p className="text-xs text-gray-500 mt-1">We'll respond within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="size-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Business Hours</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday:</span>
                    <span className="text-gray-800 font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday:</span>
                    <span className="text-gray-800 font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday:</span>
                    <span className="text-gray-800 font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-12 bg-gradient-to-br from-[#4A90E2] to-[#357ABD] rounded-lg flex items-center justify-center">
                <MessageSquare className="size-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Send Us a Message</h2>
                <p className="text-sm text-gray-600">Fill out the form below and we'll get back to you soon</p>
              </div>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="size-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600">Thank you for contacting us. We'll respond to your inquiry within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+63 123 456 7890"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="General Inquiry"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#357ABD] hover:to-[#2868A8] text-white py-6 text-base font-semibold shadow-lg"
                >
                  <Send className="size-5 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mt-6">
            <h3 className="font-bold text-gray-800 mb-4">Find Us Here</h3>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <MapPin className="size-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Map Location</p>
                <p className="text-sm text-gray-400">123 Business St, Metro Manila</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}