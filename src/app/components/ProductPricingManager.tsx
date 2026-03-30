import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from '../context/AppContext';

export function ProductPricingManager() {
  const { products, updateProduct, deleteProduct, addProduct } = useApp();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', price: 0, cost: 0, stock: 0 });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
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

  const handleAddProduct = () => {
    if (!editForm.name || !editForm.category || editForm.price <= 0) {
      alert('Please fill all required fields');
      return;
    }
    addProduct(editForm);
    setShowAddDialog(false);
    setEditForm({ name: '', category: '', price: 0, cost: 0, stock: 0 });
  };

  const calculateMargin = (price: number, cost: number) => {
    if (price === 0) return 0;
    return ((price - cost) / price * 100);
  };

  const calculateCostPercentage = (price: number, cost: number) => {
    if (price === 0) return 0;
    return (cost / price * 100);
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-gray-800">Product & Pricing Management</h2>
        <Button 
          className="bg-[#4A90E2] hover:bg-[#3A7BC8] text-white px-5 rounded-lg"
          onClick={() => {
            setEditForm({ name: '', category: '', price: 0, cost: 0, stock: 0 });
            setShowAddDialog(true);
          }}
        >
          Add New Product
        </Button>
      </div>

      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4A90E2] hover:bg-[#4A90E2]">
                  <TableHead className="text-white font-medium">Product Name</TableHead>
                  <TableHead className="text-white font-medium">Category</TableHead>
                  <TableHead className="text-white font-medium">Retail Price</TableHead>
                  <TableHead className="text-white font-medium">Unit Price</TableHead>
                  <TableHead className="text-white font-medium">Cost %</TableHead>
                  <TableHead className="text-white font-medium text-center" colSpan={2}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const costPercentage = calculateCostPercentage(product.price, product.cost);
                  
                  return (
                    <TableRow key={product.id} className="border-b border-gray-100">
                      <TableCell className="font-medium text-gray-800">{product.name}</TableCell>
                      <TableCell className="text-gray-600">{product.category}</TableCell>
                      <TableCell className="text-gray-700 font-medium">₱{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-700">₱{product.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {costPercentage.toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-md"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-md"
                          onClick={() => handleDelete(product)}
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
          <DialogTitle>Edit Product Pricing</DialogTitle>
          <DialogDescription>
            Update product price and cost information
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
                <label className="text-sm font-medium mb-2 block">Price (₱)</label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cost (₱)</label>
                <Input
                  type="number"
                  value={editForm.cost}
                  onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between text-sm mb-2">
                <span>Cost Percentage:</span>
                <span className="font-semibold">
                  {calculateCostPercentage(editForm.price, editForm.cost).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Profit Margin:</span>
                <span className="font-semibold text-green-600">
                  {calculateMargin(editForm.price, editForm.cost).toFixed(1)}%
                </span>
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

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product with pricing information
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product Name *</label>
              <Input
                placeholder="Enter product name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <Input
                placeholder="Enter category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Price (₱) *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={editForm.price || ''}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cost (₱)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={editForm.cost || ''}
                  onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Initial Stock</label>
              <Input
                type="number"
                placeholder="0"
                value={editForm.stock || ''}
                onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            {editForm.price > 0 && (
              <div className="bg-blue-50 p-4 rounded">
                <div className="flex justify-between text-sm mb-2">
                  <span>Cost Percentage:</span>
                  <span className="font-semibold">
                    {calculateCostPercentage(editForm.price, editForm.cost).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profit Margin:</span>
                  <span className="font-semibold text-green-600">
                    {calculateMargin(editForm.price, editForm.cost).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
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
