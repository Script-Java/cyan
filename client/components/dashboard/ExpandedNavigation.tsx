import React, { lazy, Suspense } from "react";
import { X } from "lucide-react";

// Lazy load page components
const OrderHistory = lazy(() => import("@/pages/OrderHistory"));
const Finances = lazy(() => import("@/pages/Finances"));
const Designs = lazy(() => import("@/pages/Designs"));
const Proofs = lazy(() => import("@/pages/Proofs"));
const Support = lazy(() => import("@/pages/Support"));
const MyTickets = lazy(() => import("@/pages/MyTickets"));
const AccountSettings = lazy(() => import("@/pages/AccountSettings"));

interface ExpandedNavigationProps {
  expandedItem: string | null;
  onClose: () => void;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const itemPageMap: Record<string, React.LazyExoticComponent<() => JSX.Element>> =
  {
    orders: OrderHistory,
    finances: Finances,
    designs: Designs,
    proofs: Proofs,
    support: Support,
    "my-tickets": MyTickets,
    "account-settings": AccountSettings,
  };

export default function ExpandedNavigation({
  expandedItem,
  onClose,
}: ExpandedNavigationProps) {
  if (!expandedItem || !itemPageMap[expandedItem]) {
    return null;
  }

  const PageComponent = itemPageMap[expandedItem];

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="rounded-xl border-2 border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {expandedItem.replace("-", " ")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close expanded view"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <PageComponent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
