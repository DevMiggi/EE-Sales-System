import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  Receipt,
  RefreshCw,
} from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface DashboardTotals {
  total_products: number;
  total_cashiers: number;
  total_sales_today: number;
  total_sales_month: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface RecentTransaction {
  sale_id: number;
  receipt_number: string;
  sale_datetime: string;
  total_amount: number;
  status: string;
  cashier_name: string;
}

interface FastMovingProduct {
  product_id: number;
  display_name: string;
  total_qty_sold: number;
  total_sales: number;
}

interface DashboardData {
  totals: DashboardTotals;
  recent_transactions: RecentTransaction[];
  fast_moving_products: FastMovingProduct[];
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData>({
    totals: {
      total_products: 0,
      total_cashiers: 0,
      total_sales_today: 0,
      total_sales_month: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
    },
    recent_transactions: [],
    fast_moving_products: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("ee_token");

      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load dashboard.");
      }

      setData(result);
    } catch (error) {
      console.error("DASHBOARD FETCH ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const totals = data.totals;

  return (
    <div className="max-w-7xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Live admin monitoring connected to cashier activity
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4A90E2] px-4 py-2 text-sm font-medium text-white hover:bg-[#357ABD]"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="relative p-8 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <DollarSign className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-green-100 uppercase tracking-wide font-medium">
              Sales Today
            </p>
            <p className="text-4xl font-bold">
              ₱
              {Number(totals.total_sales_today || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-green-100">
              Live total from completed cashier transactions
            </p>
          </div>
        </Card>

        <Card className="relative p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <Package className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-blue-100 uppercase tracking-wide font-medium">
              Total Products
            </p>
            <p className="text-4xl font-bold">{totals.total_products}</p>
            <p className="text-xs text-blue-100">
              Active products currently managed
            </p>
          </div>
        </Card>

        <Card className="relative p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <Users className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-purple-100 uppercase tracking-wide font-medium">
              Active Cashiers
            </p>
            <p className="text-4xl font-bold">{totals.total_cashiers}</p>
            <p className="text-xs text-purple-100">
              Active cashier accounts in the system
            </p>
          </div>
        </Card>

        <Card className="relative p-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <AlertTriangle className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-orange-100 uppercase tracking-wide font-medium">
              Low Stock Items
            </p>
            <p className="text-4xl font-bold">{totals.low_stock_count}</p>
            <p className="text-xs text-orange-100">
              Products needing admin attention
            </p>
          </div>
        </Card>

        <Card className="relative p-8 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <AlertTriangle className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-red-100 uppercase tracking-wide font-medium">
              Out of Stock
            </p>
            <p className="text-4xl font-bold">{totals.out_of_stock_count}</p>
            <p className="text-xs text-red-100">
              Products currently unavailable
            </p>
          </div>
        </Card>

        <Card className="relative p-8 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <TrendingUp className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-cyan-100 uppercase tracking-wide font-medium">
              Sales This Month
            </p>
            <p className="text-4xl font-bold">
              ₱
              {Number(totals.total_sales_month || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-cyan-100">
              Running monthly completed sales
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Transactions
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Latest cashier sales activity
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                <TableHead className="text-white font-semibold">Receipt</TableHead>
                <TableHead className="text-white font-semibold">Cashier</TableHead>
                <TableHead className="text-white font-semibold">Amount</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-gray-500">
                    Loading dashboard data...
                  </TableCell>
                </TableRow>
              ) : data.recent_transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-gray-500">
                    No recent transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                data.recent_transactions.map((transaction) => (
                  <TableRow
                    key={transaction.sale_id}
                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="py-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <Receipt className="size-4 text-blue-500" />
                        {transaction.receipt_number}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-gray-700">
                      {transaction.cashier_name}
                    </TableCell>

                    <TableCell className="py-4 font-bold text-green-600">
                      ₱
                      {Number(transaction.total_amount || 0).toLocaleString(
                        "en-PH",
                        { minimumFractionDigits: 2 }
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 capitalize">
                        {transaction.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-800">
              Fast-Moving Products
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Best-performing products based on actual sales
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                <TableHead className="text-white font-semibold">Product</TableHead>
                <TableHead className="text-white font-semibold">Qty Sold</TableHead>
                <TableHead className="text-white font-semibold">Sales</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-gray-500">
                    Loading fast-moving products...
                  </TableCell>
                </TableRow>
              ) : data.fast_moving_products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-gray-500">
                    No product sales data yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.fast_moving_products.map((product, index) => (
                  <TableRow
                    key={product.product_id}
                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">
                          {product.display_name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 font-semibold text-gray-700">
                      {Number(product.total_qty_sold || 0)}
                    </TableCell>

                    <TableCell className="py-4 font-bold text-green-600">
                      ₱
                      {Number(product.total_sales || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}