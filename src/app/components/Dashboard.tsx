import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DashboardView } from "./DashboardView";
import { TransactionHistory } from "./TransactionHistory";
import { InventoryMonitoring } from "./InventoryMonitoring";
import { LowStockAlerts } from "./LowStockAlerts";
import { ProductPricingManager } from "./ProductPricingManager";
import { SalesReportAnalysis } from "./SalesReportAnalysis";
import { Suppliers } from "./Suppliers";
import { CashierAccounts } from "./CashierAccounts";
import { DemandForecasting } from "./DemandForecasting";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  History,
  Package,
  AlertTriangle,
  BarChart3,
  Search,
  User,
  LogOut,
  Truck,
  Users,
  TrendingUp,
  Boxes,
} from "lucide-react";

type AdminTab =
  | "dashboard"
  | "products"
  | "inventory"
  | "alerts"
  | "suppliers"
  | "transactions"
  | "reports"
  | "cashiers"
  | "forecasting";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-emerald-500",
    },
    {
      id: "products",
      label: "Product Management",
      icon: Package,
      color: "text-blue-500",
    },
    {
      id: "inventory",
      label: "Inventory Management",
      icon: Boxes,
      color: "text-orange-500",
    },
    {
      id: "alerts",
      label: "Low Stock Monitoring",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      id: "suppliers",
      label: "Supplier Management",
      icon: Truck,
      color: "text-cyan-600",
    },
    {
      id: "transactions",
      label: "Transaction Monitoring",
      icon: History,
      color: "text-violet-500",
    },
    {
      id: "reports",
      label: "Sales Reports",
      icon: BarChart3,
      color: "text-indigo-500",
    },
    {
      id: "cashiers",
      label: "Cashier Accounts",
      icon: Users,
      color: "text-pink-500",
    },
    {
      id: "forecasting",
      label: "Demand Forecasting",
      icon: TrendingUp,
      color: "text-green-600",
    },
  ] as const;

  const activeMenu = menuItems.find((item) => item.id === activeTab);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();

    const match = menuItems.find((item) =>
      item.label.toLowerCase().includes(query)
    );

    if (match) {
      setActiveTab(match.id);
      setSearchQuery("");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;

      case "products":
        return <ProductPricingManager />;

      case "inventory":
        return <InventoryMonitoring />;

      case "alerts":
        return <LowStockAlerts />;

      case "suppliers":
        return <Suppliers />;

      case "transactions":
        return <TransactionHistory />;

      case "reports":
        return <SalesReportAnalysis />;

      case "cashiers":
        return <CashierAccounts />;

      case "forecasting":
        return <DemandForecasting />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#357ABD] shadow-md">
              <Package className="size-6 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                E&amp;E Admin Panel
              </h1>
              <p className="text-sm text-gray-500">
                Sales and Inventory Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search admin modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 pl-10"
                />
              </div>

              <Button
                type="submit"
                className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
              >
                Search
              </Button>
            </form>

            <div className="ml-2 flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
              <User className="size-4 text-gray-600" />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs capitalize text-gray-500">
                  {user?.role || "admin"}
                </p>
              </div>
            </div>

            <Button
              onClick={logout}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-81px)]">
        <aside className="w-72 border-r border-gray-200 bg-white shadow-sm">
          <div className="p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Admin Modules
            </p>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`size-5 ${
                        isActive ? "text-white" : item.color
                      }`}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {activeMenu?.label || "Dashboard"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor business operations from the admin side.
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}