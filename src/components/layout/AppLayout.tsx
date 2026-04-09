import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { LifecycleBanner } from "./LifecycleBanner";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 sticky top-0 bg-background/80 backdrop-blur-xl z-40">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold text-foreground">KIIT Connect</h2>
          </header>
          <LifecycleBanner />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
