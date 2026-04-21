import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Users, Plus, Search, RefreshCw, Pencil } from "lucide-react";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

interface CashierAccount {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  role: "cashier";
  status: "active" | "inactive";
  created_at: string;
  last_login: string | null;
}

export function CashierAccounts() {
  const [cashiers, setCashiers] = useState<CashierAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingCashier, setEditingCashier] = useState<CashierAccount | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    status: "active",
  });

  const token = localStorage.getItem("ee_token") || "";

  const loadCashiers = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/admin/cashiers?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load cashiers.");
      }

      setCashiers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD CASHIERS ERROR:", error);
      setCashiers([]);
      alert("Failed to load cashier accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashiers();
  }, []);

  const filteredCashiers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return cashiers.filter((cashier) => {
      return (
        cashier.full_name.toLowerCase().includes(term) ||
        cashier.username.toLowerCase().includes(term) ||
        cashier.email.toLowerCase().includes(term) ||
        cashier.status.toLowerCase().includes(term)
      );
    });
  }, [cashiers, searchTerm]);

  const openAddDialog = () => {
    setEditingCashier(null);
    setForm({
      full_name: "",
      username: "",
      email: "",
      password: "",
      status: "active",
    });
    setShowDialog(true);
  };

  const openEditDialog = (cashier: CashierAccount) => {
    setEditingCashier(cashier);
    setForm({
      full_name: cashier.full_name || "",
      username: cashier.username || "",
      email: cashier.email || "",
      password: "",
      status: cashier.status || "active",
    });
    setShowDialog(true);
  };

  const resetDialog = () => {
    setShowDialog(false);
    setEditingCashier(null);
    setForm({
      full_name: "",
      username: "",
      email: "",
      password: "",
      status: "active",
    });
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.username.trim() || !form.email.trim()) {
      alert("Full name, username, and email are required.");
      return;
    }

    if (!editingCashier && form.password.trim().length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (editingCashier && form.password && form.password.trim().length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsSaving(true);

      if (editingCashier) {
        const res = await fetch(
          `${API_URL}/admin/cashiers/${editingCashier.user_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              full_name: form.full_name.trim(),
              username: form.username.trim(),
              email: form.email.trim(),
              status: form.status,
              ...(form.password.trim() ? { password: form.password.trim() } : {}),
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to update cashier.");
        }

        alert("Cashier account updated successfully.");
      } else {
        const res = await fetch(`${API_URL}/admin/cashiers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: form.full_name.trim(),
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to create cashier.");
        }

        alert("Cashier account created successfully.");
      }

      await loadCashiers();
      resetDialog();
    } catch (error: any) {
      console.error("SAVE CASHIER ERROR:", error);
      alert(error.message || "Failed to save cashier account.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-pink-500 p-3">
            <Users className="size-6 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Cashier Account Management
            </h2>
            <p className="text-sm text-gray-500">
              Create, update, activate, and deactivate cashier accounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadCashiers}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>

          <Button
            onClick={openAddDialog}
            className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
          >
            <Plus className="mr-2 size-4" />
            Add Cashier
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search cashier name, username, email, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="text-sm text-gray-500">
              Total cashiers:{" "}
              <span className="font-semibold text-gray-800">
                {filteredCashiers.length}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] hover:from-[#4A90E2] hover:to-[#357ABD]">
                  <TableHead className="font-semibold text-white">Full Name</TableHead>
                  <TableHead className="font-semibold text-white">Username</TableHead>
                  <TableHead className="font-semibold text-white">Email</TableHead>
                  <TableHead className="font-semibold text-white">Status</TableHead>
                  <TableHead className="font-semibold text-white">Last Login</TableHead>
                  <TableHead className="text-center font-semibold text-white">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                      Loading cashier accounts...
                    </TableCell>
                  </TableRow>
                ) : filteredCashiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                      No cashier accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCashiers.map((cashier) => (
                    <TableRow
                      key={cashier.user_id}
                      className="border-b border-gray-100 transition-colors hover:bg-blue-50/30"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {cashier.full_name}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cashier.username}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cashier.email}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            cashier.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {cashier.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {cashier.last_login
                          ? new Date(cashier.last_login).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className="bg-pink-500 text-white hover:bg-pink-600"
                          onClick={() => openEditDialog(cashier)}
                        >
                          <Pencil className="mr-1 size-4" />
                          Edit
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

      <Dialog open={showDialog} onOpenChange={resetDialog}>
        <DialogContent>
          <DialogTitle>
            {editingCashier ? "Edit Cashier Account" : "Add Cashier Account"}
          </DialogTitle>
          <DialogDescription>
            {editingCashier
              ? "Update cashier account details and status."
              : "Create a new cashier account."}
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Full Name</label>
              <Input
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Username</label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {editingCashier ? "New Password (optional)" : "Password"}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder={
                  editingCashier
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
              />
            </div>

            {editingCashier && (
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>

            <Button
              className="bg-[#4A90E2] text-white hover:bg-[#357ABD]"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingCashier
                ? "Save Changes"
                : "Add Cashier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}