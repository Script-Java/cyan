import DashboardLayout from "@/components/DashboardLayout";
import Proofs from "@/components/dashboard/Proofs";

export default function ProofsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout>
                <div className="pt-20 px-4">
                    <Proofs />
                </div>
            </DashboardLayout>
        </div>
    );
}
