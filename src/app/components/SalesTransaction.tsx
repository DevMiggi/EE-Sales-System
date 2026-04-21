import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShoppingCart,
  Receipt,
  Search,
  ScanLine,
  LogOut,
  History,
  Minus,
  Plus,
  Trash2,
  Package,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  Printer,
} from "lucide-react";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

type CashierPage = "pos" | "history";
type ScanStatusType = "idle" | "success" | "error";

export function SalesTransaction() {
  const { logout, user } = useAuth();

  const {
    products,
    cart,
    transactions,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    confirmPurchase,
    refreshTransactions,
  } = useApp();

  const [activePage, setActivePage] = useState<CashierPage>("pos");
  const [searchTerm, setSearchTerm] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [scanMessage, setScanMessage] = useState("Barcode scanner active");
  const [scanStatus, setScanStatus] = useState<ScanStatusType>("idle");
  const [manualSearchMode, setManualSearchMode] = useState(false);

  const payInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const receiptPrintRef = useRef<HTMLDivElement>(null);
  const scanBufferRef = useRef("");
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return products.slice(0, 12);

    return products.filter(
      (p: any) =>
        String(p.name || "").toLowerCase().includes(term) ||
        String(p.category || "").toLowerCase().includes(term) ||
        String(p.barcode || "").toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const paid = Number(amountPaid || 0);
  const change = paid - totalAmount;

  const setScannerFeedback = (
    message: string,
    status: ScanStatusType = "idle"
  ) => {
    setScanMessage(message);
    setScanStatus(status);
  };

  const getCartQuantity = (productId: number) => {
    const existing = cart.find((item) => item.product.id === productId);
    return existing ? existing.quantity : 0;
  };

  const addProduct = (product: any) => {
    const stock = Number(product.stock || 0);
    const currentCartQty = getCartQuantity(product.id);

    if (stock <= 0) {
      setScannerFeedback(`Out of stock: ${product.name}`, "error");
      return;
    }

    if (currentCartQty >= stock) {
      setScannerFeedback(`Stock limit reached: ${product.name}`, "error");
      return;
    }

    addToCart(product, 1);
    setSearchTerm("");
    setScannerFeedback(`Added: ${product.name}`, "success");
  };

  const processScannedBarcode = (barcode: string) => {
    const cleanBarcode = String(barcode || "").trim();

    if (!cleanBarcode) return;

    const product = products.find(
      (p: any) => String(p.barcode || "").trim() === cleanBarcode
    );

    if (!product) {
      setScannerFeedback(`No product found: ${cleanBarcode}`, "error");
      return;
    }

    addProduct(product);
  };

  const handleManualQtyChange = (product: any, nextQty: number) => {
    const stock = Number(product.stock || 0);

    if (nextQty <= 0) {
      removeFromCart(product.id);
      return;
    }

    if (nextQty > stock) {
      setScannerFeedback(`Stock limit reached: ${product.name}`, "error");
      return;
    }

    updateCartQuantity(product.id, nextQty);
  };

  const handlePrintReceipt = () => {
    if (!receiptPrintRef.current || !receiptData) return;

    const printContents = receiptPrintRef.current.innerHTML;
    const printWindow = window.open("", "", "width=420,height=800");

    if (!printWindow) {
      alert("Unable to open print window.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Receipt</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              margin: 0;
              padding: 16px;
              font-size: 12px;
              background: #fff;
            }
            .receipt {
              width: 100%;
              max-width: 320px;
              margin: 0 auto;
            }
            .center {
              text-align: center;
            }
            .bold {
              font-weight: bold;
            }
            .store-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .store-sub {
              font-size: 12px;
              margin-bottom: 2px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 10px;
              margin: 2px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              margin: 6px 0;
            }
            .item-name {
              flex: 1;
              word-break: break-word;
            }
            .item-total {
              white-space: nowrap;
              text-align: right;
            }
            .small {
              font-size: 11px;
            }
            .totals {
              margin-top: 8px;
            }
            .thank-you {
              margin-top: 14px;
              text-align: center;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              .receipt {
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    if (paid < totalAmount) {
      alert("Insufficient payment.");
      return;
    }

    const savedCart = [...cart];
    const result = await confirmPurchase(paid);

    if (!result) return;

    setReceiptData({
      receiptNumber: result.receipt_number,
      items: savedCart.map((item: any) => ({
        name: item.product.name,
        qty: item.quantity,
        unitPrice: Number(item.product.price || 0),
        total: Number(item.product.price || 0) * item.quantity,
      })),
      totalAmount,
      amountPaid: paid,
      change,
      date: new Date().toLocaleString(),
      cashierName: user?.name || "Cashier",
    });

    setAmountPaid("");
    setShowPayment(false);
    setShowReceipt(true);
    setActivePage("pos");
    setSearchTerm("");
    setManualSearchMode(false);
    setScannerFeedback("Sale saved successfully", "success");
  };

  useEffect(() => {
    if (showPayment) {
      setTimeout(() => payInputRef.current?.focus(), 150);
    }
  }, [showPayment]);

  useEffect(() => {
    if (!showReceipt) return;

    const timer = setTimeout(() => {
      setShowReceipt(false);
      setReceiptData(null);
    }, 8000);

    return () => clearTimeout(timer);
  }, [showReceipt]);

  useEffect(() => {
    if (activePage === "history") {
      refreshTransactions();
    }
  }, [activePage, refreshTransactions]);

  useEffect(() => {
    if (
      scanMessage === "Barcode scanner active" ||
      scanMessage === "Click search field to type manually"
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setScanMessage("Barcode scanner active");
      setScanStatus("idle");
    }, 1800);

    return () => clearTimeout(timer);
  }, [scanMessage]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (activePage !== "pos" || showPayment || showReceipt) return;

      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      const typingInSearch =
        target === searchInputRef.current ||
        (tagName === "input" && manualSearchMode);

      if (typingInSearch) return;

      const key = e.key;

      if (
        key === "Shift" ||
        key === "Control" ||
        key === "Alt" ||
        key === "Meta" ||
        key === "Tab"
      ) {
        return;
      }

      if (key === "Enter") {
        const code = scanBufferRef.current.trim();

        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
          scanTimeoutRef.current = null;
        }

        if (code.length > 0) {
          processScannedBarcode(code);
        }

        scanBufferRef.current = "";
        return;
      }

      if (key.length === 1) {
        scanBufferRef.current += key;

        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }

        scanTimeoutRef.current = setTimeout(() => {
          const code = scanBufferRef.current.trim();

          if (code.length >= 8) {
            processScannedBarcode(code);
          }

          scanBufferRef.current = "";
          scanTimeoutRef.current = null;
        }, 80);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [products, activePage, showPayment, showReceipt, manualSearchMode, cart]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const exactBarcodeMatch = products.find(
      (p: any) => String(p.barcode || "").trim() === trimmed
    );

    if (exactBarcodeMatch) {
      addProduct(exactBarcodeMatch);
      return;
    }

    const exactNameMatch = products.find(
      (p: any) =>
        String(p.name || "").toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (exactNameMatch) {
      addProduct(exactNameMatch);
      return;
    }

    if (filteredProducts.length === 1) {
      addProduct(filteredProducts[0]);
      return;
    }

    setScannerFeedback("Select a product from the list", "error");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">Cashier Panel</h1>
          <p className="text-sm text-slate-300 mt-1">
            {user?.name || "Cashier"}
          </p>
          <p className="text-xs text-slate-400 mt-1 capitalize">
            {user?.role || "cashier"}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActivePage("pos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activePage === "pos" ? "bg-blue-600" : "hover:bg-slate-800"
            }`}
          >
            <ShoppingCart className="size-5" />
            POS
          </button>

          <button
            onClick={() => setActivePage("history")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activePage === "history" ? "bg-blue-600" : "hover:bg-slate-800"
            }`}
          >
            <History className="size-5" />
            History
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {activePage === "pos" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">Point of Sale</h2>
                <p className="text-gray-500">Scan barcode or search products</p>
              </div>

              <div className="bg-white rounded-2xl px-5 py-3 shadow">
                <p className="text-sm text-gray-500">Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <Card className="p-4 rounded-2xl">
                  <div className="relative">
                    <Search className="size-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      className="pl-10 h-12"
                      placeholder="Click to search manually or scan barcode..."
                      value={searchTerm}
                      onFocus={() => {
                        setManualSearchMode(true);
                        setScanMessage("Type product name or scan barcode");
                        setScanStatus("idle");
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setManualSearchMode(false);
                          setSearchTerm("");
                          setScanMessage("Barcode scanner active");
                          setScanStatus("idle");
                        }, 150);
                      }}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                  </div>

                  <div
                    className={`mt-2 flex items-center gap-2 text-sm ${
                      scanStatus === "success"
                        ? "text-green-600"
                        : scanStatus === "error"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {scanStatus === "success" ? (
                      <CheckCircle2 className="size-4" />
                    ) : scanStatus === "error" ? (
                      <AlertCircle className="size-4" />
                    ) : (
                      <ScanLine className="size-4" />
                    )}
                    {scanMessage}
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  {filteredProducts.map((product: any) => (
                    <Card
                      key={product.id}
                      className="p-4 rounded-2xl cursor-pointer hover:shadow-lg transition"
                      onClick={() => addProduct(product)}
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.category}
                          </p>
                          <p className="text-xs mt-1">
                            {String(product.barcode || "").trim()
                              ? `Barcode: ${product.barcode}`
                              : "No barcode assigned"}
                          </p>
                        </div>

                        <p className="font-bold text-blue-600 whitespace-nowrap">
                          ₱{Number(product.price || 0).toFixed(2)}
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-green-600">
                        Stock: {product.stock}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Card className="p-4 rounded-2xl sticky top-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt className="size-5 text-blue-600" />
                    <h3 className="font-bold text-lg">Current Sale</h3>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.length === 0 && (
                      <p className="text-sm text-gray-500">No items yet.</p>
                    )}

                    {cart.map((item: any) => (
                      <div
                        key={item.product.id}
                        className="border rounded-xl p-3"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">
                              ₱{Number(item.product.price || 0).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex gap-2 items-center">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleManualQtyChange(
                                  item.product,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="size-3" />
                            </Button>

                            <span>{item.quantity}</span>

                            <Button
                              size="sm"
                              onClick={() =>
                                handleManualQtyChange(
                                  item.product,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>

                          <p className="font-bold">
                            ₱
                            {(
                              Number(item.product.price || 0) * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4 space-y-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₱{totalAmount.toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full h-12 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowPayment(true)}
                    >
                      Checkout
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {activePage === "history" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">Transaction History</h2>
                <p className="text-gray-500">
                  View recorded sales transactions
                </p>
              </div>

              <Button onClick={refreshTransactions}>Refresh</Button>
            </div>

            <div className="space-y-4">
              {transactions.length === 0 ? (
                <Card className="p-8 rounded-2xl text-center">
                  <History className="size-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-lg font-semibold">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Completed sales will appear here.
                  </p>
                </Card>
              ) : (
                transactions.map((transaction: any) => (
                  <Card key={transaction.id} className="p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="size-4 text-blue-600" />
                          <p className="font-bold">{transaction.id}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays className="size-4" />
                          <span>{transaction.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-semibold capitalize">
                          {transaction.status}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-green-600">
                          ₱{Number(transaction.amount || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-sm text-gray-500">Paid</p>
                        <p className="font-bold">
                          ₱{Number(transaction.amountPaid || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-sm text-gray-500">Change</p>
                        <p className="font-bold text-blue-600">
                          ₱{Number(transaction.changeAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="size-4 text-gray-600" />
                        <p className="font-semibold">Items</p>
                      </div>

                      <div className="space-y-2">
                        {Array.isArray(transaction.items) &&
                        transaction.items.length > 0 ? (
                          transaction.items.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between border rounded-xl p-3"
                            >
                              <div>
                                <p className="font-medium">
                                  {item.productName || item.product_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  Unit: ₱
                                  {Number(
                                    item.unitPrice || item.unit_price || 0
                                  ).toFixed(2)}
                                </p>
                                <p className="font-bold">
                                  ₱
                                  {Number(
                                    item.lineTotal || item.line_total || 0
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No item details available.
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>Enter amount received</DialogDescription>

          <div className="space-y-4 mt-4">
            <Input
              ref={payInputRef}
              type="number"
              placeholder="Cash amount"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm">Total</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm">Change</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₱{change > 0 ? change.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={completeSale}
            >
              Confirm Purchase
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>Print or review the transaction receipt</DialogDescription>

          {receiptData && (
            <>
              <div ref={receiptPrintRef} className="receipt space-y-3 text-sm">
                <div className="center text-center">
                  <p className="text-lg font-bold">Erin and Elyzha</p>
                  <p>School Supply, Plastic Supply</p>
                  <p>Wholesale, Retail and General Merchandise</p>
                  <p className="mt-1 font-semibold">SALES RECEIPT</p>
                </div>

                <div className="border-t border-b border-dashed py-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Receipt No.</span>
                    <span>{receiptData.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>{receiptData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier</span>
                    <span>{receiptData.cashierName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Item</span>
                    <span>Amount</span>
                  </div>

                  {receiptData.items.map((item: any, index: number) => (
                    <div key={index} className="border-b pb-2">
                      <div className="flex justify-between gap-3">
                        <span className="flex-1">{item.name}</span>
                        <span className="whitespace-nowrap">
                          ₱{item.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Qty: {item.qty} × ₱{item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₱{receiptData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash</span>
                    <span>₱{receiptData.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change</span>
                    <span>₱{receiptData.change.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-xs">
                  <p>Thank you for your purchase.</p>
                  <p>Please come again.</p>
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                onClick={handlePrintReceipt}
              >
                <Printer className="size-4 mr-2" />
                Print Receipt
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}