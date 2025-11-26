import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030140] to-[#1a0055] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
