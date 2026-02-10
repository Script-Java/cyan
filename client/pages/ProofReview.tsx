import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    AlertCircle,
    Loader,
    Send,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function ProofReview() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const action = searchParams.get("action"); // 'approve' or 'revise'

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState("");
    const [actionCompleted, setActionCompleted] = useState<"approve" | "revise" | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Validate token and action exist
        if (!token) {
            setError("Invalid proof link. Token is missing.");
            return;
        }

        if (!action || (action !== "approve" && action !== "revise")) {
            setError("Invalid action specified in the proof link.");
            return;
        }

        // Auto-approve if action is 'approve'
        if (action === "approve") {
            handleApprove();
        }
    }, [token, action]);

    const handleApprove = async () => {
        if (!token) {
            setError("Invalid token");
            return;
        }

        try {
            setIsProcessing(true);
            setError(null);

            // Call the approve endpoint with the token
            // The backend will validate the token and extract the proof ID
            const response = await fetch(`/api/proofs/approve?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to approve proof");
            }

            setActionCompleted("approve");
            toast.success("Thank you! Your design has been approved.");

            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (err: any) {
            const errorMessage = err.message || "Failed to approve proof. Please try again or contact support.";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRequestRevisions = async () => {
        if (!token) {
            setError("Invalid token");
            return;
        }

        if (!revisionNotes.trim()) {
            toast.error("Please describe the changes you'd like");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch(`/api/proofs/revise?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ revision_notes: revisionNotes }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to submit revision request");
            }

            setActionCompleted("revise");
            toast.success("Your feedback has been sent. We'll make those changes!");

            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (err: any) {
            const errorMessage = err.message || "Failed to submit feedback. Please try again or contact support.";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isProcessing) {
        return (
            <>
                <Header />
                <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
                    <div className="text-center">
                        <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Processing your approval...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
                    <div className="text-center max-w-md mx-auto px-4">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {error.includes("expired") || error.includes("invalid") ? "Link Expired or Invalid" : "Something Went Wrong"}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error}
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
                            {actionCompleted === "approve"
                                ? "Design Approved! ✓"
                                : actionCompleted === "revise"
                                    ? "Feedback Submitted ✓"
                                    : action === "approve"
                                        ? "Approving Your Design..."
                                        : "Request Design Changes"}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {actionCompleted === "approve"
                                ? "Thank you for approving your design. We'll move forward with production."
                                : actionCompleted === "revise"
                                    ? "Thank you for your feedback. Our design team will make those changes."
                                    : action === "revise"
                                        ? "Please describe the changes you'd like us to make to your design."
                                        : "Please wait while we process your approval..."}
                        </p>
                    </div>

                    {/* Status Display for Completed Actions */}
                    {actionCompleted === "approve" && (
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

                    {actionCompleted === "revise" && (
                        <div className="bg-orange-50 border border-orange-300 rounded-xl p-6 mb-8">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
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

                    {/* Revision Form - only show if action is 'revise' and not completed */}
                    {!actionCompleted && action === "revise" && (
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-300 rounded-xl p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    What would you like us to change?
                                </h3>

                                <textarea
                                    value={revisionNotes}
                                    onChange={(e) => setRevisionNotes(e.target.value)}
                                    placeholder="Tell us what you'd like us to change (e.g., different colors, adjust size, move text, etc.)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                                    rows={6}
                                    autoFocus
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
                    {actionCompleted && (
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
