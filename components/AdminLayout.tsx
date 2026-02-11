import AdminNavbar from "@/components/AdminNavbar";
import AdminQuickAccess from "@/components/AdminQuickAccess";

interface AdminLayoutProps {
  children: React.ReactNode;
  hideQuickAccess?: boolean;
  showNavGrid?: boolean;
}

export default function AdminLayout({
  children,
  showNavGrid = true,
  hideQuickAccess = false,
}: AdminLayoutProps) {
  return (
    <>
      <AdminNavbar />
      <main className="min-h-screen bg-[#fafafa] text-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!hideQuickAccess && (
            <div className="py-6">
              <AdminQuickAccess />
            </div>
          )}
          {children}
        </div>
      </main>
    </>
  );
}
