import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  Plus,
  Minus,
  History,
  Search,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: number;
  email: string;
  name: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  reason: string;
  notes?: string;
  created_at: string;
}

export default function StoreCreditAdmin() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModifying, setIsModifying] = useState(false);

  // Modal state for adding/removing credit
  const [modifyAmount, setModifyAmount] = useState("");
  const [modifyReason, setModifyReason] = useState("add");
  const [modifyNotes, setModifyNotes] = useState("");
  const [showModifyDialog, setShowModifyDialog] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setAuthToken(token);
    loadCustomers(token);
  }, [navigate]);

  const loadCustomers = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/store-credit/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load customers");
      }

      const data = await response.json();
      setCustomers(data.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load customers";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async (customerId: number, token: string) => {
    try {
      const response = await fetch(
        `/api/store-credit/${customerId}/history?limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load transaction history");
      }

      const data = await response.json();
      setTransactions(data.data || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error("Failed to load transaction history");
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    if (authToken) {
      await loadTransactions(customer.id, authToken);
    }
  };

  const handleModifyCredit = async () => {
    if (!selectedCustomer || !authToken) {
      toast.error("Please select a customer");
      return;
    }

    if (!modifyAmount || isNaN(parseFloat(modifyAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!modifyReason) {
      toast.error("Please select a reason");
      return;
    }

    setIsModifying(true);

    try {
      const amount =
        modifyReason === "subtract" || modifyReason === "refund"
          ? -parseFloat(modifyAmount)
          : parseFloat(modifyAmount);

      const response = await fetch("/api/store-credit/modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          amount,
          reason: modifyReason,
          notes: modifyNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to modify credit");
      }

      const result = await response.json();
      toast.success(result.message);

      // Update local customer state
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? { ...c, balance: result.data.new_balance }
            : c,
        ),
      );

      setSelectedCustomer((prev) =>
        prev ? { ...prev, balance: result.data.new_balance } : null,
      );

      // Reload transactions
      await loadTransactions(selectedCustomer.id, authToken);

      // Reset form
      setModifyAmount("");
      setModifyReason("add");
      setModifyNotes("");
      setShowModifyDialog(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to modify credit";
      toast.error(message);
    } finally {
      setIsModifying(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Store Credit Management
            </h1>
            <p className="text-gray-600">
              Manage customer store credit balances
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customers List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Customers</CardTitle>
                  <CardDescription>
                    {filteredCustomers.length} total
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedCustomer?.id === customer.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="font-medium text-sm">
                          {customer.name}
                        </div>
                        <div className="text-xs opacity-75">
                          {customer.email}
                        </div>
                        <div className="text-sm font-semibold mt-1">
                          ${customer.balance.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Details & Modify */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCustomer ? (
                <>
                  {/* Customer Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedCustomer.name}</CardTitle>
                      <CardDescription>
                        {selectedCustomer.email}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600">
                            Current Balance
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            ${selectedCustomer.balance.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="text-lg font-semibold">
                            {new Date(
                              selectedCustomer.created_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Dialog
                        open={showModifyDialog}
                        onOpenChange={setShowModifyDialog}
                      >
                        <DialogTrigger asChild>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Modify Credit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modify Store Credit</DialogTitle>
                            <DialogDescription>
                              Add or remove credit for {selectedCustomer.name}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Amount</Label>
                              <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={modifyAmount}
                                onChange={(e) =>
                                  setModifyAmount(e.target.value)
                                }
                                step="0.01"
                              />
                            </div>

                            <div>
                              <Label htmlFor="reason">Reason</Label>
                              <Select
                                value={modifyReason}
                                onValueChange={setModifyReason}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="add">
                                    Add Credit
                                  </SelectItem>
                                  <SelectItem value="subtract">
                                    Remove Credit
                                  </SelectItem>
                                  <SelectItem value="refund">Refund</SelectItem>
                                  <SelectItem value="reward">
                                    Reward/Promotion
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="notes">Notes (Optional)</Label>
                              <Input
                                id="notes"
                                placeholder="Add a note..."
                                value={modifyNotes}
                                onChange={(e) => setModifyNotes(e.target.value)}
                              />
                            </div>

                            <Button
                              onClick={handleModifyCredit}
                              disabled={isModifying}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {isModifying ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Update Credit"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  {/* Transaction History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Transaction History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {transactions.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">
                          No transactions yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {transaction.amount > 0 ? (
                                    <Plus className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Minus className="w-4 h-4 text-red-600" />
                                  )}
                                  <span className="font-medium text-sm">
                                    {transaction.reason}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {new Date(
                                    transaction.created_at,
                                  ).toLocaleString()}
                                </p>
                                {transaction.notes && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {transaction.notes}
                                  </p>
                                )}
                              </div>
                              <div
                                className={`font-semibold ${
                                  transaction.amount > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.amount > 0 ? "+" : ""}$
                                {Math.abs(transaction.amount).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-600 py-12">
                      Select a customer to view and manage their store credit
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
