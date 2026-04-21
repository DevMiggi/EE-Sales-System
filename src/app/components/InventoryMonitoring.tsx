import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Package, RefreshCw, Search } from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface InventoryProduct {
  product_id: number;
  group_id: number;
  group_name: string;
  display_name: string;
  product_name: string;
  barcode?: string | null;
  unit_of_measure: string;
  stock_qty: number;
  reorder_level: number;
  price: number;
  is_active: number | boolean;
}

type AdjustmentType = "stock_in" | "deduct" | "set";

export function InventoryMonitoring() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(
    null
  );
  const [adjustmentType, setAdjustmentType] =
    useState<AdjustmentType>("stock_in");
  const [adjustQty, setAdjustQty] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("ee_token") || "";

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/products?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load inventory.");
      }

      setProducts(
        data
          .filter((item: any) => Number(item.is_active) === 1 || item.is_active === true)
          .map((item: any) => ({
            ...item,
            stock_qty: Number(item.stock_qty || 0),
            reorder_level: Number(item.reorder_level || 0),
            price: Number(item.price || 0),
          }))
      );
    } catch (error) {
      console.error("FETCH INVENTORY ERROR:", error);
      alert("Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredInventory = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      return (
        String(product.display_name || "").toLowerCase().includes(term) ||
        String(product.group_name || "").toLowerCase().includes(term) ||
        String(product.barcode || "").toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) {
      return {
        percentage: 0,
        color: "bg-red-600",
        label: "Out of Stock",
        badge: "bg-red-100 text-red-700",
      };
    }

    if (stock <= 5) {
      return {
        percentage: 15,
        color: "bg-red-500",
        label: "Critical",
        badge: "bg-red-100 text-red-700",
      };
    }

    if (stock <= reorderLevel) {
      return {
        percentage: 35,
        color: "bg-orange-400",
        label: "Low Stock",
        badge: "bg-orange-100 text-orange-700",
      };
    }

    if (stock <= reorderLevel + 20) {
      return {
        percentage: 60,
        color: "bg-yellow-400",
        label: "Medium",
        badge: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      percentage: 90,
      color: "bg-green-500",
      label: "In Stock",
      badge: "bg-green-100 text-green-700",
    };
  };

  const handleEdit = (product: InventoryProduct) => {
    setEditingProduct(product);
    setAdjustmentType("stock_in");
    setAdjustQty("");
    setReorderLevel(String(product.reorder_level ?? 0));
  };

  const resetDialog = () => {
    setEditingProduct(null);
    setAdjustmentType("stock_in");
    setAdjustQty("");
    setReorderLevel("");
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    const qty = Number(adjustQty || 0);
    const reorder = Number(reorderLevel || 0);

    if (adjustmentType !== "set" && qty <= 0) {
      alert("Enter a quantity greater than 0.");
      return;
    }

    if (adjustmentType === "set" && qty < 0) {
      alert("Set quantity cannot be negative.");
      return;
    }

    if (reorder < 0) {
      alert("Reorder level cannot be negative.");
      return;
    }

    if (
      adjustmentType === "deduct" &&
      qty > Number(editingProduct.stock_qty || 0)
    ) {
      alert("Cannot deduct more than current stock.");
      return;
    }

    try {
      setIsSaving(true);

      const adjustRes = await fetch(`${API_URL}/admin/inventory/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: editingProduct.product_id,
          adjustment_type: adjustmentType,
          quantity: qty,
        }),
      });

      const adjustData = await adjustRes.json();

      if (!adjustRes.ok) {
        throw new Error(adjustData.message || "Failed to update stock.");
      }

      const reorderRes = await fetch(`${API_URL}/admin/inventory/reorder-level`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: editingProduct.product_id,
          reorder_level: reorder,
        }),
      });

      const reorderData = await reorderRes.json();

      if (!reorderRes.ok) {
        throw new Error(
          reorderData.message || "Failed to update reorder level."
        );
      }

      await fetchProducts();
      resetDialog();
      alert("Inventory updated successfully.");
    } catch (error: any) {
      console.error("SAVE INVENTORY ERROR:", error);
      alert(error.message || "Failed to update inventory.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-3">
            <Package className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Inventory Management
            </h2>
            <p className="text-sm text-gray-500">
              Monitor stock, adjust quantities, and update reorder levels
            </p>
          </div>
        </div>

        <Button
          onClick={fetchProducts}
          className="bg-[#4A90E2] text-white hover:bg-[#3A7BC8]"
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products, category, or barcode..."
                className="border-gray-300 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-gray-600">
              Total products:{" "}
              <span className="font-semibold text-gray-800">
                {filteredInventory.length}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4A90E2] hover:bg-[#4A90E2]">
                  <TableHead className="font-medium text-white">Product Name</TableHead>
                  <TableHead className="font-medium text-white">Category</TableHead>
                  <TableHead className="font-medium text-white">Barcode</TableHead>
                  <TableHead className="font-medium text-white">Current Stock</TableHead>
                  <TableHead className="font-medium text-white">Reorder Level</TableHead>
                  <TableHead className="font-medium text-white">Stock Status</TableHead>
                  <TableHead className="font-medium text-white text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-gray-500"
                    >
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-gray-500"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(
                      Number(item.stock_qty || 0),
                      Number(item.reorder_level || 0)
                    );

                    return (
                      <TableRow
                        key={item.product_id}
                        className="border-b border-gray-100"
                      >
                        <TableCell className="font-medium text-gray-800">
                          {item.display_name}
                        </TableCell>

                        <TableCell className="text-gray-600">
                          {item.group_name}
                        </TableCell>

                        <TableCell className="text-gray-600">
                          {item.barcode || "—"}
                        </TableCell>

                        <TableCell className="font-medium text-gray-700">
                          {Number(item.stock_qty || 0)}
                        </TableCell>

                        <TableCell className="text-gray-700">
                          {Number(item.reorder_level || 0)}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-32 rounded-full bg-gray-200">
                              <div
                                className={`${status.color} h-2 rounded-full transition-all`}
                                style={{ width: `${status.percentage}%` }}
                              />
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            className="rounded-md bg-[#4A90E2] px-4 text-white hover:bg-[#3A7BC8]"
                            onClick={() => handleEdit(item)}
                          >
                            Edit Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Dialog open={!!editingProduct} onOpenChange={resetDialog}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Edit Inventory</DialogTitle>
          <DialogDescription>
            Adjust stock quantity and reorder level for this product
          </DialogDescription>

          {editingProduct && (
            <div className="space-y-4 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Name
                </label>
                <Input value={editingProduct.display_name} readOnly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Current Stock
                  </label>
                  <Input
                    value={String(Number(editingProduct.stock_qty || 0))}
                    readOnly
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Barcode
                  </label>
                  <Input value={editingProduct.barcode || ""} readOnly />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Adjustment Type
                </label>
                <select
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                  value={adjustmentType}
                  onChange={(e) =>
                    setAdjustmentType(e.target.value as AdjustmentType)
                  }
                >
                  <option value="stock_in">Stock In / Add</option>
                  <option value="deduct">Deduct / Remove</option>
                  <option value="set">Set Exact Stock</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder={
                    adjustmentType === "set"
                      ? "Enter exact new stock"
                      : "Enter quantity"
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Reorder Level
                </label>
                <Input
                  type="number"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  placeholder="Enter reorder level"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}