import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminNavbar from "@/components/AdminNavbar";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  showNavGrid?: boolean;
}

export default function AdminLayout({
  children,
  showNavGrid = true,
}: AdminLayoutProps) {
  return (
    <>
      <Header />
      <AdminNavbar />
      <main className="min-h-screen bg-black text-white">
        {children}
      </main>
    </>
  );
}
