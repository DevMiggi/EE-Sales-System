import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Minus, Plus, Trash2, ShoppingCart, Receipt } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useApp } from '../context/AppContext';

interface SalesTransactionProps {
  onPurchase: (itemName: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  purchasedItem: string;
}

export function SalesTransaction({ onPurchase, showSuggestions, setShowSuggestions, purchasedItem }: SalesTransactionProps) {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, confirmPurchase } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Product');
  const [customerName, setCustomerName] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const suggestedProducts = [
    {
      id: 1,
      name: 'Premium Notebook Set',
      price: 149.99,
      image: 'premium notebook',
      description: 'Perfect for organizing your notes'
    },
    {
      id: 2,
      name: 'Desk Organizer',
      price: 199.99,
      image: 'desk organizer',
      description: 'Keep your workspace tidy'
    },
    {
      id: 3,
      name: 'Sticky Notes Pack',
      price: 45.99,
      image: 'sticky notes colorful',
      description: 'Colorful sticky notes for reminders'
    },
    {
      id: 4,
      name: 'Paper Clips Set',
      price: 34.99,
      image: 'paper clips assorted',
      description: 'Essential office supplies'
    }
  ];

  const categories = ['All Product', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Product' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmPurchase = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    const customer = customerName.trim() || 'Guest';
    confirmPurchase(customer);
    setShowConfirmDialog(false);
    setCustomerName('');
    alert('Purchase confirmed successfully!');
    
    // Show suggestions after first item
    if (cart.length > 0) {
      onPurchase(cart[0].product.name);
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <ShoppingCart className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Sales Transaction</h2>
          <p className="text-sm text-gray-500">Process customer purchases</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Side - Product Selection */}
        <div className="col-span-2">
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  placeholder="🔍 Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Input placeholder="📁 Category" value={categoryFilter} readOnly className="border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100" />
                <Input placeholder="📅 Date" value={new Date().toLocaleDateString()} readOnly className="border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100" />
              </div>

              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button 
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={categoryFilter === cat 
                      ? 'bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#3A7BC8] hover:to-[#2A6BAA] text-white shadow-md' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'}
                    size="sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                      <TableHead className="text-white font-semibold">Product Name</TableHead>
                      <TableHead className="text-white font-semibold">Category</TableHead>
                      <TableHead className="text-white font-semibold">Price</TableHead>
                      <TableHead className="text-white font-semibold">Stock</TableHead>
                      <TableHead className="text-white font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                        <TableCell className="py-3 text-gray-800 font-medium">{product.name}</TableCell>
                        <TableCell className="py-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium">
                            {product.category}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-gray-800 font-semibold">₱{product.price}</TableCell>
                        <TableCell className="py-3">
                          <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 50 ? 'text-orange-600' : 'text-green-600'}`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <Button 
                            size="sm" 
                            className={product.stock === 0 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#3A7BC8] hover:to-[#2A6BAA] text-white shadow-sm'
                            }
                            onClick={() => addToCart(product, 1)}
                            disabled={product.stock === 0}
                          >
                            {product.stock === 0 ? 'Out of Stock' : '+ Add'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side - Receipt */}
        <div>
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl border-0 rounded-2xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="size-5" />
                <h3 className="text-lg font-semibold">Transaction Receipt</h3>
              </div>
              <p className="text-xs text-blue-100">Transaction ID: TR-{String(Date.now()).slice(-9)}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4 space-y-1 text-sm bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600">Date: <span className="text-gray-800 font-medium">{new Date().toLocaleDateString()}</span></p>
                <p className="text-gray-600">Items: <span className="text-gray-800 font-medium">{totalItems}</span></p>
              </div>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="size-16 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm">Cart is empty</p>
                    <p className="text-gray-400 text-xs mt-1">Add products to start</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{item.product.name}</p>
                          <p className="text-xs text-gray-500">₱{item.product.price} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <Button
                            size="sm"
                            className="size-7 p-0 bg-white hover:bg-gray-50 border-0 shadow-sm"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="size-3 text-gray-600" />
                          </Button>
                          <span className="text-sm w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                          <Button
                            size="sm"
                            className="size-7 p-0 bg-white hover:bg-gray-50 border-0 shadow-sm"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="size-3 text-gray-600" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold text-blue-600">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t-2 border-gray-200 pt-4 space-y-4">
                <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <span>Total Items:</span>
                  <span className="font-bold text-gray-800">{totalItems}</span>
                </div>
                <div className="flex justify-between bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                  <span className="text-base font-semibold text-gray-800">TOTAL AMOUNT:</span>
                  <span className="text-2xl font-bold text-green-600">₱{totalAmount.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={handleConfirmPurchase}
                  disabled={cart.length === 0}
                >
                  CONFIRM PURCHASE
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Purchase Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Please enter customer name to complete the transaction.
          </DialogDescription>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Customer Name</label>
              <Input
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-medium mb-2">Order Summary:</p>
              <div className="space-y-1 text-sm">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>₱{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₱{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={handleFinalConfirm}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggested Products Dialog */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-2xl font-semibold">You might also like these products</DialogTitle>
          <DialogDescription className="text-gray-600">
            Based on your purchase of <strong>{purchasedItem}</strong>
          </DialogDescription>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedProducts.map((product) => (
              <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow border">
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/200x200/?${product.image}`}
                    alt={product.name}
                    className="size-32 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-blue-600">₱{product.price}</span>
                      <Button 
                        size="sm" 
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => {
                          alert(`Added ${product.name} to cart!`);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setShowSuggestions(false)}>
              No, Thanks
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                setShowSuggestions(false);
              }}
            >
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}