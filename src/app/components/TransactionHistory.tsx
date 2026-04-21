import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { History, Search, Receipt, RefreshCw, User } from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface TransactionItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface TransactionRecord {
  sale_id: number;
  receipt_number: string;
  sale_datetime: string;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
  status: string;
  cashier_name: string;
  items: TransactionItem[];
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions?t=${Date.now()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch transactions.");
      }

      setTransactions(data);
    } catch (error) {
      console.error("FETCH TRANSACTIONS ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const interval = setInterval(() => {
      fetchTransactions();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return transactions.filter((transaction) => {
      return (
        transaction.receipt_number.toLowerCase().includes(term) ||
        String(transaction.cashier_name || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [transactions, searchTerm]);

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3">
            <History className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Transaction Monitoring
            </h2>
            <p className="text-sm text-gray-500">
              {filteredTransactions.length} transactions found
            </p>
          </div>
        </div>

        <Button
          onClick={fetchTransactions}
          className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
        <div className="p-6">
          <div className="mb-6 flex gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by receipt number or cashier..."
                className="border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                  <TableHead className="font-semibold text-white">
                    Receipt No.
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Date | Time
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Cashier
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    QTY
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Paid
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Change
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-gray-500"
                    >
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-gray-500"
                    >
                      <History className="mx-auto mb-2 size-12 text-gray-300" />
                      <p>No transactions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const totalQty = (transaction.items || []).reduce(
                      (sum, item) => sum + Number(item.quantity || 0),
                      0
                    );

                    return (
                      <TableRow
                        key={transaction.sale_id}
                        className="border-b border-gray-100 transition-colors hover:bg-blue-50/30"
                      >
                        <TableCell className="font-bold text-blue-600">
                          {transaction.receipt_number}
                        </TableCell>

                        <TableCell className="text-gray-600">
                          {new Date(transaction.sale_datetime).toLocaleString()}
                        </TableCell>

                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-gray-400" />
                            {transaction.cashier_name}
                          </div>
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {totalQty}
                        </TableCell>

                        <TableCell className="font-bold text-gray-800">
                          ₱{Number(transaction.total_amount || 0).toFixed(2)}
                        </TableCell>

                        <TableCell className="text-gray-700">
                          ₱{Number(transaction.amount_paid || 0).toFixed(2)}
                        </TableCell>

                        <TableCell className="font-semibold text-green-600">
                          ₱{Number(transaction.change_amount || 0).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <span className="rounded-full bg-gradient-to-r from-green-400 to-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm capitalize">
                            {transaction.status}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white shadow-sm hover:from-[#3A7BC8] hover:to-[#2A6BAA]"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            View
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

      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Receipt No.</p>
                  <p className="font-semibold">
                    {selectedTransaction.receipt_number}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(
                      selectedTransaction.sale_datetime
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Cashier</p>
                  <p className="font-semibold">
                    {selectedTransaction.cashier_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold capitalize">
                    {selectedTransaction.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="font-semibold">
                    ₱{Number(selectedTransaction.amount_paid || 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Change</p>
                  <p className="font-semibold text-green-600">
                    ₱{Number(selectedTransaction.change_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedTransaction.items &&
                selectedTransaction.items.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="mb-3 font-semibold">Items Sold:</p>

                    <div className="space-y-2">
                      {selectedTransaction.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {Number(item.quantity)} × ₱
                              {Number(item.unit_price || 0).toFixed(2)}
                            </p>
                          </div>

                          <span className="font-semibold">
                            ₱{Number(item.line_total || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>
                    ₱{Number(selectedTransaction.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setSelectedTransaction(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}