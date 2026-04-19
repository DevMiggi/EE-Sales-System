import { useEffect, useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Truck, Search, Plus, Pencil } from 'lucide-react';

const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_number: string;
  products?: string[];
}

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    supplier_name: '',
    contact_number: '',
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/suppliers`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load suppliers.');
      }

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('SUPPLIERS LOAD ERROR:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return suppliers.filter((supplier) => {
      const nameMatch = supplier.supplier_name.toLowerCase().includes(term);
      const contactMatch = (supplier.contact_number || '').toLowerCase().includes(term);
      const productMatch = (supplier.products || []).some((product) =>
        product.toLowerCase().includes(term)
      );

      return nameMatch || contactMatch || productMatch;
    });
  }, [suppliers, searchTerm]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setForm({
      supplier_name: '',
      contact_number: '',
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      supplier_name: supplier.supplier_name || '',
      contact_number: supplier.contact_number || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.supplier_name.trim()) {
      alert('Supplier name is required.');
      return;
    }

    try {
      setIsSaving(true);

      const url = editingSupplier
        ? `${API_URL}/suppliers/${editingSupplier.supplier_id}`
        : `${API_URL}/suppliers`;

      const method = editingSupplier ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier_name: form.supplier_name.trim(),
          contact_number: form.contact_number.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save supplier.');
      }

      await loadSuppliers();
      setShowDialog(false);
      setEditingSupplier(null);
      alert(editingSupplier ? 'Supplier updated successfully.' : 'Supplier added successfully.');
    } catch (error: any) {
      alert(error.message || 'Failed to save supplier.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-600 rounded-xl">
            <Truck className="size-6 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Suppliers</h2>
            <p className="text-sm text-gray-500">
              Manage supplier names, contact numbers, and linked products
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
        >
          <Plus className="size-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search supplier, contact, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="text-sm text-gray-500">
              Total suppliers:{' '}
              <span className="font-semibold text-gray-800">{filteredSuppliers.length}</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                  <TableHead className="text-white font-semibold">Supplier Name</TableHead>
                  <TableHead className="text-white font-semibold">Contact Number</TableHead>
                  <TableHead className="text-white font-semibold">Products Supplied</TableHead>
                  <TableHead className="text-white font-semibold text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                      Loading suppliers...
                    </TableCell>
                  </TableRow>
                ) : filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow
                      key={supplier.supplier_id}
                      className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {supplier.supplier_name}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {supplier.contact_number || '—'}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {supplier.products && supplier.products.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {supplier.products.map((product, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded-md text-xs font-medium"
                              >
                                {product}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No linked products yet</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                          onClick={() => handleOpenEdit(supplier)}
                        >
                          <Pencil className="size-4 mr-1" />
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>
            {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
          </DialogTitle>

          <DialogDescription>
            Enter the supplier details below.
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Supplier Name</label>
              <Input
                value={form.supplier_name}
                onChange={(e) =>
                  setForm({ ...form, supplier_name: e.target.value })
                }
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Contact Number</label>
              <Input
                value={form.contact_number}
                onChange={(e) =>
                  setForm({ ...form, contact_number: e.target.value })
                }
                placeholder="Enter contact number"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>

            <Button
              className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}