import DashboardLayout from "@/components/DashboardLayout";
import Support from "@/components/dashboard/Support";

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout>
                <div className="pt-20 px-4">
                    <Support />
                </div>
            </DashboardLayout>
        </div>
    );
}
