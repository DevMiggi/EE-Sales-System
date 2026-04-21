import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  Bell,
  RefreshCw,
  Package2,
  Siren,
  Boxes,
} from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface StockAlertItem {
  product_id: number;
  display_name: string;
  group_name: string;
  stock_qty: number;
  reorder_level: number;
  stock_status?: "critical" | "low" | "out_of_stock" | "normal";
}

type AlertFilter = "critical" | "low" | "out_of_stock";

export function LowStockAlerts() {
  const [items, setItems] = useState<StockAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<AlertFilter>("critical");
  const [notification, setNotification] = useState<{
    type: "low" | "critical" | "out_of_stock";
    message: string;
  } | null>(null);

  const previousMapRef = useRef<Record<number, number>>({});

  const normalizeItems = (data: any[]): StockAlertItem[] => {
    return (data || []).map((item: any) => ({
      product_id: Number(item.product_id),
      display_name: item.display_name,
      group_name: item.group_name,
      stock_qty: Number(item.stock_qty || 0),
      reorder_level: Number(item.reorder_level || 0),
      stock_status: item.stock_status || undefined,
    }));
  };

  const getDerivedStatus = (item: StockAlertItem) => {
    if (item.stock_status) return item.stock_status;
    if (item.stock_qty === 0) return "out_of_stock";
    if (item.stock_qty <= 5) return "critical";
    if (item.stock_qty <= item.reorder_level) return "low";
    return "normal";
  };

  const checkForNewNotifications = (currentItems: StockAlertItem[]) => {
    const previousMap = previousMapRef.current;
    let outTriggered = 0;
    let criticalTriggered = 0;
    let lowTriggered = 0;

    for (const item of currentItems) {
      const previousStock = previousMap[item.product_id];
      const currentStatus = getDerivedStatus(item);

      if (previousStock === undefined) {
        continue;
      }

      const previousItem: StockAlertItem = {
        ...item,
        stock_qty: previousStock,
      };

      const previousStatus = getDerivedStatus(previousItem);

      if (previousStatus !== "out_of_stock" && currentStatus === "out_of_stock") {
        outTriggered++;
      } else if (
        previousStatus !== "critical" &&
        previousStatus !== "out_of_stock" &&
        currentStatus === "critical"
      ) {
        criticalTriggered++;
      } else if (
        previousStatus === "normal" &&
        currentStatus === "low"
      ) {
        lowTriggered++;
      }
    }

    if (outTriggered > 0) {
      setNotification({
        type: "out_of_stock",
        message: `${outTriggered} product${
          outTriggered > 1 ? "s are" : " is"
        } now out of stock.`,
      });
    } else if (criticalTriggered > 0) {
      setNotification({
        type: "critical",
        message: `${criticalTriggered} product${
          criticalTriggered > 1 ? "s are" : " is"
        } now in critical stock.`,
      });
    } else if (lowTriggered > 0) {
      setNotification({
        type: "low",
        message: `${lowTriggered} product${
          lowTriggered > 1 ? "s are" : " is"
        } now low on stock.`,
      });
    }

    const newMap: Record<number, number> = {};
    for (const item of currentItems) {
      newMap[item.product_id] = item.stock_qty;
    }
    previousMapRef.current = newMap;
  };

  const loadAlerts = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const res = await fetch(`${API_URL}/low-stock?t=${Date.now()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load stock alerts.");
      }

      const normalized = normalizeItems(data);
      checkForNewNotifications(normalized);

      setItems(normalized);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("LOW STOCK ALERTS ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);

    const interval = setInterval(() => {
      loadAlerts(false);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  const { criticalItems, lowItems, outOfStockItems } = useMemo(() => {
    const critical = items.filter((item) => getDerivedStatus(item) === "critical");
    const low = items.filter((item) => getDerivedStatus(item) === "low");
    const out = items.filter((item) => getDerivedStatus(item) === "out_of_stock");

    return {
      criticalItems: critical,
      lowItems: low,
      outOfStockItems: out,
    };
  }, [items]);

  const displayedItems =
    selectedFilter === "critical"
      ? criticalItems
      : selectedFilter === "low"
      ? lowItems
      : outOfStockItems;

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-500 p-3">
            <Bell className="size-6 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Low Stock Monitoring
            </h2>
            <p className="text-sm text-gray-500">
              Live stock alerts connected to cashier sales activity
            </p>
          </div>
        </div>

        <Button
          onClick={() => loadAlerts(false)}
          className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {notification && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-white shadow-lg ${
            notification.type === "out_of_stock"
              ? "bg-gradient-to-r from-red-700 to-red-800"
              : notification.type === "critical"
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : "bg-gradient-to-r from-orange-400 to-yellow-500"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "out_of_stock" ? (
              <Boxes className="size-5" />
            ) : notification.type === "critical" ? (
              <Siren className="size-5" />
            ) : (
              <AlertTriangle className="size-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => setSelectedFilter("critical")}
          className={`text-left transition-all ${
            selectedFilter === "critical"
              ? "scale-[1.01] ring-4 ring-red-200"
              : "opacity-90 hover:opacity-100"
          }`}
        >
          <Card className="rounded-2xl border-0 bg-gradient-to-r from-red-500 to-red-600 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Critical Stock</p>
                <p className="text-3xl font-bold">{criticalItems.length}</p>
                <p className="mt-1 text-xs text-red-100">
                  Click to view critical items
                </p>
              </div>
              <Siren className="size-10 text-white/90" />
            </div>
          </Card>
        </button>

        <button
          onClick={() => setSelectedFilter("low")}
          className={`text-left transition-all ${
            selectedFilter === "low"
              ? "scale-[1.01] ring-4 ring-yellow-200"
              : "opacity-90 hover:opacity-100"
          }`}
        >
          <Card className="rounded-2xl border-0 bg-gradient-to-r from-yellow-400 to-orange-400 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-50">Low Stock</p>
                <p className="text-3xl font-bold">{lowItems.length}</p>
                <p className="mt-1 text-xs text-yellow-50">
                  Click to view low stock items
                </p>
              </div>
              <Package2 className="size-10 text-white/90" />
            </div>
          </Card>
        </button>

        <button
          onClick={() => setSelectedFilter("out_of_stock")}
          className={`text-left transition-all ${
            selectedFilter === "out_of_stock"
              ? "scale-[1.01] ring-4 ring-red-300"
              : "opacity-90 hover:opacity-100"
          }`}
        >
          <Card className="rounded-2xl border-0 bg-gradient-to-r from-red-700 to-red-800 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Out of Stock</p>
                <p className="text-3xl font-bold">{outOfStockItems.length}</p>
                <p className="mt-1 text-xs text-red-100">
                  Click to view unavailable items
                </p>
              </div>
              <Boxes className="size-10 text-white/90" />
            </div>
          </Card>
        </button>
      </div>

      {loading ? (
        <Card className="rounded-2xl p-8 text-center text-gray-500">
          Loading stock alerts...
        </Card>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <p className="font-medium text-green-700">
            All products are above reorder level.
          </p>
          <p className="mt-1 text-sm text-green-600">
            No low stock or critical stock items right now.
          </p>
        </Card>
      ) : (
        <section>
          <div className="mb-4 flex items-center gap-2">
            {selectedFilter === "critical" ? (
              <>
                <Siren className="size-5 text-red-600" />
                <h3 className="text-xl font-semibold text-red-600">
                  Critical Stock Items
                </h3>
              </>
            ) : selectedFilter === "low" ? (
              <>
                <AlertTriangle className="size-5 text-orange-500" />
                <h3 className="text-xl font-semibold text-orange-500">
                  Low Stock Items
                </h3>
              </>
            ) : (
              <>
                <Boxes className="size-5 text-red-800" />
                <h3 className="text-xl font-semibold text-red-800">
                  Out of Stock Items
                </h3>
              </>
            )}
          </div>

          {displayedItems.length === 0 ? (
            <Card className="rounded-xl p-4 text-sm text-gray-500">
              {selectedFilter === "critical"
                ? "No critical items right now."
                : selectedFilter === "low"
                ? "No low stock items right now."
                : "No out of stock items right now."}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {displayedItems.map((item) => (
                <Card
                  key={item.product_id}
                  className={`rounded-2xl p-5 shadow-sm ${
                    selectedFilter === "critical"
                      ? "border border-red-200 bg-red-50"
                      : selectedFilter === "low"
                      ? "border border-yellow-200 bg-yellow-50"
                      : "border border-red-300 bg-red-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.display_name}
                      </p>
                      <p className="text-sm text-gray-500">{item.group_name}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                        selectedFilter === "critical"
                          ? "bg-red-600"
                          : selectedFilter === "low"
                          ? "bg-yellow-500"
                          : "bg-red-800"
                      }`}
                    >
                      {selectedFilter === "critical"
                        ? "CRITICAL"
                        : selectedFilter === "low"
                        ? "LOW"
                        : "OUT"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border bg-white p-3">
                      <p className="text-xs text-gray-500">Current Stock</p>
                      <p
                        className={`text-2xl font-bold ${
                          selectedFilter === "critical"
                            ? "text-red-600"
                            : selectedFilter === "low"
                            ? "text-orange-500"
                            : "text-red-800"
                        }`}
                      >
                        {item.stock_qty}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-white p-3">
                      <p className="text-xs text-gray-500">Reorder Level</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {item.reorder_level}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mt-6 text-xs text-gray-400">
        Last updated: {lastUpdated || "—"}
      </div>
    </div>
  );
}