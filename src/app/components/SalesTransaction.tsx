import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Receipt,
  Search,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function SalesTransaction() {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    confirmPurchase,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [showTransactionCard, setShowTransactionCard] = useState(false);
  const [activeProduct, setActiveProduct] = useState<any>(null);
  const [activeQuantity, setActiveQuantity] = useState(1);
  const [amountPaid, setAmountPaid] = useState("");
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    return products.filter((product) =>
      product.name.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  useEffect(() => {
    if (showTransactionCard) {
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 150);
    }
  }, [showTransactionCard]);

  useEffect(() => {
    if (!showReceiptDialog) return;

    const timer = setTimeout(() => {
      setShowReceiptDialog(false);
      setReceiptData(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showReceiptDialog]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const paid = Number(amountPaid || 0);
  const change = paid - totalAmount;

  const openCard = (product: any) => {
    setActiveProduct(product);
    setActiveQuantity(1);
    setShowTransactionCard(true);
  };

  const addCurrentProduct = () => {
    if (!activeProduct) return;

    if (activeQuantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    if (activeQuantity > activeProduct.stock) {
      alert("Quantity exceeds stock.");
      return;
    }

    addToCart(activeProduct, activeQuantity);

    // keep the card open and allow cashier to add another product
    setActiveProduct(null);
    setActiveQuantity(1);
    setSearchTerm("");
  };

  const selectAnotherProductInsideCard = (product: any) => {
    setActiveProduct(product);
    setActiveQuantity(1);
  };

  const handleConfirmPurchase = async () => {
    if (cart.length === 0) {
      alert("No products selected.");
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
      items: savedCart.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        total: item.product.price * item.quantity,
      })),
      totalAmount,
      amountPaid: paid,
      change,
      date: new Date().toLocaleString(),
    });

    setAmountPaid("");
    setShowTransactionCard(false);
    setShowReceiptDialog(true);
  };

  const handleEnter = (e: any) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    if (activeProduct) {
      addCurrentProduct();
    } else {
      handleConfirmPurchase();
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl">
          <ShoppingCart className="size-6 text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Sales Transaction</h2>
          <p className="text-sm text-gray-500">
            Search product then complete sale inside transaction card
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-6 rounded-2xl shadow-lg">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 size-4 text-gray-400" />

              <Input
                className="pl-10"
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {!searchTerm ? (
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                Search a product first.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl">
                No product found.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => openCard(product)}
                    className="w-full text-left border rounded-xl p-4 hover:bg-blue-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">₱{product.price}</p>
                        <p className="text-sm text-green-600">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-5">
              <div className="flex gap-2 items-center">
                <Receipt className="size-5" />
                <h3 className="font-semibold">Receipt</h3>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  No products selected
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="border rounded-xl p-3">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          ₱{item.product.price}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
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
                            updateCartQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      <p className="font-bold text-blue-600">
                        ₱
                        {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span>{totalItems}</span>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">
                    ₱{totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Change</span>
                  <span className="text-blue-600">
                    ₱{change > 0 ? change.toFixed(2) : "0.00"}
                  </span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={cart.length === 0}
                  onClick={() => setShowTransactionCard(true)}
                >
                  Open Transaction Card
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        open={showTransactionCard}
        onOpenChange={setShowTransactionCard}
      >
        <DialogContent className="max-w-3xl" onKeyDown={handleEnter}>
          <div>
            <DialogTitle>Transaction Card</DialogTitle>
            <DialogDescription>
              Quantity, add products, payment, confirm here.
            </DialogDescription>
          </div>

          <div className="space-y-5 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search another product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm.trim() && searchResults.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => selectAnotherProductInsideCard(product)}
                    className="w-full text-left border rounded-xl p-3 hover:bg-blue-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₱{product.price}</p>
                        <p className="text-sm text-green-600">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeProduct && (
              <div className="border rounded-xl p-4 bg-blue-50">
                <p className="font-semibold">{activeProduct.name}</p>
                <p className="text-sm text-gray-500">
                  ₱{activeProduct.price} | Stock {activeProduct.stock}
                </p>

                <div className="mt-3 flex gap-3">
                  <Input
                    type="number"
                    min="1"
                    max={activeProduct.stock}
                    value={activeQuantity}
                    onChange={(e) =>
                      setActiveQuantity(parseInt(e.target.value) || 1)
                    }
                  />

                  <Button onClick={addCurrentProduct}>
                    Add Product
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="font-semibold text-gray-800">Receipt Preview</p>

              {cart.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                  No products added yet.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="border rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          ₱{item.product.price}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
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
                            updateCartQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      <p className="font-bold text-blue-600">
                        ₱
                        {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Amount Received
              </label>

              <Input
                ref={amountInputRef}
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter cash"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Change</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₱{change > 0 ? change.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTransactionCard(false)}>
                Close
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleConfirmPurchase}
              >
                Confirm Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
      >
        <DialogContent>
          <DialogTitle>Transaction Receipt</DialogTitle>
          <DialogDescription>
            Auto closes in 5 seconds
          </DialogDescription>

          {receiptData && (
            <div className="space-y-4">
              <p>
                <b>Receipt:</b> {receiptData.receiptNumber}
              </p>

              <p>
                <b>Date:</b> {receiptData.date}
              </p>

              <div className="border rounded-xl p-4 space-y-2">
                {receiptData.items.map(
                  (item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between"
                    >
                      <span>
                        {item.name} x{item.qty}
                      </span>
                      <span>
                        ₱{item.total.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>
                    ₱{receiptData.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Paid</span>
                  <span>
                    ₱{receiptData.amountPaid.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-green-600">
                  <span>Change</span>
                  <span>
                    ₱{receiptData.change.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}