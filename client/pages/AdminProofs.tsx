import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Send,
  Plus,
  X,
  Package,
  Upload,
  Download,
  FileIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { formatOrderNumber } from "@/lib/order-number";

interface ProofComment {
  id: string;
  proof_id: string;
  customer_id?: number;
  admin_id?: string;
  admin_email?: string;
  message: string;
  created_at: string;
}

interface CustomerInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface Proof {
  id: string;
  order_id: number;
  customer_id: number;
  description?: string;
  file_url?: string;
  file_name?: string;
  status: "pending" | "approved" | "denied" | "revisions_requested";
  revision_notes?: string;
  created_at: string;
  updated_at: string;
  customers?: CustomerInfo;
  comments?: ProofComment[];
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

interface AdminProofsResponse {
  success: boolean;
  proofs: Proof[];
  unreadNotifications: number;
  pagination?: PaginationInfo;
}

interface OrderItem {
  id?: number;
  quantity?: number;
  product_name?: string;
  options?: Record<string, any>;
  design_file_url?: string;
}

interface PendingOrder {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  dateCreated: string;
  source: "ecwid" | "supabase";
  orderItems?: OrderItem[];
}

interface PendingOrdersResponse {
  success: boolean;
  orders: PendingOrder[];
  count: number;
}

export default function AdminProofs() {
  const navigate = useNavigate();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<
    Record<string, boolean>
  >({});
  const [showSendForm, setShowSendForm] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("");
  const [sendingProof, setSendingProof] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [selectedOrderProofStatus, setSelectedOrderProofStatus] = useState<
    "pending" | "awaiting" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProofs(token, 1, false);
    fetchPendingOrders(token);
  }, [navigate]);

  const fetchProofs = async (
    token: string,
    page: number = 1,
    append: boolean = false,
  ) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError("");

      const response = await fetch(`/api/admin/proofs?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch proofs");
      }

      const data: AdminProofsResponse = await response.json();

      if (append) {
        setProofs((prev) => [...prev, ...(data.proofs || [])]);
      } else {
        setProofs(data.proofs || []);
      }

      setUnreadCount(data.unreadNotifications || 0);
      setPagination(data.pagination || null);
      setCurrentPage(page);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load proofs";
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchPendingOrders = async (token: string) => {
    try {
      setOrdersLoading(true);

      const response = await fetch("/api/admin/pending-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch pending orders");
      }

      const data: PendingOrdersResponse = await response.json();
      setPendingOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching pending orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const getOrderProofStatus = (orderId: number): "pending" | "awaiting" | null => {
    const existingProof = proofs.find((p) => p.order_id === orderId);
    if (existingProof) {
      return existingProof.status === "pending" ? "awaiting" : null;
    }
    return "pending";
  };

  const handleSelectOrder = (order: PendingOrder) => {
    const status = getOrderProofStatus(order.id);
    setOrderId(order.id.toString());
    setCustomerId(order.customerId ? order.customerId.toString() : "");
    setCustomerEmail(order.customerEmail || "");
    setDescription("");
    setSelectedOrder(order);
    setSelectedOrderProofStatus(status);
    setShowOrderModal(false);
    setShowSendForm(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploadedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
  };

  const handleSendProof = async () => {
    try {
      if (!description) {
        toast.error("Please fill in Proof Description");
        return;
      }

      if (!customerEmail) {
        toast.error("Please enter customer email address");
        return;
      }

      setSendingProof(true);

      const requestBody: any = {
        description,
        customerEmail,
      };

      if (uploadedFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64String = (e.target?.result as string).split(",")[1];
            const token = localStorage.getItem("authToken");

            const response = await fetch("/api/admin/proofs/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...requestBody,
                fileData: base64String,
                fileName: uploadedFile.name,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to send proof");
            }

            toast.success("Proof sent to customer successfully!");
            setOrderId("");
            setCustomerId("");
            setCustomerEmail("");
            setDescription("");
            setUploadedFile(null);
            setFilePreview(null);
            setSelectedOrder(null);
            setSelectedOrderProofStatus(null);
            setShowSendForm(false);
            fetchProofs();
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Failed to send proof";
            toast.error(message);
          } finally {
            setSendingProof(false);
          }
        };
        reader.readAsDataURL(uploadedFile);
      } else {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/admin/proofs/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send proof");
        }

        toast.success("Proof sent to customer successfully!");
        setOrderId("");
        setCustomerId("");
        setCustomerEmail("");
        setDescription("");
        setSelectedOrder(null);
        setSelectedOrderProofStatus(null);
        setShowSendForm(false);
        fetchProofs();
        setSendingProof(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send proof";
      toast.error(message);
      setSendingProof(false);
    }
  };

  const handleAddComment = async (proofId: string) => {
    try {
      const message = commentText[proofId]?.trim();
      if (!message) {
        toast.error("Please enter a comment");
        return;
      }

      setSubmittingComment((prev) => ({ ...prev, [proofId]: true }));

      const response = await fetch(`/api/admin/proofs/${proofId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          adminId: "admin",
          adminEmail: "admin@example.com",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setCommentText((prev) => ({ ...prev, [proofId]: "" }));
      toast.success("Comment added");
      fetchProofs();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add comment";
      toast.error(message);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [proofId]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case "revisions_requested":
        return <AlertTriangle className="w-6 h-6 text-orange-400" />;
      case "pending":
      default:
        return <Clock className="w-6 h-6 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-700 bg-green-100 border border-green-300";
      case "revisions_requested":
        return "text-orange-700 bg-orange-100 border border-orange-300";
      case "pending":
      default:
        return "text-blue-700 bg-blue-100 border border-blue-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "revisions_requested":
        return "Revisions Requested";
      case "pending":
      default:
        return "Pending Review";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingProofs = proofs.filter((p) => p.status === "pending");
  const reviewedProofs = proofs.filter((p) => p.status !== "pending");

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="w-full pb-20 md:pb-0 py-6 md:py-8 px-3 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center h-48 sm:h-64">
              <div className="text-gray-600 text-sm">Loading proofs...</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full pb-20 md:pb-0 px-3 sm:px-6 lg:px-8 pt-6 md:pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 border-b border-gray-300 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <Package className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 text-green-600 flex-shrink-0" />
                  <span>Proofs</span>
                </h1>
                <p className="text-gray-600 mt-2 text-xs sm:text-sm">
                  Manage design proofs for customers
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    const token = localStorage.getItem("authToken");
                    if (token) {
                      fetchProofs(token, 1, false);
                      toast.success("Refreshing proofs...");
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex-shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  onClick={() => navigate("/admin/send-proof")}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex-shrink-0 flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4" />
                  <span>Send New Proof</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Pending Orders Section */}
          {pendingOrders.length > 0 && !showSendForm && (
            <div className="backdrop-blur-xl bg-white border border-gray-300 rounded-lg sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <Package className="w-5 h-5 text-green-600" />
                Pending Orders Ready for Proofs
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Click on any order below to quickly send a proof to that
                customer
              </p>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-100">
                      <th className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 whitespace-nowrap">
                        Order #
                      </th>
                      <th className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">
                        Customer
                      </th>
                      <th className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                        Email
                      </th>
                      <th className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 text-right whitespace-nowrap">
                        Total
                      </th>
                      <th className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 whitespace-nowrap text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => {
                      const proofStatus = getOrderProofStatus(order.id);
                      return (
                        <tr
                          key={order.id}
                          onClick={() => handleSelectOrder(order)}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap text-xs sm:text-sm">
                            #{order.id}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-700 whitespace-nowrap hidden sm:table-cell truncate max-w-xs text-xs sm:text-sm">
                            {order.customerName}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-600 hidden md:table-cell text-xs sm:text-sm">
                            <div className="flex items-center gap-1 truncate max-w-xs">
                              {order.customerEmail}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <div className="space-y-1">
                              <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300 whitespace-nowrap inline-block">
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                              {proofStatus && (
                                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium border whitespace-nowrap inline-block ml-2 ${
                                  proofStatus === "awaiting"
                                    ? "bg-blue-100 text-blue-700 border-blue-300"
                                    : "bg-yellow-100 text-yellow-700 border-yellow-300"
                                }`}>
                                  {proofStatus === "awaiting"
                                    ? "Awaiting Review"
                                    : "Pending Proof"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-green-700 text-right whitespace-nowrap text-xs sm:text-sm">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectOrder(order)}
                              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium text-xs whitespace-nowrap border border-green-300"
                            >
                              <span>Send</span>
                              <span className="hidden sm:inline">Proof</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Send Proof Form */}
          {showSendForm && (
            <div className="backdrop-blur-xl bg-white border border-green-300 rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex justify-between items-start gap-3 mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Send Proof to Customer
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    For Supabase orders only
                  </p>
                </div>
                <button
                  onClick={() => setShowSendForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter customer email address"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                  />
                  <input type="hidden" value={customerId} />
                  <p className="text-xs text-gray-600 mt-2">
                    ℹ️ Customer email is required. The proof will be sent to this address.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Proof Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the proof (e.g., 'Front and back design mockup')"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Upload File (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-green-500 hover:bg-gray-50 transition-all">
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadedFile
                          ? `Selected: ${uploadedFile.name}`
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images, PDF, or Office files (max 50MB)
                      </p>
                    </div>
                  </div>
                </div>
                {uploadedFile && (
                  <div className="backdrop-blur-xl bg-gray-50 border border-gray-300 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        File Preview
                      </h4>
                      <button
                        onClick={handleRemoveFile}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {filePreview ? (
                      <div>
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full max-h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          {uploadedFile.name}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-300">
                        <FileIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Details Section */}
                {selectedOrder &&
                  selectedOrder.orderItems &&
                  selectedOrder.orderItems.length > 0 && (
                    <div className="backdrop-blur-xl bg-gray-50 border border-gray-300 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Order Details
                      </h4>
                      <div className="space-y-4">
                        {selectedOrder.orderItems.map((item, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-300 p-4"
                          >
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">
                                  Product
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.product_name || "Custom Item"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">
                                  Quantity
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.quantity || "N/A"}
                                </p>
                              </div>
                            </div>

                            {item.options &&
                              Object.keys(item.options).length > 0 && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  {item.options.size && (
                                    <div>
                                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                                        Size
                                      </p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.options.size}
                                      </p>
                                    </div>
                                  )}
                                  {item.options.color && (
                                    <div>
                                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                                        Color
                                      </p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.options.color}
                                      </p>
                                    </div>
                                  )}
                                  {item.options.vinyl_finish && (
                                    <div>
                                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                                        Vinyl Finish
                                      </p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.options.vinyl_finish}
                                      </p>
                                    </div>
                                  )}
                                  {item.options.sticker_type && (
                                    <div>
                                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                                        Sticker Type
                                      </p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.options.sticker_type}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                            {item.design_file_url && (
                              <div className="pt-4 border-t border-gray-300">
                                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                                  Design Thumbnail
                                </p>
                                <div
                                  className={
                                    'rounded-lg border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center"'
                                  }
                                  style={{ maxHeight: "120px" }}
                                >
                                  <img
                                    src={item.design_file_url}
                                    alt="Design thumbnail"
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                      (
                                        e.currentTarget as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                  <button
                    onClick={handleSendProof}
                    disabled={sendingProof}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors"
                  >
                    {sendingProof ? "Sending..." : "Send Proof"}
                  </button>
                  <button
                    onClick={() => {
                      setShowSendForm(false);
                      setUploadedFile(null);
                      setFilePreview(null);
                      setOrderId("");
                      setCustomerEmail("");
                      setSelectedOrder(null);
                      setSelectedOrderProofStatus(null);
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Selection Modal */}
          {showOrderModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-black border border-white/10 rounded-lg sm:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-black border-b border-white/10 p-4 sm:p-6 flex justify-between items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Select Order to Send Proof
                  </h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-white/40 hover:text-white/60 transition-colors flex-shrink-0"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-4 sm:p-6">
                  {ordersLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="text-white/60 text-xs sm:text-sm">
                        Loading orders...
                      </div>
                    </div>
                  ) : pendingOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-base text-white/60">
                        No pending orders available
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-purple-300">
                              Order #
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-purple-300">
                              Customer
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-purple-300">
                              Email
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-purple-300">
                              Status
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-purple-300 text-right">
                              Total
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-purple-300">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-white/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-white text-xs sm:text-sm">
                                #{order.id}
                              </td>
                              <td className="px-2 sm:px-4 py-3 sm:py-4 text-white/80 text-xs sm:text-sm truncate">
                                {order.customerName}
                              </td>
                              <td className="px-2 sm:px-4 py-3 sm:py-4 text-white/60 text-xs sm:text-sm truncate">
                                {order.customerEmail}
                              </td>
                              <td className="px-2 sm:px-4 py-3 sm:py-4">
                                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30 inline-block">
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-green-300 text-right text-xs sm:text-sm">
                                ${order.total.toFixed(2)}
                              </td>
                              <td className="px-2 sm:px-4 py-3 sm:py-4">
                                <button
                                  onClick={() => handleSelectOrder(order)}
                                  className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 transition-colors font-medium text-xs border border-green-600/30 whitespace-nowrap"
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 sm:mb-8 backdrop-blur-xl bg-red-50 border border-red-300 rounded-lg sm:rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {proofs.length === 0 && !error && (
            <div className="backdrop-blur-xl bg-white border border-gray-300 rounded-lg sm:rounded-2xl p-6 sm:p-12 text-center">
              <Clock className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No Proofs Yet
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Start by sending a proof to a customer.
              </p>
              <button
                onClick={() => setShowSendForm(true)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium text-sm sm:text-base rounded-lg transition-colors"
              >
                Send Your First Proof
              </button>
            </div>
          )}

          {/* Pending Proofs Section */}
          {pendingProofs.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>Awaiting Customer Review ({pendingProofs.length})</span>
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {pendingProofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="backdrop-blur-xl bg-white border border-gray-300 rounded-lg sm:rounded-2xl overflow-hidden hover:bg-gray-50 transition-colors"
                  >
                    {/* Proof Header */}
                    <button
                      onClick={() =>
                        setExpandedProofId(
                          expandedProofId === proof.id ? null : proof.id,
                        )
                      }
                      className="w-full px-3 sm:px-6 py-3 sm:py-4 flex items-start sm:items-center justify-between hover:bg-gray-50 transition-colors gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 text-left min-w-0">
                        {/* Thumbnail Preview */}
                        <div className="flex-shrink-0">
                          {proof.file_url ? (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                              {proof.file_url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                                <img
                                  src={proof.file_url}
                                  alt={proof.file_name || "Design thumbnail"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                                  }}
                                />
                              ) : (
                                <FileIcon className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                              <FileIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {proof.description || `Proof ${proof.id.substring(0, 8)}`}
                            </h3>
                            <span
                              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(proof.status)}`}
                            >
                              {getStatusLabel(proof.status)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            To: {proof.customers?.email || "Unknown email"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {proof.customers?.first_name} {proof.customers?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Sent on {formatDate(proof.created_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedProofId === proof.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Proof Details - Expanded */}
                    {expandedProofId === proof.id && (
                      <div className="border-t border-gray-300 px-3 sm:px-6 py-4 sm:py-6 bg-gray-50">
                        {/* Comments Section */}
                        {proof.comments && proof.comments.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Comments ({proof.comments.length})
                            </h4>
                            <div className="space-y-4">
                              {proof.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-white rounded-lg border border-gray-300 p-4"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {comment.admin_email
                                          ? "Admin"
                                          : "Customer"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatDate(comment.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {comment.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Comment Section */}
                        <div className="bg-white rounded-lg border border-gray-300 p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                            Add a Comment
                          </label>
                          <textarea
                            value={commentText[proof.id] || ""}
                            onChange={(e) =>
                              setCommentText((prev) => ({
                                ...prev,
                                [proof.id]: e.target.value,
                              }))
                            }
                            placeholder="Add feedback or ask for changes..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-3 transition"
                            rows={3}
                          />
                          <button
                            onClick={() => handleAddComment(proof.id)}
                            disabled={submittingComment[proof.id]}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Post Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Proofs Section */}
          {reviewedProofs.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reviewed Proofs ({reviewedProofs.length})
                </h2>
              </div>
              <div className="space-y-4">
                {reviewedProofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="backdrop-blur-xl bg-white border border-gray-300 rounded-2xl overflow-hidden hover:bg-gray-50 transition-colors"
                  >
                    {/* Proof Header */}
                    <button
                      onClick={() =>
                        setExpandedProofId(
                          expandedProofId === proof.id ? null : proof.id,
                        )
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg flex-shrink-0">
                          {getStatusIcon(proof.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order {formatOrderNumber(proof.order_id)}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}
                            >
                              {getStatusLabel(proof.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Customer: {proof.customers?.first_name}{" "}
                            {proof.customers?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last updated on {formatDate(proof.updated_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedProofId === proof.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Proof Details - Expanded */}
                    {expandedProofId === proof.id && (
                      <div className="border-t border-gray-300 px-3 sm:px-6 py-4 sm:py-6 bg-gray-50">
                        {/* Status Info */}
                        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-300">
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            Status
                          </p>
                          <p className="text-sm text-gray-600">
                            {proof.status === "approved"
                              ? "✓ Customer approved this proof"
                              : "Customer requested revisions"}
                          </p>
                          {proof.revision_notes && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-300">
                              <p className="text-xs font-medium text-orange-700 mb-1">
                                Customer Notes:
                              </p>
                              <p className="text-sm text-orange-800 whitespace-pre-wrap">
                                {proof.revision_notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Approved File Section */}
                        {proof.file_url && (
                          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-300">
                            <p className="text-sm font-medium text-gray-900 mb-3">
                              Approved Design
                            </p>
                            <div
                              className="rounded-lg border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center mb-3"
                              style={{
                                maxHeight: "200px",
                                minHeight: "100px",
                              }}
                            >
                              {proof.file_url.match(
                                /\.(jpg|jpeg|png|gif|webp|svg)$/i,
                              ) ? (
                                <img
                                  src={proof.file_url}
                                  alt={proof.file_name || "Approved design"}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => {
                                    (
                                      e.currentTarget as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center w-full">
                                  <FileIcon className="w-10 h-10 text-gray-300 mb-2" />
                                  <p className="text-sm text-gray-600">
                                    {proof.file_name || "File"}
                                  </p>
                                </div>
                              )}
                            </div>
                            {proof.file_name && (
                              <p className="text-xs text-gray-500 mb-2">
                                {proof.file_name}
                              </p>
                            )}
                            {proof.description && (
                              <p className="text-sm text-gray-700">
                                {proof.description}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Comments Section */}
                        {proof.comments && proof.comments.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Comments
                            </h4>
                            <div className="space-y-4">
                              {proof.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-white rounded-lg border border-gray-300 p-4"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {comment.admin_email
                                          ? "Admin"
                                          : "Customer"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatDate(comment.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {comment.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load More Button */}
          {pagination && pagination.hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  const token = localStorage.getItem("authToken");
                  if (token) {
                    fetchProofs(token, currentPage + 1, true);
                  }
                }}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </>
                ) : (
                  <span className="text-sm">Load More Proofs</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
