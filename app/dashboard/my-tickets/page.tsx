import DashboardLayout from "@/components/DashboardLayout";
import MyTickets from "@/components/dashboard/MyTickets";

export default function MyTicketsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout>
                <div className="pt-20 px-4">
                    <MyTickets />
                </div>
            </DashboardLayout>
        </div>
    );
}
