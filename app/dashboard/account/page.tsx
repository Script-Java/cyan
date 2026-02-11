import DashboardLayout from "@/components/DashboardLayout";
import AccountSettings from "@/components/dashboard/AccountSettings";

export default function AccountSettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout>
                <div className="pt-20 px-4">
                    <AccountSettings />
                </div>
            </DashboardLayout>
        </div>
    );
}
