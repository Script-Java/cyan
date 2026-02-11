import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: number;
  product_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title?: string;
  comment?: string;
  image_urls?: string[];
  helpful_count?: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminReviews() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        toast.error("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: number, newStatus: "approved" | "rejected") => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Review ${newStatus}`);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
        setExpandedReviewId(null);
      } else {
        toast.error("Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Review deleted");
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setExpandedReviewId(null);
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Filter reviews
  const filteredReviews =
    statusFilter === "all"
      ? reviews
      : reviews.filter((r) => r.status === statusFilter);

  // Calculate stats
  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-600 mt-1">
              Moderate and manage customer product reviews
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-600 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm font-semibold">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-semibold">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  statusFilter === filter
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter !== "all" && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                    {filter === "pending"
                      ? stats.pending
                      : filter === "approved"
                        ? stats.approved
                        : stats.rejected}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {statusFilter === "pending"
                  ? "No pending reviews. Great job keeping up!"
                  : statusFilter === "approved"
                    ? "No approved reviews yet."
                    : statusFilter === "rejected"
                      ? "No rejected reviews."
                      : "No reviews found."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  {/* Review Header */}
                  <button
                    onClick={() =>
                      setExpandedReviewId(
                        expandedReviewId === review.id ? null : review.id
                      )
                    }
                    className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {review.title || `Review from ${review.reviewer_name}`}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            review.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : review.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {review.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <RatingStars rating={review.rating} />
                        <span>•</span>
                        <span>{review.reviewer_name}</span>
                        <span>•</span>
                        <span>Product: {review.product_id}</span>
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ml-4 ${
                        expandedReviewId === review.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Review Details */}
                  {expandedReviewId === review.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                      {/* Comment */}
                      {review.comment && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Review</p>
                          <p className="text-gray-900">{review.comment}</p>
                        </div>
                      )}

                      {/* Reviewer Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Reviewer</p>
                          <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{review.reviewer_email}</p>
                        </div>
                      </div>

                      {/* Images */}
                      {review.image_urls && review.image_urls.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Images ({review.image_urls.length})</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {review.image_urls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden rounded border border-gray-200 aspect-square"
                              >
                                <img
                                  src={url}
                                  alt={`Review image ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition">
                                    View
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {review.status === "pending" && (
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                          <Button
                            onClick={() => updateReviewStatus(review.id, "approved")}
                            disabled={isUpdating}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => updateReviewStatus(review.id, "rejected")}
                            disabled={isUpdating}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}

                      {/* Delete Button */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => deleteReview(review.id)}
                          disabled={isUpdating}
                          variant="destructive"
                          className="w-full bg-red-100 hover:bg-red-200 text-red-700 gap-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete Review
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
