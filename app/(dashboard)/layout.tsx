import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/app/(dashboard)/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardStoreProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-8">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </DashboardStoreProvider>
  );
}
