import DashboardLayout from "@/components/DashboardLayout";
import Designs from "@/components/dashboard/Designs";

export default function DesignsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout>
                <div className="pt-20 px-4">
                    <Designs />
                </div>
            </DashboardLayout>
        </div>
    );
}
