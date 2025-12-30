import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
}

interface ProofDetailResponse {
  success: boolean;
  proof: Proof;
}

export default function ProofApproval() {
  const { proofId } = useParams<{ proofId: string }>();
  const navigate = useNavigate();
  const [proof, setProof] = useState<Proof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [actionType, setActionType] = useState<"approve" | "revise" | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");

  useEffect(() => {
    fetchProof();
  }, [proofId]);

  const fetchProof = async () => {
    try {
      if (!proofId) {
        setError("Invalid proof ID");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/proofs/public/${proofId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load proof");
      }

      const data: ProofDetailResponse = await response.json();
      setProof(data.proof);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load proof";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      if (!proofId) return;

      setIsSubmitting(true);

      const response = await fetch(`/api/proofs/public/${proofId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve proof");
      }

      toast.success("Design approved! Thank you for your feedback.");
      setActionType("approve");

      setTimeout(() => {
        navigate("/proofs");
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve proof";
      toast.error(message);
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

      const response = await fetch(`/api/proofs/${proofId}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision_notes: revisionNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request revisions");
      }

      toast.success("Revision request sent! We'll update your design soon.");
      setActionType("revise");

      setTimeout(() => {
        navigate("/proofs");
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit revision request";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div className="bg-white rounded-lg shadow p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Proof</h1>
                <p className="text-gray-600 mb-6">{error || "The proof you're looking for doesn't exist."}</p>
                <Button onClick={() => navigate("/proofs")}>Back to Proofs</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (actionType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {actionType === "approve" ? "Design Approved!" : "Revisions Requested"}
            </h1>
            <p className="text-gray-600 mb-6">
              {actionType === "approve"
                ? "Thank you for approving your design. We'll proceed with production."
                : "Your feedback has been sent to our team. We'll update your design and send you a new proof soon."}
            </p>
            <p className="text-sm text-gray-500">Redirecting to proofs...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-yellow-50 border-yellow-200",
    approved: "bg-green-50 border-green-200",
    denied: "bg-red-50 border-red-200",
    revisions_requested: "bg-orange-50 border-orange-200",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Proof Image */}
          {proof.file_url ? (
            <div className="w-full bg-gray-100 p-4 sm:p-6">
              <img
                src={proof.file_url}
                alt="Design Proof"
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full bg-gray-100 p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No design image available</p>
              </div>
            </div>
          )}

          {/* Proof Details */}
          <div className="p-6 sm:p-8 border-t">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Proof Ready</h1>
              <p className="text-gray-600">Order #{proof.order_id}</p>
            </div>

            {/* Description */}
            {proof.description && (
              <div className={`rounded-lg border p-4 mb-6 ${statusColors[proof.status]}`}>
                <h3 className="font-semibold text-gray-900 mb-2">Proof Details:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{proof.description}</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="mb-8">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                proof.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : proof.status === "revisions_requested"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}>
                {proof.status === "approved" && "✓ Approved"}
                {proof.status === "revisions_requested" && "Revisions Requested"}
                {proof.status === "pending" && "⏳ Pending Review"}
                {proof.status === "denied" && "❌ Denied"}
              </span>
            </div>

            {/* Action Buttons */}
            {proof.status === "pending" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 text-base sm:text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Approve This Design
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setActionType("revise")}
                    variant="outline"
                    className="py-3 sm:py-4 text-base sm:text-lg border-gray-300"
                  >
                    Request Revisions
                  </Button>
                </div>
              </div>
            )}

            {/* Revision Request Form */}
            {actionType === "revise" && proof.status === "pending" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What changes would you like?</h3>
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Describe the changes you'd like us to make to the design..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  rows={5}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleRequestRevisions}
                    disabled={isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Submit Revision Request"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType(null);
                      setRevisionNotes("");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Already Approved/Denied Message */}
            {proof.status !== "pending" && (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">
                  {proof.status === "approved" && "You have already approved this design."}
                  {proof.status === "revisions_requested" && "Revisions have been requested for this design."}
                  {proof.status === "denied" && "This design has been denied."}
                </p>
                <Button onClick={() => navigate("/proofs")} variant="outline">
                  Back to Proofs
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
