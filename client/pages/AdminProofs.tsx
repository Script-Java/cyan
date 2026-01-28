import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Package,
  RefreshCw,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

interface CustomerInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface Proof {
  id: string;
  customer_id: number;
  description?: string;
  file_url?: string;
  file_name?: string;
  status: "pending" | "approved" | "denied" | "revisions_requested";
  created_at: string;
  updated_at: string;
  customers?: CustomerInfo;
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

export default function AdminProofs() {
  const navigate = useNavigate();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProofs(token, 1);
  }, [navigate]);

  const fetchProofs = async (token: string, page: number = 1) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/proofs?page=${page}&sort=${sortOrder}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch proofs");
      }

      const data: AdminProofsResponse = await response.json();

      setProofs(data.proofs || []);
      setPagination(data.pagination || null);
      setCurrentPage(page);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load proofs";
      setError(message);
    } finally {
      setIsLoading(false);
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
        return <CheckCircle2 className="w-4 h-4" />;
      case "revisions_requested":
        return <AlertTriangle className="w-4 h-4" />;
      case "pending":
      default:
        return <Clock className="w-4 h-4" />;
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
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-2 py-2 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-700 hidden sm:inline">
                    Sort:
                  </span>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      const token = localStorage.getItem("authToken");
                      if (token) {
                        fetchProofs(token, 1);
                        toast.success("Sorting by newest first...");
                      }
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-colors ${
                      sortOrder === "newest"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      const token = localStorage.getItem("authToken");
                      if (token) {
                        fetchProofs(token, 1);
                        toast.success("Sorting by oldest first...");
                      }
                    }}
                    className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-colors ${
                      sortOrder === "oldest"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    Oldest
                  </button>
                </div>
                <Button
                  onClick={() => {
                    const token = localStorage.getItem("authToken");
                    if (token) {
                      fetchProofs(token, currentPage);
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
                  <span className="hidden sm:inline">Send Proof</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 sm:mb-8 bg-red-50 border border-red-300 rounded-lg sm:rounded-2xl p-4 flex gap-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {proofs.length === 0 && !error && (
            <div className="bg-white border border-gray-300 rounded-lg sm:rounded-2xl p-6 sm:p-12 text-center">
              <Clock className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No Proofs Yet
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Start by sending a proof to a customer.
              </p>
              <button
                onClick={() => navigate("/admin/send-proof")}
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
                    onClick={() => navigate(`/admin/proofs/${proof.id}`)}
                    className="bg-white border border-gray-300 rounded-lg sm:rounded-2xl p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    {/* Thumbnail and Info */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        {proof.file_url ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                            {proof.file_url.match(
                              /\.(jpg|jpeg|png|gif|webp|svg)$/i,
                            ) ? (
                              <img
                                src={proof.file_url}
                                alt={proof.file_name || "Design"}
                                className="w-full h-full object-cover"
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

                      {/* Text Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                          {proof.description ||
                            `Proof ${proof.id.substring(0, 8)}`}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          To: {proof.customers?.email || "Unknown"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {proof.customers?.first_name}{" "}
                          {proof.customers?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Sent {formatDate(proof.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 border ${getStatusColor(
                        proof.status,
                      )}`}
                    >
                      {getStatusIcon(proof.status)}
                      <span className="hidden sm:inline">
                        {getStatusLabel(proof.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Proofs Section */}
          {reviewedProofs.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Reviewed Proofs ({reviewedProofs.length})</span>
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {reviewedProofs.map((proof) => (
                  <div
                    key={proof.id}
                    onClick={() => navigate(`/admin/proofs/${proof.id}`)}
                    className="bg-white border border-gray-300 rounded-lg sm:rounded-2xl p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    {/* Thumbnail and Info */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        {proof.file_url ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                            {proof.file_url.match(
                              /\.(jpg|jpeg|png|gif|webp|svg)$/i,
                            ) ? (
                              <img
                                src={proof.file_url}
                                alt={proof.file_name || "Design"}
                                className="w-full h-full object-cover"
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

                      {/* Text Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                          {proof.description ||
                            `Proof ${proof.id.substring(0, 8)}`}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          To: {proof.customers?.email || "Unknown"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {proof.customers?.first_name}{" "}
                          {proof.customers?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Updated {formatDate(proof.updated_at)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 border ${getStatusColor(
                        proof.status,
                      )}`}
                    >
                      {getStatusIcon(proof.status)}
                      <span className="hidden sm:inline">
                        {getStatusLabel(proof.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => {
                  const token = localStorage.getItem("authToken");
                  if (token && currentPage > 1) {
                    fetchProofs(token, currentPage - 1);
                  }
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-700 text-sm font-medium">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => {
                  const token = localStorage.getItem("authToken");
                  if (token && pagination.hasMore) {
                    fetchProofs(token, currentPage + 1);
                  }
                }}
                disabled={!pagination.hasMore}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
