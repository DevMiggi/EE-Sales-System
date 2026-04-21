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
import { Truck, Search, Plus, Pencil, RefreshCw } from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface SupplierProduct {
  product_id: number;
  display_name: string;
}

interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_number: string;
  is_active: number | boolean;
  products?: SupplierProduct[];
}

interface ProductOption {
  product_id: number;
  display_name: string;
}

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    supplier_name: "",
    contact_number: "",
    is_active: true,
    product_ids: [] as number[],
  });

  const token = localStorage.getItem("ee_token") || "";

  const loadSuppliers = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/admin/suppliers?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load suppliers.");
      }

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("SUPPLIERS LOAD ERROR:", error);
      setSuppliers([]);
      alert("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/products?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(
        (Array.isArray(data) ? data : [])
          .filter((item: any) => Number(item.is_active) === 1 || item.is_active === true)
          .map((item: any) => ({
            product_id: Number(item.product_id),
            display_name: item.display_name,
          }))
      );
    } catch (error) {
      console.error("PRODUCT OPTIONS LOAD ERROR:", error);
      setProducts([]);
      alert("Failed to load products for supplier assignment.");
    }
  };

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return suppliers.filter((supplier) => {
      const nameMatch = supplier.supplier_name.toLowerCase().includes(term);
      const contactMatch = String(supplier.contact_number || "")
        .toLowerCase()
        .includes(term);
      const productMatch = (supplier.products || []).some((product) =>
        product.display_name.toLowerCase().includes(term)
      );

      return nameMatch || contactMatch || productMatch;
    });
  }, [suppliers, searchTerm]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setForm({
      supplier_name: "",
      contact_number: "",
      is_active: true,
      product_ids: [],
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      supplier_name: supplier.supplier_name || "",
      contact_number: supplier.contact_number || "",
      is_active: Boolean(supplier.is_active),
      product_ids: (supplier.products || []).map((p) => Number(p.product_id)),
    });
    setShowDialog(true);
  };

  const resetDialog = () => {
    setShowDialog(false);
    setEditingSupplier(null);
    setForm({
      supplier_name: "",
      contact_number: "",
      is_active: true,
      product_ids: [],
    });
  };

  const toggleProductSelection = (productId: number) => {
    setForm((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  const handleSave = async () => {
    if (!form.supplier_name.trim()) {
      alert("Supplier name is required.");
      return;
    }

    if (!form.contact_number.trim()) {
      alert("Contact number is required.");
      return;
    }

    try {
      setIsSaving(true);

      if (editingSupplier) {
        const updateRes = await fetch(
          `${API_URL}/admin/suppliers/${editingSupplier.supplier_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              supplier_name: form.supplier_name.trim(),
              contact_number: form.contact_number.trim(),
              is_active: form.is_active,
            }),
          }
        );

        const updateData = await updateRes.json();

        if (!updateRes.ok) {
          throw new Error(updateData.message || "Failed to update supplier.");
        }

        const productsRes = await fetch(
          `${API_URL}/admin/suppliers/${editingSupplier.supplier_id}/products`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_ids: form.product_ids,
            }),
          }
        );

        const productsData = await productsRes.json();

        if (!productsRes.ok) {
          throw new Error(
            productsData.message || "Failed to update supplier products."
          );
        }

        alert("Supplier updated successfully.");
      } else {
        const createRes = await fetch(`${API_URL}/admin/suppliers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            supplier_name: form.supplier_name.trim(),
            contact_number: form.contact_number.trim(),
          }),
        });

        const createData = await createRes.json();

        if (!createRes.ok) {
          throw new Error(createData.message || "Failed to add supplier.");
        }

        const supplierId = Number(createData.supplier_id);

        if (supplierId && form.product_ids.length > 0) {
          const productsRes = await fetch(
            `${API_URL}/admin/suppliers/${supplierId}/products`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                product_ids: form.product_ids,
              }),
            }
          );

          const productsData = await productsRes.json();

          if (!productsRes.ok) {
            throw new Error(
              productsData.message || "Failed to assign supplier products."
            );
          }
        }

        alert("Supplier added successfully.");
      }

      await loadSuppliers();
      resetDialog();
    } catch (error: any) {
      console.error("SUPPLIER SAVE ERROR:", error);
      alert(error.message || "Failed to save supplier.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-600 p-3">
            <Truck className="size-6 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Supplier Management
            </h2>
            <p className="text-sm text-gray-500">
              Manage supplier details and assign supplied products
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadSuppliers}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
          >
            <Plus className="mr-2 size-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search supplier, contact, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="text-sm text-gray-500">
              Total suppliers:{" "}
              <span className="font-semibold text-gray-800">
                {filteredSuppliers.length}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                  <TableHead className="font-semibold text-white">
                    Supplier Name
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Contact Number
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Products Supplied
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-semibold text-white">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                      Loading suppliers...
                    </TableCell>
                  </TableRow>
                ) : filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow
                      key={supplier.supplier_id}
                      className="border-b border-gray-100 transition-colors hover:bg-blue-50/30"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {supplier.supplier_name}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {supplier.contact_number || "—"}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {supplier.products && supplier.products.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {supplier.products.map((product) => (
                              <span
                                key={product.product_id}
                                className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700"
                              >
                                {product.display_name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            No linked products yet
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            Number(supplier.is_active) === 1 || supplier.is_active === true
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {Number(supplier.is_active) === 1 || supplier.is_active === true
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="bg-cyan-600 text-white hover:bg-cyan-700"
                          onClick={() => handleOpenEdit(supplier)}
                        >
                          <Pencil className="mr-1 size-4" />
                          Edit
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

      <Dialog open={showDialog} onOpenChange={resetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>
            {editingSupplier ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>

          <DialogDescription>
            Enter supplier details and assign supplied products.
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Supplier Name
              </label>
              <Input
                value={form.supplier_name}
                onChange={(e) =>
                  setForm({ ...form, supplier_name: e.target.value })
                }
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Contact Number
              </label>
              <Input
                value={form.contact_number}
                onChange={(e) =>
                  setForm({ ...form, contact_number: e.target.value })
                }
                placeholder="Enter contact number"
              />
            </div>

            {editingSupplier && (
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                  value={form.is_active ? "active" : "inactive"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_active: e.target.value === "active",
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Assigned Products
              </label>

              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500">No products available.</p>
                ) : (
                  products.map((product) => (
                    <label
                      key={product.product_id}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.product_ids.includes(product.product_id)}
                        onChange={() => toggleProductSelection(product.product_id)}
                      />
                      <span className="text-sm text-gray-700">
                        {product.display_name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>

            <Button
              className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingSupplier
                ? "Save Changes"
                : "Add Supplier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}