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

export default function AdminProofs() {
  const navigate = useNavigate();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<
    Record<string, boolean>
  >({});
  const [showSendForm, setShowSendForm] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [sendingProof, setSendingProof] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProofs();
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

  const handleSendProof = async () => {
    try {
      if (!orderId || !customerId || !description) {
        toast.error("Please fill in all required fields");
        return;
      }

      setSendingProof(true);

      const response = await fetch("/api/admin/proofs/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: parseInt(orderId),
          customerId: parseInt(customerId),
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send proof");
      }

      toast.success("Proof sent to customer successfully!");
      setOrderId("");
      setCustomerId("");
      setDescription("");
      setShowSendForm(false);
      fetchProofs();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send proof";
      toast.error(message);
    } finally {
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
      const message = err instanceof Error ? err.message : "Failed to add comment";
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
              <p className="text-gray-600 mt-2">Manage design proofs for customers</p>
            </div>
            <Button
              onClick={() => setShowSendForm(!showSendForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Send New Proof
            </Button>
          </div>

          {/* Send Proof Form */}
          {showSendForm && (
            <div className="bg-white rounded-lg border border-blue-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Send Proof to Customer
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID *
                  </label>
                  <input
                    type="number"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter order ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID *
                  </label>
                  <input
                    type="number"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Enter customer ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                <div className="flex gap-3">
                  <Button
                    onClick={handleSendProof}
                    disabled={sendingProof}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingProof ? "Sending..." : "Send Proof"}
                  </Button>
                  <Button
                    onClick={() => setShowSendForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
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
                          {proof.customers?.last_name} ({proof.customers?.email})
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
