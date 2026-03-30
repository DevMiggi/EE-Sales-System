import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, TrendingDown, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useState } from 'react';

export function LowStockAlerts() {
  const { products } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Filter products with stock below 50
  const lowStockProducts = products.filter(p => p.stock < 50);

  const getAlertLevel = (stock: number) => {
    if (stock < 20) return { 
      borderColor: 'border-l-red-500', 
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-red-700',
      label: 'Current Stock: 0 Units',
      tag: 'Critical Stock',
      tagBg: 'bg-red-500',
      pulseColor: 'bg-red-400'
    };
    if (stock < 35) return { 
      borderColor: 'border-l-orange-400', 
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconBg: 'bg-gradient-to-br from-orange-400 to-orange-500',
      textColor: 'text-orange-700',
      label: `Current Stock: ${stock} Units`,
      tag: 'Low Stock',
      tagBg: 'bg-orange-500',
      pulseColor: 'bg-orange-300'
    };
    return { 
      borderColor: 'border-l-yellow-400', 
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      textColor: 'text-yellow-700',
      label: `Current Stock: ${stock} Units`,
      tag: 'Medium Stock',
      tagBg: 'bg-yellow-500',
      pulseColor: 'bg-yellow-300'
    };
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
          <AlertTriangle className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Low Stock Alerts</h2>
          <p className="text-sm text-gray-500">{lowStockProducts.length} items need attention</p>
        </div>
      </div>

      {lowStockProducts.length === 0 ? (
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-16 text-center shadow-lg">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-green-500 rounded-full mb-4">
              <Package className="size-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">All Stock Levels Healthy!</h3>
            <p className="text-green-700">No low stock alerts at the moment. All products are well stocked.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {lowStockProducts.map((product) => {
            const alertLevel = getAlertLevel(product.stock);
            return (
              <Card 
                key={product.id} 
                className={`${alertLevel.bgColor} border-l-4 ${alertLevel.borderColor} shadow-lg hover:shadow-xl rounded-2xl overflow-hidden transition-all hover:scale-[1.02]`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className={`${alertLevel.iconBg} p-4 rounded-xl shadow-md`}>
                        <TrendingDown className="size-7 text-white" />
                      </div>
                      {product.stock < 20 && (
                        <span className="absolute -top-1 -right-1 flex size-4">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${alertLevel.pulseColor} opacity-75`}></span>
                          <span className={`relative inline-flex rounded-full size-4 ${alertLevel.tagBg}`}></span>
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
                      <div className="space-y-2">
                        <p className={`text-sm font-semibold ${alertLevel.textColor}`}>
                          {alertLevel.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span> {product.category}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md ${alertLevel.tagBg}`}>
                            {alertLevel.tag}
                          </span>
                          <Button 
                            size="sm" 
                            className="text-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogTitle>Product Alert Details</DialogTitle>
          <DialogDescription>
            Complete information about this low stock product
          </DialogDescription>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-5 text-red-500" />
                  <p className="font-semibold text-red-700">Low Stock Alert</p>
                </div>
                <p className="text-sm text-red-600">
                  This product is running low and needs restocking soon
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-semibold">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="font-semibold text-red-600">{selectedProduct.stock} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold">₱{selectedProduct.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="font-semibold">₱{selectedProduct.cost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="font-semibold text-green-600">
                    {((selectedProduct.price - selectedProduct.cost) / selectedProduct.price * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Contact supplier for restock</li>
                  <li>Consider ordering at least 50 units</li>
                  <li>Review sales trend to optimize stock levels</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Close
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600">
              Request Restock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}