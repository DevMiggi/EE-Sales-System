import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';

export function ReportPricingManager() {
  const [timeRange, setTimeRange] = useState('month');

  const salesData = [
    { month: 'Jan', revenue: 45000, profit: 12000, sales: 234 },
    { month: 'Feb', revenue: 52000, profit: 15000, sales: 267 },
    { month: 'Mar', revenue: 48000, profit: 13500, sales: 245 },
    { month: 'Apr', revenue: 61000, profit: 18000, sales: 312 },
    { month: 'May', revenue: 55000, profit: 16500, sales: 289 },
    { month: 'Jun', revenue: 67000, profit: 20000, sales: 345 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 42, revenue: 125000 },
    { name: 'Accessories', value: 28, revenue: 84000 },
    { name: 'Software', value: 18, revenue: 54000 },
    { name: 'Services', value: 12, revenue: 36000 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const priceChanges = [
    { product: 'Laptop Pro 15"', oldPrice: 1269, newPrice: 1299, change: 2.4, date: '2026-02-10' },
    { product: 'Monitor 27"', oldPrice: 472, newPrice: 449, change: -4.9, date: '2026-02-08' },
    { product: 'Mechanical Keyboard', oldPrice: 147, newPrice: 159, change: 8.2, date: '2026-02-13' },
  ];

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Pricing Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of sales and pricing trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12.5% vs last period</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+15.3% vs last period</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-purple-600">{profitMargin}%</p>
              <p className="text-xs text-green-600 mt-1">+2.1% vs last period</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Price Changes</p>
              <p className="text-2xl font-bold">{priceChanges.length}</p>
              <p className="text-xs text-gray-600 mt-1">This period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue & Profit Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="size-4 rounded" style={{ backgroundColor: COLORS[index] }} />
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-gray-600">${cat.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Monthly Sales Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name="Number of Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Price Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Price Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priceChanges.map((change) => (
              <div key={change.product} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{change.product}</p>
                  <p className="text-sm text-gray-600">{change.date}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Old Price</p>
                    <p className="font-medium">${change.oldPrice}</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">New Price</p>
                    <p className="font-medium">${change.newPrice}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    change.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {change.change > 0 ? '+' : ''}{change.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
