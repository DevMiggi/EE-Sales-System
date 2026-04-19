import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DashboardView } from './DashboardView';
import { SalesTransaction } from './SalesTransaction';
import { TransactionHistory } from './TransactionHistory';
import { InventoryMonitoring } from './InventoryMonitoring';
import { LowStockAlerts } from './LowStockAlerts';
import { ProductPricingManager } from './ProductPricingManager';
import { SalesReportAnalysis } from './SalesReportAnalysis';
import { Suppliers } from './Suppliers';
import { AboutPage } from './AboutPage';
import { ServicesPage } from './ServicesPage';
import { ContactPage } from './ContactPage';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  Package,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Search,
  Home,
  Info,
  Briefcase,
  Mail,
  User,
  Phone,
  MapPin,
  LogOut,
  Truck,
} from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeNavPage, setActiveNavPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-green-500' },
    { id: 'sales', label: 'Sales Transaction', icon: ShoppingCart, color: 'text-gray-700' },
    { id: 'history', label: 'Transaction History', icon: History, color: 'text-blue-500' },
    { id: 'inventory', label: 'Inventory Monitoring', icon: Package, color: 'text-orange-500' },
    { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle, color: 'text-orange-500' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, color: 'text-cyan-600' },
    { id: 'pricing', label: 'Product & Pricing Management', icon: DollarSign, color: 'text-red-500' },
    { id: 'reports', label: 'Sales Report', icon: BarChart3, color: 'text-blue-500' },
  ];

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Info },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const matchingTab = menuItems.find((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingTab) {
        setActiveTab(matchingTab.id);
        setActiveNavPage('home');
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="bg-[#4A90E2] text-white px-6 py-2 text-xs flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone className="size-3.5" />
              <span>+63 912 345 6789</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="size-3.5" />
              <span>eesales@gmail.com</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="size-3.5" />
              <span>{user?.name || 'User'}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-gradient-to-br from-[#4A90E2] to-[#357ABD] rounded-lg flex items-center justify-center shadow-md">
              <Package className="size-7 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-tight">
                E&amp;E Sales and Inventory Management System
              </h1>
              <p className="text-xs text-gray-500">
                Plastic Supply Wholesale, Retail, and General Merchandise
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeNavPage === link.id;

              return (
                <Button
                  key={link.id}
                  variant="ghost"
                  onClick={() => {
                    setActiveNavPage(link.id);
                    if (link.id === 'home') {
                      setActiveTab('dashboard');
                    } else {
                      setActiveTab('');
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'text-[#4A90E2] bg-blue-50 font-semibold'
                      : 'text-gray-700 hover:text-[#4A90E2] hover:bg-blue-50'
                  }`}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Button>
              );
            })}
          </nav>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border-gray-300 focus:border-[#4A90E2] focus:ring-[#4A90E2] text-sm"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-4 py-2 text-sm"
            >
              Search
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-56 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Menu
            </p>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setActiveNavPage('home');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`size-4 ${isActive ? 'text-white' : item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          {activeNavPage === 'home' && (
            <>
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'sales' && <SalesTransaction />}
              {activeTab === 'history' && <TransactionHistory />}
              {activeTab === 'inventory' && <InventoryMonitoring />}
              {activeTab === 'alerts' && <LowStockAlerts />}
              {activeTab === 'suppliers' && <Suppliers />}
              {activeTab === 'pricing' && <ProductPricingManager />}
              {activeTab === 'reports' && <SalesReportAnalysis />}
            </>
          )}

          {activeNavPage === 'about' && <AboutPage />}
          {activeNavPage === 'services' && <ServicesPage />}
          {activeNavPage === 'contact' && <ContactPage />}
        </main>
      </div>

      <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
        <div className="px-6 py-8">
          <div className="grid grid-cols-4 gap-8 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 bg-gradient-to-br from-[#4A90E2] to-[#357ABD] rounded-lg flex items-center justify-center">
                  <Package className="size-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm">
                  E&amp;E Sales and Inventory Management System
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your trusted source for school supplies, plastic products, wholesale and retail
                merchandise. We provide quality products for students, offices, and businesses at
                competitive prices.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">School Supplies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">Plastic Products</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">Wholesale Orders</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">Retail Sales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#4A90E2] transition-colors">General Merchandise</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact Us</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin className="size-4 text-[#4A90E2] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">123 Business St, Metro Manila, Philippines 1000</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-[#4A90E2]" />
                  <span className="text-gray-400">+63 123 456 7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-[#4A90E2]" />
                  <span className="text-gray-400">eesales@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex items-center justify-between text-xs">
            <p className="text-gray-500">
              © 2026 E&amp;E Sales and Inventory Management System. All rights reserved. | Serving the community with quality products since 2020
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-[#4A90E2] transition-colors">Privacy Policy</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="text-gray-500 hover:text-[#4A90E2] transition-colors">Terms of Service</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="text-gray-500 hover:text-[#4A90E2] transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}