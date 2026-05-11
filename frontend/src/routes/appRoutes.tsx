import { Navigate, Route, Routes } from "react-router-dom";

import { HomePage } from "../pages/homePage";
import { InstitutionDashboardPage } from "../pages/institution/institutionDashboardPage";
import { MonitoringDashboardPage } from "../pages/monitoring/monitoringDashboardPage";
import { PendingTrainerPage } from "../pages/pendingTrainer/pendingTrainerPage";
import { ProgrammeManagerDashboardPage } from "../pages/programmeManager/programmeManagerDashboardPage";
import { SettingsPage } from "../pages/settings/settingsPage";
import { StudentDashboardPage } from "../pages/student/studentDashboardPage";
import { SuperAdminDashboardPage } from "../pages/superAdmin/superAdminDashboardPage";
import { TrainerDashboardPage } from "../pages/trainer/trainerDashboardPage";
import { UnauthorizedPage } from "../pages/unauthorizedPage";
import { AppLayout } from "../layouts/appLayout";
import { ROLE } from "../types/authTypes";
import { ProtectedRoute } from "./protectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={[ROLE.SUPER_ADMIN]}>
                <SuperAdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programme-manager"
            element={
              <ProtectedRoute allowedRoles={[ROLE.PROGRAMME_MANAGER]}>
                <ProgrammeManagerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute allowedRoles={[ROLE.MONITORING_OFFICER]}>
                <MonitoringDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution"
            element={
              <ProtectedRoute allowedRoles={[ROLE.INSTITUTION]}>
                <InstitutionDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={[ROLE.TRAINER]}>
                <TrainerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={[ROLE.STUDENT]}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-trainer"
            element={
              <ProtectedRoute allowedRoles={[ROLE.PENDING_TRAINER]}>
                <PendingTrainerPage />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export { AppRoutes };
