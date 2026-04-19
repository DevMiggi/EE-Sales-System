import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Bell, RefreshCw, Package2, Siren } from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface StockAlertItem {
  product_id: number;
  display_name: string;
  group_name: string;
  stock_qty: number;
  reorder_level: number;
}

type AlertFilter = "critical" | "low";

export function LowStockAlerts() {
  const [items, setItems] = useState<StockAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<AlertFilter>("critical");
  const [notification, setNotification] = useState<{
    type: "low" | "critical";
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
    }));
  };

  const getCriticalThreshold = (reorderLevel: number) => {
    return Math.max(1, Math.floor(reorderLevel * 0.4));
  };

  const checkForNewNotifications = (currentItems: StockAlertItem[]) => {
    const previousMap = previousMapRef.current;
    let criticalTriggered = 0;
    let lowTriggered = 0;

    for (const item of currentItems) {
      const previousStock = previousMap[item.product_id];
      const criticalThreshold = getCriticalThreshold(item.reorder_level);
      const lowThreshold = item.reorder_level;

      const wasCritical =
        previousStock !== undefined && previousStock <= criticalThreshold;
      const isCritical = item.stock_qty <= criticalThreshold;

      const wasLow =
        previousStock !== undefined &&
        previousStock > criticalThreshold &&
        previousStock <= lowThreshold;
      const isLow =
        item.stock_qty > criticalThreshold && item.stock_qty <= lowThreshold;

      if (!wasCritical && isCritical) {
        criticalTriggered++;
      } else if (!wasLow && isLow) {
        lowTriggered++;
      }
    }

    if (criticalTriggered > 0) {
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

      const res = await fetch(`${API_URL}/low-stock`);
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
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  const { criticalItems, lowItems } = useMemo(() => {
    const critical = items.filter(
      (item) => item.stock_qty <= getCriticalThreshold(item.reorder_level)
    );

    const low = items.filter(
      (item) =>
        item.stock_qty > getCriticalThreshold(item.reorder_level) &&
        item.stock_qty <= item.reorder_level
    );

    return {
      criticalItems: critical,
      lowItems: low,
    };
  }, [items]);

  const displayedItems =
    selectedFilter === "critical" ? criticalItems : lowItems;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500 rounded-xl">
            <Bell className="size-6 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Low Stock Alerts
            </h2>
            <p className="text-sm text-gray-500">
              Checks stock in the background without reloading the whole page
            </p>
          </div>
        </div>

        <Button
          onClick={() => loadAlerts(false)}
          className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
          disabled={refreshing}
        >
          <RefreshCw className={`size-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {notification && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-white shadow-lg ${
            notification.type === "critical"
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : "bg-gradient-to-r from-orange-400 to-yellow-500"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "critical" ? (
              <Siren className="size-5" />
            ) : (
              <AlertTriangle className="size-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setSelectedFilter("critical")}
          className={`text-left transition-all ${
            selectedFilter === "critical"
              ? "ring-4 ring-red-200 scale-[1.01]"
              : "opacity-90 hover:opacity-100"
          }`}
        >
          <Card className="p-5 rounded-2xl border-0 shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Critical Stock</p>
                <p className="text-3xl font-bold">{criticalItems.length}</p>
                <p className="text-xs text-red-100 mt-1">
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
              ? "ring-4 ring-yellow-200 scale-[1.01]"
              : "opacity-90 hover:opacity-100"
          }`}
        >
          <Card className="p-5 rounded-2xl border-0 shadow-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-50">Low Stock</p>
                <p className="text-3xl font-bold">{lowItems.length}</p>
                <p className="text-xs text-yellow-50 mt-1">
                  Click to view low stock items
                </p>
              </div>
              <Package2 className="size-10 text-white/90" />
            </div>
          </Card>
        </button>
      </div>

      {loading ? (
        <Card className="p-8 rounded-2xl text-center text-gray-500">
          Loading stock alerts...
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 rounded-2xl text-center border border-green-200 bg-green-50">
          <p className="text-green-700 font-medium">
            All products are above reorder level.
          </p>
          <p className="text-sm text-green-600 mt-1">
            No low stock or critical stock items right now.
          </p>
        </Card>
      ) : (
        <section>
          <div className="flex items-center gap-2 mb-4">
            {selectedFilter === "critical" ? (
              <>
                <Siren className="size-5 text-red-600" />
                <h3 className="text-xl font-semibold text-red-600">
                  Critical Stock Items
                </h3>
              </>
            ) : (
              <>
                <AlertTriangle className="size-5 text-orange-500" />
                <h3 className="text-xl font-semibold text-orange-500">
                  Low Stock Items
                </h3>
              </>
            )}
          </div>

          {displayedItems.length === 0 ? (
            <Card className="p-4 rounded-xl text-sm text-gray-500">
              {selectedFilter === "critical"
                ? "No critical items right now."
                : "No low stock items right now."}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedItems.map((item) => (
                <Card
                  key={item.product_id}
                  className={`p-5 rounded-2xl shadow-sm ${
                    selectedFilter === "critical"
                      ? "border border-red-200 bg-red-50"
                      : "border border-yellow-200 bg-yellow-50"
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
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        selectedFilter === "critical"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {selectedFilter === "critical" ? "CRITICAL" : "LOW"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border">
                      <p className="text-xs text-gray-500">Current Stock</p>
                      <p
                        className={`text-2xl font-bold ${
                          selectedFilter === "critical"
                            ? "text-red-600"
                            : "text-orange-500"
                        }`}
                      >
                        {item.stock_qty}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3 border">
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