import { Card } from './ui/card';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SalesReportAnalysis() {
  const { products, transactions } = useApp();

  // Calculate product performance based on stock levels and transactions
  const calculateProductPerformance = () => {
    return products.map(product => {
      // Fast moving: high initial stock, low current stock
      // Slow moving: low initial stock, high current stock relative to average
      const stockRatio = product.stock / 200; // Assuming max stock of 200
      const performance = (1 - stockRatio) * 100;
      return { ...product, performance: Math.max(0, Math.min(100, performance)) };
    });
  };

  const productPerformance = calculateProductPerformance();

  const fastMoving = productPerformance
    .filter(p => p.performance > 50)
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 4);

  const slowMoving = productPerformance
    .filter(p => p.performance <= 50)
    .sort((a, b) => a.performance - b.performance)
    .slice(0, 3);

  const getColorForPerformance = (performance: number) => {
    if (performance >= 90) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (performance >= 75) return 'bg-gradient-to-r from-green-300 to-green-400';
    if (performance >= 60) return 'bg-gradient-to-r from-green-200 to-green-300';
    if (performance >= 45) return 'bg-gradient-to-r from-yellow-300 to-yellow-400';
    if (performance >= 30) return 'bg-gradient-to-r from-orange-300 to-orange-400';
    if (performance >= 15) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
          <BarChart3 className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Sales Reports & Analysis</h2>
          <p className="text-sm text-gray-500">Product performance insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Fast Moving Products */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Fast Moving Products</h3>
                <p className="text-sm text-gray-600">High-performing items with strong sales velocity</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {fastMoving.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No fast moving products</p>
            ) : (
              fastMoving.map((product, index) => (
                <div key={product.id} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{product.name}</span>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600">{Math.round(product.performance)} Units</span>
                      <p className="text-xs text-gray-500">Performance Score</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`${getColorForPerformance(product.performance)} h-4 rounded-full transition-all duration-500 shadow-sm flex items-center justify-end pr-2`}
                      style={{ width: `${product.performance}%` }}
                    >
                      <span className="text-xs font-bold text-white">{Math.round(product.performance)}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Slow Moving Products */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingDown className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Slow Moving Products</h3>
                <p className="text-sm text-gray-600">Items with lower sales velocity that need attention</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {slowMoving.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No slow moving products</p>
            ) : (
              slowMoving.map((product, index) => (
                <div key={product.id}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{product.name}</span>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-orange-600">{Math.round(product.performance)} Units</span>
                      <p className="text-xs text-gray-500">Performance Score</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`${getColorForPerformance(product.performance)} h-4 rounded-full transition-all duration-500 shadow-sm flex items-center justify-end pr-2`}
                      style={{ width: `${product.performance}%` }}
                    >
                      {product.performance > 10 && (
                        <span className="text-xs font-bold text-white">{Math.round(product.performance)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}