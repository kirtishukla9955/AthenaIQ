"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { AzureGL } from "@/components/gl/azure-gl";
import { useAuth } from "@/context/auth-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authState } = useAuth();
  const router = useRouter();

  // Redirect to landing if not connected
  useEffect(() => {
    if (authState === "disconnected") {
      router.push("/");
    }
  }, [authState, router]);

  // Show loading spinner while connecting/verifying
  if (authState !== "connected") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ boxShadow: "0 0 30px 8px rgba(0,123,255,0.4)" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Azure particle background */}
      <AzureGL />

      {/* Azure glow behind content */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0, 123, 255, 0.4) 0%, rgba(0, 123, 255, 0.1) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="ml-20 lg:ml-64 min-h-screen relative z-20">
        <div className="p-6 lg:p-10 animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}
