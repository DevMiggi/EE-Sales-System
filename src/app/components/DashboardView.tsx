import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useApp } from '../context/AppContext';
import { DollarSign, Package, Grid3x3 } from 'lucide-react';

export function DashboardView() {
  const { products, transactions } = useApp();

  const totalSales = transactions
    .filter(t => t.status === 'Confirm')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalItems = products.length;

  const categories = [...new Set(products.map(p => p.category))];
  const totalCategories = categories.length;

  const fastMovingProducts = [...products]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);

  return (
    <div className="max-w-7xl">
      <h2 className="text-2xl font-medium mb-6 text-gray-800">Dashboard Overview</h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="relative p-8 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <DollarSign className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-green-100 uppercase tracking-wide font-medium">Total Sales</p>
            <p className="text-4xl font-bold">₱{totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-green-100">+12.5% from last month</p>
          </div>
        </Card>

        <Card className="relative p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <Package className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-blue-100 uppercase tracking-wide font-medium">Total Items</p>
            <p className="text-4xl font-bold">{totalItems}</p>
            <p className="text-xs text-blue-100">Active products in inventory</p>
          </div>
        </Card>

        <Card className="relative p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <Grid3x3 className="size-32 -mr-4 -mt-4" />
          </div>
          <div className="relative space-y-2">
            <p className="text-sm text-purple-100 uppercase tracking-wide font-medium">Categories</p>
            <p className="text-4xl font-bold">{totalCategories}</p>
            <p className="text-xs text-purple-100">Product categories</p>
          </div>
        </Card>
      </div>

      <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-800">Fast-Moving Products</h3>
          <p className="text-sm text-gray-500 mt-1">Top selling items based on inventory turnover</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
              <TableHead className="text-white font-semibold">Product Name</TableHead>
              <TableHead className="text-white font-semibold">Category</TableHead>
              <TableHead className="text-white font-semibold">Qty</TableHead>
              <TableHead className="text-white font-semibold">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fastMovingProducts.map((product, index) => (
              <TableRow key={product.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-800 font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className={`font-semibold ${product.stock < 50 ? 'text-orange-600' : 'text-gray-700'}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-gray-800 font-bold">
                  ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}