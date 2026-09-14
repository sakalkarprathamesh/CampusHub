"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PreviewRole, PREVIEW_ROLES } from "@/lib/preview/config";
import RolePreviewBanner, { PreviewView } from "./RolePreviewBanner";
import RolePreviewDashboard from "./RolePreviewDashboard";
import RolePreviewLogin from "./RolePreviewLogin";
import RolePreviewRegister from "./RolePreviewRegister";
import RolePreviewProfile from "./RolePreviewProfile";

interface RolePreviewContainerProps {
  initialRole: PreviewRole;
  initialView?: PreviewView;
}

export default function RolePreviewContainer({
  initialRole,
  initialView = "dashboard",
}: RolePreviewContainerProps) {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<PreviewRole>(initialRole);
  const [currentView, setCurrentView] = useState<PreviewView>(initialView);

  const handleRoleChange = (role: PreviewRole) => {
    setCurrentRole(role);
    router.replace(`/role-preview/${role}`);
  };

  const handleContinueToDashboard = (selectedRole?: PreviewRole) => {
    if (selectedRole && selectedRole !== currentRole) {
      setCurrentRole(selectedRole);
    }
    setCurrentView("dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Persistent Top Banner with Exit Preview and Tabs */}
      <RolePreviewBanner
        currentRole={currentRole}
        currentView={currentView}
        onViewChange={setCurrentView}
        onRoleChange={handleRoleChange}
      />

      {/* 2. Main Content View */}
      <main className="flex-1">
        {currentView === "dashboard" && <RolePreviewDashboard role={currentRole} />}

        {currentView === "login" && (
          <RolePreviewLogin
            role={currentRole}
            onContinueToDashboard={handleContinueToDashboard}
            onSwitchToRegister={() => setCurrentView("register")}
          />
        )}

        {currentView === "register" && (
          <RolePreviewRegister
            initialRole={currentRole}
            onContinueToDashboard={handleContinueToDashboard}
            onSwitchToLogin={() => setCurrentView("login")}
          />
        )}

        {currentView === "profile" && <RolePreviewProfile role={currentRole} />}
      </main>
    </div>
  );
}
