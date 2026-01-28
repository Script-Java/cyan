import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MessageSquare,
  Send,
  FileIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
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
  order_id?: number;
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

export default function AdminProofDetail() {
  const { proofId } = useParams<{ proofId: string }>();
  const navigate = useNavigate();
  const [proof, setProof] = useState<Proof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (!proofId) {
      setError("Invalid proof ID");
      return;
    }
    fetchProof();
  }, [proofId]);

  const fetchProof = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`/api/admin/proofs/${proofId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load proof");
      }

      const data = await response.json();
      setProof(data.proof);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load proof";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    try {
      if (!commentText.trim() || !proofId) return;

      setIsSubmittingComment(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch(`/api/admin/proofs/${proofId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: commentText }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      toast.success("Comment added");
      setCommentText("");
      await fetchProof();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add comment";
      toast.error(message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "revisions_requested":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "pending":
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5" />;
      case "revisions_requested":
        return <AlertTriangle className="w-5 h-5" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5" />;
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="w-full pb-20 md:pb-0 px-3 sm:px-6 lg:px-8 pt-6 md:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-sm">
                Loading proof details...
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !proof) {
    return (
      <AdminLayout>
        <div className="w-full pb-20 md:pb-0 px-3 sm:px-6 lg:px-8 pt-6 md:pt-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate("/admin/proofs")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Proofs
            </button>
            <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
              <p className="text-red-800">{error || "Proof not found"}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full pb-20 md:pb-0 px-3 sm:px-6 lg:px-8 pt-6 md:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate("/admin/proofs")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proofs
          </button>

          {/* Proof Details Card */}
          <div className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 mb-6">
            {/* Title and Status */}
            <div className="mb-6 pb-6 border-b border-gray-300">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {proof.description || `Proof ${proof.id.substring(0, 8)}`}
                </h1>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-medium text-sm flex-shrink-0 ${getStatusColor(
                    proof.status,
                  )}`}
                >
                  {getStatusIcon(proof.status)}
                  {getStatusLabel(proof.status)}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  Customer Email
                </p>
                <p className="text-base font-medium text-gray-900">
                  {proof.customers?.email || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  Customer Name
                </p>
                <p className="text-base font-medium text-gray-900">
                  {proof.customers?.first_name} {proof.customers?.last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  Sent On
                </p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(proof.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                  Last Updated
                </p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(proof.updated_at)}
                </p>
              </div>
            </div>

            {/* Design Preview */}
            {proof.file_url && (
              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-900 mb-4">
                  Design Preview
                </p>
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {proof.file_url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                    <img
                      src={proof.file_url}
                      alt={proof.file_name || "Design"}
                      className="w-full max-h-96 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12">
                      <FileIcon className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">{proof.file_name}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <a
                    href={proof.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Design
                  </a>
                </div>
              </div>
            )}

            {/* Revision Notes */}
            {proof.revision_notes && (
              <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-semibold text-orange-900 mb-2">
                  Revision Notes
                </p>
                <p className="text-sm text-orange-800 whitespace-pre-wrap">
                  {proof.revision_notes}
                </p>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t border-gray-300 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Admin Comments
              </h3>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {proof.comments && proof.comments.length > 0 ? (
                  proof.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.admin_email || "Admin"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No comments yet
                  </p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <button
                onClick={handleAddComment}
                disabled={isSubmittingComment || !commentText.trim()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {isSubmittingComment ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
