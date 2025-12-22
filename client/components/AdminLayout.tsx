import Header from "@/components/Header";
import AdminNavbar from "@/components/AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
  showNavGrid = true,
}: AdminLayoutProps) {
  return (
    <>
      <Header />
      <AdminNavbar />
      <main className="min-h-screen bg-[#fafafa] text-gray-900">{children}</main>
    </>
  );
}
