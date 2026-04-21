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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Package, RefreshCw, Search, Pencil, Ban } from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface ProductGroup {
  group_id: number;
  group_name: string;
  description?: string | null;
}

interface AdminProduct {
  product_id: number;
  group_id: number;
  group_name: string;
  product_code?: string | null;
  product_name: string;
  size_label?: string | null;
  variant_label?: string | null;
  display_name: string;
  barcode?: string | null;
  unit_of_measure: string;
  is_active: number | boolean;
  stock_qty: number;
  reorder_level: number;
  price: number;
  price_level_id?: number | null;
  price_label?: string | null;
}

interface ProductFormState {
  group_id: string;
  product_code: string;
  product_name: string;
  size_label: string;
  variant_label: string;
  display_name: string;
  barcode: string;
  unit_of_measure: string;
  price: string;
  price_label: string;
  reorder_level: string;
  initial_stock: string;
}

const emptyForm: ProductFormState = {
  group_id: "",
  product_code: "",
  product_name: "",
  size_label: "",
  variant_label: "",
  display_name: "",
  barcode: "",
  unit_of_measure: "pack",
  price: "",
  price_label: "Regular",
  reorder_level: "",
  initial_stock: "",
};

export function ProductPricingManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
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
        throw new Error(data.message || "Failed to fetch admin products.");
      }

      setProducts(
        data.map((item: any) => ({
          ...item,
          stock_qty: Number(item.stock_qty || 0),
          reorder_level: Number(item.reorder_level || 0),
          price: Number(item.price || 0),
        }))
      );
    } catch (error) {
      console.error("FETCH ADMIN PRODUCTS ERROR:", error);
      alert("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/product-groups?t=${Date.now()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch product groups.");
      }

      setGroups(data);
    } catch (error) {
      console.error("FETCH GROUPS ERROR:", error);
      alert("Failed to load product groups.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchGroups();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return products;

    return products.filter((product) => {
      return (
        String(product.display_name || "").toLowerCase().includes(term) ||
        String(product.group_name || "").toLowerCase().includes(term) ||
        String(product.barcode || "").toLowerCase().includes(term) ||
        String(product.product_code || "").toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  const openAddDialog = () => {
    setForm(emptyForm);
    setShowAddDialog(true);
  };

  const openEditDialog = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm({
      group_id: String(product.group_id || ""),
      product_code: product.product_code || "",
      product_name: product.product_name || "",
      size_label: product.size_label || "",
      variant_label: product.variant_label || "",
      display_name: product.display_name || "",
      barcode: product.barcode || "",
      unit_of_measure: product.unit_of_measure || "pack",
      price: String(product.price ?? ""),
      price_label: product.price_label || "Regular",
      reorder_level: String(product.reorder_level ?? 0),
      initial_stock: String(product.stock_qty ?? 0),
    });
  };

  const resetDialogs = () => {
    setEditingProduct(null);
    setShowAddDialog(false);
    setForm(emptyForm);
  };

  const validateForm = (isAdd: boolean) => {
    if (!form.group_id || !form.product_name.trim() || !form.display_name.trim()) {
      alert("Group, product name, and display name are required.");
      return false;
    }

    if (Number(form.price || 0) < 0) {
      alert("Price cannot be negative.");
      return false;
    }

    if (Number(form.reorder_level || 0) < 0) {
      alert("Reorder level cannot be negative.");
      return false;
    }

    if (isAdd && Number(form.initial_stock || 0) < 0) {
      alert("Initial stock cannot be negative.");
      return false;
    }

    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm(true)) return;

    try {
      const res = await fetch(`${API_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_id: Number(form.group_id),
          product_code: form.product_code || null,
          product_name: form.product_name.trim(),
          size_label: form.size_label || null,
          variant_label: form.variant_label || null,
          display_name: form.display_name.trim(),
          barcode: form.barcode || null,
          unit_of_measure: form.unit_of_measure || "pack",
          price: Number(form.price || 0),
          price_label: form.price_label || "Regular",
          reorder_level: Number(form.reorder_level || 0),
          initial_stock: Number(form.initial_stock || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add product.");
      }

      alert("Product added successfully.");
      resetDialogs();
      fetchProducts();
    } catch (error: any) {
      console.error("ADD PRODUCT ERROR:", error);
      alert(error.message || "Failed to add product.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    if (!validateForm(false)) return;

    try {
      const res = await fetch(
        `${API_URL}/admin/products/${editingProduct.product_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            group_id: Number(form.group_id),
            product_code: form.product_code || null,
            product_name: form.product_name.trim(),
            size_label: form.size_label || null,
            variant_label: form.variant_label || null,
            display_name: form.display_name.trim(),
            barcode: form.barcode || null,
            unit_of_measure: form.unit_of_measure || "pack",
            price: Number(form.price || 0),
            price_label: form.price_label || "Regular",
            reorder_level: Number(form.reorder_level || 0),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update product.");
      }

      alert("Product updated successfully.");
      resetDialogs();
      fetchProducts();
    } catch (error: any) {
      console.error("UPDATE PRODUCT ERROR:", error);
      alert(error.message || "Failed to update product.");
    }
  };

  const handleDeactivate = async (product: AdminProduct) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${product.display_name}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/admin/products/${product.product_id}/deactivate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to deactivate product.");
      }

      alert("Product deactivated successfully.");
      fetchProducts();
    } catch (error: any) {
      console.error("DEACTIVATE PRODUCT ERROR:", error);
      alert(error.message || "Failed to deactivate product.");
    }
  };

  const selectedGroupName =
    groups.find((group) => String(group.group_id) === form.group_id)?.group_name ||
    "";

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3">
            <Package className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Product Management
            </h2>
            <p className="text-sm text-gray-500">
              Manage products, barcode, price, group, and reorder levels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchProducts}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>

          <Button
            className="bg-[#4A90E2] px-5 text-white hover:bg-[#3A7BC8]"
            onClick={openAddDialog}
          >
            Add New Product
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by product, category, code, or barcode..."
                className="border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4A90E2] hover:bg-[#4A90E2]">
                  <TableHead className="font-medium text-white">Product</TableHead>
                  <TableHead className="font-medium text-white">Category</TableHead>
                  <TableHead className="font-medium text-white">Barcode</TableHead>
                  <TableHead className="font-medium text-white">Price</TableHead>
                  <TableHead className="font-medium text-white">Stock</TableHead>
                  <TableHead className="font-medium text-white">Reorder</TableHead>
                  <TableHead className="font-medium text-white text-center">
                    Action
                  </TableHead>
                  <TableHead className="font-medium text-white text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-gray-500"
                    >
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-gray-500"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.product_id}
                      className="border-b border-gray-100"
                    >
                      <TableCell className="font-medium text-gray-800">
                        <div>
                          <p>{product.display_name}</p>
                          {product.product_code && (
                            <p className="text-xs text-gray-500">
                              Code: {product.product_code}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {product.group_name}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {product.barcode || "—"}
                      </TableCell>

                      <TableCell className="font-medium text-gray-700">
                        ₱{Number(product.price || 0).toFixed(2)}
                      </TableCell>

                      <TableCell className="text-gray-700">
                        {Number(product.stock_qty || 0)}
                      </TableCell>

                      <TableCell className="text-gray-700">
                        {Number(product.reorder_level || 0)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="bg-green-500 px-4 text-white hover:bg-green-600 rounded-md"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="mr-2 size-3" />
                          Edit
                        </Button>
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="bg-red-500 px-4 text-white hover:bg-red-600 rounded-md"
                          onClick={() => handleDeactivate(product)}
                        >
                          <Ban className="mr-2 size-3" />
                          Deactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product, barcode, price, and reorder level
          </DialogDescription>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                value={form.group_id}
                onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              >
                <option value="">Select category</option>
                {groups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Product Code</label>
              <Input
                value={form.product_code}
                onChange={(e) =>
                  setForm({ ...form, product_code: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Product Name</label>
              <Input
                value={form.product_name}
                onChange={(e) =>
                  setForm({ ...form, product_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Display Name</label>
              <Input
                value={form.display_name}
                onChange={(e) =>
                  setForm({ ...form, display_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Size Label</label>
              <Input
                value={form.size_label}
                onChange={(e) =>
                  setForm({ ...form, size_label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Variant Label</label>
              <Input
                value={form.variant_label}
                onChange={(e) =>
                  setForm({ ...form, variant_label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Barcode</label>
              <Input
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Unit of Measure</label>
              <Input
                value={form.unit_of_measure}
                onChange={(e) =>
                  setForm({ ...form, unit_of_measure: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Price (₱)</label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Price Label</label>
              <Input
                value={form.price_label}
                onChange={(e) =>
                  setForm({ ...form, price_label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Reorder Level</label>
              <Input
                type="number"
                value={form.reorder_level}
                onChange={(e) =>
                  setForm({ ...form, reorder_level: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Current Group</label>
              <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                {selectedGroupName || "No category selected"}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialogs}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product with category, barcode, stock, and pricing
          </DialogDescription>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Category *</label>
              <select
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                value={form.group_id}
                onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              >
                <option value="">Select category</option>
                {groups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Product Code</label>
              <Input
                placeholder="Optional product code"
                value={form.product_code}
                onChange={(e) =>
                  setForm({ ...form, product_code: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Product Name *</label>
              <Input
                placeholder="Enter product name"
                value={form.product_name}
                onChange={(e) =>
                  setForm({ ...form, product_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Display Name *</label>
              <Input
                placeholder="Enter display name"
                value={form.display_name}
                onChange={(e) =>
                  setForm({ ...form, display_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Size Label</label>
              <Input
                placeholder="Optional size"
                value={form.size_label}
                onChange={(e) =>
                  setForm({ ...form, size_label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Variant Label</label>
              <Input
                placeholder="Optional variant"
                value={form.variant_label}
                onChange={(e) =>
                  setForm({ ...form, variant_label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Barcode</label>
              <Input
                placeholder="Optional barcode"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Unit of Measure</label>
              <Input
                placeholder="pack / piece / box"
                value={form.unit_of_measure}
                onChange={(e) =>
                  setForm({ ...form, unit_of_measure: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Price (₱)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Price Label</label>
              <Input
                placeholder="Regular"
                value={form.price_label}
                onChange={(e) =>
                  setForm({ ...form, price_label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Reorder Level</label>
              <Input
                type="number"
                placeholder="0"
                value={form.reorder_level}
                onChange={(e) =>
                  setForm({ ...form, reorder_level: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Initial Stock</label>
              <Input
                type="number"
                placeholder="0"
                value={form.initial_stock}
                onChange={(e) =>
                  setForm({ ...form, initial_stock: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialogs}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}