import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface Review {
  id: number;
  product_id: string;
  reviewer_name: string;
  rating: number;
  title?: string;
  comment?: string;
  image_urls?: string[];
  helpful_count?: number;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    reviewer_name: "",
    reviewer_email: "",
    rating: 5,
    title: "",
    comment: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setAverageRating(parseFloat(data.averageRating) || 0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 3 images
    if (uploadedImages.length >= 3) {
      toast.error("Maximum 3 images per review");
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        toast.error("Image size must be less than 15MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImages((prev) => [...prev, base64]);
        setImagePreviewUrls((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reviewer_name.trim() || !formData.reviewer_email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.comment.trim() && !formData.title.trim()) {
      toast.error("Please write a review or title");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          reviewer_name: formData.reviewer_name.trim(),
          reviewer_email: formData.reviewer_email.trim(),
          rating: formData.rating,
          title: formData.title.trim(),
          comment: formData.comment.trim(),
          images: uploadedImages,
        }),
      });

      if (response.ok) {
        toast.success("Review submitted! It will appear after moderation.");
        // Reset form
        setFormData({
          reviewer_name: "",
          reviewer_email: "",
          rating: 5,
          title: "",
          comment: "",
        });
        setUploadedImages([]);
        setImagePreviewUrls([]);
        setShowForm(false);
        // Refresh reviews
        await fetchReviews();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({ rating, readonly = false, onChange }: { rating: number; readonly?: boolean; onChange?: (r: number) => void }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          className={`transition-all ${readonly ? "cursor-default" : "cursor-pointer"}`}
          disabled={readonly}
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="backdrop-blur-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mt-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1 uppercase">⭐ Customer Reviews</h2>
          <div className="flex items-center gap-3">
            {reviews.length > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{averageRating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-600">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
              </>
            )}
          </div>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="space-y-4">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1 block">
                  Your Name *
                </Label>
                <Input
                  type="text"
                  value={formData.reviewer_name}
                  onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1 block">
                  Your Email *
                </Label>
                <Input
                  type="email"
                  value={formData.reviewer_email}
                  onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                  required
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label className="text-gray-700 text-xs font-semibold mb-2 block">
                Rating *
              </Label>
              <RatingStars
                rating={formData.rating}
                onChange={(r) => setFormData({ ...formData, rating: r })}
              />
            </div>

            {/* Title */}
            <div>
              <Label className="text-gray-700 text-xs font-semibold mb-1 block">
                Review Title
              </Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Excellent quality stickers!"
                className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
              />
            </div>

            {/* Comment */}
            <div>
              <Label className="text-gray-700 text-xs font-semibold mb-1 block">
                Your Review *
              </Label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 min-h-24 text-xs"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-gray-700 text-xs font-semibold mb-2 block">
                Upload Photos (optional - max 3)
              </Label>

              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {imagePreviewUrls.map((preview, idx) => (
                    <div key={idx} className="relative bg-gray-100 rounded overflow-hidden">
                      <img
                        src={preview}
                        alt={`Review image ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedImages.length < 3 && (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-400 rounded p-3 cursor-pointer hover:border-blue-500 transition bg-blue-50">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <div className="text-center">
                    <p className="text-black font-medium text-xs">Click to upload photos</p>
                    <p className="text-gray-600 text-xs mt-0.5">JPG, PNG (max 15MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-semibold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    Submit Review
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    reviewer_name: "",
                    reviewer_email: "",
                    rating: 5,
                    title: "",
                    comment: "",
                  });
                  setUploadedImages([]);
                  setImagePreviewUrls([]);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 text-xs mt-2">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm mb-3">No reviews yet. Be the first to share your experience!</p>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Write First Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{review.reviewer_name}</h3>
                  {review.title && (
                    <p className="text-gray-700 font-medium text-xs mt-1">{review.title}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-gray-600 text-xs mb-3 leading-relaxed">{review.comment}</p>
              )}

              {/* Review Images */}
              {review.image_urls && review.image_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {review.image_urls.map((imageUrl, idx) => (
                    <img
                      key={idx}
                      src={imageUrl}
                      alt={`Review image ${idx + 1}`}
                      className="w-full h-20 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
                </div>
              )}

              {/* Review Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                {review.helpful_count && review.helpful_count > 0 && (
                  <span>{review.helpful_count} found this helpful</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
