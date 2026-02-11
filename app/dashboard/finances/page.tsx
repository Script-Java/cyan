import DashboardLayout from "@/components/DashboardLayout";
import Finances from "@/components/dashboard/Finances";

export default function FinancesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout>
                <div className="pt-20 px-4">
                    <Finances />
                </div>
            </DashboardLayout>
        </div>
    );
}
