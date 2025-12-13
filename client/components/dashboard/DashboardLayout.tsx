import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 mt-6">
      <div className="max-w-7xl mx-auto">
        <style>{`
          .dashboard-section {
            animation: slideUp 0.6s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        <div className="dashboard-section space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
