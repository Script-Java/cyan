import React, { lazy, Suspense } from "react";
import { X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy load page components
const OrderHistory = lazy(() => import("@/components/dashboard/OrderHistory"));
const Finances = lazy(() => import("@/components/dashboard/Finances"));
const Designs = lazy(() => import("@/components/dashboard/Designs"));
const Proofs = lazy(() => import("@/components/dashboard/Proofs"));
const Support = lazy(() => import("@/components/dashboard/Support"));
const MyTickets = lazy(() => import("@/components/dashboard/MyTickets"));
const AccountSettings = lazy(() => import("@/components/dashboard/AccountSettings"));

interface ExpandedNavigationProps {
  expandedItem: string | null;
  onClose: () => void;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-24 sm:h-48 md:h-96">
    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
  </div>
);

const itemPageMap: Record<
  string,
  React.LazyExoticComponent<() => JSX.Element>
> = {
  orders: OrderHistory,
  finances: Finances,
  designs: Designs,
  proofs: Proofs,
  support: Support,
  "my-tickets": MyTickets,
  "account-settings": AccountSettings,
};

const itemRoutes: Record<string, string> = {
  orders: "/dashboard/orders",
  finances: "/dashboard/finances",
  designs: "/dashboard/designs",
  proofs: "/dashboard/proofs",
  support: "/dashboard/support",
  "my-tickets": "/dashboard/my-tickets",
  "account-settings": "/dashboard/account",
};

export default function ExpandedNavigation({
  expandedItem,
  onClose,
}: ExpandedNavigationProps) {
  const router = useRouter();

  if (!expandedItem || !itemPageMap[expandedItem]) {
    return null;
  }

  const PageComponent = itemPageMap[expandedItem];
  const route = itemRoutes[expandedItem];

  return (
    <div className="mt-4 sm:mt-6 md:mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-gray-50 gap-2">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 capitalize truncate">
            {expandedItem.replace("-", " ")}
          </h2>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(route)}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
              aria-label="Open in full page"
              title="Open in full page"
            >
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Close expanded view"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content - Responsive height container for mobile */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
          <Suspense fallback={<LoadingSpinner />}>
            <PageComponent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
