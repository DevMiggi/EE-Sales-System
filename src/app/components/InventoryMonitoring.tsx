import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from '../context/AppContext';

const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export function InventoryMonitoring() {
  const { products, refreshProducts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredInventory = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return products.filter((product) =>
      product.name.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const getStockStatus = (stock: number) => {
    if (stock > 100) return { percentage: 90, color: 'bg-green-500', label: 'In Stock' };
    if (stock > 50) return { percentage: 60, color: 'bg-yellow-400', label: 'Medium' };
    if (stock > 5) return { percentage: 30, color: 'bg-orange-400', label: 'Low Stock' };
    return { percentage: 15, color: 'bg-red-500', label: 'Critical' };
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setAdjustQty('');
    setRemarks('');
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    const qty = Number(adjustQty);

    if (!qty || qty === 0) {
      alert('Enter a valid adjustment like 10 or -10.');
      return;
    }

    if (qty < 0 && Math.abs(qty) > Number(editingProduct.stock)) {
      alert('Cannot subtract more than current stock.');
      return;
    }

    try {
      setIsSaving(true);

      const movementType = qty > 0 ? 'stock_in' : 'damaged';

      const res = await fetch(`${API_URL}/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: editingProduct.id,
          quantity: Math.abs(qty),
          type: movementType,
          remarks: remarks || null,
          user_id: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update inventory.');
      }

      await refreshProducts();
      setEditingProduct(null);
      alert('Stock updated successfully.');
    } catch (error: any) {
      alert(error.message || 'Failed to update stock.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-2xl font-medium mb-6 text-gray-800">Inventory Monitoring</h2>

      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 gap-4">
            <Input
              placeholder="Search products..."
              className="max-w-md border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="text-sm text-gray-600">
              Total products: <span className="font-semibold text-gray-800">{filteredInventory.length}</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4A90E2] hover:bg-[#4A90E2]">
                  <TableHead className="text-white font-medium">Product Name</TableHead>
                  <TableHead className="text-white font-medium">Category</TableHead>
                  <TableHead className="text-white font-medium">Current Stock</TableHead>
                  <TableHead className="text-white font-medium">Stock Status</TableHead>
                  <TableHead className="text-white font-medium text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item.stock);

                    return (
                      <TableRow key={item.id} className="border-b border-gray-100">
                        <TableCell className="font-medium text-gray-800">{item.name}</TableCell>
                        <TableCell className="text-gray-600">{item.category}</TableCell>
                        <TableCell className="text-gray-700 font-medium">{item.stock}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={`${status.color} h-2 rounded-full transition-all`}
                                style={{ width: `${status.percentage}%` }}
                              />
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                status.color === 'bg-green-500'
                                  ? 'bg-green-100 text-green-700'
                                  : status.color === 'bg-yellow-400'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : status.color === 'bg-orange-400'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            className="bg-[#4A90E2] hover:bg-[#3A7BC8] text-white px-4 rounded-md"
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

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogTitle>Edit Stock</DialogTitle>
          <DialogDescription>
            Enter a positive number to add stock or a negative number to subtract stock.
          </DialogDescription>

          {editingProduct && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product Name</label>
                <Input value={editingProduct.name} readOnly />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Current Stock</label>
                <Input value={String(editingProduct.stock)} readOnly />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Adjustment</label>
                <Input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Example: 10 to add, -10 to subtract"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Remarks</label>
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional remarks"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}