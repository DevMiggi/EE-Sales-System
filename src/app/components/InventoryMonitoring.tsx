import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from '../context/AppContext';

export function InventoryMonitoring() {
  const { products, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', stock: 0, price: 0 });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredInventory = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number) => {
    if (stock > 100) return { percentage: 90, color: 'bg-green-500', label: 'In Stock' };
    if (stock > 50) return { percentage: 60, color: 'bg-yellow-400', label: 'Medium' };
    if (stock > 25) return { percentage: 30, color: 'bg-orange-400', label: 'Low Stock' };
    return { percentage: 15, color: 'bg-red-500', label: 'Critical' };
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
    });
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editForm);
      setEditingProduct(null);
    }
  };

  const handleDelete = (product: any) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteProduct(product.id);
    }
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-2xl font-medium mb-6 text-gray-800">Inventory Monitoring</h2>

      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <Input 
              placeholder="Search products..." 
              className="max-w-md border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4A90E2] hover:bg-[#4A90E2]">
                  <TableHead className="text-white font-medium">Product Name</TableHead>
                  <TableHead className="text-white font-medium">Category</TableHead>
                  <TableHead className="text-white font-medium">Current Stock</TableHead>
                  <TableHead className="text-white font-medium">Stock Status</TableHead>
                  <TableHead className="text-white font-medium text-center" colSpan={2}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
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
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            status.color === 'bg-green-500' ? 'bg-green-100 text-green-700' :
                            status.color === 'bg-yellow-400' ? 'bg-yellow-100 text-yellow-700' :
                            status.color === 'bg-orange-400' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
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
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-md"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Stock</label>
                <Input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
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
    </div>
  );
}
