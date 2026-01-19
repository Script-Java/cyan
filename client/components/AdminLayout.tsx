import Header from "@/components/Header";
import AdminNavbar from "@/components/AdminNavbar";
import AdminQuickAccess from "@/components/AdminQuickAccess";

interface AdminLayoutProps {
  children: React.ReactNode;
  hideQuickAccess?: boolean;
}

export default function AdminLayout({
  children,
  showNavGrid = true,
  hideQuickAccess = false,
}: AdminLayoutProps) {
  return (
    <>
      <Header />
      <AdminNavbar />
      <main className="min-h-screen bg-[#fafafa] text-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {!hideQuickAccess && (
            <div className="mb-6">
              <AdminQuickAccess />
            </div>
          )}
          {children}
        </div>
      </main>
    </>
  );
}
