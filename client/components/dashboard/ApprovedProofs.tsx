import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Proof {
  id: number;
  orderId: number;
  customerName: string;
  thumbnailUrl?: string;
  approvedAt: string;
  status: string;
}

interface ApprovedProofsProps {
  proofs: Proof[];
  isLoading: boolean;
}

export default function ApprovedProofs({
  proofs,
  isLoading,
}: ApprovedProofsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">✅ Approved Proofs</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">✅ Approved Proofs</h2>

      {proofs.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">No approved proofs for this day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {proof.thumbnailUrl && (
                  <img
                    src={proof.thumbnailUrl}
                    alt="Proof thumbnail"
                    className="w-12 h-12 rounded object-cover bg-gray-200"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {proof.customerName}
                  </p>
                  <p className="text-xs text-gray-600">
                    Order #{proof.orderId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Approved{" "}
                    {new Date(proof.approvedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/orders/${proof.orderId}`)}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                View Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
