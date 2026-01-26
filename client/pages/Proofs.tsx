import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Send,
  AlertTriangle,
  Bell,
  Download,
  FileIcon,
  Image,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
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
  comments?: ProofComment[];
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

interface ProofsResponse {
  success: boolean;
  proofs: Proof[];
  unreadNotifications: number;
  pagination?: PaginationInfo;
}

interface ProofDetailResponse {
  success: boolean;
  proof: Proof & { comments: ProofComment[] };
}

export default function Proofs() {
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
  const [submittingAction, setSubmittingAction] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/proofs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch proofs");
      }

      const data: ProofsResponse = await response.json();
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

  const fetchProofDetail = async (proofId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/proofs/${proofId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch proof details");
      }

      const data: ProofDetailResponse = await response.json();
      setProofs((prev) => prev.map((p) => (p.id === proofId ? data.proof : p)));
    } catch (err) {
      console.error("Error fetching proof detail:", err);
    }
  };

  const handleApprove = async (proofId: string) => {
    try {
      setSubmittingAction((prev) => ({ ...prev, [proofId]: true }));
      const token = localStorage.getItem("authToken");

      const response = await fetch(`/api/proofs/${proofId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve proof");
      }

      toast.success("Proof approved! Admin has been notified.");
      fetchProofs();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to approve proof";
      toast.error(message);
    } finally {
      setSubmittingAction((prev) => ({ ...prev, [proofId]: false }));
    }
  };

  const handleDeny = async (proofId: string) => {
    try {
      setSubmittingAction((prev) => ({ ...prev, [proofId]: true }));
      const token = localStorage.getItem("authToken");
      const revisionNotes = commentText[`deny-${proofId}`] || "";

      const response = await fetch(`/api/proofs/${proofId}/deny`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ revisionNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deny proof");
      }

      toast.success("Revision requested. Admin will see your feedback.");
      setCommentText((prev) => ({ ...prev, [`deny-${proofId}`]: "" }));
      fetchProofs();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to deny proof";
      toast.error(message);
    } finally {
      setSubmittingAction((prev) => ({ ...prev, [proofId]: false }));
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
      const token = localStorage.getItem("authToken");

      const response = await fetch(`/api/proofs/${proofId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setCommentText((prev) => ({ ...prev, [proofId]: "" }));
      toast.success("Comment added");
      fetchProofDetail(proofId);
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
      case "denied":
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
      case "denied":
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
      case "denied":
        return "Denied";
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
  const pendingProofsCount = pendingProofs.length;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">
                Loading your proofs...
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 sm:mb-4"
            >
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
              Back to Dashboard
            </button>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Proofs
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                  Review and approve design proofs for your orders
                </p>
              </div>
              {pendingProofsCount > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 flex-shrink-0 text-xs sm:text-sm">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-blue-900">
                    {pendingProofsCount}{" "}
                    {pendingProofsCount === 1 ? "proof" : "proofs"} awaiting
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {proofs.length === 0 && !error && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No Proofs Yet
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Your design proofs will appear here once the admin sends them
                for your review.
              </p>
            </div>
          )}

          {/* Pending Proofs Section */}
          {pendingProofs.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Awaiting Your Review ({pendingProofs.length})
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
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
                      className="w-full px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                          {getStatusIcon(proof.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              Order {formatOrderNumber(proof.order_id)}
                            </h3>
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(proof.status)}`}
                            >
                              {getStatusLabel(proof.status)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {proof.description ||
                              "Design proof ready for your review"}
                          </p>
                          {proof.file_name && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 truncate">
                              <FileIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                File: {proof.file_name}
                              </span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Sent on {formatDate(proof.created_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedProofId === proof.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Proof Details - Expanded */}
                    {expandedProofId === proof.id && (
                      <div className="border-t border-gray-200 px-3 sm:px-6 py-4 sm:py-6 bg-gray-50 space-y-4 sm:space-y-6">
                        {/* File Preview Section */}
                        {proof.file_url && (
                          <div className="bg-white rounded border border-gray-200 p-3 sm:p-4">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              Attached File
                            </h4>
                            {proof.file_url
                              .toLowerCase()
                              .match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <div>
                                <img
                                  src={proof.file_url}
                                  alt="Proof preview"
                                  className="w-full max-h-96 object-contain rounded border border-gray-200 mb-2 sm:mb-3"
                                />
                                <a
                                  href={proof.file_url}
                                  download={proof.file_name || "proof"}
                                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                                >
                                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">
                                    Download
                                  </span>
                                  <span className="sm:hidden">DL</span>
                                </a>
                              </div>
                            ) : (
                              <a
                                href={proof.file_url}
                                download={proof.file_name || "proof"}
                                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                              >
                                <FileIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                                    {proof.file_name || "Proof file"}
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    Click to download
                                  </p>
                                </div>
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Comments Section */}
                        {proof.comments && proof.comments.length > 0 && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center gap-2">
                              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                              Comments
                            </h4>
                            <div className="space-y-3 sm:space-y-4">
                              {proof.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-white rounded border border-gray-200 p-3 sm:p-4"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                                        {comment.admin_email ? "Admin" : "You"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatDate(comment.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                                    {comment.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Comment Section */}
                        <div className="bg-white rounded border border-gray-200 p-3 sm:p-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
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
                            placeholder="Share your thoughts on this proof..."
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-3"
                            rows={3}
                          />
                          <button
                            onClick={() => handleAddComment(proof.id)}
                            disabled={submittingComment[proof.id]}
                            className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                          >
                            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">
                              Post Comment
                            </span>
                            <span className="sm:hidden">Post</span>
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded border border-gray-200 p-3 sm:p-4">
                          <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
                            <button
                              onClick={() => handleApprove(proof.id)}
                              disabled={submittingAction[proof.id]}
                              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">Approve</span>
                              <span className="sm:hidden">OK</span>
                            </button>
                            <button
                              onClick={() => {
                                const denyInput =
                                  commentText[`deny-${proof.id}`];
                                if (!denyInput?.trim()) {
                                  setCommentText((prev) => ({
                                    ...prev,
                                    [`deny-${proof.id}`]:
                                      "Please update this design",
                                  }));
                                }
                              }}
                              disabled={submittingAction[proof.id]}
                              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
                            >
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">
                                Request Revisions
                              </span>
                              <span className="sm:hidden">Revise</span>
                            </button>
                          </div>

                          {/* Revision Notes Input */}
                          {commentText[`deny-${proof.id}`] && (
                            <div className="mt-3 sm:mt-4">
                              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                                Revision Notes (Optional)
                              </label>
                              <textarea
                                value={commentText[`deny-${proof.id}`] || ""}
                                onChange={(e) =>
                                  setCommentText((prev) => ({
                                    ...prev,
                                    [`deny-${proof.id}`]: e.target.value,
                                  }))
                                }
                                placeholder="What needs to be changed?"
                                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2 sm:mb-3"
                                rows={3}
                              />
                              <button
                                onClick={() => handleDeny(proof.id)}
                                disabled={submittingAction[proof.id]}
                                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm bg-orange-600 text-white rounded font-medium hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
                              >
                                <span className="hidden sm:inline">
                                  Confirm Request for Revisions
                                </span>
                                <span className="sm:hidden">Confirm</span>
                              </button>
                            </div>
                          )}
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
              <div className="mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Reviewed Proofs ({reviewedProofs.length})
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
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
                      className="w-full px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <div className="bg-gray-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                          {getStatusIcon(proof.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              Order {formatOrderNumber(proof.order_id)}
                            </h3>
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(proof.status)}`}
                            >
                              {getStatusLabel(proof.status)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {proof.description || "Design proof"}
                          </p>
                          {proof.file_name && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 truncate">
                              <FileIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                File: {proof.file_name}
                              </span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Last updated on {formatDate(proof.updated_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedProofId === proof.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Proof Details - Expanded */}
                    {expandedProofId === proof.id && (
                      <div className="border-t border-gray-200 px-3 sm:px-6 py-4 sm:py-6 bg-gray-50 space-y-4 sm:space-y-6">
                        {/* File Preview Section */}
                        {proof.file_url && (
                          <div className="bg-white rounded border border-gray-200 p-3 sm:p-4">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              Attached File
                            </h4>
                            {proof.file_url
                              .toLowerCase()
                              .match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <div>
                                <img
                                  src={proof.file_url}
                                  alt="Proof preview"
                                  className="w-full max-h-96 object-contain rounded border border-gray-200 mb-2 sm:mb-3"
                                />
                                <a
                                  href={proof.file_url}
                                  download={proof.file_name || "proof"}
                                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                                >
                                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">
                                    Download
                                  </span>
                                  <span className="sm:hidden">DL</span>
                                </a>
                              </div>
                            ) : (
                              <a
                                href={proof.file_url}
                                download={proof.file_name || "proof"}
                                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                              >
                                <FileIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                                    {proof.file_name || "Proof file"}
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    Click to download
                                  </p>
                                </div>
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Status Info */}
                        <div className="p-3 sm:p-4 bg-white rounded border border-gray-200">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                            Status
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {proof.status === "approved"
                              ? "✓ You approved this proof"
                              : proof.status === "revisions_requested"
                                ? "Revisions have been requested"
                                : "This proof was denied"}
                          </p>
                          {proof.revision_notes && (
                            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-orange-50 rounded border border-orange-200">
                              <p className="text-xs font-medium text-orange-900 mb-1">
                                Revision Notes:
                              </p>
                              <p className="text-xs sm:text-sm text-orange-800 whitespace-pre-wrap">
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
                                        {comment.admin_email ? "Admin" : "You"}
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
    </>
  );
}
