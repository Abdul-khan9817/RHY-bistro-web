import React from "react";
import { Redirect } from "wouter";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f2419] flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-3 border-[#c9a84c] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif tracking-widest text-sm text-[#c9a84c] uppercase">Verifying Authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
};
