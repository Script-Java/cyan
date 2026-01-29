import { useEffect, useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Send,
  Copy,
  X,
  MoreHorizontal,
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: "Draft" | "Sent" | "Unpaid" | "Paid" | "Overdue" | "Canceled";
  sent_date?: string;
  due_date: string;
  updated_at: string;
}

interface Stats {
  total_outstanding: number;
  paid_this_month: number;
  overdue_count: number;
  draft_count: number;
}

export default function AdminInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const response = await fetch(`/api/admin/invoices?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data.data || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, typeFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Sent":
        return "bg-blue-100 text-blue-800";
      case "Canceled":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      const response = await fetch(
        `/api/admin/invoices/${selectedInvoice.id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel invoice");
      }

      toast.success("Invoice canceled successfully");
      setShowCancelDialog(false);
      setSelectedInvoice(null);
      setCancelReason("");
      fetchInvoices();
    } catch (error) {
      console.error("Error canceling invoice:", error);
      toast.error("Failed to cancel invoice");
    }
  };

  const handleResendInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(
        `/api/admin/invoices/${invoice.id}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            email_subject: `Invoice #${invoice.invoice_number}`,
            email_message: "Please find your invoice below. Click the link to pay.",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resend invoice");
      }

      toast.success("Invoice sent successfully");
      fetchInvoices();
    } catch (error) {
      console.error("Error resending invoice:", error);
      toast.error("Failed to resend invoice");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-600">Manage and track all customer invoices</p>
          </div>

          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Outstanding</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${stats.total_outstanding.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Paid This Month</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${stats.paid_this_month.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats.overdue_count}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.draft_count}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Controls */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/admin/invoices/new")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Access Link
              </Button>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by customer, email, or invoice #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Canceled">Canceled</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                <option value="Standard">Standard</option>
                <option value="ArtworkUpload">Artwork Upload</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No invoices found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Invoice #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Due Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                navigate(`/admin/invoices/${invoice.id}`)
                              }
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {invoice.invoice_number}
                            </button>
                          </td>
                          <td className="py-3 px-4">{invoice.customer_name}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {invoice.customer_email}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            ${invoice.total.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                invoice.status
                              )}`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/admin/invoices/${invoice.id}`)
                                }
                                className="text-gray-600 hover:text-gray-900"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {invoice.status === "Draft" && (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/admin/invoices/${invoice.id}/edit`
                                    )
                                  }
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {invoice.status === "Sent" ||
                              invoice.status === "Unpaid" ? (
                                <button
                                  onClick={() => handleResendInvoice(invoice)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Resend"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              ) : null}
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowCancelDialog(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Cancel Invoice?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this invoice? The customer will be
            notified.
          </AlertDialogDescription>
          <div className="my-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation reason (optional)
            </label>
            <Input
              placeholder="e.g., Customer requested cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvoice}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Invoice
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
