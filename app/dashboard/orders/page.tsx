import DashboardLayout from "@/components/DashboardLayout";
import OrderHistory from "@/components/dashboard/OrderHistory";

export default function OrderHistoryPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout>
                <div className="pt-20 px-4">
                    <OrderHistory />
                </div>
            </DashboardLayout>
        </div>
    );
}
