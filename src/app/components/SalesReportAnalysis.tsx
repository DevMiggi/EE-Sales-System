import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Receipt,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface DailySalesRow {
  report_date: string;
  total_transactions: number;
  total_sales: number;
}

interface TopProductRow {
  display_name: string;
  total_qty_sold: number;
  total_sales: number;
}

interface SalesSummaryResponse {
  daily_sales: DailySalesRow[];
  top_products: TopProductRow[];
}

export function SalesReportAnalysis() {
  const [data, setData] = useState<SalesSummaryResponse>({
    daily_sales: [],
    top_products: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("ee_token") || "";

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/reports/sales-summary?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load sales reports.");
      }

      setData({
        daily_sales: Array.isArray(result.daily_sales) ? result.daily_sales : [],
        top_products: Array.isArray(result.top_products) ? result.top_products : [],
      });
    } catch (error) {
      console.error("SALES REPORT FETCH ERROR:", error);
      alert("Failed to load sales reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const interval = setInterval(() => {
      fetchReports();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fastMoving = useMemo(() => {
    return [...data.top_products]
      .sort((a, b) => Number(b.total_qty_sold || 0) - Number(a.total_qty_sold || 0))
      .slice(0, 5);
  }, [data.top_products]);

  const slowMoving = useMemo(() => {
    return [...data.top_products]
      .sort((a, b) => Number(a.total_qty_sold || 0) - Number(b.total_qty_sold || 0))
      .slice(0, 5);
  }, [data.top_products]);

  const maxQty = useMemo(() => {
    return Math.max(
      1,
      ...data.top_products.map((product) => Number(product.total_qty_sold || 0))
    );
  }, [data.top_products]);

  const getBarWidth = (qty: number) => {
    return `${Math.max(8, (Number(qty || 0) / maxQty) * 100)}%`;
  };

  const totalSalesOverall = useMemo(() => {
    return data.daily_sales.reduce(
      (sum, row) => sum + Number(row.total_sales || 0),
      0
    );
  }, [data.daily_sales]);

  const totalTransactionsOverall = useMemo(() => {
    return data.daily_sales.reduce(
      (sum, row) => sum + Number(row.total_transactions || 0),
      0
    );
  }, [data.daily_sales]);

  return (
    <div className="max-w-7xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3">
            <BarChart3 className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Sales Reports & Analysis
            </h2>
            <p className="text-sm text-gray-500">
              Real sales insights connected to cashier transactions
            </p>
          </div>
        </div>

        <Button
          onClick={fetchReports}
          className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-green-500 to-green-600 p-8 text-white shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-green-100">
              Total Sales
            </p>
            <p className="text-4xl font-bold">
              ₱
              {Number(totalSalesOverall || 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-green-100">Based on recorded sales summary</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-100">
              Total Transactions
            </p>
            <p className="text-4xl font-bold">{totalTransactionsOverall}</p>
            <p className="text-xs text-blue-100">Completed transactions counted</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 p-8 text-white shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-purple-100">
              Top Products
            </p>
            <p className="text-4xl font-bold">{data.top_products.length}</p>
            <p className="text-xs text-purple-100">Products with recorded sales</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#4A90E2] p-2">
              <Receipt className="size-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Daily Sales Summary
              </h3>
              <p className="text-sm text-gray-500">
                Daily completed sales and transaction count
              </p>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
              <TableHead className="font-semibold text-white">Date</TableHead>
              <TableHead className="font-semibold text-white">
                Transactions
              </TableHead>
              <TableHead className="font-semibold text-white">
                Total Sales
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-gray-500">
                  Loading sales summary...
                </TableCell>
              </TableRow>
            ) : data.daily_sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-gray-500">
                  No sales summary available yet.
                </TableCell>
              </TableRow>
            ) : (
              data.daily_sales.map((row, index) => (
                <TableRow
                  key={`${row.report_date}-${index}`}
                  className="border-b border-gray-100 transition-colors hover:bg-blue-50/30"
                >
                  <TableCell className="font-medium text-gray-800">
                    {new Date(row.report_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {Number(row.total_transactions || 0)}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    ₱
                    {Number(row.total_sales || 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
          <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500 p-2">
                <TrendingUp className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Fast Moving Products
                </h3>
                <p className="text-sm text-gray-600">
                  Products with the highest sold quantity
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {fastMoving.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No fast moving products yet
              </p>
            ) : (
              fastMoving.map((product, index) => (
                <div key={`${product.display_name}-${index}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-white shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {product.display_name}
                        </span>
                        <p className="text-xs text-gray-500">
                          Qty Sold: {Number(product.total_qty_sold || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600">
                        ₱
                        {Number(product.total_sales || 0).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <p className="text-xs text-gray-500">Total Sales</p>
                    </div>
                  </div>

                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
                    <div
                      className="flex h-4 items-center justify-end rounded-full bg-gradient-to-r from-green-400 to-green-500 pr-2 text-xs font-bold text-white shadow-sm transition-all duration-500"
                      style={{ width: getBarWidth(product.total_qty_sold) }}
                    >
                      {Number(product.total_qty_sold || 0)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
          <div className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500 p-2">
                <TrendingDown className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Slow Moving Products
                </h3>
                <p className="text-sm text-gray-600">
                  Products with the lowest sold quantity
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {slowMoving.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No slow moving products yet
              </p>
            ) : (
              slowMoving.map((product, index) => (
                <div key={`${product.display_name}-${index}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-sm font-bold text-white shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {product.display_name}
                        </span>
                        <p className="text-xs text-gray-500">
                          Qty Sold: {Number(product.total_qty_sold || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-orange-600">
                        ₱
                        {Number(product.total_sales || 0).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <p className="text-xs text-gray-500">Total Sales</p>
                    </div>
                  </div>

                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
                    <div
                      className="flex h-4 items-center justify-end rounded-full bg-gradient-to-r from-orange-400 to-red-500 pr-2 text-xs font-bold text-white shadow-sm transition-all duration-500"
                      style={{ width: getBarWidth(product.total_qty_sold) }}
                    >
                      {Number(product.total_qty_sold || 0)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}