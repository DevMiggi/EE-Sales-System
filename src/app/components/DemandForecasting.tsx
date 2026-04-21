import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TrendingUp, RefreshCw, Search } from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface ForecastRow {
  product_id: number;
  display_name: string;
  current_stock: number;
  reorder_level: number;
  qty_last_30_days: number;
  average_daily_sales: number;
  suggested_reorder_qty: number;
}

export function DemandForecasting() {
  const [rows, setRows] = useState<ForecastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("ee_token") || "";

  const loadForecasting = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/admin/forecasting?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load forecasting data.");
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD FORECASTING ERROR:", error);
      setRows([]);
      alert("Failed to load forecasting data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecasting();
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return rows.filter((row) =>
      row.display_name.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const getPriorityBadge = (row: ForecastRow) => {
    if (row.current_stock === 0) {
      return "bg-red-100 text-red-700";
    }
    if (row.suggested_reorder_qty >= 20) {
      return "bg-orange-100 text-orange-700";
    }
    if (row.suggested_reorder_qty > 0) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-green-100 text-green-700";
  };

  const getPriorityText = (row: ForecastRow) => {
    if (row.current_stock === 0) return "Urgent";
    if (row.suggested_reorder_qty >= 20) return "High";
    if (row.suggested_reorder_qty > 0) return "Medium";
    return "Stable";
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-600 p-3">
            <TrendingUp className="size-6 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Demand Forecasting
            </h2>
            <p className="text-sm text-gray-500">
              Forecast reorder needs based on the last 30 days of sales
            </p>
          </div>
        </div>

        <Button
          onClick={loadForecasting}
          className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="text-sm text-gray-500">
              Total forecast rows:{" "}
              <span className="font-semibold text-gray-800">
                {filteredRows.length}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                  <TableHead className="font-semibold text-white">Product</TableHead>
                  <TableHead className="font-semibold text-white">Current Stock</TableHead>
                  <TableHead className="font-semibold text-white">Reorder Level</TableHead>
                  <TableHead className="font-semibold text-white">Qty Last 30 Days</TableHead>
                  <TableHead className="font-semibold text-white">Avg / Day</TableHead>
                  <TableHead className="font-semibold text-white">Suggested Reorder</TableHead>
                  <TableHead className="font-semibold text-white">Priority</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                      Loading forecasting data...
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                      No forecasting data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow
                      key={row.product_id}
                      className="border-b border-gray-100 transition-colors hover:bg-blue-50/30"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {row.display_name}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {Number(row.current_stock || 0)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {Number(row.reorder_level || 0)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {Number(row.qty_last_30_days || 0)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {Number(row.average_daily_sales || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">
                        {Number(row.suggested_reorder_qty || 0)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityBadge(
                            row
                          )}`}
                        >
                          {getPriorityText(row)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}