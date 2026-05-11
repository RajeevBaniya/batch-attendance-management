import type { BackendRole } from "../types/authTypes";

const roleDashboardRoutes: Record<BackendRole, string> = {
  SUPER_ADMIN: "/super-admin",
  PROGRAMME_MANAGER: "/programme-manager",
  MONITORING_OFFICER: "/monitoring",
  INSTITUTION: "/institution",
  TRAINER: "/trainer",
  STUDENT: "/student",
  PENDING_TRAINER: "/pending-trainer",
};

const getDashboardRouteForRole = (role: BackendRole) => {
  return roleDashboardRoutes[role];
};

export { getDashboardRouteForRole, roleDashboardRoutes };
