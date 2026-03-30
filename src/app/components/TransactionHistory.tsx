import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { History, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function TransactionHistory() {
  const { transactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirm' | 'Pending'>('All');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <History className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Transaction History</h2>
          <p className="text-sm text-gray-500">{filteredTransactions.length} transactions found</p>
        </div>
      </div>

      <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input 
                placeholder="Search by order no or customer..." 
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <select
                className="pl-10 border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:border-blue-500 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Status</option>
                <option value="Confirm">Confirmed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                  <TableHead className="text-white font-semibold">Order No.</TableHead>
                  <TableHead className="text-white font-semibold">Date | Time</TableHead>
                  <TableHead className="text-white font-semibold">Customer Name</TableHead>
                  <TableHead className="text-white font-semibold">QTY</TableHead>
                  <TableHead className="text-white font-semibold">Amount</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-white font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                      <History className="size-12 mx-auto text-gray-300 mb-2" />
                      <p>No transactions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-bold text-blue-600">{transaction.id}</TableCell>
                      <TableCell className="text-gray-600">{transaction.date} | 12:00 PM</TableCell>
                      <TableCell className="text-gray-800 font-medium">{transaction.customer}</TableCell>
                      <TableCell className="text-gray-600 font-medium">{transaction.items.length || '1'}</TableCell>
                      <TableCell className="text-gray-800 font-bold">₱{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          transaction.status === 'Confirm' 
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        }`}>
                          {transaction.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#3A7BC8] hover:to-[#2A6BAA] text-white shadow-sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          View
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

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-semibold">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{selectedTransaction.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedTransaction.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedTransaction.status === 'Confirm' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Items:</p>
                  <div className="space-y-2">
                    {selectedTransaction.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product.name} x{item.quantity}</span>
                        <span>₱{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₱{selectedTransaction.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setSelectedTransaction(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}