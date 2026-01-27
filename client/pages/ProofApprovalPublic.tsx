import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Loader,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface ProofDetail {
  id: string;
  description: string;
  file_url?: string;
  file_name?: string;
  status: "pending" | "approved" | "revisions_requested";
  created_at: string;
  updated_at: string;
}

export default function ProofApprovalPublic() {
  const { proofId } = useParams<{ proofId: string }>();
  const navigate = useNavigate();
  const [proof, setProof] = useState<ProofDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [action, setAction] = useState<"approve" | "revise" | null>(null);

  useEffect(() => {
    if (!proofId) {
      toast.error("Invalid proof link");
      return;
    }

    fetchProof();
  }, [proofId]);

  const fetchProof = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/proofs/${proofId}/public`);

      if (!response.ok) {
        throw new Error("Proof not found");
      }

      const data = await response.json();
      setProof(data.proof);
    } catch (err) {
      toast.error("Failed to load proof");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      if (!proofId) return;

      setIsSubmitting(true);
      const response = await fetch(`/api/proofs/${proofId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to approve proof");
      }

      setAction("approve");
      setProof((prev) => (prev ? { ...prev, status: "approved" } : null));
      toast.success("Thank you! Your design has been approved.");

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      toast.error("Failed to approve proof. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevisions = async () => {
    try {
      if (!proofId) return;

      if (!revisionNotes.trim()) {
        toast.error("Please describe the changes you'd like");
        return;
      }

      setIsSubmitting(true);
      const response = await fetch(`/api/proofs/${proofId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision_notes: revisionNotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit revision request");
      }

      setAction("revise");
      setProof((prev) =>
        prev ? { ...prev, status: "revisions_requested" } : null,
      );
      toast.success("Your feedback has been sent. We'll make those changes!");

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your design proof...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!proof) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Proof Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              This proof link may have expired or is invalid.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go Home
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {action === "approve"
                ? "Design Approved! ✓"
                : action === "revise"
                  ? "Feedback Submitted ✓"
                  : "Review Your Design"}
            </h1>
            <p className="text-lg text-gray-600">
              {action === "approve"
                ? "Thank you for approving your design. We'll move forward with production."
                : action === "revise"
                  ? "Thank you for your feedback. Our design team will make those changes."
                  : "Please review the design below and let us know if you'd like any changes."}
            </p>
          </div>

          {/* Design Preview */}
          <div className="bg-white border border-gray-300 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {proof.description}
            </h2>

            {proof.file_url && (
              <div className="mb-6">
                <img
                  src={proof.file_url}
                  alt="Design Proof"
                  className="w-full rounded-xl border border-gray-300 shadow-lg"
                />
              </div>
            )}

            {proof.file_name && (
              <p className="text-sm text-gray-600">File: {proof.file_name}</p>
            )}
          </div>

          {/* Status Display */}
          {proof.status === "approved" && (
            <div className="bg-green-50 border border-green-300 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    Design Approved
                  </h3>
                  <p className="text-sm text-green-800">
                    Your design has been approved. Production will begin soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {proof.status === "revisions_requested" && (
            <div className="bg-orange-50 border border-orange-300 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">
                    Feedback Received
                  </h3>
                  <p className="text-sm text-orange-800">
                    We've received your feedback and will make those changes.
                    We'll send you an updated proof soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {proof.status === "pending" && !action && (
            <div className="space-y-6">
              {/* Approve Button */}
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Approve Design
                  </>
                )}
              </button>

              {/* Revisions Section */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-6">
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={!!revisionNotes || false}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-900">
                    Request Changes
                  </span>
                </label>

                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Tell us what you'd like us to change (e.g., different colors, adjust size, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                  rows={4}
                />

                <button
                  onClick={handleRequestRevisions}
                  disabled={isSubmitting || !revisionNotes.trim()}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Redirecting Message */}
          {action && (
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Redirecting you to the home page in a few seconds...
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
