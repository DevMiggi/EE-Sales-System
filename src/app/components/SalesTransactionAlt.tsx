import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Calendar, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

interface SalesTransactionAltProps {
  onPurchase: (itemName: string) => void;
}

export function SalesTransactionAlt({ onPurchase }: SalesTransactionAltProps) {
  const [selectedDate, setSelectedDate] = useState('2026-02-14');

  const dailyStats = [
    { label: 'Daily Sales', value: '$12,450', icon: DollarSign, color: 'blue' },
    { label: 'Transactions', value: '48', icon: ShoppingBag, color: 'green' },
    { label: 'Growth', value: '+18%', icon: TrendingUp, color: 'purple' },
  ];

  const salesByCategory = [
    { category: 'Electronics', sales: 5280, percentage: 42 },
    { category: 'Accessories', sales: 3120, percentage: 25 },
    { category: 'Software', sales: 2490, percentage: 20 },
    { category: 'Services', sales: 1560, percentage: 13 },
  ];

  const topProducts = [
    { name: 'Laptop Pro 15"', sales: 24, revenue: 31176, trend: '+12%' },
    { name: 'Wireless Earbuds', sales: 89, revenue: 8900, trend: '+25%' },
    { name: 'USB-C Hub', sales: 156, revenue: 7800, trend: '+8%' },
    { name: 'External SSD 1TB', sales: 42, revenue: 6300, trend: '+15%' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Date Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="size-5 text-gray-600" />
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button variant="outline">Today</Button>
            <Button variant="outline">This Week</Button>
            <Button variant="outline">This Month</Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {dailyStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                    <Icon className={`size-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-gray-600">${item.sales.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{item.percentage}% of total</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center bg-blue-600 text-white rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${product.revenue.toLocaleString()}</p>
                    <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                      {product.trend}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onPurchase(product.name)}
                  >
                    Buy
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
