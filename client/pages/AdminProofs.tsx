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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

interface AdminProofsResponse {
  success: boolean;
  proofs: Proof[];
  unreadNotifications: number;
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

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProofs();
    fetchPendingOrders();
  }, [navigate]);

  const fetchProofs = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/proofs");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch proofs");
      }

      const data: AdminProofsResponse = await response.json();
      setProofs(data.proofs || []);
      setUnreadCount(data.unreadNotifications || 0);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load proofs";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      setOrdersLoading(true);

      // Fetch Supabase orders only
      const response = await fetch("/api/admin/pending-orders");

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

  const handleSelectOrder = (order: PendingOrder) => {
    setOrderId(order.id.toString());
    // Server will look up customer ID from order if needed
    setCustomerId(order.customerId ? order.customerId.toString() : "");
    setCustomerEmail(order.customerEmail || "");
    setDescription("");
    setShowOrderModal(false);
    setShowSendForm(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploadedFile(file);

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, show file icon
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
  };

  const handleSendProof = async () => {
    try {
      if (!orderId || !description) {
        toast.error("Please fill in Order ID and Proof Description");
        return;
      }

      setSendingProof(true);

      const requestBody: any = {
        orderId: parseInt(orderId),
        description,
      };

      // Add customerId if available (server will look it up from order if not provided)
      if (customerId) {
        requestBody.customerId = parseInt(customerId);
      }

      // If a file is uploaded, convert it to base64 and include it
      if (uploadedFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = (e.target?.result as string).split(",")[1];

          try {
            const response = await fetch("/api/admin/proofs/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
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
        // No file, send without file
        const response = await fetch("/api/admin/proofs/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "revisions_requested":
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case "pending":
      default:
        return <Clock className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "revisions_requested":
        return "text-orange-600 bg-orange-50";
      case "pending":
      default:
        return "text-blue-600 bg-blue-50";
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
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600 text-lg">Loading proofs...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proofs</h1>
              <p className="text-gray-600 mt-2">
                Manage design proofs for customers
              </p>
            </div>
            <Button
              onClick={() => {
                setShowSendForm(!showSendForm);
                setShowOrderModal(false);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Send New Proof
            </Button>
          </div>

          {/* Pending Orders Section */}
          {pendingOrders.length > 0 && !showSendForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Pending Orders Ready for Proofs
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Click on any order below to quickly send a proof to that
                customer
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-semibold text-gray-900">
                        Order #
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 text-right">
                        Total
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-4 font-semibold text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {order.customerName}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {order.customerEmail}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-900 text-right">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleSelectOrder(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium text-xs"
                          >
                            Send Proof
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Send Proof Form */}
          {showSendForm && (
            <div className="bg-white rounded-lg border border-blue-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Send Proof to Customer
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    For Supabase orders only
                  </p>
                </div>
                <button
                  onClick={() => setShowSendForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID * {orderId && `(#${orderId})`}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={orderId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setOrderId(id);
                        // Auto-populate customerId when order is found
                        if (id) {
                          const foundOrder = pendingOrders.find(
                            (o) => o.id.toString() === id,
                          );
                          if (foundOrder) {
                            setCustomerId(foundOrder.customerId.toString());
                          }
                        }
                      }}
                      placeholder="Enter order ID"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {pendingOrders.length > 0 && (
                      <Button
                        onClick={() => setShowOrderModal(true)}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        Browse Orders
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter customer email (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input type="hidden" value={customerId} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the proof (e.g., 'Front and back design mockup')"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors">
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
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
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
                          className="w-full max-h-48 object-cover rounded border border-gray-200"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          {uploadedFile.name}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-white rounded border border-gray-200">
                        <FileIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
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
                <div className="flex gap-3">
                  <Button
                    onClick={handleSendProof}
                    disabled={sendingProof}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingProof ? "Sending..." : "Send Proof"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSendForm(false);
                      setUploadedFile(null);
                      setFilePreview(null);
                      setCustomerEmail("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Order Selection Modal */}
          {showOrderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Select Order to Send Proof
                  </h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  {ordersLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="text-gray-600">Loading orders...</div>
                    </div>
                  ) : pendingOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        No pending orders available
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-3 font-semibold text-gray-900">
                              Order #
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-900">
                              Customer
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-900">
                              Email
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-900">
                              Status
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-900 text-right">
                              Total
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-900">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-4 font-semibold text-gray-900">
                                #{order.id}
                              </td>
                              <td className="px-4 py-4 text-gray-700">
                                {order.customerName}
                              </td>
                              <td className="px-4 py-4 text-gray-600">
                                {order.customerEmail}
                              </td>
                              <td className="px-4 py-4">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-semibold text-gray-900 text-right">
                                ${order.total.toFixed(2)}
                              </td>
                              <td className="px-4 py-4">
                                <button
                                  onClick={() => handleSelectOrder(order)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium text-xs"
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {proofs.length === 0 && !error && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Proofs Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start by sending a proof to a customer.
            </p>
            <Button
              onClick={() => setShowSendForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Your First Proof
            </Button>
          </div>
        )}

        {/* Pending Proofs Section */}
        {pendingProofs.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Awaiting Customer Review ({pendingProofs.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="bg-white rounded-lg border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Proof Header */}
                  <button
                    onClick={() =>
                      setExpandedProofId(
                        expandedProofId === proof.id ? null : proof.id,
                      )
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                        {getStatusIcon(proof.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{proof.order_id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}
                          >
                            {getStatusLabel(proof.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Customer: {proof.customers?.first_name}{" "}
                          {proof.customers?.last_name} ({proof.customers?.email}
                          )
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {proof.description}
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
                    <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
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
                                className="bg-white rounded border border-gray-200 p-4"
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
                      <div className="bg-white rounded border border-gray-200 p-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                          rows={3}
                        />
                        <button
                          onClick={() => handleAddComment(proof.id)}
                          disabled={submittingComment[proof.id]}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
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
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
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
                      <div className="bg-gray-100 p-3 rounded-lg flex-shrink-0">
                        {getStatusIcon(proof.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{proof.order_id}
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
                    <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
                      {/* Status Info */}
                      <div className="mb-6 p-4 bg-white rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Status
                        </p>
                        <p className="text-sm text-gray-600">
                          {proof.status === "approved"
                            ? "✓ Customer approved this proof"
                            : "Customer requested revisions"}
                        </p>
                        {proof.revision_notes && (
                          <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                            <p className="text-xs font-medium text-orange-900 mb-1">
                              Customer Notes:
                            </p>
                            <p className="text-sm text-orange-800 whitespace-pre-wrap">
                              {proof.revision_notes}
                            </p>
                          </div>
                        )}
                      </div>

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
                                className="bg-white rounded border border-gray-200 p-4"
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
      </div>
    </main>
  );
}
