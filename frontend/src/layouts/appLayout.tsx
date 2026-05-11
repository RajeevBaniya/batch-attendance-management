import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { MobileSidebar } from "../components/navigation/mobileSidebar";
import { Sidebar } from "../components/navigation/sidebar";
import { ProfileDropdown } from "../components/profile/profileDropdown";
import { getNavigationSectionsForRole, getPageHeaderForPath } from "../config/navigation";
import { useAuthContext } from "../hooks/useAuthContext";
import { useRealtime } from "../realtime/useRealtime";

const AppLayout = () => {
  const { role } = useAuthContext();
  useRealtime();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigationSections = getNavigationSectionsForRole(role);
  const pageHeader = getPageHeaderForPath(location.pathname);
  const roleLabel = role ?? "Unknown role";

  return (
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4">
      <MobileSidebar
        sections={navigationSections}
        roleLabel={roleLabel}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="mx-auto flex w-full max-w-[1600px] gap-4">
        <Sidebar sections={navigationSections} roleLabel={roleLabel} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-3 z-30 rounded-2xl border border-slate-800/90 bg-slate-950/85 px-4 py-3 backdrop-blur sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Workspace</p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">{pageHeader.title}</h1>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">{pageHeader.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="focus-ring inline-flex min-h-[38px] items-center rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 lg:hidden"
                  aria-label="Open navigation menu"
                  aria-expanded={isMobileSidebarOpen}
                  aria-controls="mobile-navigation"
                >
                  Menu
                </button>
                <span className="hidden rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300 sm:inline-flex">
                  {roleLabel}
                </span>
                <ProfileDropdown />
              </div>
            </div>
          </header>

          <main className="pt-4 sm:pt-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export { AppLayout };
